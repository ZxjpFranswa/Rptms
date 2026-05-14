<template>
  <div class="space-y-4">
    <p class="text-sm text-slate-600 dark:text-slate-400">
      System and workflow notifications. Mark as read to clear your inbox (persisted in this session).
    </p>
    <ul class="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-800 dark:bg-slate-900">
      <li
        v-for="n in visible"
        :key="n.id"
        class="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        :class="n.read ? 'bg-slate-50/80 dark:bg-slate-950/40' : 'bg-white dark:bg-slate-900'"
      >
        <div>
          <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ n.title }}</p>
          <p class="text-xs text-slate-600 dark:text-slate-400">{{ n.body }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ n.time }}</p>
        </div>
        <div class="flex shrink-0 gap-2">
          <button
            v-if="n.actionLabel && n.actionPath"
            type="button"
            class="btn-secondary btn-sm"
            @click="go(n.actionPath)"
          >
            {{ n.actionLabel }}
          </button>
          <button v-if="!n.read" type="button" class="btn-primary btn-sm" @click="markRead(n.id)">Mark read</button>
        </div>
      </li>
    </ul>
    <p v-if="!visible.length" class="text-center text-sm text-slate-500">No notifications.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const toast = useToastStore()

interface Notice {
  id: string
  title: string
  body: string
  time: string
  read: boolean
  actionLabel?: string
  actionPath?: string
}

const items = ref<Notice[]>([
  {
    id: '1',
    title: 'FAAS released',
    body: 'FAAS-2024-001 for PIN PIN-2024-002 is available under Released FAAS.',
    time: 'Today, 09:12',
    read: false,
    actionLabel: 'Open Released FAAS',
    actionPath: '/clerk/released-faas',
  },
  {
    id: '2',
    title: 'Application returned for correction',
    body: 'APP-2026-002 was returned by the assessor with remarks.',
    time: 'Yesterday',
    read: false,
    actionLabel: 'Encoding queue',
    actionPath: '/clerk/encoding-queue',
  },
  {
    id: '3',
    title: 'Scheduled maintenance',
    body: 'RPRAMS will be unavailable Sunday 02:00–04:00 for database patching.',
    time: 'May 10',
    read: true,
  },
])

const visible = computed(() => items.value)

const markRead = (id: string) => {
  const n = items.value.find((x) => x.id === id)
  if (n) n.read = true
  toast.push('Notification marked as read.', 'success')
}

const go = (path: string) => {
  router.push(path)
}
</script>
