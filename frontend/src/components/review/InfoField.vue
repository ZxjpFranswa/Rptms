<template>
  <div :class="{ 'md:col-span-2': colspan }">
    <p class="text-sm font-medium text-gray-600 mb-1">{{ label }}</p>
    <p class="text-base font-semibold text-gray-900">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: string
  colspan?: boolean
}

withDefaults(defineProps<Props>(), {
  colspan: false,
})
</script>
