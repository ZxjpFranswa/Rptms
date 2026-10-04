<template>
  <div class="space-y-6">
    <div v-if="loading" class="text-center py-10 text-gray-500">Loading assessment…</div>

    <template v-else>
      <!-- Status banner -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-bold text-gray-900">Appraisal &amp; Assessment</h3>
          <span :class="['px-3 py-1 rounded-full text-xs font-semibold', statusClass]">
            {{ statusLabel }}
          </span>
        </div>
        <p v-if="!assessment && role === 'assessor'" class="text-sm text-gray-500">
          The clerk has not prepared an assessment for this property yet.
        </p>
      </div>

      <div
        v-if="assessment?.status === 'Returned' && assessment.remarks"
        class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-900"
      >
        <p class="font-semibold">Returned by Municipal Assessor</p>
        <p class="mt-1">{{ assessment.remarks }}</p>
      </div>
      <div
        v-if="assessment?.status === 'Rejected' && assessment.remarks"
        class="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-900"
      >
        <p class="font-semibold">Rejected</p>
        <p class="mt-1">{{ assessment.remarks }}</p>
      </div>

      <template v-if="assessment || canEdit">
        <!-- Totals -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="rounded-xl p-5 bg-gradient-to-br from-primary-700 to-primary-900 text-white shadow-md">
            <p class="text-xs uppercase tracking-wide opacity-80">Total Market Value</p>
            <p class="text-2xl font-bold mt-1">{{ peso(totals.mv) }}</p>
          </div>
          <div class="rounded-xl p-5 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md">
            <p class="text-xs uppercase tracking-wide opacity-80">Total Assessed Value</p>
            <p class="text-2xl font-bold mt-1">{{ peso(totals.av) }}</p>
          </div>
          <div class="rounded-xl p-5 bg-white border border-gray-200 shadow-md">
            <p class="text-xs uppercase tracking-wide text-gray-500">Taxability</p>
            <label v-if="canEdit" class="flex items-center gap-2 mt-2 text-sm font-medium text-gray-800">
              <input v-model="form.is_taxable" type="checkbox" class="w-4 h-4 rounded text-primary-600" />
              Taxable
            </label>
            <p v-else class="text-lg font-bold mt-1" :class="form.is_taxable ? 'text-gray-900' : 'text-amber-700'">
              {{ form.is_taxable ? 'Taxable' : 'Exempt' }}
            </p>
            <input
              v-if="!form.is_taxable"
              v-model="form.exemption_reason"
              :disabled="!canEdit"
              placeholder="Legal basis for exemption"
              class="mt-2 w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
            />
          </div>
        </div>

        <!-- Record header -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label class="text-sm">
            <span class="block font-medium text-gray-700 mb-1">PIN</span>
            <input v-model="form.pin" :disabled="!canEdit" class="field" />
          </label>
          <label class="text-sm">
            <span class="block font-medium text-gray-700 mb-1">ARP Number</span>
            <input v-model="form.arp_number" :disabled="!canEdit" class="field" />
          </label>
          <label class="text-sm">
            <span class="block font-medium text-gray-700 mb-1">Effective Year</span>
            <input v-model.number="form.effective_year" type="number" :disabled="!canEdit" class="field" />
          </label>
          <label class="text-sm">
            <span class="block font-medium text-gray-700 mb-1">Quarter</span>
            <select v-model.number="form.effective_quarter" :disabled="!canEdit" class="field">
              <option v-for="q in 4" :key="q" :value="q">Q{{ q }}</option>
            </select>
          </label>
        </div>

        <!-- Items -->
        <div class="space-y-4">
          <div
            v-for="(item, i) in form.items"
            :key="i"
            class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-bold text-gray-900">
                {{ item.item_type }} #{{ i + 1 }}
              </span>
              <button
                v-if="canEdit && form.items.length > 1"
                type="button"
                class="text-xs font-semibold text-red-600 hover:text-red-800"
                @click="removeItem(i)"
              >
                Remove
              </button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label class="text-sm">
                <span class="lbl">Type</span>
                <select v-model="item.item_type" :disabled="!canEdit" class="field" @change="onTypeChange(item)">
                  <option>Land</option>
                  <option>Building</option>
                  <option>Machinery</option>
                </select>
              </label>
              <label class="text-sm">
                <span class="lbl">Classification</span>
                <select v-model="item.classification" :disabled="!canEdit" class="field" @change="lookupSmv(item)">
                  <option v-for="c in classes" :key="c">{{ c }}</option>
                </select>
              </label>
              <label class="text-sm">
                <span class="lbl">Actual Use</span>
                <select v-model="item.actual_use" :disabled="!canEdit" class="field" @change="lookupSmv(item)">
                  <option v-for="c in classes" :key="c">{{ c }}</option>
                </select>
              </label>
              <label class="text-sm">
                <span class="lbl">{{ item.item_type === 'Machinery' ? 'Quantity' : 'Area (sq.m)' }}</span>
                <input v-model.number="item.area_sqm" type="number" min="0" step="0.01" :disabled="!canEdit" class="field" />
              </label>
              <label class="text-sm">
                <span class="lbl">Unit Value (₱)</span>
                <input v-model.number="item.unit_value" type="number" min="0" step="0.01" :disabled="!canEdit" class="field" />
              </label>
              <label v-if="item.item_type === 'Land'" class="text-sm">
                <span class="lbl">Adjustment (%)</span>
                <input v-model.number="item.adjustment_factor_pct" type="number" step="0.1" :disabled="!canEdit" class="field" />
              </label>
              <label v-else class="text-sm">
                <span class="lbl">Depreciation (%)</span>
                <input
                  :value="item.details?.depreciation_pct ?? 0"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  :disabled="!canEdit"
                  class="field"
                  @input="setDepreciation(item, ($event.target as HTMLInputElement).value)"
                />
              </label>
              <label class="text-sm">
                <span class="lbl">Assessment Level (%)</span>
                <input
                  v-model.number="item.assessment_level_pct"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  :disabled="!canEdit"
                  class="field"
                  placeholder="Auto"
                />
              </label>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">Market Value</p>
                <p class="font-bold text-gray-900">{{ peso(calc[i]?.market_value) }}</p>
              </div>
              <div>
                <p class="text-gray-500">Assessed Value ({{ calc[i]?.assessment_level_pct ?? 0 }}%)</p>
                <p class="font-bold text-emerald-700">{{ peso(form.is_taxable ? calc[i]?.assessed_value : 0) }}</p>
              </div>
            </div>
          </div>

          <div v-if="canEdit" class="flex gap-2">
            <button
              v-for="t in ['Land', 'Building', 'Machinery']"
              :key="t"
              type="button"
              class="px-4 py-2 text-sm font-semibold border border-dashed border-primary-600 text-primary-700 rounded-lg hover:bg-primary-50 transition"
              @click="addItem(t as ItemType)"
            >
              + Add {{ t }}
            </button>
          </div>
        </div>

        <label v-if="canEdit" class="block text-sm">
          <span class="block font-medium text-gray-700 mb-1">Clerk Remarks</span>
          <textarea v-model="form.remarks" rows="2" class="field" />
        </label>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <!-- Clerk actions -->
        <div v-if="canEdit" class="flex flex-wrap gap-3">
          <button type="button" class="btn-secondary" :disabled="busy" @click="save">Save Draft</button>
          <button type="button" class="btn-primary" :disabled="busy || !form.items.length" @click="saveAndSubmit">
            Save &amp; Submit for Review
          </button>
        </div>

        <!-- Assessor actions -->
        <div
          v-if="role === 'assessor' && assessment && ['UnderReview', 'Approved'].includes(assessment.status)"
          class="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4"
        >
          <h4 class="font-bold text-gray-900">
            {{ assessment.status === 'Approved' ? 'Final Authorization' : 'Assessor Decision' }}
          </h4>

          <template v-if="assessment.status === 'UnderReview'">
            <textarea
              v-model="decisionText"
              rows="3"
              placeholder="Remarks (required for Return / Reject)"
              class="field"
            />
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button type="button" class="btn-green" :disabled="busy" @click="decide('approve')">Approve</button>
              <button type="button" class="btn-yellow" :disabled="busy || !decisionText.trim()" @click="decide('return')">
                Return to Clerk
              </button>
              <button type="button" class="btn-red" :disabled="busy || !decisionText.trim()" @click="decide('reject')">
                Reject
              </button>
            </div>
          </template>

          <template v-else>
            <p class="text-sm text-gray-600">
              Authorizing issues the official Tax Declaration and activates the property for
              taxation. This cannot be undone.
            </p>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="confirmAuthorize" type="checkbox" class="w-4 h-4 rounded text-primary-600" />
              I validated the appraisal and authorize this assessment.
            </label>
            <button type="button" class="btn-green" :disabled="busy || !confirmAuthorize" @click="authorize">
              Authorize &amp; Issue Tax Declaration
            </button>
          </template>
        </div>

        <!-- Tax declaration -->
        <div
          v-if="assessment?.tax_declaration"
          class="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5"
        >
          <p class="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Tax Declaration Issued</p>
          <p class="text-2xl font-bold text-emerald-900 mt-1">{{ assessment.tax_declaration.td_number }}</p>
          <p class="text-sm text-emerald-800 mt-1">
            Effective {{ assessment.tax_declaration.effectivity_date?.slice(0, 10) }} ·
            AV {{ peso(assessment.tax_declaration.total_assessed_value) }}
          </p>
        </div>

        <!-- History -->
        <div v-if="assessment?.status_histories?.length" class="space-y-2">
          <h4 class="font-bold text-gray-900 text-sm">Assessment History</h4>
          <ol class="border-l-2 border-gray-200 ml-2 space-y-3">
            <li v-for="h in assessment.status_histories" :key="h.id" class="pl-4 relative text-sm">
              <span class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary-600" />
              <p class="font-semibold text-gray-900">
                {{ h.from_status ?? '—' }} → {{ h.to_status }}
              </p>
              <p class="text-gray-600">{{ h.remarks }}</p>
              <p class="text-xs text-gray-400">
                {{ h.actor?.full_name ?? 'System' }} · {{ new Date(h.created_at).toLocaleString() }}
              </p>
            </li>
          </ol>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  approveAssessmentApi,
  authorizeAssessmentApi,
  calculateAssessmentApi,
  fetchAssessmentApi,
  fetchSmvApi,
  rejectAssessmentApi,
  returnAssessmentApi,
  saveAssessmentApi,
  submitAssessmentApi,
  type Assessment,
  type AssessmentItem,
  type AssessmentItemInput,
  type ItemType,
} from '@/services/assessmentsApi'
import { parseApiError } from '@/services/apiError'

