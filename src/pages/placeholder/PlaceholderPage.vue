<template>
  <div class="card border-2 border-dashed border-slate-300 py-12 text-center">
    <svg class="mx-auto h-16 w-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
    <h3 class="text-xl font-semibold text-slate-900 mb-2">Page Under Development</h3>
    <p class="text-slate-600 max-w-md mx-auto">
      This page is currently being developed. Please check back soon or continue exploring other sections of the application.
    </p>
    <div class="mt-6">
      <router-link to="/" class="btn-primary">
        Back to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
