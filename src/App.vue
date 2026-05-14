<template>
  <ToastStack />
  <router-view />
</template>

<script setup lang="ts">
import ToastStack from '@/components/ToastStack.vue'
import { useThemeStore } from '@/stores/theme'

useThemeStore()
</script>

<style scoped>
</style>
