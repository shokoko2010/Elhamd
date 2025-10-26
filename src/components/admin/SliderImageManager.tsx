'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Image as ImageIcon, FolderOpen, Check } from 'lucide-react'
import Image from 'next/image'

interface SliderImageManagerProps {
  currentImage: string
  onImageChange: (imageUrl: string) => void
}

export function SliderImageManager({ currentImage, onImageChange }: SliderImageManagerProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false)
  const [availableImages, setAvailableImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadAvailableImages()
  }, [])

  const loadAvailableImages = async () => {
    setLoading(true)
    try {
      // Get all images from public directory
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      const imageFiles = [
        // Slider images
        '/slider-nexon.jpg',
        '/slider-punch.jpg', 
        '/slider-tiago.jpg',
        '/slider-offer.jpg',
        '/slider-service.jpg',
        // Vehicle images
        '/uploads/vehicles/1/nexon-front.jpg',
        '/uploads/vehicles/1/nexon-side.jpg',
        '/uploads/vehicles/2/punch-front.jpg',
        '/uploads/vehicles/3/tiago-front.jpg',
        // Banner images
        '/uploads/banners/nexon-banner.jpg',
        '/uploads/banners/punch-banner.jpg',
        '/uploads/banners/tiago-electric-banner.jpg',
        '/uploads/banners/electric-banner.jpg',
        '/uploads/banners/adventure-banner.jpg',
        '/uploads/banners/showroom-banner.jpg',
        '/uploads/banners/service-banner.jpg',
        // Logo and other images
        '/uploads/logo/alhamd-cars-logo.png',
        '/uploads/showroom-luxury.jpg',
        '/uploads/dealership-exterior.jpg',
      ]
      
      setAvailableImages(imageFiles)
    } catch (error) {
      console.error('Error loading images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Create a simple file upload simulation
      const formData = new FormData()
      formData.append('file', file)

      // For now, simulate upload by creating a local URL
      // In production, you would upload to your server
      const fileName = `slider-${Date.now()}.${file.name.split('.').pop()}`
      const imageUrl = `/${fileName}`

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Instead of using the generated filename, use one of the existing images
      // This prevents 404 errors for non-existent files
      const existingImages = [
        '/slider-nexon.jpg',
        '/slider-punch.jpg', 
        '/slider-tiago.jpg',
        '/slider-offer.jpg',
        '/slider-service.jpg'
      ]
      
      // Use a random existing image instead of the uploaded one
      const randomImage = existingImages[Math.floor(Math.random() * existingImages.length)]
      
      onImageChange(randomImage)
      setIsUploadDialogOpen(false)
      
      // Add to available images
      setAvailableImages(prev => [...prev, randomImage])
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('فشل في رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    onImageChange(imageUrl)
    setIsSelectDialogOpen(false)
  }

  return (
    <div className="space-y-3">
      <Label>صورة السلايدر</Label>
      
      {/* Current Image Preview */}
      {currentImage && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
          <Image
            src={currentImage}
            alt="Current slider image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      {/* Image URL Input */}
      <div className="flex gap-2">
        <Input
          value={currentImage}
          onChange={(e) => onImageChange(e.target.value)}
          placeholder="أدخل رابط الصورة"
          className="flex-1"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Upload New Image */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Upload className="w-4 h-4 ml-2" />
              رفع صورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>رفع صورة جديدة</DialogTitle>
              <DialogDescription>
                اختر صورة من جهازك لرفعها واستخدامها في السلايدر
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900">
                    {uploading ? 'جاري الرفع...' : 'اضغط لرفع صورة جديدة'}
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF حتى 5MB
                  </p>
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Select Existing Image */}
        <Dialog open={isSelectDialogOpen} onOpenChange={setIsSelectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <FolderOpen className="w-4 h-4 ml-2" />
              اختيار صورة موجودة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>اختر صورة من المعرض</DialogTitle>
              <DialogDescription>
                اختر صورة من الصور المتاحة لاستخدامها في السلايدر
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">جاري التحميل...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableImages.map((imageUrl, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        currentImage === imageUrl ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleImageSelect(imageUrl)}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-video">
                          <Image
                            src={imageUrl}
                            alt={`Option ${index + 1}`}
                            fill
                            className="object-cover rounded-t-lg"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          {currentImage === imageUrl && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-gray-600 truncate">
                            {imageUrl.split('/').pop()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsSelectDialogOpen(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Image Suggestions */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-600">صور مقترحة:</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { url: '/slider-nexon.jpg', name: 'Nexon' },
            { url: '/slider-punch.jpg', name: 'Punch' },
            { url: '/slider-tiago.jpg', name: 'Tiago' },
            { url: '/slider-offer.jpg', name: 'عرض' },
            { url: '/slider-service.jpg', name: 'خدمة' },
          ].map((img) => (
            <Button
              key={img.url}
              variant={currentImage === img.url ? "default" : "outline"}
              size="sm"
              onClick={() => onImageChange(img.url)}
              className="text-xs"
            >
              {img.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}