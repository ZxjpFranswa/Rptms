<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
      <div>
        <h4 class="text-base font-bold text-gray-900 flex items-center gap-2">
          <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Reassessment for Price Changes (Increase or Decrease)
        </h4>
        <p class="text-xs text-gray-600 mt-1">
          Adjust valuation upwards (e.g. appreciation, SMV general revision, improvements) or downwards (e.g. calamity damage, erosion, economic obsolescence).
        </p>
      </div>

      <button
        v-if="canCreate"
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition whitespace-nowrap self-start sm:self-auto"
        @click="showCreateForm = !showCreateForm"
      >
        <span v-if="showCreateForm">Close Form</span>
        <span v-else>+ Initiate Reassessment</span>
      </button>
    </div>

    <!-- Create Reassessment Form -->
    <div
      v-if="showCreateForm"
      class="bg-white rounded-xl border border-amber-300 p-5 shadow-sm space-y-4"
    >
      <div class="flex items-center justify-between pb-3 border-b border-gray-100">
        <h5 class="text-sm font-bold text-gray-900 flex items-center gap-2">
          New Reassessment Request
        </h5>
        <span class="text-xs text-gray-500">
          Current Market Value: <strong>{{ peso(currentMarketValue) }}</strong> · AV: <strong>{{ peso(currentAssessedValue) }}</strong>
        </span>
      </div>

      <!-- Increase vs Decrease Toggle -->
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          :class="[
            'p-3 rounded-xl border text-left flex items-center gap-3 transition',
            form.reassessment_type === 'Increase'
              ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-200'
              : 'border-gray-200 hover:border-gray-300 bg-white',
          ]"
          @click="setType('Increase')"
        >
          <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
            ↑
          </div>
          <div>
            <p class="text-xs font-bold text-gray-900">Price Increase</p>
            <p class="text-[11px] text-gray-500">General revision, appreciation, zone upgrade</p>
          </div>
        </button>

        <button
          type="button"
          :class="[
            'p-3 rounded-xl border text-left flex items-center gap-3 transition',
            form.reassessment_type === 'Decrease'
              ? 'border-red-600 bg-red-50/50 ring-2 ring-red-200'
              : 'border-gray-200 hover:border-gray-300 bg-white',
          ]"
          @click="setType('Decrease')"
        >
          <div class="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg">
            ↓
          </div>
          <div>
            <p class="text-xs font-bold text-gray-900">Price Decrease</p>
            <p class="text-[11px] text-gray-500">Calamity damage, erosion, economic obsolescence</p>
          </div>
        </button>
      </div>

      <!-- Percentage Adjustment & Effective Year -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Price Change Percentage (%)
          </label>
          <div class="relative">
            <input
              v-model.number="form.abs_pct"
              type="number"
              step="0.1"
              min="0.1"
              max="200"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="e.g. 10.0"
              @input="onPctChange"
            />
            <span
              :class="[
                'absolute right-3 top-2 text-xs font-bold',
                form.reassessment_type === 'Increase' ? 'text-emerald-600' : 'text-red-600',
              ]"
            >
              {{ form.reassessment_type === 'Increase' ? '+' : '-' }}{{ form.abs_pct || 0 }}%
            </span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Effective Year
          </label>
          <input
            v-model.number="form.effective_year"
            type="number"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Effective Quarter
          </label>
          <select
            v-model.number="form.effective_quarter"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option :value="1">Q1 (1st Quarter)</option>
            <option :value="2">Q2 (2nd Quarter)</option>
            <option :value="3">Q3 (3rd Quarter)</option>
            <option :value="4">Q4 (4th Quarter)</option>
          </select>
        </div>
      </div>

      <!-- Reason Presets & Details -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Primary Reason for Reassessment *
          </label>
          <select
            v-model="form.reason_preset"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            @change="onReasonPresetChange"
          >
            <option v-for="r in reasonOptions" :key="r">{{ r }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Reason Details / Legal Basis *
          </label>
          <input
            v-model="form.reason"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            placeholder="e.g. SMV Revision Ordinance No. 2026-03"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">
          Assessor / Field Inspection Notes (Optional)
        </label>
        <textarea
          v-model="form.remarks"
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          placeholder="Additional technical observations or justification…"
        />
      </div>

      <!-- Live Before vs After Impact Card -->
      <div class="rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-md">
        <p class="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">
          Simulated Before vs. After Impact
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-xs text-gray-400">Market Value</p>
            <p class="text-gray-300">{{ peso(currentMarketValue) }}</p>
            <p class="text-lg font-bold mt-0.5" :class="previewDiff.mv >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              {{ peso(previewValues.new_market_value) }}
            </p>
            <span class="text-xs" :class="previewDiff.mv >= 0 ? 'text-emerald-300' : 'text-rose-300'">
              {{ previewDiff.mv >= 0 ? '+' : '' }}{{ peso(previewDiff.mv) }}
            </span>
          </div>

          <div>
            <p class="text-xs text-gray-400">Assessed Value</p>
            <p class="text-gray-300">{{ peso(currentAssessedValue) }}</p>
            <p class="text-lg font-bold mt-0.5" :class="previewDiff.av >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              {{ peso(previewValues.new_assessed_value) }}
            </p>
            <span class="text-xs" :class="previewDiff.av >= 0 ? 'text-emerald-300' : 'text-rose-300'">
              {{ previewDiff.av >= 0 ? '+' : '' }}{{ peso(previewDiff.av) }}
            </span>
          </div>

          <div>
            <p class="text-xs text-gray-400">Annual Tax Due (2%)</p>
            <p class="text-gray-300">{{ peso(currentAnnualTax) }}</p>
            <p class="text-lg font-bold mt-0.5 text-amber-300">
              {{ peso(previewValues.new_annual_tax) }}
            </p>
            <span class="text-xs" :class="previewDiff.tax >= 0 ? 'text-amber-300' : 'text-rose-300'">
              {{ previewDiff.tax >= 0 ? '+' : '' }}{{ peso(previewDiff.tax) }}/yr
            </span>
          </div>
        </div>
      </div>

      <p v-if="createError" class="text-xs text-red-600">{{ createError }}</p>

      <div class="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
          @click="showCreateForm = false"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="submitting || !form.abs_pct || !form.reason.trim()"
          class="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition"
          @click="submitReassessment"
        >
          <span v-if="submitting">Submitting…</span>
          <span v-else>Submit Reassessment</span>
        </button>
      </div>
    </div>

    <!-- Reassessment Records History -->
    <div class="space-y-3">
      <h5 class="text-xs uppercase font-bold text-gray-500 tracking-wider">
        Reassessment History &amp; Price Change Records ({{ reassessments.length }})
      </h5>

      <div v-if="loading" class="text-center py-6 text-gray-400 text-sm">
        Loading reassessments…
      </div>

      <div v-else-if="reassessments.length === 0" class="p-6 text-center rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500">
        No reassessments have been recorded for this property yet.
      </div>

      <div
        v-for="r in reassessments"
        :key="r.id"
        class="rounded-xl border p-4 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:shadow-md"
        :class="r.status === 'Approved' ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-200'"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span
              :class="[
                'px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider',
                r.reassessment_type === 'Increase'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800',
              ]"
            >
              {{ r.reassessment_type }} {{ Number(r.adjustment_pct) >= 0 ? '+' : '' }}{{ r.adjustment_pct }}%
            </span>

            <span
              :class="[
                'px-2 py-0.5 rounded text-[11px] font-semibold',
                r.status === 'Approved'
                  ? 'bg-emerald-600 text-white'
                  : r.status === 'Rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-800',
              ]"
            >
              {{ r.status }}
            </span>

            <span class="text-xs text-gray-400">Effective {{ r.effective_year }} Q{{ r.effective_quarter }}</span>
          </div>

          <p class="text-sm font-semibold text-gray-900 mt-1">{{ r.reason }}</p>
          <p v-if="r.remarks" class="text-xs text-gray-600">{{ r.remarks }}</p>

          <p class="text-[11px] text-gray-400">
            Requested by {{ r.creator?.full_name ?? 'Clerk' }} on {{ formatDate(r.created_at) }}
            <template v-if="r.approver">
              · Reviewed by {{ r.approver.full_name }}
            </template>
          </p>
        </div>

        <!-- Before vs After Numbers -->
        <div class="flex items-center gap-4 text-xs shrink-0 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <div>
            <p class="text-[10px] uppercase text-gray-400 font-semibold">Prev Market Value</p>
            <p class="font-medium text-gray-700">{{ peso(r.previous_market_value) }}</p>
          </div>
          <span class="text-gray-300">→</span>
          <div>
            <p class="text-[10px] uppercase text-gray-400 font-semibold">New Market Value</p>
            <p class="font-bold text-gray-900">{{ peso(r.new_market_value) }}</p>
          </div>
          <div class="pl-2 border-l border-gray-200">
            <p class="text-[10px] uppercase text-gray-400 font-semibold">New Assessed Value</p>
            <p class="font-bold text-emerald-700">{{ peso(r.new_assessed_value) }}</p>
          </div>
        </div>

        <!-- Assessor Actions for Pending Reassessments -->
        <div v-if="role === 'assessor' && r.status === 'Pending'" class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
            @click="approve(r)"
          >
            Approve &amp; Apply
          </button>
          <button
            type="button"
            class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition"
            @click="reject(r)"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  approveReassessmentApi,
  createReassessmentApi,
  fetchReassessmentsApi,
  rejectReassessmentApi,
  type Reassessment,
} from '@/services/assessmentsApi'

