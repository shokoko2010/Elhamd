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
    // In production, this would query the database
    // For now, return mock data
    const mockFiles: MediaFile[] = [
      {
        id: '1',
        filename: 'nexon_front.webp',
        originalFilename: 'nexon_front.jpg',
        path: '/uploads/vehicles/optimized/nexon_front.webp',
        url: '/uploads/vehicles/optimized/nexon_front.webp',
        thumbnailUrl: '/uploads/thumbnails/1_thumbnail.webp',
        mimeType: 'image/webp',
        size: 150000,
        width: 1920,
        height: 1080,
        altText: 'Tata Nexon front view',
        title: 'Tata Nexon',
        description: 'Front view of Tata Nexon',
        tags: ['tata', 'nexon', 'suv', 'front'],
        category: 'vehicle',
        entityId: '1',
        isPublic: true,
        isFeatured: true,
        order: 0,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        optimizedFiles: []
      }
    ]

    return {
      files: mockFiles,
      total: mockFiles.length,
      hasMore: false
    }
  }

  async updateMedia(
    mediaId: string,
    updates: Partial<MediaFile>
  ): Promise<MediaFile> {
    // In production, update database record
    const mockFile: MediaFile = {
      id: mediaId,
      filename: 'updated.webp',
      originalFilename: 'original.jpg',
      path: '/uploads/vehicles/optimized/updated.webp',
      url: '/uploads/vehicles/optimized/updated.webp',
      mimeType: 'image/webp',
      size: 150000,
      width: 1920,
      height: 1080,
      altText: updates.altText || 'Updated alt text',
      title: updates.title || 'Updated title',
      description: updates.description,
      tags: updates.tags || [],
      category: updates.category || 'vehicle',
      isPublic: updates.isPublic ?? true,
      isFeatured: updates.isFeatured ?? false,
      order: updates.order || 0,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      optimizedFiles: []
    }

    return mockFile
  }

  async deleteMedia(mediaId: string): Promise<void> {
    // In production, get media from database first
    const media = await this.getMediaById(mediaId)

    // Delete all associated files
    const filesToDelete = [
      media.path,
      media.thumbnailUrl,
      ...media.optimizedFiles.map(f => f.path)
    ].filter(Boolean)

    for (const filePath of filesToDelete) {
      try {
        if (filePath && existsSync(join(process.cwd(), 'public', filePath))) {
          unlinkSync(join(process.cwd(), 'public', filePath))
        }
      } catch (error) {
        console.error(`Failed to delete file ${filePath}:`, error)
      }
    }

    // Delete from database
    // await db.media.delete({ where: { id: mediaId } })
  }

  async getMediaStats(): Promise<MediaStats> {
    // In production, calculate from database
    return {
      totalFiles: 150,
      totalSize: 500 * 1024 * 1024, // 500MB
      byCategory: {
        vehicle: { count: 80, size: 300 * 1024 * 1024 },
        service: { count: 30, size: 100 * 1024 * 1024 },
        banner: { count: 20, size: 50 * 1024 * 1024 },
        gallery: { count: 20, size: 50 * 1024 * 1024 }
      },
      byMimeType: {
        'image/webp': { count: 100, size: 300 * 1024 * 1024 },
        'image/jpeg': { count: 30, size: 150 * 1024 * 1024 },
        'image/png': { count: 20, size: 50 * 1024 * 1024 }
      },
      byMonth: {
        '2024-01': { count: 50, size: 200 * 1024 * 1024 },
        '2024-02': { count: 100, size: 300 * 1024 * 1024 }
      },
      storageUsage: {
        used: 500 * 1024 * 1024,
        available: 524 * 1024 * 1024, // ~524MB remaining
        total: 1024 * 1024 * 1024 // 1GB
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
    console.log('Applying watermark to:', imagePath)
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
    // In production, save to database using Prisma
    console.log('Saving media to database:', mediaFile.id)
  }

  private async getMediaById(mediaId: string): Promise<MediaFile> {
    // In production, fetch from database
    throw new Error('Not implemented')
  }
}

export const enhancedMediaService = EnhancedMediaService.getInstance()
export default EnhancedMediaService