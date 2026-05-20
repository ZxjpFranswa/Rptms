export const DOCUMENT_TYPES = [
  'Title',
  'Tax Declaration',
  'Survey Plan',
  'Building Permit',
  'Government ID',
  'Deed of Sale',
  'Affidavit',
  'Exemption Document',
] as const

export const REQUIRED_DOCUMENT_TYPES = ['Title', 'Tax Declaration', 'Government ID'] as const

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export const ACCEPTED_DOCUMENT_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'] as const

export const ACCEPTED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const