interface Props {
  applicationId: string
  currentMarketValue: number
  currentAssessedValue: number
  role: 'clerk' | 'assessor'
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'updated'): void }>()

const loading = ref(false)
const submitting = ref(false)
const showCreateForm = ref(false)
const createError = ref('')
const reassessments = ref<Reassessment[]>([])

const canCreate = computed(() => true)

const currentAnnualTax = computed(() => round(props.currentAssessedValue * 0.02, 2))

const reasonOptions = [
  'Schedule of Market Values (SMV) General Revision',
  'Commercial / Urban Reclassification',
  'Infrastructure Development / Road Widening',
  'Building / Improvement Renovation Addition',
  'Natural Calamity / Typhoon / Flood Depreciation',
  'Riverbank Erosion / Physical Land Degradation',
  'Economic Obsolescence',
  'Correction of Previous Appraisal Error',
  'Other Reason',
]

const form = reactive({
  reassessment_type: 'Increase' as 'Increase' | 'Decrease',
  abs_pct: 10.0,
  reason_preset: reasonOptions[0],
  reason: reasonOptions[0],
  remarks: '',
  effective_year: new Date().getFullYear(),
  effective_quarter: 1,
})

const setType = (type: 'Increase' | 'Decrease') => {
  form.reassessment_type = type
}

