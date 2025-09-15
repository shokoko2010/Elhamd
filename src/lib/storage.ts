import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage'
import { storage } from './firebase'

export class StorageService {
  /**
   * رفع صورة سيارة جديدة
   */
  static async uploadVehicleImage(
    file: File,
    vehicleId: string,
    isPrimary: boolean = false,
    order: number = 0
  ): Promise<{ url: string; path: string }> {
    try {
      // إنشاء اسم فريد للملف
      const fileName = `${vehicleId}/${Date.now()}-${file.name}`
      const storageRef = ref(storage, `vehicle-images/${fileName}`)
      
      // رفع الملف
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snapshot.ref)
      
      console.log('Image uploaded successfully:', { url, path: fileName })
      return { url, path: fileName }
    } catch (error) {
      console.error('Error uploading image:', error)
      throw new Error('Failed to upload image')
    }
  }

  /**
   * حذف صورة سيارة
   */
  static async deleteVehicleImage(imagePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, `vehicle-images/${imagePath}`)
      await deleteObject(storageRef)
      console.log('Image deleted successfully:', imagePath)
    } catch (error) {
      console.error('Error deleting image:', error)
      throw new Error('Failed to delete image')
    }
  }

  /**
   * الحصول على جميع صور سيارة معينة
   */
  static async getVehicleImages(vehicleId: string): Promise<{ url: string; path: string }[]> {
    try {
      const storageRef = ref(storage, `vehicle-images/${vehicleId}`)
      const result = await listAll(storageRef)
      
      const imagePromises = result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef)
        return {
          url,
          path: itemRef.fullPath.replace('vehicle-images/', '')
        }
      })
      
      return await Promise.all(imagePromises)
    } catch (error) {
      console.error('Error getting vehicle images:', error)
      return []
    }
  }

  /**
   * رفع صورة ملف المستخدم
   */
  static async uploadUserProfileImage(
    file: File,
    userId: string
  ): Promise<{ url: string; path: string }> {
    try {
      const fileName = `users/${userId}/profile-${Date.now()}-${file.name}`
      const storageRef = ref(storage, fileName)
      
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snapshot.ref)
      
      return { url, path: fileName }
    } catch (error) {
      console.error('Error uploading profile image:', error)
      throw new Error('Failed to upload profile image')
    }
  }

  /**
   * حذف صورة ملف المستخدم
   */
  static async deleteUserProfileImage(imagePath: string): Promise<void> {
    try {
      const storageRef = ref(storage, imagePath)
      await deleteObject(storageRef)
    } catch (error) {
      console.error('Error deleting profile image:', error)
      throw new Error('Failed to delete profile image')
    }
  }

  /**
   * ضغط الصورة قبل الرفع (اختياري - يمكن إضافة مكتبة ضغط)
   */
  static async compressImage(file: File, quality: number = 0.7): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            }
          },
          file.type,
          quality
        )
      }
      
      img.src = URL.createObjectURL(file)
    })
  }
}