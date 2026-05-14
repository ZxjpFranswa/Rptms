<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-slate-900 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-slate-700 mb-4">Page Not Found</h2>
      <p class="text-slate-600 mb-8 max-w-md">
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <router-link to="/" class="btn-primary">
        Back to Home
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
