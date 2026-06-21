<template>
  <router-link
    :to="to"
    :class="[
      'group relative flex items-center rounded-xl transition-all duration-200',
      collapsed ? 'justify-center p-2.5' : 'gap-3 px-4 py-3',
      active
        ? 'bg-primary-700 text-white'
        : 'text-primary-100 hover:bg-primary-700 hover:text-white',
    ]"
    @click="$emit('click')"
  >
    <!-- Icon slot -->
    <slot name="icon">
      <!-- Default dashboard icon if none provided -->
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4" />
      </svg>
    </slot>

    <!-- Label -->
    <span
      :class="[
        'overflow-hidden whitespace-nowrap transition-all duration-300 font-medium text-sm',
        collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
      ]"
    >
      {{ label }}
    </span>

    <!-- Tooltip on collapsed desktop -->
    <span
      v-if="collapsed"
      class="pointer-events-none absolute left-full ml-3 z-50 rounded-lg bg-gray-900 px-3 py-1.5
             text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity
             shadow-lg"
    >
      {{ label }}
    </span>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  label: string
  active: boolean
  collapsed: boolean
}>()

defineEmits<{ click: [] }>()
</script>
