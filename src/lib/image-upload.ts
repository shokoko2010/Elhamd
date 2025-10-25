export class ImageUploadService {
  private static instance: ImageUploadService

  static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService()
    }
    return ImageUploadService.instance
  }

  async uploadVehicleImage(
    file: File,
    vehicleId: string,
    isPrimary: boolean = false,
    order: number = 0
  ): Promise<{ url: string; filename: string; size: number }> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('vehicleId', vehicleId)
      formData.append('isPrimary', isPrimary.toString())
      formData.append('order', order.toString())

      const response = await fetch('/api/upload/public', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في رفع الصورة')
      }

      const result = await response.json()
      
      // After uploading the file, add it to the database
      await this.addImageToDatabase(vehicleId, {
        imageUrl: result.url,
        altText: `${vehicleId} - صورة ${order + 1}`,
        isPrimary,
        order
      })

      return {
        url: result.url,
        filename: result.filename,
        size: result.size
      }
    } catch (error) {
      console.error('Error uploading vehicle image:', error)
      throw error
    }
  }

  private async addImageToDatabase(
    vehicleId: string,
    imageData: {
      imageUrl: string
      altText?: string
      isPrimary: boolean
      order: number
    }
  ): Promise<void> {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/images/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imageData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إضافة الصورة لقاعدة البيانات')
      }
    } catch (error) {
      console.error('Error adding image to database:', error)
      throw error
    }
  }

  async deleteVehicleImage(imagePath: string): Promise<void> {
    try {
      // For now, we'll just log the deletion
      // In a real implementation, you might want to delete the file from the server
    } catch (error) {
      console.error('Error deleting vehicle image:', error)
      throw error
    }
  }

  validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'نوع الملف غير مدعوم. يرجى استخدام JPEG, PNG, WebP, أو GIF'
      }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت'
      }
    }

    return { valid: true }
  }

  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max width 1200px)
        const maxWidth = 1200
        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }
}

// Export singleton instance
export const imageUploadService = ImageUploadService.getInstance()

// Backward compatibility
export const LocalStorageService = ImageUploadService.getInstance()