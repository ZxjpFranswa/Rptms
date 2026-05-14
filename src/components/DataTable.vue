<template>
  <div class="w-full">
    <!-- Header with search and actions -->
    <div class="mb-6 flex items-center justify-between gap-4">
      <div v-if="showSearch" class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="input-field"
        />
      </div>
      <slot name="toolbar" />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50">
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 text-left text-sm font-semibold text-slate-900"
            >
              {{ column.label }}
            </th>
            <th v-if="$slots['row-actions']" class="px-6 py-4 text-right text-sm font-semibold text-slate-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in paginatedData"
            :key="idx"
            class="border-b border-slate-100 transition-colors hover:bg-slate-50"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 text-sm text-slate-900"
            >
              <slot :name="`cell-${column.key}`" :row="row">
                <span>{{ getNestedValue(row, column.key) }}</span>
              </slot>
            </td>
            <td v-if="$slots['row-actions']" class="px-6 py-4 text-right">
              <slot name="row-actions" :row="row" />
            </td>
          </tr>
          <tr v-if="filteredData.length === 0">
            <td
              :colspan="columns.length + ($slots['row-actions'] ? 1 : 0)"
              class="px-6 py-8 text-center text-slate-500"
            >
              <slot name="empty">No data available</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && totalPages > 1" class="mt-6 flex items-center justify-between">
      <div class="text-sm text-slate-600">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }}
      </div>
      <div class="flex gap-2">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="btn-secondary btn-sm"
        >
          Previous
        </button>
        <div class="flex items-center gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'btn-sm rounded',
              currentPage === page
                ? 'btn-primary'
                : 'btn-ghost'
            ]"
          >
            {{ page }}
          </button>
        </div>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="btn-secondary btn-sm"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue'

interface Column {
  key: string
  label: string
}

interface Props {
  data: T[]
  columns: Column[]
  pageSize?: number
  showSearch?: boolean
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  showSearch: true,
  showPagination: true,
})

const currentPage = ref(1)
const searchQuery = ref('')

const filteredData = computed(() => {
  if (!searchQuery.value) return props.data
  const query = searchQuery.value.toLowerCase()
  return props.data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(query)
    )
  )
})

const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / props.pageSize)
)

const startIndex = computed(() => (currentPage.value - 1) * props.pageSize)
const endIndex = computed(() => Math.min(startIndex.value + props.pageSize, filteredData.value.length))

const paginatedData = computed(() =>
  filteredData.value.slice(startIndex.value, endIndex.value)
)

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj) ?? '-'
}
</script>