interface Props {
  applicationId: string
  role: 'clerk' | 'assessor'
  barangay?: string
  defaultPin?: string
  defaultArp?: string
  defaultClassification?: string
  defaultArea?: number
  taxExempt?: boolean
  exemptionNotes?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  barangay: '',
  defaultPin: '',
  defaultArp: '',
  defaultClassification: 'Residential',
  defaultArea: 0,
  taxExempt: false,
  exemptionNotes: null,
})

const emit = defineEmits<{ (e: 'changed'): void }>()

const classes = ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Special']

const loading = ref(true)
const busy = ref(false)
const error = ref('')
const assessment = ref<Assessment | null>(null)
const decisionText = ref('')
const confirmAuthorize = ref(false)
const calc = ref<AssessmentItem[]>([])
const totals = reactive({ mv: 0, av: 0 })

const form = reactive({
  pin: '',
  arp_number: '',
  is_taxable: true,
  exemption_reason: '',
  effective_year: new Date().getFullYear(),
  effective_quarter: 1,
  remarks: '',
  items: [] as AssessmentItemInput[],
})

const canEdit = computed(
  () =>
    props.role === 'clerk' &&
    (!assessment.value || ['Draft', 'Returned'].includes(assessment.value.status)),
)

const statusLabel = computed(() =>
  assessment.value ? assessment.value.status.replace(/([a-z])([A-Z])/g, '$1 $2') : 'Not started',
)

