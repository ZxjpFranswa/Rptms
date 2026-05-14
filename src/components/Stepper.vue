<template>
  <div class="w-full">
    <div class="flex flex-wrap items-center gap-2">
      <template v-for="(step, index) in steps" :key="step.key">
        <button
          v-if="clickable && index < currentIndex"
          type="button"
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
          @click="emit('update:modelValue', index)"
        >
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            :class="index < currentIndex ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'"
          >
            {{ index + 1 }}
          </span>
          <span class="hidden sm:inline">{{ step.label }}</span>
        </button>
        <div v-else class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            :class="stepClass(index)"
          >
            {{ index + 1 }}
          </span>
          <span
            class="hidden font-medium sm:inline"
            :class="index === currentIndex ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'"
          >
            {{ step.label }}
          </span>
        </div>
        <span v-if="index < steps.length - 1" class="hidden text-slate-300 sm:inline dark:text-slate-600">/</span>
      </template>
    </div>
    <div class="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        class="h-full rounded-full bg-emerald-600 transition-all duration-500 ease-out"
        :style="{ width: progressWidth }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface StepperStep {
  key: string
  label: string
}

const props = withDefaults(
  defineProps<{
    steps: StepperStep[]
    modelValue: number
    clickable?: boolean
  }>(),
  { clickable: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const currentIndex = computed(() => Math.min(props.modelValue, props.steps.length - 1))

const progressWidth = computed(() => {
  if (props.steps.length <= 1) return '100%'
  const pct = (currentIndex.value / (props.steps.length - 1)) * 100
  return `${pct}%`
})

const stepClass = (index: number) => {
  if (index < currentIndex.value) return 'bg-emerald-600 text-white'
  if (index === currentIndex.value) return 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-100 dark:ring-emerald-500'
  return 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
}
</script>
