<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <!-- Toolbar -->
    <div class="p-4 sm:p-6 border-b border-gray-200 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
        <div class="flex items-center gap-3">
          <slot name="toolbar-actions" />
          <button
            v-if="showExport"
            type="button"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            @click="exportCsv"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
          <MagnifyingGlassIcon class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <select
          v-if="statusFilterKey"
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
        >
          <option value="">All Statuses</option>
          <option v-for="opt in statusOptions" :key="opt" :value="opt">
            {{ formatStatus(opt) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="p-6 space-y-4">
      <div v-for="n in 5" :key="n" class="h-10 bg-gray-100 rounded-lg animate-pulse" />
    </div>

    <template v-else>
      <!-- ── MOBILE: Card list (shown below md) ── -->
      <div class="md:hidden divide-y divide-gray-200">
        <div
          v-if="paginatedData.length === 0"
          class="p-10 text-center"
        >
          <DocumentTextIcon class="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 font-medium">No data available</p>
          <p v-if="searchQuery || statusFilter" class="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        </div>

        <div
          v-for="(row, index) in paginatedData"
          :key="rowKey(row, index)"
          class="p-4 space-y-2"
        >
          <div
            v-for="column in columns"
            :key="column.key"
            class="flex justify-between items-start gap-3 text-sm"
          >
            <span class="font-medium text-gray-500 flex-shrink-0">{{ column.label }}</span>
            <span
              v-if="column.type === 'status'"
              :class="['inline-block px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(String(row[column.key]))]"
            >
              {{ formatStatus(String(row[column.key])) }}
            </span>
            <span v-else-if="column.type === 'date'" class="text-gray-700 text-right">
              {{ formatDate(String(row[column.key])) }}
            </span>
            <span v-else class="text-gray-700 text-right break-words">{{ row[column.key] }}</span>
          </div>

          <!-- Actions for card row -->
          <div v-if="hasActions" class="pt-2 flex justify-end">
            <Menu as="div" class="relative inline-block text-left">
              <MenuButton class="p-2 hover:bg-gray-100 rounded-lg transition inline-flex items-center gap-1 text-sm text-gray-600">
                <EllipsisVerticalIcon class="w-5 h-5" />
                Actions
              </MenuButton>
              <transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <MenuItems class="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <MenuItem
                    v-for="action in visibleActions(row)"
                    :key="action.label"
                    v-slot="{ active }"
                  >
                    <button
                      type="button"
                      :class="[active ? 'bg-gray-100' : '', 'block w-full px-4 py-2 text-left text-sm text-gray-700 first:rounded-t-lg last:rounded-b-lg']"
                      @click="handleAction(action, row)"
                    >
                      {{ action.label }}
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>

      <!-- ── DESKTOP: Table (hidden below md) ── -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th v-for="column in columns" :key="column.key" class="px-6 py-3 text-left">
                <button
                  v-if="column.sortable"
                  type="button"
                  class="flex items-center gap-2 font-semibold text-sm text-gray-700 hover:text-gray-900"
                  @click="toggleSort(column.key)"
                >
                  {{ column.label }}
                  <ChevronUpIcon
                    v-if="sortKey === column.key"
                    :class="['w-4 h-4', sortOrder === 'desc' ? 'rotate-180' : '']"
                  />
                </button>
                <span v-else class="font-semibold text-sm text-gray-700">{{ column.label }}</span>
              </th>
              <th v-if="hasActions" class="px-6 py-3 text-right">
                <span class="font-semibold text-sm text-gray-700">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(row, index) in paginatedData"
              :key="rowKey(row, index)"
              class="hover:bg-gray-50 transition"
            >
              <td v-for="column in columns" :key="column.key" class="px-6 py-4">
                <span
                  v-if="column.type === 'status'"
                  :class="['inline-block px-3 py-1 rounded-full text-xs font-semibold', getStatusColor(String(row[column.key]))]"
                >
                  {{ formatStatus(String(row[column.key])) }}
                </span>
                <span v-else-if="column.type === 'date'" class="text-sm text-gray-700">
                  {{ formatDate(String(row[column.key])) }}
                </span>
                <span v-else class="text-sm text-gray-700">{{ row[column.key] }}</span>
              </td>
              <td v-if="hasActions" class="px-6 py-4 text-right relative">
                <Menu as="div" class="relative inline-block text-left">
                  <MenuButton class="p-2 hover:bg-gray-100 rounded-lg transition inline-flex">
                    <EllipsisVerticalIcon class="w-5 h-5 text-gray-600" />
                  </MenuButton>
                  <transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0"
                  >
                    <MenuItems class="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                      <MenuItem
                        v-for="action in visibleActions(row)"
                        :key="action.label"
                        v-slot="{ active }"
                      >
                        <button
                          type="button"
                          :class="[active ? 'bg-gray-100' : '', 'block w-full px-4 py-2 text-left text-sm text-gray-700 first:rounded-t-lg last:rounded-b-lg']"
                          @click="handleAction(action, row)"
                        >
                          {{ action.label }}
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </transition>
                </Menu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state (desktop) -->
      <div v-if="paginatedData.length === 0" class="hidden md:block p-12 text-center">
        <DocumentTextIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500 font-medium">No data available</p>
        <p v-if="searchQuery || statusFilter" class="text-sm text-gray-400 mt-1">
          Try adjusting your search or filters
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredData.length > 0"
        class="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3"
      >
        <p class="text-sm text-gray-600">
          Showing <span class="font-semibold">{{ rangeStart }}</span> to
          <span class="font-semibold">{{ rangeEnd }}</span> of
          <span class="font-semibold">{{ filteredData.length }}</span> results
        </p>
        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="currentPage === 1"
            class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            @click="currentPage = Math.max(1, currentPage - 1)"
          >
            Previous
          </button>
          <span class="text-sm text-gray-600">
            Page <span class="font-semibold">{{ currentPage }}</span> of
            <span class="font-semibold">{{ totalPages }}</span>
          </span>
          <button
            type="button"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import {
  ArrowDownTrayIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'

export interface Column {
  key: string
  label: string
  type?: 'text' | 'status' | 'date'
  sortable?: boolean
}

export interface Action {
  label: string
  color?: 'primary' | 'danger' | 'warning'
  when?: (row: Record<string, unknown>) => boolean
}

interface Props {
  title: string
  columns: Column[]
  data: Record<string, unknown>[]
  actions?: Action[]
  showExport?: boolean
  itemsPerPage?: number
  loading?: boolean
  statusFilterKey?: string
  rowIdKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  showExport: true,
  itemsPerPage: 10,
  loading: false,
  rowIdKey: 'id',
})

const emit = defineEmits<{
  action: [action: Action, row: Record<string, unknown>]
}>()

const searchQuery = ref('')
const statusFilter = ref('')
const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)

const statusOptions = computed(() => {
  if (!props.statusFilterKey) return []
  const set = new Set<string>()
  props.data.forEach((row) => {
    const val = row[props.statusFilterKey!]
    if (val) set.add(String(val))
  })
  return Array.from(set)
})

const filteredData = computed(() => {
  let result = [...props.data]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(q)),
    )
  }

  if (statusFilter.value && props.statusFilterKey) {
    result = result.filter((row) => String(row[props.statusFilterKey!]) === statusFilter.value)
  }

  if (sortKey.value) {
    result.sort((a, b) => {
      const aVal = String(a[sortKey.value] ?? '')
      const bVal = String(b[sortKey.value] ?? '')
      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / props.itemsPerPage)),
)

