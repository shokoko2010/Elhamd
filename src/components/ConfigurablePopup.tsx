'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, ExternalLink } from 'lucide-react'

interface PopupConfig {
  id: string
  title?: string
  content?: string
  imageUrl?: string
  linkUrl?: string
  buttonText?: string
  buttonColor: string
  textColor: string
  backgroundColor: string
  position: 'TOP_LEFT' | 'TOP_CENTER' | 'TOP_RIGHT' | 'CENTER' | 'BOTTOM_LEFT' | 'BOTTOM_CENTER' | 'BOTTOM_RIGHT'
  showDelay: number
  autoHide: boolean
  hideDelay: number
  isActive: boolean
  showOnPages: string
  targetAudience: 'all' | 'new' | 'returning' | 'guests'
  startDate?: string
  endDate?: string
  priority: number
}

interface PopupResponse {
  popup: PopupConfig | null
}

export default function ConfigurablePopup({ page = 'homepage' }: { page?: string }) {
  const [popup, setPopup] = useState<PopupConfig | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/public/popup?page=${page}`)
        const data: PopupResponse = await response.json()
        
        if (data.popup) {
          setPopup(data.popup)
          
          // Show popup after the specified delay
          setTimeout(() => {
            setIsVisible(true)
            // Set visited cookie for audience targeting
            document.cookie = 'visited_before=true; path=/; max-age=31536000'
          }, data.popup.showDelay)
        }
      } catch (error) {
        console.error('Error fetching popup config:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopup()
  }, [page])

  useEffect(() => {
    let hideTimer: NodeJS.Timeout
    
    if (isVisible && popup?.autoHide) {
      hideTimer = setTimeout(() => {
        setIsVisible(false)
      }, popup.hideDelay)
    }

    return () => {
      if (hideTimer) {
        clearTimeout(hideTimer)
      }
    }
  }, [isVisible, popup])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleButtonClick = () => {
    if (popup?.linkUrl) {
      window.open(popup.linkUrl, '_blank')
    }
    setIsVisible(false)
  }

  const getPositionClasses = () => {
    if (!popup) return ''
    
    switch (popup.position) {
      case 'TOP_LEFT':
        return 'top-4 left-4'
      case 'TOP_CENTER':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'TOP_RIGHT':
        return 'top-4 right-4'
      case 'CENTER':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      case 'BOTTOM_LEFT':
        return 'bottom-4 left-4'
      case 'BOTTOM_CENTER':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      case 'BOTTOM_RIGHT':
        return 'bottom-4 right-4'
      default:
        return 'bottom-4 right-4'
    }
  }

  const getWidthClasses = () => {
    if (!popup) return ''
    
    switch (popup.position) {
      case 'TOP_CENTER':
      case 'BOTTOM_CENTER':
        return 'w-full max-w-md'
      case 'CENTER':
        return 'w-full max-w-lg'
      default:
        return 'w-full max-w-sm'
    }
  }

  if (isLoading || !isVisible || !popup) {
    return null
  }

  return (
    <div className={`fixed z-50 ${getPositionClasses()} ${getWidthClasses()}`}>
      <Card 
        className="shadow-lg border-0 overflow-hidden"
        style={{ 
          backgroundColor: popup.backgroundColor,
          color: popup.textColor
        }}
      >
        <CardContent className="p-0">
          {/* Close button */}
          <div className="flex justify-start p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-white/20"
              style={{ color: popup.textColor }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-4 pb-4">
            {popup.imageUrl && (
              <div className="mb-4">
                <img
                  src={popup.imageUrl}
                  alt={popup.title || 'Popup image'}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}

            {popup.title && (
              <h3 className="text-lg font-semibold mb-2">
                {popup.title}
              </h3>
            )}

            {popup.content && (
              <p className="text-sm mb-4 opacity-90 leading-relaxed">
                {popup.content}
              </p>
            )}

            {popup.buttonText && (
              <Button
                onClick={handleButtonClick}
                className="w-full font-semibold transition-all hover:opacity-90"
                style={{ 
                  backgroundColor: popup.buttonColor,
                  color: popup.textColor
                }}
              >
                {popup.buttonText}
                {popup.linkUrl && <ExternalLink className="mr-2 h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}