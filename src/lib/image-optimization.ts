import sharp from 'sharp'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

export interface ImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export interface ValidationResult {
  valid: boolean
  error?: string
  maxSize?: number
  allowedTypes?: string[]
}

export class ImageOptimizationService {
  private static instance: ImageOptimizationService
  private uploadDir: string
  private maxFileSize: number // 5MB
  private allowedTypes: string[]
  private defaultQuality: number

  private constructor() {
    this.uploadDir = join(process.cwd(), 'public', 'uploads')
    this.maxFileSize = 5 * 1024 * 1024 // 5MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    this.defaultQuality = 80
  }

  static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService()
    }
    return ImageOptimizationService.instance
  }

  validateImage(file: File): ValidationResult {
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' }
    }

    if (!this.allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Invalid image type. Allowed types: ${this.allowedTypes.join(', ')}`,
        allowedTypes: this.allowedTypes
      }
    }

    if (file.size > this.maxFileSize) {
      return { 
        valid: false, 
        error: `Image size must be less than ${this.maxFileSize / (1024 * 1024)}MB`,
        maxSize: this.maxFileSize
      }
    }

    return { valid: true }
  }

  async optimizeImage(
    buffer: Buffer,
    options: ImageOptions = {}
  ): Promise<Buffer> {
    const {
      width,
      height,
      quality = this.defaultQuality,
      format = 'jpeg',
      fit = 'cover'
    } = options

    let pipeline = sharp(buffer)

    // Resize if dimensions are provided
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit,
        withoutEnlargement: true
      })
    }

    // Apply format-specific optimizations
    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, mozjpeg: true })
        break
      case 'png':
        pipeline = pipeline.png({ quality, compressionLevel: 9 })
        break
      case 'webp':
        pipeline = pipeline.webp({ quality, effort: 6 })
        break
    }

    return await pipeline.toBuffer()
  }

  async generateThumbnails(
    buffer: Buffer,
    imageId: string
  ): Promise<{ [key: string]: string }> {
    const thumbnailSizes = {
      small: { width: 150, height: 150 },
      medium: { width: 300, height: 300 },
      large: { width: 600, height: 600 }
    }

    const thumbnails: { [key: string]: string } = {}

    if (thumbnailSizes && typeof thumbnailSizes === 'object') {
      for (const [size, dimensions] of Object.entries(thumbnailSizes)) {
        const optimizedBuffer = await this.optimizeImage(buffer, {
          ...dimensions,
          quality: 70,
          format: 'webp'
        })

        const filename = `${imageId}_${size}.webp`
        const filepath = join(this.uploadDir, 'thumbnails', filename)
        
        await this.ensureDirectory(dirname(filepath))
        await writeFile(filepath, optimizedBuffer)
        
        thumbnails[size] = `/uploads/thumbnails/${filename}`
      }
    }

    return thumbnails
  }

  async saveVehicleImage(
    file: File,
    vehicleId: string,
    isPrimary: boolean = false,
    order: number = 0
  ): Promise<{
    originalUrl: string
    optimizedUrl: string
    thumbnails: { [key: string]: string }
    filename: string
    filesize: number
  }> {
    // Validate file
    const validation = this.validateImage(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const imageId = `${vehicleId}_${timestamp}_${randomId}`
    const extension = file.type.split('/')[1]
    const filename = `${imageId}.${extension}`

    // Create paths
    const originalPath = join(this.uploadDir, 'vehicles', 'original', filename)
    const optimizedPath = join(this.uploadDir, 'vehicles', 'optimized', filename)

    // Ensure directories exist
    await this.ensureDirectory(dirname(originalPath))
    await this.ensureDirectory(dirname(optimizedPath))

    // Save original image
    await writeFile(originalPath, buffer)

    // Optimize and save image
    const optimizedBuffer = await this.optimizeImage(buffer, {
      width: 1200,
      height: 800,
      quality: 85,
      format: 'webp'
    })

    const optimizedFilename = `${imageId}.webp`
    const optimizedFinalPath = join(this.uploadDir, 'vehicles', 'optimized', optimizedFilename)
    await writeFile(optimizedFinalPath, optimizedBuffer)

    // Generate thumbnails
    const thumbnails = await this.generateThumbnails(buffer, imageId)

    return {
      originalUrl: `/uploads/vehicles/original/${filename}`,
      optimizedUrl: `/uploads/vehicles/optimized/${optimizedFilename}`,
      thumbnails,
      filename: optimizedFilename,
      filesize: optimizedBuffer.length
    }
  }

  async saveServiceImage(
    file: File,
    serviceId: string
  ): Promise<{
    url: string
    thumbnails: { [key: string]: string }
    filename: string
    filesize: number
  }> {
    // Validate file
    const validation = this.validateImage(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const imageId = `service_${serviceId}_${timestamp}_${randomId}`

    // Create path
    const dirPath = join(this.uploadDir, 'services')
    const filename = `${imageId}.webp`
    const filepath = join(dirPath, filename)

    // Ensure directory exists
    await this.ensureDirectory(dirPath)

    // Optimize and save image
    const optimizedBuffer = await this.optimizeImage(buffer, {
      width: 800,
      height: 600,
      quality: 80,
      format: 'webp'
    })

    await writeFile(filepath, optimizedBuffer)

    // Generate thumbnails
    const thumbnails = await this.generateThumbnails(buffer, imageId)

    return {
      url: `/uploads/services/${filename}`,
      thumbnails,
      filename,
      filesize: optimizedBuffer.length
    }
  }

  async deleteImage(imagePath: string): Promise<void> {
    try {
      // Remove leading slash if present
      const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
      const fullPath = join(process.cwd(), 'public', cleanPath)

      if (existsSync(fullPath)) {
        await unlink(fullPath)
      }

      // Also delete thumbnails if they exist
      const filename = fullPath.split('/').pop()?.split('.')[0]
      if (filename) {
        const thumbnailDir = join(dirname(fullPath), '..', 'thumbnails')
        const thumbnailFiles = [
          join(thumbnailDir, `${filename}_small.webp`),
          join(thumbnailDir, `${filename}_medium.webp`),
          join(thumbnailDir, `${filename}_large.webp`)
        ]

        await Promise.all(
          thumbnailFiles.map(async (file) => {
            if (existsSync(file)) {
              await unlink(file)
            }
          })
        )
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      throw new Error('Failed to delete image')
    }
  }

  async getImageMetadata(imagePath: string): Promise<{
    width: number
    height: number
    format: string
    size: number
  }> {
    try {
      const fullPath = join(process.cwd(), 'public', imagePath.startsWith('/') ? imagePath.slice(1) : imagePath)
      const metadata = await sharp(fullPath).metadata()
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: metadata.size || 0
      }
    } catch (error) {
      console.error('Error getting image metadata:', error)
      throw new Error('Failed to get image metadata')
    }
  }

  async batchOptimizeImages(
    imageFiles: File[],
    options: ImageOptions = {}
  ): Promise<Array<{ filename: string; buffer: Buffer; size: number }>> {
    return Promise.all(
      imageFiles.map(async (file) => {
        const validation = this.validateImage(file)
        if (!validation.valid) {
          throw new Error(`Invalid image ${file.name}: ${validation.error}`)
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const optimizedBuffer = await this.optimizeImage(buffer, options)
        
        return {
          filename: file.name,
          buffer: optimizedBuffer,
          size: optimizedBuffer.length
        }
      })
    )
  }

  private async ensureDirectory(dirPath: string): Promise<void> {
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true })
    }
  }

  // Utility method to get image URL with proper sizing
  getImageUrl(
    basePath: string,
    size: 'small' | 'medium' | 'large' | 'original' | 'optimized' = 'optimized'
  ): string {
    if (size === 'original' || size === 'optimized') {
      return basePath
    }

    const filename = basePath.split('/').pop()?.split('.')[0]
    if (!filename) {
      return basePath
    }

    return `/uploads/thumbnails/${filename}_${size}.webp`
  }

  // Method to create responsive image set
  createResponsiveImageSet(basePath: string): string {
    const sizes = [
      { size: 'small', width: 150 },
      { size: 'medium', width: 300 },
      { size: 'large', width: 600 }
    ]

    return sizes
      .map(({ size, width }) => `${this.getImageUrl(basePath, size)} ${width}w`)
      .join(', ')
  }
}