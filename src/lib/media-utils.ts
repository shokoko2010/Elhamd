export type VehicleInfo = Partial<{
  make: string
  model: string
  trim: string
  year: number | string
  category: string
}>

export function slugifyForFilename(text: string, fallback = 'image'): string {
  if (!text?.trim()) {
    return fallback
  }

  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return normalized || fallback
}

export function buildVehicleImageAlt(
  vehicle: VehicleInfo,
  options?: { context?: string; imageIndex?: number }
): string {
  const parts: string[] = []

  if (options?.context) {
    parts.push(options.context)
  }

  if (vehicle.year) {
    parts.push(`موديل ${vehicle.year}`)
  }

  if (vehicle.make) {
    parts.push(vehicle.make)
  }

  if (vehicle.model) {
    parts.push(vehicle.model)
  }

  if (vehicle.trim) {
    parts.push(vehicle.trim)
  }

  if (vehicle.category) {
    parts.push(`فئة ${vehicle.category}`)
  }

  if (typeof options?.imageIndex === 'number') {
    parts.push(`صورة رقم ${options.imageIndex + 1}`)
  }

  const alt = parts.join(' ').replace(/\s+/g, ' ').trim()
  return alt || 'سيارة من شركة الحمد للاستيراد والتصدير'
}

export function buildSliderImageAlt(
  slide: Partial<{ title: string; subtitle: string; badge?: string; description?: string }>,
  options?: { index?: number }
): string {
  const parts = [slide.title, slide.subtitle, slide.badge, slide.description]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim())

  if (typeof options?.index === 'number') {
    parts.push(`شريحة رقم ${options.index + 1}`)
  }

  parts.push('عروض شركة الحمد للاستيراد والتصدير')

  return parts.join(' - ').replace(/\s+/g, ' ').trim()
}