const onReasonPresetChange = () => {
  if (form.reason_preset !== 'Other Reason') {
    form.reason = form.reason_preset
  } else {
    form.reason = ''
  }
}

const onPctChange = () => {
  /* triggers computed updates */
}

const signedPct = computed(() => {
  const abs = Math.abs(Number(form.abs_pct) || 0)
  return form.reassessment_type === 'Increase' ? abs : -abs
})

const previewValues = computed(() => {
  const factor = 1 + (signedPct.value / 100.0)
  const newMv = round(props.currentMarketValue * factor, 2)
  const newAv = round(props.currentAssessedValue * factor, 2)
  const newTax = round(newAv * 0.02, 2)
  return {
    new_market_value: newMv,
    new_assessed_value: newAv,
    new_annual_tax: newTax,
  }
})

const previewDiff = computed(() => ({
  mv: round(previewValues.value.new_market_value - props.currentMarketValue, 2),
  av: round(previewValues.value.new_assessed_value - props.currentAssessedValue, 2),
  tax: round(previewValues.value.new_annual_tax - currentAnnualTax.value, 2),
}))

const round = (num: number, decimals: number) => {
  const factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}

const peso = (v: number | string | undefined | null) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v ?? 0))

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const loadReassessments = async () => {
  loading.value = true
  try {
    reassessments.value = await fetchReassessmentsApi(props.applicationId)
  } catch (e) {
    /* ignore */
  } finally {
    loading.value = false
  }
}

onMounted(loadReassessments)

const submitReassessment = async () => {
  submitting.value = true
  createError.value = ''
  try {
    const created = await createReassessmentApi(props.applicationId, {
      reassessment_type: form.reassessment_type,
      adjustment_pct: signedPct.value,
      reason: form.reason,
      remarks: form.remarks,
      effective_year: form.effective_year,
      effective_quarter: form.effective_quarter,
    })
    reassessments.value.unshift(created)
    showCreateForm.value = false
    emit('updated')
  } catch (e: any) {
    createError.value = e?.response?.data?.message || 'Failed to submit reassessment request.'
  } finally {
    submitting.value = false
  }
}

const approve = async (r: Reassessment) => {
  const remarks = prompt('Enter assessor approval notes (optional):', 'Approved pursuant to municipal revision')
  if (remarks === null) return
  try {
    const updated = await approveReassessmentApi(r.id, remarks)
    const idx = reassessments.value.findIndex((x) => x.id === r.id)
    if (idx !== -1) reassessments.value[idx] = updated
    emit('updated')
    alert('Reassessment approved and applied to property assessment!')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to approve reassessment.')
  }
}

const reject = async (r: Reassessment) => {
  const reason = prompt('Enter reason for rejecting reassessment:')
  if (!reason) return
  try {
    const updated = await rejectReassessmentApi(r.id, reason)
    const idx = reassessments.value.findIndex((x) => x.id === r.id)
    if (idx !== -1) reassessments.value[idx] = updated
    emit('updated')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Failed to reject reassessment.')
  }
}
</script>
