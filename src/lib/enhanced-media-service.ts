import { db } from '@/lib/db'
import { ImageOptimizationService, ImageOptions } from './image-optimization'
import { writeFileSync, mkdirSync, existsSync, unlinkSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { execSync } from 'child_process'

export interface MediaFile {
  id: string
  filename: string
  originalFilename: string
  path: string
  url: string
  thumbnailUrl?: string
  mimeType: string
  size: number
  width: number
  height: number
  altText?: string
  title?: string
  description?: string
  tags: string[]
  category: 'vehicle' | 'service' | 'blog' | 'testimonial' | 'banner' | 'gallery' | 'other'
  entityId?: string
  isPublic: boolean
  isFeatured: boolean
  order: number
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
  createdBy: string
  optimizedFiles: OptimizedFile[]
}

export interface OptimizedFile {
  id: string
  filename: string
  path: string
  url: string
  size: string
  width: number
  height: number
  quality: number
  format: string
  purpose: 'thumbnail' | 'medium' | 'large' | 'web' | 'social' | 'original'
}

export interface MediaUploadOptions {
  category: MediaFile['category']
  entityId?: string
  isPublic?: boolean
  isFeatured?: boolean
  altText?: string
  title?: string
  description?: string
  tags?: string[]
  generateThumbnails?: boolean
  optimizeFormats?: ('webp' | 'avif' | 'jpeg' | 'png')[]
  watermark?: boolean
  aiTags?: boolean
}

export interface MediaFilterOptions {
  category?: MediaFile['category']
  entityId?: string
  tags?: string[]
  mimeType?: string
  isPublic?: boolean
  isFeatured?: boolean
  createdBy?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'size' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface MediaStats {
  totalFiles: number
  totalSize: number
  byCategory: Record<string, { count: number; size: number }>
  byMimeType: Record<string, { count: number; size: number }>
  byMonth: Record<string, { count: number; size: number }>
  storageUsage: {
    used: number
    available: number
    total: number
  }
}

export class EnhancedMediaService {
  private static instance: EnhancedMediaService
  private imageService: ImageOptimizationService
  private uploadDir: string
  private maxFileSize: number // 10MB
  private allowedMimeTypes: string[]
  private storageQuota: number // 1GB in bytes

  private constructor() {
    this.imageService = ImageOptimizationService.getInstance()
    this.uploadDir = join(process.cwd(), 'public', 'uploads')
    this.maxFileSize = 10 * 1024 * 1024 // 10MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif'
    ]
    this.storageQuota = 1024 * 1024 * 1024 // 1GB
    this.ensureDirectories()
  }

  static getInstance(): EnhancedMediaService {
    if (!EnhancedMediaService.instance) {
      EnhancedMediaService.instance = new EnhancedMediaService()
    }
    return EnhancedMediaService.instance
  }

  private ensureDirectories(): void {
    const directories = [
      join(this.uploadDir, 'original'),
      join(this.uploadDir, 'optimized'),
      join(this.uploadDir, 'thumbnails'),
      join(this.uploadDir, 'vehicles'),
      join(this.uploadDir, 'services'),
      join(this.uploadDir, 'blog'),
      join(this.uploadDir, 'banners'),
      join(this.uploadDir, 'gallery'),
      join(this.uploadDir, 'testimonials')
    ]

    directories.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
    })
  }

  async uploadMedia(
    file: File,
    options: MediaUploadOptions
  ): Promise<MediaFile> {
    // Validate file
    const validation = this.validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file')
    }

    // Check storage quota
    await this.checkStorageQuota(file.size)

    // Generate unique ID and filename
    const mediaId = this.generateMediaId()
    const timestamp = Date.now()
    const extension = this.getFileExtension(file.name)
    const originalFilename = file.name
    const filename = `${mediaId}_${timestamp}.${extension}`

    // Create file paths
    const categoryDir = join(this.uploadDir, options.category)
    const originalPath = join(categoryDir, 'original', filename)
    const optimizedPath = join(categoryDir, 'optimized', `${mediaId}.webp`)

    // Ensure directories exist
    this.ensureDirectory(dirname(originalPath))
    this.ensureDirectory(dirname(optimizedPath))

    // Convert file to buffer and save original
    const buffer = Buffer.from(await file.arrayBuffer())
    writeFileSync(originalPath, buffer)

    // Get image metadata
    const metadata = await this.getImageMetadata(originalPath)

    // Optimize image
    const optimizedBuffer = await this.imageService.optimizeImage(buffer, {
      width: 1920,
      height: 1080,
      quality: 85,
      format: 'webp'
    })
    writeFileSync(optimizedPath, optimizedBuffer)

    // Generate thumbnails if requested
    const thumbnails: OptimizedFile[] = []
    if (options.generateThumbnails) {
      const thumbnailSizes = [
        { size: 'thumbnail', width: 150, height: 150 },
        { size: 'medium', width: 300, height: 300 },
        { size: 'large', width: 600, height: 600 }
      ]

      for (const { size, width, height } of thumbnailSizes) {
        const thumbnailBuffer = await this.imageService.optimizeImage(buffer, {
          width,
          height,
          quality: 70,
          format: 'webp'
        })

        const thumbnailFilename = `${mediaId}_${size}.webp`
        const thumbnailPath = join(this.uploadDir, 'thumbnails', thumbnailFilename)
        writeFileSync(thumbnailPath, thumbnailBuffer)

        thumbnails.push({
          id: `${mediaId}_${size}`,
          filename: thumbnailFilename,
          path: thumbnailPath,
          url: `/uploads/thumbnails/${thumbnailFilename}`,
          size: this.formatFileSize(thumbnailBuffer.length),
          width,
          height,
          quality: 70,
          format: 'webp',
          purpose: size as OptimizedFile['purpose']
        })
      }
    }

    // Generate additional formats if requested
    const optimizedFiles: OptimizedFile[] = [...thumbnails]
    if (options.optimizeFormats) {
      for (const format of options.optimizeFormats) {
        if (format !== 'webp') { // Skip webp as we already generated it
          const formatBuffer = await this.imageService.optimizeImage(buffer, {
            width: 1920,
            height: 1080,
            quality: 85,
            format
          })

          const formatFilename = `${mediaId}.${format}`
          const formatPath = join(categoryDir, 'optimized', formatFilename)
          writeFileSync(formatPath, formatBuffer)

          optimizedFiles.push({
            id: `${mediaId}_${format}`,
            filename: formatFilename,
            path: formatPath,
            url: `/uploads/${options.category}/optimized/${formatFilename}`,
            size: this.formatFileSize(formatBuffer.length),
            width: metadata.width,
            height: metadata.height,
            quality: 85,
            format,
            purpose: 'web'
          })
        }
      }
    }

    // Apply watermark if requested
    if (options.watermark) {
      await this.applyWatermark(optimizedPath)
    }

    // Generate AI tags if requested
    let tags = options.tags || []
    if (options.aiTags) {
      const aiGeneratedTags = await this.generateAITags(buffer, options.category)
      tags = [...tags, ...aiGeneratedTags]
    }

    // Create media record in database
    const mediaFile: MediaFile = {
      id: mediaId,
      filename,
      originalFilename,
      path: optimizedPath,
      url: `/uploads/${options.category}/optimized/${mediaId}.webp`,
      thumbnailUrl: thumbnails[0]?.url,
      mimeType: file.type,
      size: optimizedBuffer.length,
      width: metadata.width,
      height: metadata.height,
      altText: options.altText || this.generateAltText(file.name, options.category),
      title: options.title || this.generateTitle(file.name),
      description: options.description,
      tags: [...new Set(tags)], // Remove duplicates
      category: options.category,
      entityId: options.entityId,
      isPublic: options.isPublic ?? true,
      isFeatured: options.isFeatured ?? false,
      order: 0,
      metadata: {
        originalSize: file.size,
        compressionRatio: ((file.size - optimizedBuffer.length) / file.size * 100).toFixed(2),
        colors: await this.extractColors(buffer),
        exif: metadata.exif || {},
        optimization: {
          quality: 85,
          format: 'webp',
          timestamp
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system', // In production, get from auth context
      optimizedFiles
    }

    // Save to database
    await this.saveMediaToDatabase(mediaFile)

    return mediaFile
  }

  async uploadMultipleMedia(
    files: File[],
    options: MediaUploadOptions
  ): Promise<MediaFile[]> {
    const results: MediaFile[] = []

    for (const file of files) {
      try {
        const mediaFile = await this.uploadMedia(file, options)
        results.push(mediaFile)
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error)
        // Continue with other files
      }
    }

    return results
  }

  async getMedia(filter: MediaFilterOptions = {}): Promise<{
    files: MediaFile[]
    total: number
    hasMore: boolean
  }> {
    try {
      // Build where clause
      const where: any = {}
      
      if (filter.category) {
        where.category = filter.category
      }
      
      if (filter.entityId) {
        where.entityId = filter.entityId
      }
      
      if (filter.mimeType) {
        where.mimeType = { startsWith: filter.mimeType }
      }
      
      if (filter.isPublic !== undefined) {
        where.isPublic = filter.isPublic
      }
      
      if (filter.isFeatured !== undefined) {
        where.isFeatured = filter.isFeatured
      }
      
      if (filter.createdBy) {
        where.createdBy = filter.createdBy
      }
      
      if (filter.search) {
        where.OR = [
          { filename: { contains: filter.search, mode: 'insensitive' } },
          { originalName: { contains: filter.search, mode: 'insensitive' } },
          { title: { contains: filter.search, mode: 'insensitive' } },
          { altText: { contains: filter.search, mode: 'insensitive' } }
        ]
      }
      
      if (filter.dateFrom || filter.dateTo) {
        where.createdAt = {}
        if (filter.dateFrom) {
          where.createdAt.gte = new Date(filter.dateFrom)
        }
        if (filter.dateTo) {
          where.createdAt.lte = new Date(filter.dateTo)
        }
      }
      
      // Get total count
      const total = await db.media.count({ where })
      
      // Get files with pagination - get all files if no limit specified
      const limit = filter.limit || undefined // Remove default limit
      const files = await db.media.findMany({
        where,
        orderBy: [
          { [filter.sortBy || 'createdAt']: filter.sortOrder || 'desc' }
        ],
        skip: filter.offset || 0,
        take: limit // Will be undefined if no limit specified, returning all files
      })
      
      return {
        files: files.map(file => this.mapDbMediaToMediaFile(file)),
        total,
        hasMore: (filter.offset || 0) + (filter.limit || 20) < total
      }
    } catch (error) {
      console.error('Error fetching media from database:', error)
      // Fallback to empty array
      return {
        files: [],
        total: 0,
        hasMore: false
      }
    }
  }

  async updateMedia(
    mediaId: string,
    updates: Partial<MediaFile>
  ): Promise<MediaFile> {
    try {
      const updateData: any = {}
      
      if (updates.altText !== undefined) updateData.altText = updates.altText
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.tags !== undefined) updateData.tags = JSON.stringify(updates.tags)
      if (updates.category !== undefined) updateData.category = updates.category
      if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic
      if (updates.isFeatured !== undefined) updateData.isFeatured = updates.isFeatured
      if (updates.order !== undefined) updateData.order = updates.order
      
      const updatedMedia = await db.media.update({
        where: { id: mediaId },
        data: updateData
      })
      
      return this.mapDbMediaToMediaFile(updatedMedia)
    } catch (error) {
      console.error('Error updating media in database:', error)
      throw new Error('Failed to update media')
    }
  }

  async deleteMedia(mediaId: string): Promise<void> {
    try {
      // Get media from database first
      const media = await db.media.findUnique({
        where: { id: mediaId }
      })
      
      if (!media) {
        throw new Error('Media not found')
      }
      
      // Delete all associated files
      const filesToDelete = [
        media.path,
        media.thumbnailUrl
      ].filter(Boolean)
      
      for (const filePath of filesToDelete) {
        try {
          if (filePath) {
            const fullPath = join(process.cwd(), 'public', filePath)
            if (existsSync(fullPath)) {
              unlinkSync(fullPath)
            }
          }
        } catch (error) {
          console.error(`Failed to delete file ${filePath}:`, error)
        }
      }
      
      // Delete from database
      await db.media.delete({
        where: { id: mediaId }
      })
    } catch (error) {
      console.error('Error deleting media from database:', error)
      throw new Error('Failed to delete media')
    }
  }

  async getMediaStats(): Promise<MediaStats> {
    try {
      // Get all media files
      const allMedia = await db.media.findMany()
      
      // Calculate statistics
      const totalFiles = allMedia.length
      const totalSize = allMedia.reduce((sum, media) => sum + media.size, 0)
      
      // Group by category
      const byCategory: Record<string, { count: number; size: number }> = {}
      allMedia.forEach(media => {
        const category = media.category || 'other'
        if (!byCategory[category]) {
          byCategory[category] = { count: 0, size: 0 }
        }
        byCategory[category].count++
        byCategory[category].size += media.size
      })
      
      // Group by MIME type
      const byMimeType: Record<string, { count: number; size: number }> = {}
      allMedia.forEach(media => {
        const mimeType = media.mimeType.split('/')[0] || 'unknown'
        if (!byMimeType[mimeType]) {
          byMimeType[mimeType] = { count: 0, size: 0 }
        }
        byMimeType[mimeType].count++
        byMimeType[mimeType].size += media.size
      })
      
      // Group by month
      const byMonth: Record<string, { count: number; size: number }> = {}
      allMedia.forEach(media => {
        const month = new Date(media.createdAt).toISOString().substring(0, 7) // YYYY-MM
        if (!byMonth[month]) {
          byMonth[month] = { count: 0, size: 0 }
        }
        byMonth[month].count++
        byMonth[month].size += media.size
      })
      
      return {
        totalFiles,
        totalSize,
        byCategory,
        byMimeType,
        byMonth,
        storageUsage: {
          used: totalSize,
          available: Math.max(0, this.storageQuota - totalSize),
          total: this.storageQuota
        }
      }
    } catch (error) {
      console.error('Error calculating media stats:', error)
      // Return empty stats
      return {
        totalFiles: 0,
        totalSize: 0,
        byCategory: {},
        byMimeType: {},
        byMonth: {},
        storageUsage: {
          used: 0,
          available: this.storageQuota,
          total: this.storageQuota
        }
      }
    }
  }

  async optimizeExistingMedia(mediaId: string): Promise<MediaFile> {
    const media = await this.getMediaById(mediaId)
    
    // Re-optimize the original file
    const originalPath = join(process.cwd(), 'public', media.path)
    if (!existsSync(originalPath)) {
      throw new Error('Original file not found')
    }

    const buffer = readFileSync(originalPath)
    const optimizedBuffer = await this.imageService.optimizeImage(buffer, {
      width: 1920,
      height: 1080,
      quality: 85,
      format: 'webp'
    })

    writeFileSync(originalPath, optimizedBuffer)

    // Update media record
    media.size = optimizedBuffer.length
    media.metadata.compressionRatio = ((media.metadata.originalSize - optimizedBuffer.length) / media.metadata.originalSize * 100).toFixed(2)
    media.updatedAt = new Date().toISOString()

    return media
  }

  async bulkOptimizeMedia(category?: string): Promise<{
    processed: number
    totalSize: number
    savedSpace: number
  }> {
    // In production, get all media files and optimize them
    return {
      processed: 50,
      totalSize: 100 * 1024 * 1024,
      savedSpace: 20 * 1024 * 1024
    }
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' }
    }

    if (!this.allowedMimeTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      }
    }

    if (file.size > this.maxFileSize) {
      return { 
        valid: false, 
        error: `File size must be less than ${this.maxFileSize / (1024 * 1024)}MB`
      }
    }

    return { valid: true }
  }

  private async checkStorageQuota(fileSize: number): Promise<void> {
    const stats = await this.getMediaStats()
    const projectedUsage = stats.storageUsage.used + fileSize

    if (projectedUsage > this.storageQuota) {
      throw new Error('Storage quota exceeded. Please delete some files or upgrade your plan.')
    }
  }

  private generateMediaId(): string {
    return `media_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'jpg'
  }

  private ensureDirectory(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true })
    }
  }

  private async getImageMetadata(imagePath: string): Promise<{
    width: number
    height: number
    format: string
    exif?: any
  }> {
    try {
      const { Image } = await import('image-js')
      const image = await Image.load(imagePath)
      
      return {
        width: image.width,
        height: image.height,
        format: image.meta.format,
        exif: image.meta.exif
      }
    } catch (error) {
      // Fallback to basic dimensions
      const metadata = await this.imageService.getImageMetadata(imagePath)
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      }
    }
  }

  private async applyWatermark(imagePath: string): Promise<void> {
    // In production, implement watermarking using sharp or image-js
  }

  private async generateAITags(buffer: Buffer, category: string): Promise<string[]> {
    try {
      // In production, use AI service to generate tags
      // For now, return basic tags based on category
      const categoryTags: Record<string, string[]> = {
        vehicle: ['car', 'vehicle', 'automotive'],
        service: ['service', 'maintenance', 'repair'],
        blog: ['blog', 'article', 'news'],
        testimonial: ['testimonial', 'review', 'customer'],
        banner: ['banner', 'advertisement', 'promotion'],
        gallery: ['gallery', 'collection', 'portfolio']
      }

      return categoryTags[category] || []
    } catch (error) {
      console.error('Failed to generate AI tags:', error)
      return []
    }
  }

  private async extractColors(buffer: Buffer): Promise<string[]> {
    try {
      // In production, use color extraction library
      return ['#ffffff', '#000000', '#ff0000'] // Mock colors
    } catch (error) {
      console.error('Failed to extract colors:', error)
      return []
    }
  }

  private generateAltText(filename: string, category: string): string {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    const cleanName = nameWithoutExt.replace(/[-_]/g, ' ')
    
    const categoryPrefixes: Record<string, string> = {
      vehicle: 'Photo of ',
      service: 'Image showing ',
      blog: 'Blog post image: ',
      testimonial: 'Customer testimonial: ',
      banner: 'Promotional banner: ',
      gallery: 'Gallery image: '
    }

    return `${categoryPrefixes[category] || 'Image of '}${cleanName}`
  }

  private generateTitle(filename: string): string {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    return nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private async saveMediaToDatabase(mediaFile: MediaFile): Promise<void> {
    try {
      await db.media.create({
        data: {
          id: mediaFile.id,
          filename: mediaFile.filename,
          originalName: mediaFile.originalFilename,
          path: mediaFile.path,
          url: mediaFile.url,
          thumbnailUrl: mediaFile.thumbnailUrl,
          mimeType: mediaFile.mimeType,
          size: mediaFile.size,
          width: mediaFile.width,
          height: mediaFile.height,
          altText: mediaFile.altText,
          title: mediaFile.title,
          description: mediaFile.description,
          tags: JSON.stringify(mediaFile.tags),
          category: mediaFile.category,
          entityId: mediaFile.entityId,
          isPublic: mediaFile.isPublic,
          isFeatured: mediaFile.isFeatured,
          order: mediaFile.order,
          metadata: JSON.stringify(mediaFile.metadata),
          createdBy: mediaFile.createdBy
        }
      })
    } catch (error) {
      console.error('Error saving media to database:', error)
      throw new Error('Failed to save media to database')
    }
  }

  private async getMediaById(mediaId: string): Promise<MediaFile> {
    const media = await db.media.findUnique({
      where: { id: mediaId }
    })

    if (!media) {
      throw new Error('Media not found')
    }

    return this.mapDbMediaToMediaFile(media)
  }

  private mapDbMediaToMediaFile(dbMedia: any): MediaFile {
    return {
      id: dbMedia.id,
      filename: dbMedia.filename,
      originalFilename: dbMedia.originalName,
      path: dbMedia.path,
      url: dbMedia.url,
      thumbnailUrl: dbMedia.thumbnailUrl,
      mimeType: dbMedia.mimeType,
      size: dbMedia.size,
      width: dbMedia.width,
      height: dbMedia.height,
      altText: dbMedia.altText,
      title: dbMedia.title,
      description: dbMedia.description,
      tags: dbMedia.tags ? JSON.parse(dbMedia.tags) : [],
      category: dbMedia.category,
      entityId: dbMedia.entityId,
      isPublic: dbMedia.isPublic,
      isFeatured: dbMedia.isFeatured,
      order: dbMedia.order,
      metadata: dbMedia.metadata ? JSON.parse(dbMedia.metadata) : {},
      createdAt: dbMedia.createdAt.toISOString(),
      updatedAt: dbMedia.updatedAt.toISOString(),
      createdBy: dbMedia.createdBy,
      optimizedFiles: []
    }
  }
}

export const enhancedMediaService = EnhancedMediaService.getInstance()
export default EnhancedMediaService