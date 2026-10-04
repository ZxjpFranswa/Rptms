<template>
  <div class="p-6">
    <div class="bg-white rounded-xl shadow-md p-12 text-center">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
      <p class="text-gray-600 mb-6">This page is under development. Check back soon!</p>
      <router-link
        to="/"
        class="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition"
      >
        Back to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
