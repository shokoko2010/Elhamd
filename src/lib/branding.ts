const distributorPhrase = 'الموزع المعتمد لسيارات تاتا في مدن القناة'
const distributorPhraseEn = 'Authorized Canal Cities distributor for Tata Motors'

const arabicExclusivePhrases = [
  'الوكيل الحصري لشركة تاتا موتورز في مصر',
  'الوكيل الحصري لشركة تاتا موتورز بمصر',
  'الوكيل الحصري لشركة تاتا موتورز',
  'الوكيل الحصري لسيارات تاتا موتورز في مصر',
  'الوكيل الحصري لسيارات تاتا موتورز بمصر',
  'الوكيل الحصري لسيارات تاتا في مصر',
  'الوكيل الحصري لسيارات تاتا',
  'وكيل تاتا موتورز الحصري في مصر',
  'الوكيل الحصري لتاتا موتورز في مصر',
  'الوكيل الحصري لتاتا في مصر',
  'الوكيل الحصري لتاتا موتورز',
  'الوكيل الحصري لتاتا'
]

const englishExclusivePhrases = [
  'exclusive distributor of tata motors in egypt',
  'exclusive dealer of tata motors in egypt',
  'exclusive tata motors dealer in egypt',
  'exclusive tata distributor in egypt'
]

const normalizeArabicBranding = (value: string) => {
  let normalized = value
  for (const phrase of arabicExclusivePhrases) {
    if (normalized.includes(phrase)) {
      normalized = normalized.replaceAll(phrase, distributorPhrase)
    }
  }
  return normalized
}

const normalizeEnglishBranding = (value: string) => {
  let normalized = value
  for (const phrase of englishExclusivePhrases) {
    if (normalized.toLowerCase().includes(phrase)) {
      const regex = new RegExp(phrase, 'gi')
      normalized = normalized.replace(regex, distributorPhraseEn)
    }
  }
  return normalized
}

export const normalizeBrandingText = (value?: string | null) => {
  if (!value || typeof value !== 'string') {
    return value ?? ''
  }

  let normalized = value
  normalized = normalizeArabicBranding(normalized)
  normalized = normalizeEnglishBranding(normalized)

  return normalized
}

export const normalizeBrandingObject = <T extends Record<string, any>>(value: T): T => {
  if (!value || typeof value !== 'object') {
    return value
  }

  const normalizedEntries = Object.entries(value).map(([key, field]) => {
    if (typeof field === 'string') {
      return [key, normalizeBrandingText(field)]
    }

    if (Array.isArray(field)) {
      return [
        key,
        field.map((entry) => {
          if (typeof entry === 'string') {
            return normalizeBrandingText(entry)
          }

          if (entry && typeof entry === 'object') {
            return normalizeBrandingObject(entry)
          }

          return entry
        })
      ]
    }

    if (field && typeof field === 'object') {
      return [key, normalizeBrandingObject(field)]
    }

    return [key, field]
  })

  return Object.fromEntries(normalizedEntries) as T
}

export const DISTRIBUTOR_BRANDING = distributorPhrase
export const DISTRIBUTOR_BRANDING_EN = distributorPhraseEn
