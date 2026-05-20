import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertyStore, type PropertyApplication } from '@/stores/property'
import type { Action } from '@/components/tables/DataTable.vue'

const resubmitTarget = ref<PropertyApplication | null>(null)
const uploadTarget = ref<PropertyApplication | null>(null)
const toastMessage = ref<string | null>(null)

export function useClerkPropertyActions() {
  const router = useRouter()
  const propertyStore = usePropertyStore()
  const showToast = (message: string) => {
    toastMessage.value = message
    setTimeout(() => {
      toastMessage.value = null
    }, 4000)
  }

  const goToView = (app: PropertyApplication) => {
    router.push({ name: 'ClerkPropertyDetail', params: { id: app.id } })
  }

  const goToEdit = (app: PropertyApplication) => {
    router.push({ name: 'NewRegistration', query: { edit: app.id } })
  }

  const openResubmitConfirm = (app: PropertyApplication) => {
    resubmitTarget.value = app
  }

  const openUploadModal = (app: PropertyApplication) => {
    uploadTarget.value = app
  }

  const confirmResubmit = async () => {
    if (!resubmitTarget.value) return
    const app = resubmitTarget.value
    await propertyStore.resubmitApplication(app.id)
    showToast(`${app.intakeRef} resubmitted for assessor review.`)
    resubmitTarget.value = null
  }

  const cancelResubmit = () => {
    resubmitTarget.value = null
  }

  const closeUploadModal = () => {
    uploadTarget.value = null
  }

  const handleTableAction = (action: Action, row: Record<string, unknown>) => {
    const app = row as unknown as PropertyApplication

    switch (action.label) {
      case 'View':
        goToView(app)
        break
      case 'Edit':
        goToEdit(app)
        break
      case 'Resubmit':
        openResubmitConfirm(app)
        break
      case 'Upload Docs':
        openUploadModal(app)
        break
    }
  }

  const clerkTableActions: Action[] = [
    { label: 'View' },
    { label: 'Edit', when: (row) => row.status === 'Returned' },
    { label: 'Resubmit', when: (row) => row.status === 'Returned' },
    {
      label: 'Upload Docs',
      when: (row) => row.status === 'Returned' || row.status === 'Draft',
    },
  ]

  return {
    clerkTableActions,
    handleTableAction,
    resubmitTarget,
    uploadTarget,
    toastMessage,
    confirmResubmit,
    cancelResubmit,
    closeUploadModal,
    goToView,
    goToEdit,
    openUploadModal,
    openResubmitConfirm,
    showToast,
  }
}
