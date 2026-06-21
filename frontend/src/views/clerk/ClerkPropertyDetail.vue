<template>
  <div class="p-6">
    <div v-if="!property" class="text-center py-12 text-gray-500">
      Property not found.
      <router-link to="/clerk/dashboard" class="text-primary-700 font-medium ml-1">
        Back to dashboard
      </router-link>
    </div>

    <div v-else class="max-w-5xl mx-auto space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <router-link
            to="/clerk/registrations"
            class="text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            ← Back to Properties
          </router-link>
          <h2 class="text-2xl font-bold text-gray-900 mt-2">{{ property.intakeRef }}</h2>
          <p class="text-gray-600">{{ property.taxpayerName }} — {{ property.propertyType }}</p>
        </div>
        <span
          :class="[
            'inline-flex px-4 py-2 rounded-full text-sm font-semibold self-start',
            statusBadgeClass(property.status),
          ]"
        >
          {{ formatStatus(property.status) }}
        </span>
      </div>

      <div
        v-if="property.status === 'Returned' && property.remarks"
        class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
      >
        <p class="text-sm font-semibold text-yellow-900">Assessor remarks (correction required)</p>
        <p class="text-sm text-yellow-800 mt-1">{{ property.remarks }}</p>
      </div>

      <div
        v-if="property.status === 'Rejected' && property.remarks"
        class="p-4 bg-red-50 border border-red-200 rounded-xl"
      >
        <p class="text-sm font-semibold text-red-900">Rejection reason</p>
        <p class="text-sm text-red-800 mt-1">{{ property.remarks }}</p>
      </div>

      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="flex border-b border-gray-200 overflow-x-auto">
          <button
            v-for="(tab, index) in tabs"
            :key="tab"
            type="button"
            :class="[
              'px-6 py-4 font-medium transition border-b-2 whitespace-nowrap',
              activeTab === index
                ? 'text-primary-700 border-primary-700'
                : 'text-gray-600 border-transparent hover:text-gray-900',
            ]"
            @click="activeTab = index"
          >
            {{ tab }}
          </button>
        </div>

        <div class="p-8">
          <div v-if="activeTab === 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Full Name" :value="property.taxpayerName" />
            <InfoField label="TIN" :value="property.taxpayer?.tin || '—'" />
            <InfoField label="Contact" :value="property.taxpayer?.contact || '—'" />
            <InfoField label="Email" :value="property.taxpayer?.email || '—'" />
            <InfoField label="Address" :value="property.taxpayer?.address || '—'" colspan />
          </div>

          <div v-if="activeTab === 1" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="PIN" :value="property.property?.pin || '—'" />
            <InfoField label="ARP Number" :value="property.property?.arpNumber || '—'" />
            <InfoField label="Property Type" :value="property.propertyType" />
            <InfoField label="Barangay" :value="property.barangay" />
            <InfoField
              label="Land Classification"
              :value="property.property?.landClassification || '—'"
            />
            <InfoField label="Actual Use" :value="property.property?.actualUse || '—'" />
            <InfoField label="Total Area" :value="areaLabel" />
            <InfoField label="Tax Exempt" :value="property.taxExempt ? 'Yes' : 'No'" />
            <InfoField
              v-if="property.taxExempt"
              label="Exemption notes"
              :value="property.exemptionNotes?.trim() || '—'"
              colspan
            />
          </div>

          <div v-if="activeTab === 2" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Street" :value="property.location?.street || '—'" />
            <InfoField label="Municipality" :value="property.location?.municipality || '—'" />
            <InfoField label="Province" :value="property.location?.province || '—'" />
            <InfoField label="ZIP" :value="property.location?.zip || '—'" />
          </div>

          <div v-if="activeTab === 3" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="North Boundary" :value="property.technical?.northBoundary || '—'" />
            <InfoField label="South Boundary" :value="property.technical?.southBoundary || '—'" />
            <InfoField label="East Boundary" :value="property.technical?.eastBoundary || '—'" />
            <InfoField label="West Boundary" :value="property.technical?.westBoundary || '—'" />
            <InfoField
              label="Building Area"
              :value="property.technical?.buildingArea || '—'"
              colspan
            />
          </div>

          <div v-if="activeTab === 4" class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600">
                {{ documentList.length }} document type(s) on file
              </p>
              <button
                v-if="canUploadDocs"
                type="button"
                class="text-sm font-semibold text-primary-700 hover:text-primary-800"
                @click="openUploadModal(property)"
              >
                Manage uploads
              </button>
            </div>
            <DocumentRow
              v-for="doc in documentList"
              :key="doc.type"
              :document="doc"
              @view="onViewDocument"
            />
          </div>

          <div v-if="activeTab === 5" class="space-y-4">
            <InfoField label="Last Assessor Action" :value="property.lastAssessorAction || '—'" />
            <InfoField label="Remarks" :value="property.remarks || '—'" colspan />
            <InfoField label="Verification" :value="property.verificationStatus || '—'" />
            <InfoField label="Submission Date" :value="property.submissionDate" />
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          v-if="property.status === 'Returned'"
          type="button"
          class="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-lg transition"
          @click="goToEdit(property)"
        >
          Edit Application
        </button>
        <button
          v-if="property.status === 'Returned'"
          type="button"
          class="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition"
          @click="openResubmitConfirm(property)"
        >
          Resubmit
        </button>
        <button
          v-if="canUploadDocs"
          type="button"
          class="px-5 py-2.5 border border-primary-700 text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition"
          @click="openUploadModal(property)"
        >
          Upload Missing Docs
        </button>
        <button
          v-if="property.status === 'Draft'"
          type="button"
          class="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition"
          @click="goToEdit(property)"
        >
          Continue Draft
        </button>
      </div>

      <DocumentPreviewModal
        :open="!!previewDoc"
        :document="previewDoc"
        @close="previewDoc = null"
      />
      <ClerkActionOverlays />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePropertyStore, type PropertyDocument } from '@/stores/property'
