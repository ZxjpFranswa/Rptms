<template>
  <nav aria-label="Breadcrumb" class="mb-6">
    <ol class="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <li v-for="(item, i) in items" :key="i" class="flex items-center gap-2">
        <ChevronRight v-if="i > 0" class="h-4 w-4 shrink-0 text-emerald-500/70 dark:text-emerald-500/50" :stroke-width="2" aria-hidden="true" />
        <router-link
          v-if="item.to && i < items.length - 1"
          :to="item.to"
          class="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          {{ item.label }}
        </router-link>
        <span v-else class="font-semibold text-slate-800 dark:text-slate-100">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

export interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>
