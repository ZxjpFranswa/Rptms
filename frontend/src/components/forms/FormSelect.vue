<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-sm font-semibold text-gray-900 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :required="required"
      :disabled="disabled"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
    >
      <option value="">Select an option</option>
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
    <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  label?: string
  options: string[]
  required?: boolean
  disabled?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const id = computed(() => Math.random().toString(36).substr(2, 9))
</script>
