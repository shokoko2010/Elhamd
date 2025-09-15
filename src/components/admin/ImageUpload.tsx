'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Star, 
  Trash2,
  AlertCircle
} from 'lucide-react'
import { StorageService } from '@/lib/storage'

interface ImageUploadProps {
  vehicleId: string
  currentImages: Array<{ id: string; url: string; path: string; isPrimary: boolean; order: number }>
  onImagesChange: (images: Array<{ id: string; url: string; path: string; isPrimary: boolean; order: number }>) => void
  maxImages?: number
  className?: string
}

export function ImageUpload({
  vehicleId,
  currentImages,
  onImagesChange,
  maxImages = 10,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files)
    }
  }, [currentImages, maxImages])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    if (currentImages.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      // Upload image
      const result = await StorageService.uploadVehicleImage(
        file,
        vehicleId,
        currentImages.length === 0, // First image is primary
        currentImages.length
      )

      // Add new image to list
      const newImage = {
        id: Date.now().toString(),
        url: result.url,
        path: result.path,
        isPrimary: currentImages.length === 0,
        order: currentImages.length
      }

      onImagesChange([...currentImages, newImage])
      setUploadProgress(100)
    } catch (err) {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const removeImage = async (imageId: string, imagePath: string) => {
    try {
      await StorageService.deleteVehicleImage(imagePath)
      const updatedImages = currentImages
        .filter(img => img.id !== imageId)
        .map((img, index) => ({
          ...img,
          order: index,
          isPrimary: index === 0 && img.isPrimary
        }))
      onImagesChange(updatedImages)
    } catch (err) {
      setError('Failed to delete image')
    }
  }

  const setPrimaryImage = (imageId: string) => {
    const updatedImages = currentImages.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }))
    onImagesChange(updatedImages)
  }

  return (
    <div className={className}>
      {/* Upload Area */}
      <Card className="mb-4">
        <CardContent className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : uploading
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading || currentImages.length >= maxImages}
            />
            
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {uploading ? 'Uploading...' : 'Drop images here or click to upload'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB (max {maxImages} images)
                </p>
              </div>
              
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-500">{uploadProgress}%</p>
                </div>
              )}
              
              {currentImages.length >= maxImages && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Maximum number of images reached ({maxImages})
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative group">
                    <img
                      src={image.url}
                      alt="Vehicle"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 flex items-center justify-center space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPrimaryImage(image.id)}
                          disabled={image.isPrimary}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(image.id, image.path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {image.isPrimary && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500">
                        Primary
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {currentImages.length === 0 && !uploading && (
        <Card>
          <CardContent className="p-6 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No images uploaded yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}