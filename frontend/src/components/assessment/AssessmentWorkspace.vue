<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <div>
        <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
        <p class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
      </div>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <button
        v-for="card in cards"
        :key="card.label"
        type="button"
        :class="[
          'text-left rounded-xl p-4 border bg-white shadow-sm transition hover:shadow-md',
          card.filter && filters.status === card.filter
            ? 'border-primary-600 ring-2 ring-primary-200'
            : 'border-gray-200',
          !card.filter && 'cursor-default',
        ]"
        @click="card.filter && toggleStatus(card.filter)"
      >
        <p class="text-xs uppercase tracking-wide text-gray-500">{{ card.label }}</p>
        <p :class="['mt-1 font-bold', card.money ? 'text-xl' : 'text-3xl', card.tone]">
          {{ card.money ? peso(card.value) : card.value }}
        </p>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <input
        v-model="filters.search"
        type="search"
        placeholder="Search ref, PIN, taxpayer, barangay…"
        class="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
        @input="debouncedLoad"
      />
      <select v-model="filters.status" class="px-3 py-2 border border-gray-300 rounded-lg text-sm" @change="load(1)">
        <option value="">All statuses</option>
        <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <select v-model="filters.classification" class="px-3 py-2 border border-gray-300 rounded-lg text-sm" @change="load(1)">
        <option value="">All classifications</option>
        <option v-for="c in classes" :key="c">{{ c }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Reference</th>
              <th class="px-4 py-3">Taxpayer</th>
              <th class="px-4 py-3">Barangay</th>
              <th class="px-4 py-3">Class</th>
              <th class="px-4 py-3 text-right">Market Value</th>
              <th class="px-4 py-3 text-right">Assessed Value</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="8" class="px-4 py-10 text-center text-gray-500">Loading…</td>
            </tr>
            <tr v-else-if="!rows.length">
              <td colspan="8" class="px-4 py-10 text-center text-gray-500">No matching records.</td>
            </tr>
            <template v-else>
            <tr
              v-for="row in rows"
              :key="row.application_id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="open(row)"
            >
              <td class="px-4 py-3">
                <p class="font-semibold text-gray-900">{{ row.intake_ref }}</p>
                <p class="text-xs text-gray-500">{{ row.pin || 'No PIN' }}</p>
              </td>
              <td class="px-4 py-3 text-gray-800">{{ row.taxpayer_name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ row.barangay }}</td>
              <td class="px-4 py-3 text-gray-600">{{ row.property_type }}</td>
              <td class="px-4 py-3 text-right text-gray-800">{{ row.assessment ? peso(row.assessment.total_market_value) : '—' }}</td>
              <td class="px-4 py-3 text-right font-semibold text-emerald-700">{{ row.assessment ? peso(row.assessment.total_assessed_value) : '—' }}</td>
              <td class="px-4 py-3">
                <span :class="['px-2.5 py-1 rounded-full text-xs font-semibold', badge(row)]">
                  {{ label(row) }}
                </span>
                <p v-if="row.assessment?.td_number" class="text-xs text-emerald-700 mt-1">{{ row.assessment.td_number }}</p>
              </td>
              <td class="px-4 py-3 text-right">
                <span class="text-primary-700 font-semibold text-xs whitespace-nowrap">{{ actionLabel(row) }} →</span>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
        <span>{{ meta.total }} record{{ meta.total === 1 ? '' : 's' }}</span>
        <div class="flex items-center gap-2">
          <button type="button" class="px-3 py-1 border rounded-lg disabled:opacity-40" :disabled="meta.current_page <= 1" @click="load(meta.current_page - 1)">Prev</button>
          <span>Page {{ meta.current_page }} / {{ meta.last_page }}</span>
          <button type="button" class="px-3 py-1 border rounded-lg disabled:opacity-40" :disabled="meta.current_page >= meta.last_page" @click="load(meta.current_page + 1)">Next</button>
        </div>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <!-- Slide-over workspace -->
    <transition name="fade">
      <div v-if="selected" class="fixed inset-0 z-50 flex justify-end bg-black/40" @click.self="close">
        <aside class="w-full max-w-4xl h-full bg-gray-50 shadow-2xl overflow-y-auto">
          <div class="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500">{{ selected.intake_ref }}</p>
              <h3 class="text-lg font-bold text-gray-900">{{ selected.taxpayer_name }}</h3>
              <p class="text-sm text-gray-600">{{ selected.property_type }} · {{ selected.barangay }}</p>
            </div>
            <button type="button" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Close" @click="close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <AssessmentPanel
              :key="selected.application_id"
              :application-id="selected.application_id"
              :role="role"
              :barangay="selected.barangay"
              :default-pin="selected.pin ?? ''"
              :default-arp="selected.arp_number ?? ''"
              :default-classification="selected.land_classification || selected.property_type || 'Residential'"
              :default-area="selected.total_area"
              :tax-exempt="selected.tax_exempt"
              :exemption-notes="selected.exemption_notes"
              @changed="load(meta.current_page)"
            />
          </div>
        </aside>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AssessmentPanel from '@/components/assessment/AssessmentPanel.vue'
import {
  listAssessmentsApi,
  type AssessmentRow,
  type AssessmentStats,
} from '@/services/assessmentsApi'
import { parseApiError } from '@/services/apiError'

const props = defineProps<{ role: 'clerk' | 'assessor' }>()

const classes = ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Special']

const title = computed(() =>
  props.role === 'clerk' ? 'Appraisal & Assessment' : 'Assessment Reviews',
)
const subtitle = computed(() =>
  props.role === 'clerk'
    ? 'Encode appraisals, compute market and assessed values, and submit records for review.'
    : 'Validate appraisals, decide on submitted assessments, and authorize Tax Declarations.',
)

const statusOptions = computed(() =>
  props.role === 'clerk'
    ? [
        { value: 'NotStarted', label: 'Not started' },
        { value: 'Draft', label: 'Draft' },
        { value: 'Returned', label: 'Returned' },
        { value: 'UnderReview', label: 'Under review' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Authorized', label: 'Authorized' },
        { value: 'Rejected', label: 'Rejected' },
      ]
    : [
        { value: 'UnderReview', label: 'Awaiting review' },
        { value: 'Approved', label: 'Approved (awaiting authorization)' },
        { value: 'Authorized', label: 'Authorized' },
        { value: 'Rejected', label: 'Rejected' },
      ],
)

const rows = ref<AssessmentRow[]>([])
const stats = ref<AssessmentStats | null>(null)
const meta = reactive({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)
const error = ref('')
const selected = ref<AssessmentRow | null>(null)
const filters = reactive({ search: '', status: '', classification: '' })

const peso = (v: number | string) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(Number(v ?? 0))

interface Card {
  label: string
  value: number
  tone: string
  filter?: string
  money?: boolean
}

const cards = computed<Card[]>(() => {
  const s = stats.value
  if (!s) return []
  return props.role === 'clerk'
    ? [
        { label: 'Not started', value: s.not_started, tone: 'text-gray-900', filter: 'NotStarted' },
        { label: 'Drafts', value: s.draft, tone: 'text-gray-900', filter: 'Draft' },
        { label: 'Returned for correction', value: s.returned, tone: 'text-yellow-700', filter: 'Returned' },
        { label: 'Pending review', value: s.under_review, tone: 'text-blue-700', filter: 'UnderReview' },
      ]
    : [
        { label: 'Awaiting review', value: s.under_review, tone: 'text-blue-700', filter: 'UnderReview' },
        { label: 'Awaiting authorization', value: s.approved, tone: 'text-green-700', filter: 'Approved' },
        { label: 'Authorized TDs', value: s.authorized, tone: 'text-emerald-700', filter: 'Authorized' },
        { label: 'Authorized assessed value', value: s.total_assessed_value, tone: 'text-emerald-800', money: true },
      ]
})

const toggleStatus = (value: string) => {
  filters.status = filters.status === value ? '' : value
  void load(1)
}

const load = async (page = 1) => {
  loading.value = true
  error.value = ''
  try {
    const res = await listAssessmentsApi({ ...filters, page })
    rows.value = res.data
    stats.value = res.stats
    Object.assign(meta, res.meta)
  } catch (e) {
    error.value = parseApiError(e).message
  } finally {
    loading.value = false
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
const debouncedLoad = () => {
  clearTimeout(timer)
  timer = setTimeout(() => load(1), 300)
}

const badgeMap: Record<string, string> = {
  NotStarted: 'bg-gray-100 text-gray-600',
  Draft: 'bg-gray-100 text-gray-800',
  UnderReview: 'bg-blue-100 text-blue-800',
  Approved: 'bg-green-100 text-green-800',
  Returned: 'bg-yellow-100 text-yellow-800',
  Rejected: 'bg-red-100 text-red-800',
  Authorized: 'bg-emerald-100 text-emerald-800',
}
const statusOf = (row: AssessmentRow) => row.assessment?.status ?? 'NotStarted'
const badge = (row: AssessmentRow) => badgeMap[statusOf(row)]
const label = (row: AssessmentRow) =>
  statusOf(row) === 'NotStarted' ? 'Not started' : statusOf(row).replace(/([a-z])([A-Z])/g, '$1 $2')

const actionLabel = (row: AssessmentRow) => {
  const s = statusOf(row)
  if (props.role === 'clerk') {
    if (s === 'NotStarted') return 'Start'
    if (s === 'Draft' || s === 'Returned') return 'Edit'
    return 'View'
  }
  if (s === 'UnderReview') return 'Review'
  if (s === 'Approved') return 'Authorize'
  return 'View'
}

const open = (row: AssessmentRow) => (selected.value = row)
const close = () => (selected.value = null)

onMounted(() => load(1))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
