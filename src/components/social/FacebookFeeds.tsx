'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Facebook } from 'lucide-react'

interface FacebookFeedsProps {
  pageUrl?: string | null
}

const DEFAULT_PAGE_URL = 'https://www.facebook.com/elhamdimport'

export function FacebookFeeds({ pageUrl }: FacebookFeedsProps) {
  const [postsLoaded, setPostsLoaded] = useState(false)
  const [reelsLoaded, setReelsLoaded] = useState(false)

  const normalizedPageUrl = useMemo(() => {
    if (!pageUrl || typeof pageUrl !== 'string') {
      return DEFAULT_PAGE_URL
    }

    return pageUrl.trim() || DEFAULT_PAGE_URL
  }, [pageUrl])

  const encodedPageUrl = useMemo(() => encodeURIComponent(normalizedPageUrl), [normalizedPageUrl])

  const postsSrc = useMemo(
    () =>
      `https://www.facebook.com/plugins/page.php?href=${encodedPageUrl}&tabs=timeline&width=500&height=700&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`,
    [encodedPageUrl]
  )

  const reelsSrc = useMemo(
    () =>
      `https://www.facebook.com/plugins/page.php?href=${encodedPageUrl}&tabs=reels&width=500&height=700&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`,
    [encodedPageUrl]
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
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
            {!postsLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                <div className="text-center">
                  <div className="h-10 w-10 mx-auto mb-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  <p className="text-gray-500 font-medium">جاري تحميل المنشورات...</p>
                </div>
              </div>
            )}
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
            ></iframe>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
              <Facebook className="w-6 h-6" />
            </div>
            <div className="text-right">
              <CardTitle className="text-2xl font-bold text-gray-900">أحدث ريلز فيسبوك</CardTitle>
              <p className="text-sm text-gray-500">استمتع بمشاهدة مقاطعنا القصيرة مباشرة من فيسبوك</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-2xl overflow-hidden shadow-inner border border-gray-100">
            {!reelsLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                <div className="text-center">
                  <div className="h-10 w-10 mx-auto mb-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  <p className="text-gray-500 font-medium">جاري تحميل الريلز...</p>
                </div>
              </div>
            )}
            <iframe
              key={reelsSrc}
              src={reelsSrc}
              title="أحدث ريلز فيسبوك"
              width="100%"
              height="700"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allow="encrypted-media"
              loading="lazy"
              onLoad={() => setReelsLoaded(true)}
            ></iframe>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
