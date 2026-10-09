<template>
  <div class="relative" ref="dropdownRef">
    <!-- Bell Trigger Button -->
    <button
      @click="toggleDropdown"
      class="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 focus:outline-hidden"
      :title="unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'"
      aria-label="Notifications"
    >
      <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <!-- Badge for unread count -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white font-bold text-[10px] leading-[18px] rounded-full text-center shadow-xs flex items-center justify-center animate-pulse"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden transform transition-all animate-fadeIn"
    >
      <!-- Dropdown Header -->
      <div class="px-4 py-3.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/70 dark:bg-gray-800/90">
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-sm text-gray-900 dark:text-white">Notifications</h3>
          <span
            v-if="unreadCount > 0"
            class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300"
          >
            {{ unreadCount }} new
          </span>
        </div>

        <button
          v-if="unreadCount > 0"
          @click="handleMarkAllRead"
          :disabled="markingAll"
          class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition hover:underline disabled:opacity-50"
        >
          {{ markingAll ? 'Marking...' : 'Mark all read' }}
        </button>
      </div>

      <!-- Notification List -->
      <div class="max-h-[380px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
        <!-- Loading State -->
        <div v-if="loading && notifications.length === 0" class="p-8 text-center text-gray-400 text-xs">
          <svg class="animate-spin h-5 w-5 mx-auto mb-2 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Loading notifications...
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="p-8 text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">No notifications yet</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">You're completely up to date.</p>
        </div>

        <!-- Notification Items -->
        <div
          v-for="item in notifications"
          :key="item.id"
          @click="handleClickNotification(item)"
          :class="[
            'p-3.5 transition cursor-pointer flex items-start gap-3 relative group',
            item.is_read
              ? 'hover:bg-gray-50 dark:hover:bg-gray-700/40 opacity-80 hover:opacity-100'
              : 'bg-primary-50/40 dark:bg-primary-950/20 hover:bg-primary-50/70 dark:hover:bg-primary-900/30'
          ]"
        >
          <!-- Unread indicator dot -->
          <div
            v-if="!item.is_read"
            class="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400"
          ></div>

          <!-- Type Icon -->
          <div
            :class="[
              'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm shadow-xs',
              getTypeBadgeClass(item.type)
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <!-- Bill / Due -->
              <path
                v-if="item.type === 'bill_due' || item.type === 'bill_generated'"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
              <!-- Approved -->
              <path
                v-else-if="item.type.includes('approved')"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <!-- Denied / Cancelled -->
              <path
                v-else-if="item.type.includes('denied') || item.type.includes('cancelled')"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <!-- Pending Review -->
              <path
                v-else-if="item.type.includes('pending')"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <!-- Payment / Receipt -->
              <path
                v-else-if="item.type.includes('payment')"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <!-- Default info -->
              <path
                v-else
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <h4 class="text-xs font-bold text-gray-900 dark:text-white truncate">
                {{ item.title }}
              </h4>
              <span class="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                {{ formatRelativeTime(item.created_at) }}
              </span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
              {{ item.message }}
            </p>
          </div>
        </div>
      </div>

      <!-- Dropdown Footer -->
      <div class="p-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/80 text-center">
        <span class="text-[11px] text-gray-500 dark:text-gray-400">
          Real Property Tax Notification Center
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type UserNotificationItem,
} from '@/services/notificationApi'

const router = useRouter()
const dropdownRef = ref<HTMLElement | null>(null)

const isOpen = ref(false)
const loading = ref(false)
const markingAll = ref(false)
const notifications = ref<UserNotificationItem[]>([])
const unreadCount = ref(0)
let pollInterval: ReturnType<typeof setInterval> | null = null

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await loadNotifications()
  }
}

const loadNotifications = async () => {
  loading.value = true
  try {
    const res = await fetchNotifications()
    notifications.value = res.notifications || []
    unreadCount.value = res.unread_count || 0
  } catch {
    // Suppress network errors in local dev
  } finally {
    loading.value = false
  }
}

const handleMarkAllRead = async () => {
  markingAll.value = true
  try {
    await markAllNotificationsRead()
    notifications.value.forEach((n) => (n.is_read = true))
    unreadCount.value = 0
  } catch {
    // silent catch
  } finally {
    markingAll.value = false
  }
}

const handleClickNotification = async (item: UserNotificationItem) => {
  if (!item.is_read) {
    try {
      await markNotificationRead(item.id)
      item.is_read = true
      if (unreadCount.value > 0) unreadCount.value--
    } catch {
      // silent
    }
  }

  if (item.action_url) {
    isOpen.value = false
    router.push(item.action_url)
  }
}

const getTypeBadgeClass = (type: string) => {
  if (type.includes('approved')) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
  if (type.includes('denied') || type.includes('cancelled')) return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
  if (type.includes('pending')) return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
  if (type.includes('payment') || type.includes('receipt')) return 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
  if (type.includes('bill')) return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
  return 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
}

const formatRelativeTime = (isoString?: string) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSec < 60) return 'Just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  loadNotifications()
  document.addEventListener('click', handleClickOutside)
  // Poll every 30s for real-time background updates
  pollInterval = setInterval(loadNotifications, 30000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.15s ease-out;
}
</style>
