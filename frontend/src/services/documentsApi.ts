import { useApi } from '@/composables/useApi'
import { endpoints } from '@/services/api'
import type { PropertyDocument } from '@/stores/property'

export async function uploadDocumentApi(
  applicationId: string,
  type: string,
  file: File,
): Promise<PropertyDocument> {
  const form = new FormData()
  form.append('type', type)
  form.append('file', file)

  const { data } = await useApi().post<PropertyDocument>(
    `${endpoints.applications}/${applicationId}/documents`,
    form,
  )
  return data
}

export async function verifyDocumentApi(
  applicationId: string,
  type: string,
  uploadStatus: 'Verified' | 'Rejected',
): Promise<PropertyDocument> {
  const { data } = await useApi().patch<PropertyDocument>(
    `${endpoints.applications}/${applicationId}/documents/${encodeURIComponent(type)}`,
    { uploadStatus },
  )
  return data
}

export async function fetchDocumentBlob(downloadUrl: string): Promise<string> {
  const { data } = await useApi().get<Blob>(downloadUrl, { responseType: 'blob' })
  return URL.createObjectURL(data)
}
