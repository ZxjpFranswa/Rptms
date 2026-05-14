<template>
  <div class="grid gap-8 lg:grid-cols-2">
    <div class="card">
      <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Assessment register</h3>
      <DataTable :data="displayRows" :columns="columns" :page-size="6">
        <template #cell-assessmentStatus="{ row }">
          <Badge :variant="row.assessmentStatus === 'completed' ? 'success' : 'warning'">
            {{ row.assessmentStatus }}
          </Badge>
        </template>
        <template #cell-assessedValue="{ row }">
          {{ formatMoney(row.assessedValue) }}
        </template>
        <template #row-actions="{ row }">
          <button
            type="button"
            class="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            @click="selectedId = row.id"
          >
            Select
          </button>
        </template>
      </DataTable>
    </div>
    <div class="card space-y-4">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Assessment entry</h3>
      <p v-if="!selected" class="text-sm text-slate-600 dark:text-slate-400">Select a property from the table.</p>
      <template v-else>
        <p class="text-sm text-slate-600 dark:text-slate-400">PIN <strong>{{ selected.pin }}</strong> — {{ selected.ownerName }}</p>
        <div>
          <label class="label">Market value (PHP)</label>
          <input v-model.number="marketValue" type="number" min="0" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
        </div>
        <div>
          <label class="label">Assessment level (0–1)</label>
          <input v-model.number="level" type="number" min="0" max="1" step="0.01" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
        </div>
        <div class="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/40">
          <p class="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300">Assessed value (computed)</p>
          <p class="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{{ formatMoney(assessed) }}</p>
        </div>
        <button type="button" class="btn-primary w-full" @click="save">Save assessment</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'
import { usePropertiesStore, type Property } from '@/stores/properties'
import { useToastStore } from '@/stores/toast'

const store = usePropertiesStore()
const toast = useToastStore()

const baseRows = computed(() => store.properties.filter((p) => p.status === 'active' || p.status === 'verified'))

type Row = Property & {
  marketValue: number | string
  assessmentLevel: number | string
  assessedValue: number
  assessmentStatus: string
  assessmentDate: string
}

const displayRows = computed<Row[]>(() =>
  baseRows.value.map((p) => ({
    ...p,
    marketValue: p.assessment?.marketValue ?? '—',
    assessmentLevel: p.assessment?.assessmentLevel ?? '—',
    assessedValue: p.assessment?.assessedValue ?? 0,
    assessmentStatus: p.assessment?.status ?? 'pending',
    assessmentDate: p.assessment?.assessmentDate ?? '—',
  })),
)

const columns = [
  { key: 'pin', label: 'Property PIN' },
  { key: 'marketValue', label: 'Market Value' },
  { key: 'assessmentLevel', label: 'Assessment Level' },
  { key: 'assessedValue', label: 'Assessed Value' },
  { key: 'assessmentStatus', label: 'Assessment Status' },
  { key: 'assessmentDate', label: 'Assessment Date' },
]

const selectedId = ref<string | null>(null)
const selected = computed(() => (selectedId.value ? store.getProperty(selectedId.value) : undefined))

const marketValue = ref(0)
const level = ref(0.8)

watch(
  selected,
  (p) => {
    if (p?.assessment) {
      marketValue.value = p.assessment.marketValue
      level.value = p.assessment.assessmentLevel
    } else if (p) {
      marketValue.value = 0
      level.value = 0.8
    }
  },
  { immediate: true },
)

const assessed = computed(() => Math.round(Number(marketValue.value) * Number(level.value)))

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n)

const save = () => {
  if (!selected.value) return
  store.saveAssessment(selected.value.id, {
    marketValue: Number(marketValue.value),
    assessmentLevel: Number(level.value),
    assessedValue: assessed.value,
  })
  toast.push('Assessment saved.', 'success')
}
</script>
