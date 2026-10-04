<template>
  <img
    :src="logoUrl"
    alt="Municipal Assessor's Office - Magarao, Camarines Sur"
    :class="[sizeClasses[size], 'object-contain flex-shrink-0 rounded-full']"
  />
</template>

<script setup lang="ts">
import logoUrl from '@/assets/logo.png'

withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md',
  },
)

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
} as const
</script>
