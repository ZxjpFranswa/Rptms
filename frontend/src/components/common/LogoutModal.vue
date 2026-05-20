<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @click.self="cancel"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <!-- Modal Card -->
        <div
          class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all"
        >
          <!-- Top accent bar -->
          <div class="h-1 bg-gradient-to-r from-red-500 via-red-400 to-orange-400" />

          <div class="p-6 text-center">
            <!-- Warning icon -->
            <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center ring-4 ring-red-100">
              <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>

            <!-- Title -->
            <h3 class="text-lg font-bold text-gray-900 mb-1">Sign Out</h3>

            <!-- Message -->
            <p class="text-sm text-gray-500 leading-relaxed">
              Are you sure you want to sign out?<br />
              You'll need to log in again to access the system.
            </p>
          </div>

          <!-- Actions -->
          <div class="px-6 pb-6 flex gap-3">
            <button
              @click="cancel"
              :disabled="loading"
              class="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="confirm"
              :disabled="loading"
              class="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <!-- Spinner -->
              <svg
                v-if="loading"
                class="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              {{ loading ? 'Signing out…' : 'Sign Out' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineOptions({ name: 'LogoutModal' })

const props = defineProps<{
  visible: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const confirm = () => {
  if (!props.loading) emit('confirm')
}

const cancel = () => {
  if (!props.loading) emit('cancel')
}
</script>

<style scoped>
/* Modal entrance / exit transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
.modal-leave-to .relative {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>