import InfoField from '@/components/review/InfoField.vue'
import DocumentRow from '@/components/review/DocumentRow.vue'
import DocumentPreviewModal from '@/components/review/DocumentPreviewModal.vue'
import ClerkActionOverlays from '@/components/clerk/ClerkActionOverlays.vue'
import { useClerkPropertyActions } from '@/composables/useClerkPropertyActions'
import { createEmptyDocuments, documentForViewer } from '@/utils/documents'

const route = useRoute()
const propertyStore = usePropertyStore()
const { goToEdit, openResubmitConfirm, openUploadModal } = useClerkPropertyActions()

const activeTab = ref(0)
const previewDoc = ref<PropertyDocument | null>(null)
const tabs = ['Taxpayer', 'Property', 'Location', 'Technical', 'Documents', 'Status History']

const propertyId = computed(() => route.params.id as string)

const property = computed(() => propertyStore.getRegistrationById(propertyId.value))

onMounted(async () => {
  await propertyStore.fetchRegistrationById(propertyId.value)
})

const onViewDocument = async (doc: PropertyDocument) => {
  previewDoc.value = await documentForViewer(doc)
}

const documentList = computed(() => {
  if (!property.value) return []
  const empty = createEmptyDocuments()
  return empty.map((slot) => {
    const existing = property.value!.documents?.find((d) => d.type === slot.type)
    return existing ?? slot
  })
})

const canUploadDocs = computed(
  () => property.value?.status === 'Returned' || property.value?.status === 'Draft',
)

const areaLabel = computed(() => {
  const area = property.value?.property?.totalArea
  return area ? `${area} sq.m` : '—'
})

const formatStatus = (status: string) => status.replace(/_/g, ' ')

const statusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    Under_Review: 'bg-purple-100 text-purple-800',
    Returned: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
    Active: 'bg-emerald-100 text-emerald-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}
</script>
