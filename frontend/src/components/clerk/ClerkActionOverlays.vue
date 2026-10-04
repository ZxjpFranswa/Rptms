<template>
  <ConfirmDialog
    :open="!!resubmitTarget"
    title="Resubmit application?"
    message="This will send the corrected application back to the Municipal Assessor for review."
    :detail="resubmitTarget?.remarks"
    confirm-label="Resubmit"
    @confirm="confirmResubmit"
    @cancel="cancelResubmit"
  />

  <DocumentUploadModal
    :open="!!uploadTarget"
    :property="uploadTarget"
    @close="closeUploadModal"
    @saved="onDocsSaved"
  />

  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="toastMessage"
      class="fixed bottom-6 right-6 z-50 max-w-sm px-4 py-3 bg-primary-800 text-white text-sm font-medium rounded-xl shadow-lg"
    >
      {{ toastMessage }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import ConfirmDialog from '@/components/clerk/ConfirmDialog.vue'
import DocumentUploadModal from '@/components/clerk/DocumentUploadModal.vue'
import { useClerkPropertyActions } from '@/composables/useClerkPropertyActions'

const {
  resubmitTarget,
  uploadTarget,
  toastMessage,
  confirmResubmit,
  cancelResubmit,
  closeUploadModal,
  showToast,
} = useClerkPropertyActions()

const onDocsSaved = (message: string) => {
  showToast(message)
}
</script>
