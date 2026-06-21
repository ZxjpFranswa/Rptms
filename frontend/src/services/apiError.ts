import type { AxiosError } from 'axios'

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>
  const status = axiosError.response?.status
  const data = axiosError.response?.data
  const message =
    data?.message ||
    (data?.errors ? Object.values(data.errors).flat().join(' ') : undefined) ||
    axiosError.message ||
    'Request failed'

  return new ApiError(message, status, data?.errors)
}
