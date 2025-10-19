"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Star, 
  StarOff, 
  Trash2, 
  GripVertical,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Vehicle, VehicleImage } from "@/lib/db";

interface VehicleImageManagerProps {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function VehicleImageManager({ 
  vehicle, 
  open, 
  onOpenChange, 
  onUpdate 
}: VehicleImageManagerProps) {
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchImages();
    }
  }, [open, vehicle.id]);

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle.id}/images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data.sort((a: VehicleImage, b: VehicleImage) => a.displayOrder - b.displayOrder));
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
      setError("Failed to load images");
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 100);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("isPrimary", images.length === 0 && i === 0 ? "true" : "false");

        const response = await fetch(`/api/admin/vehicles/${vehicle.id}/upload-image`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }
      }

      setUploadProgress(100);
      setSuccess(`Successfully uploaded ${files.length} image(s)`);
      fetchImages();
      onUpdate();
    } catch (error) {
      console.error("Upload failed:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, [vehicle.id, images.length, onUpdate]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(files);
    }
  }, [vehicle.id, images.length, onUpdate]);

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle.id}/images/${imageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Image deleted successfully");
        fetchImages();
        onUpdate();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
      setError("Failed to delete image");
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle.id}/images/${imageId}/primary`, {
        method: "PATCH",
      });

      if (response.ok) {
        setSuccess("Primary image updated successfully");
        fetchImages();
        onUpdate();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update primary image");
      }
    } catch (error) {
      console.error("Failed to update primary image:", error);
      setError("Failed to update primary image");
    }
  };

  const moveImage = async (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];

    // Update displayOrder
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      displayOrder: index,
    }));

    setImages(updatedImages);

    // Update backend
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle.id}/images`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: updatedImages.map(img => ({ id: img.id, displayOrder: img.displayOrder })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update image order");
        setImages(images);
      } else {
        setSuccess("Image order updated successfully");
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update image order:", error);
      setError("Failed to update image order");
      setImages(images);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Images - {vehicle.title}</DialogTitle>
          <DialogDescription>
            Upload, organize, and manage vehicle images. The first image will be used as the primary display image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Images</CardTitle>
              <CardDescription>
                Drag and drop images here or click to browse. Maximum file size: 10MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  draggedImageId
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports: JPEG, PNG, GIF, WebP (Max 10MB)
                  </p>
                </div>
              </div>

              {uploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Uploading images...</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {error && (
                <Alert className="mt-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mt-4" variant="default">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Images Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Current Images ({images.length})</CardTitle>
              <CardDescription>
                Use arrow buttons to reorder. Click the star to set primary image.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No images uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative group border rounded-lg overflow-hidden bg-background"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={image.url}
                          alt={`Vehicle image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay with actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetPrimary(image.id)}
                            disabled={image.isPrimary}
                          >
                            {image.isPrimary ? (
                              <Star className="h-4 w-4 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Primary badge */}
                        {image.isPrimary && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="default" className="bg-yellow-500 text-white">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {image.fileName}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            Order: {image.displayOrder + 1}
                          </p>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveImage(image.id, 'up')}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveImage(image.id, 'down')}
                              disabled={index === images.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              ↓
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}