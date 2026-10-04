<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">

    <!-- Mobile backdrop overlay -->
    <Transition name="fade">
      <div
        v-if="isMobile && isMobileOpen"
        class="fixed inset-0 z-30 bg-black/50 lg:hidden"
        @click="closeMobile"
      />
    </Transition>

    <!-- Sidebar — fixed drawer on mobile, static on desktop -->
    <div
      :class="[
        'flex-shrink-0 z-40 transition-all duration-300 ease-in-out',
        // Desktop: always in flow
        'lg:relative lg:translate-x-0',
        // Mobile: fixed drawer, slides in/out
        isMobile
          ? 'fixed inset-y-0 left-0 ' + (isMobileOpen ? 'translate-x-0' : '-translate-x-full')
          : '',
      ]"
    >
      <Sidebar />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />
      <main class="flex-1 overflow-y-auto bg-gray-100">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import { useSidebar } from '@/composables/useSidebar'

const { isMobile, isMobileOpen, closeMobile } = useSidebar()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
