import { useApi } from '@/composables/useApi'

export interface UserNotificationItem {
  id: number
  user_id: string
  title: string
  message: string
  type: string
  action_url?: string | null
  is_read: boolean
  created_at: string
  updated_at?: string
}

export interface NotificationsResponse {
  notifications: UserNotificationItem[]
  unread_count: number
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
  const { data } = await useApi().get<NotificationsResponse>('/notifications')
  return data
}

export async function markNotificationRead(id: number | string): Promise<void> {
  await useApi().post(`/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await useApi().post('/notifications/read-all')
}
