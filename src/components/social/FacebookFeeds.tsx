'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Facebook } from 'lucide-react'

interface FacebookFeedsProps {
  pageUrl?: string | null
  videoUrl?: string | null
}

const DEFAULT_PAGE_URL = 'https://www.facebook.com/elhamdimport'
const DEFAULT_VIDEO_URL = `${DEFAULT_PAGE_URL}/videos`

export function FacebookFeeds({ pageUrl, videoUrl }: FacebookFeedsProps) {
  const [postsLoaded, setPostsLoaded] = useState(false)
  const [videosLoaded, setVideosLoaded] = useState(false)
  const [postsError, setPostsError] = useState(false)
  const [videosError, setVideosError] = useState(false)

  const normalizedPageUrl = useMemo(() => {
    if (!pageUrl || typeof pageUrl !== 'string') {
      return DEFAULT_PAGE_URL
    }

    return pageUrl.trim() || DEFAULT_PAGE_URL
  }, [pageUrl])

  const normalizedVideoUrl = useMemo(() => {
    if (videoUrl && typeof videoUrl === 'string') {
      const trimmed = videoUrl.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }

    return `${normalizedPageUrl}/videos` || DEFAULT_VIDEO_URL
  }, [normalizedPageUrl, videoUrl])

  const derivedVideoPageUrl = useMemo(() => {
    try {
      const url = new URL(normalizedVideoUrl)
      if (url.hostname.includes('facebook.com')) {
        const parts = url.pathname.split('/').filter(Boolean)
        if (parts.length > 0) {
          const pageSlug = parts[0]
          return `${url.origin}/${pageSlug}`
        }
      }
    } catch (error) {
      // ignore parsing errors and fall back to page URL
    }

    return normalizedPageUrl
  }, [normalizedPageUrl, normalizedVideoUrl])

  const encodedPageUrl = useMemo(() => encodeURIComponent(normalizedPageUrl), [normalizedPageUrl])
  const encodedVideoPageUrl = useMemo(() => encodeURIComponent(derivedVideoPageUrl), [derivedVideoPageUrl])

  useEffect(() => {
    setVideosLoaded(false)
    setVideosError(false)
  }, [normalizedVideoUrl, normalizedPageUrl])

  useEffect(() => {
    const postsTimeout = window.setTimeout(() => {
      if (!postsLoaded) {
        setPostsError(true)
      }
    }, 8000)

    const videosTimeout = window.setTimeout(() => {
      if (!videosLoaded) {
        setVideosError(true)
      }
    }, 8000)

    return () => {
      window.clearTimeout(postsTimeout)
      window.clearTimeout(videosTimeout)
    }
  }, [postsLoaded, videosLoaded])

  const postsSrc = useMemo(
    () =>
      `https://www.facebook.com/plugins/page.php?href=${encodedPageUrl}&tabs=timeline&width=500&height=700&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`,
    [encodedPageUrl]
  )

  const videoSrc = useMemo(
    () =>
      `https://www.facebook.com/plugins/page.php?href=${encodedVideoPageUrl}&tabs=videos&width=500&height=700&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`,
    [encodedVideoPageUrl]
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" dir="ltr">
      <Card className="order-1 lg:order-1 border-0 shadow-lg bg-white/80 backdrop-blur-sm" dir="rtl">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
              <Facebook className="w-6 h-6" />
            </div>
            <div className="text-right">
              <CardTitle className="text-2xl font-bold text-gray-900">أحدث فيديوهات فيسبوك</CardTitle>
              <p className="text-sm text-gray-500">شاهد أحدث الفيديوهات والمقاطع من صفحتنا</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-2xl overflow-hidden shadow-inner border border-gray-100">
            {!videosLoaded && !videosError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                <div className="text-center">
                  <div className="h-10 w-10 mx-auto mb-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  <p className="text-gray-500 font-medium">جاري تحميل الفيديوهات...</p>
                </div>
              </div>
            )}
            {videosError ? (
              <div className="p-8 text-center text-gray-600 space-y-3">
                <p className="text-lg font-semibold text-gray-800">تعذر تحميل فيديوهات فيسبوك</p>
                <p className="text-sm">تحقق من رابط الصفحة أو أعد المحاولة لاحقًا.</p>
                <a
                  href={normalizedVideoUrl || normalizedPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                  زيارة الصفحة على فيسبوك
                </a>
              </div>
            ) : (
              <iframe
                key={videoSrc}
                src={videoSrc}
                title="أحدث فيديوهات فيسبوك"
                width="100%"
                height="700"
                style={{ border: 'none', overflow: 'hidden' }}
                scrolling="no"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
                onLoad={() => setVideosLoaded(true)}
                onError={() => setVideosError(true)}
              ></iframe>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="order-2 lg:order-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm" dir="rtl">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
              <Facebook className="w-6 h-6" />
            </div>
            <div className="text-right">
              <CardTitle className="text-2xl font-bold text-gray-900">آخر منشورات فيسبوك</CardTitle>
              <p className="text-sm text-gray-500">تابعوا جديد الأخبار والعروض على صفحتنا</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-2xl overflow-hidden shadow-inner border border-gray-100">
            {!postsLoaded && !postsError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                <div className="text-center">
                  <div className="h-10 w-10 mx-auto mb-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  <p className="text-gray-500 font-medium">جاري تحميل المنشورات...</p>
                </div>
              </div>
            )}
            {postsError ? (
              <div className="p-8 text-center text-gray-600 space-y-3">
                <p className="text-lg font-semibold text-gray-800">تعذر تحميل منشورات فيسبوك</p>
                <p className="text-sm">تحقق من رابط الصفحة أو أعد المحاولة لاحقًا.</p>
                <a
                  href={normalizedPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                  زيارة الصفحة على فيسبوك
                </a>
              </div>
            ) : (
              <iframe
                key={postsSrc}
                src={postsSrc}
                title="آخر منشورات فيسبوك"
                width="100%"
                height="700"
                style={{ border: 'none', overflow: 'hidden' }}
                scrolling="no"
                frameBorder="0"
                allow="encrypted-media"
                loading="lazy"
                onLoad={() => setPostsLoaded(true)}
                onError={() => setPostsError(true)}
              ></iframe>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