const paginatedData = computed(() =>
  filteredData.value.slice(
    (currentPage.value - 1) * props.itemsPerPage,
    currentPage.value * props.itemsPerPage,
  ),
)

const rangeStart = computed(() =>
  filteredData.value.length === 0 ? 0 : (currentPage.value - 1) * props.itemsPerPage + 1,
)

const rangeEnd = computed(() =>
  Math.min(currentPage.value * props.itemsPerPage, filteredData.value.length),
)

const hasActions = computed(() => props.actions && props.actions.length > 0)

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

const rowKey = (row: Record<string, unknown>, index: number) =>
  String(row[props.rowIdKey] ?? index)

const visibleActions = (row: Record<string, unknown>) =>
  props.actions?.filter((a) => (a.when ? a.when(row) : true)) ?? []

const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

const getStatusColor = (status: string): string => {
  const s = status.toLowerCase()
  if (s.includes('active')) return 'bg-emerald-100 text-emerald-800'
  if (s.includes('returned')) return 'bg-yellow-100 text-yellow-800'
  if (s.includes('rejected')) return 'bg-red-100 text-red-800'
  if (s.includes('review')) return 'bg-blue-100 text-blue-800'
  return 'bg-gray-100 text-gray-800'
}

const formatStatus = (status: string): string => status.replace(/_/g, ' ')

const formatDate = (date: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const handleAction = (action: Action, row: Record<string, unknown>) => {
  emit('action', action, row)
}

const exportCsv = () => {
  const headers = props.columns.map((c) => c.label).join(',')
  const rows = filteredData.value.map((row) =>
    props.columns
      .map((c) => {
        const val = String(row[c.key] ?? '').replace(/"/g, '""')
        return `"${val}"`
      })
      .join(','),
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.title.replace(/\s+/g, '_').toLowerCase()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>
