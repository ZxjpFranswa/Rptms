import {
  ACCEPTED_DOCUMENT_EXTENSIONS,
  ACCEPTED_DOCUMENT_MIME_TYPES,
  DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from '@/constants/documents'
import { SAMPLE_IMAGE_DATA_URL, SAMPLE_PDF_DATA_URL } from '@/constants/sampleDocuments'
import { fetchDocumentBlob } from '@/services/documentsApi'
import type { PropertyDocument } from '@/stores/property'

export function createEmptyDocuments(): PropertyDocument[] {
  return DOCUMENT_TYPES.map((type) => ({
    type,
    uploadStatus: 'Pending',
  }))
}

export function inferMimeType(fileName?: string, mimeType?: string): string | undefined {
  if (mimeType) return mimeType
  if (!fileName) return undefined
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'application/pdf'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return undefined
}

export function validateDocumentFile(file: File): string | null {
  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
  const mimeOk = ACCEPTED_DOCUMENT_MIME_TYPES.includes(
    file.type as (typeof ACCEPTED_DOCUMENT_MIME_TYPES)[number],
  )
  const extOk = ACCEPTED_DOCUMENT_EXTENSIONS.includes(
    ext as (typeof ACCEPTED_DOCUMENT_EXTENSIONS)[number],
  )

  if (!mimeOk && !extOk) {
    return 'Only PDF, JPG, and PNG files are allowed.'
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return 'File must be 10MB or smaller.'
  }
  return null
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function applyFileToDocument(
  doc: PropertyDocument,
  file: File,
  applicationId?: string,
): Promise<PropertyDocument> {
  if (doc.previewUrl) {
    URL.revokeObjectURL(doc.previewUrl)
  }

  if (!applicationId) {
    throw new Error(
      'Cannot upload document: the application draft has not been created yet. Please complete the previous steps first.',
    )
  }

  const { uploadDocumentApi } = await import('@/services/documentsApi')
  const uploaded = await uploadDocumentApi(applicationId, doc.type, file)
  const mime = uploaded.mimeType || inferMimeType(uploaded.fileName) || ''
  const isImage = mime.startsWith('image/')
  const isPdf = mime === 'application/pdf'
  let previewUrl: string | undefined

  if (uploaded.downloadUrl && (isImage || isPdf)) {
    previewUrl = await fetchDocumentBlob(uploaded.downloadUrl)
  }

  return {
    ...uploaded,
    previewUrl,
  }
}


export function clearDocumentFile(doc: PropertyDocument): PropertyDocument {
  if (doc.previewUrl) {
    URL.revokeObjectURL(doc.previewUrl)
  }
  return {
    type: doc.type,
    uploadStatus: 'Pending',
  }
}

export function documentsForStorage(docs: PropertyDocument[]): PropertyDocument[] {
  return docs.map((doc) => {
    const d = { ...doc }
    delete d.previewUrl
    delete d.dataUrl
    return d
  })
}

export async function resolveDocumentViewUrl(doc: PropertyDocument): Promise<string | undefined> {
  if (doc.previewUrl) return doc.previewUrl

  if (doc.downloadUrl) {
    try {
      return await fetchDocumentBlob(doc.downloadUrl)
    } catch {
      return undefined
    }
  }

  if (doc.dataUrl) return doc.dataUrl
  if (!doc.fileName) return undefined

  const mime = inferMimeType(doc.fileName, doc.mimeType)
  if (mime === 'application/pdf') return SAMPLE_PDF_DATA_URL
  if (mime?.startsWith('image/')) return SAMPLE_IMAGE_DATA_URL
  return SAMPLE_PDF_DATA_URL
}

export function isDocumentViewable(doc: PropertyDocument): boolean {
  return !!(doc.fileName && (doc.downloadUrl || doc.previewUrl || doc.dataUrl))
}

export async function documentForViewer(doc: PropertyDocument): Promise<PropertyDocument> {
  const mimeType = inferMimeType(doc.fileName, doc.mimeType)
  const viewUrl = await resolveDocumentViewUrl(doc)
  return {
    ...doc,
    mimeType,
    previewUrl: viewUrl,
  }
}

export function countUploadedDocuments(docs: PropertyDocument[]): number {
  return docs.filter((d) => d.uploadStatus === 'Uploaded' || d.uploadStatus === 'Verified').length
}

export function missingRequiredDocuments(docs: PropertyDocument[]): string[] {
  const required = ['Title', 'Tax Declaration', 'Government ID']
  return required.filter((type) => {
    const doc = docs.find((d) => d.type === type)
    return !doc || doc.uploadStatus === 'Pending'
  })
}