const statusClass = computed(() => {
  const map: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    UnderReview: 'bg-blue-100 text-blue-800',
    Approved: 'bg-green-100 text-green-800',
    Returned: 'bg-yellow-100 text-yellow-800',
    Rejected: 'bg-red-100 text-red-800',
    Authorized: 'bg-emerald-100 text-emerald-800',
  }
  const s = assessment.value?.status
  return (s && map[s]) || 'bg-gray-100 text-gray-600'
})

const peso = (v: number | string | undefined | null) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v ?? 0))

const blankItem = (type: ItemType): AssessmentItemInput => ({
  item_type: type,
  classification: props.defaultClassification,
  actual_use: props.defaultClassification,
  area_sqm: type === 'Land' ? props.defaultArea : 0,
  unit_value: 0,
  adjustment_factor_pct: 0,
  details: type === 'Land' ? {} : { depreciation_pct: 0 },
})

const addItem = (type: ItemType) => {
  const item = blankItem(type)
  form.items.push(item)
  lookupSmv(item)
}
const removeItem = (i: number) => form.items.splice(i, 1)

const onTypeChange = (item: AssessmentItemInput) => {
  item.details = item.item_type === 'Land' ? {} : { depreciation_pct: 0 }
}

const setDepreciation = (item: AssessmentItemInput, value: string) => {
  item.details = { ...(item.details ?? {}), depreciation_pct: Number(value) || 0 }
}

// Pre-fill unit value from the Schedule of Market Values when the clerk picks a class.
const lookupSmv = async (item: AssessmentItemInput) => {
  if (!canEdit.value || !props.barangay || item.item_type !== 'Land') return
  try {
    const rows = await fetchSmvApi(props.barangay, item.classification)
    const match = rows.find((r) => r.actual_use === item.actual_use) ?? rows[0]
    if (match) item.unit_value = Number(match.unit_value)
  } catch {
    /* SMV lookup is a convenience; clerk can still type a value */
  }
}

const applyAssessment = (a: Assessment | null) => {
  assessment.value = a
  if (a) {
    form.pin = a.pin ?? ''
    form.arp_number = a.arp_number ?? ''
    form.is_taxable = a.taxability_status === 'Taxable'
    form.exemption_reason = a.exemption_reason ?? ''
    form.effective_year = a.effective_year
    form.effective_quarter = a.effective_quarter
    form.remarks = ''
    form.items = a.items.map((i) => ({
      item_type: i.item_type,
      classification: i.classification,
      actual_use: i.actual_use,
      area_sqm: Number(i.area_sqm),
      unit_value: Number(i.unit_value),
      adjustment_factor_pct: Number(i.adjustment_factor_pct),
      assessment_level_pct: Number(i.assessment_level_pct),
      details: i.details ?? {},
    }))
  } else {
    form.pin = props.defaultPin
    form.arp_number = props.defaultArp
    form.is_taxable = !props.taxExempt
    form.exemption_reason = props.exemptionNotes ?? ''
    form.items = [blankItem('Land')]
    lookupSmv(form.items[0])
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
const recalc = async () => {
  if (!form.items.length) {
    calc.value = []
    totals.mv = totals.av = 0
    return
  }
  try {
    const res = await calculateAssessmentApi(form.items, form.is_taxable, props.barangay)
    calc.value = res.items
    totals.mv = res.total_market_value
    totals.av = res.total_assessed_value
  } catch {
    /* transient validation errors while typing are expected */
  }
}

watch(
  () => [form.items, form.is_taxable],
  () => {
    if (!canEdit.value && assessment.value) return
    clearTimeout(timer)
    timer = setTimeout(recalc, 300)
  },
  { deep: true },
)

const load = async () => {
  loading.value = true
  try {
    applyAssessment(await fetchAssessmentApi(props.applicationId))
    await recalc()
  } catch (e) {
    error.value = parseApiError(e).message
  } finally {
    loading.value = false
  }
}

onMounted(load)

const run = async (fn: () => Promise<unknown>) => {
  busy.value = true
  error.value = ''
  try {
    await fn()
    emit('changed')
    await load()
  } catch (e) {
    error.value = parseApiError(e).message
  } finally {
    busy.value = false
  }
}

const payload = () => ({
  pin: form.pin,
  arp_number: form.arp_number,
  is_taxable: form.is_taxable,
  exemption_reason: form.is_taxable ? undefined : form.exemption_reason,
  effective_year: form.effective_year,
  effective_quarter: form.effective_quarter,
  remarks: form.remarks,
  items: form.items,
})

const save = () => run(() => saveAssessmentApi(props.applicationId, payload()))

const saveAndSubmit = () =>
  run(async () => {
    await saveAssessmentApi(props.applicationId, payload())
    await submitAssessmentApi(props.applicationId)
  })

const decide = (action: 'approve' | 'return' | 'reject') =>
  run(async () => {
    if (action === 'approve') await approveAssessmentApi(props.applicationId, decisionText.value)
    if (action === 'return') await returnAssessmentApi(props.applicationId, decisionText.value)
    if (action === 'reject') await rejectAssessmentApi(props.applicationId, decisionText.value)
    decisionText.value = ''
  })

const authorize = () =>
  run(async () => {
    await authorizeAssessmentApi(props.applicationId)
    confirmAuthorize.value = false
  })
</script>

<style scoped>
.field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-50 disabled:text-gray-600;
}
.lbl {
  @apply block font-medium text-gray-700 mb-1;
}
.btn-primary {
  @apply px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed;
}
.btn-secondary {
  @apply px-5 py-2.5 border border-primary-700 text-primary-700 hover:bg-primary-50 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed;
}
.btn-green {
  @apply px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed;
}
.btn-yellow {
  @apply px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed;
}
.btn-red {
  @apply px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
