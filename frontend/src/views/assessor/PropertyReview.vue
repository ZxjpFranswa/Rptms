<template>
  <div class="p-6">
    <div v-if="!property" class="text-center py-12 text-gray-500">
      Application not found.
      <router-link to="/assessor/dashboard" class="text-primary-700 font-medium ml-1">
        Back to dashboard
      </router-link>
    </div>

    <div v-else class="max-w-5xl mx-auto">
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ property.intakeRef }}</h2>
            <p class="text-gray-600">{{ property.taxpayerName }} — {{ property.propertyType }}</p>
          </div>
          <span
            :class="[
              'px-4 py-2 rounded-full text-sm font-semibold',
              statusBadgeClass(property.status),
            ]"
          >
            {{ formatStatus(property.status) }}
          </span>
        </div>
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
          <div v-if="activeTab === 0" class="space-y-6">
            <h3 class="text-lg font-bold text-gray-900">Taxpayer Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Full Name" :value="property.taxpayerName" />
              <InfoField label="TIN" :value="property.taxpayer?.tin || '123-456-789-123'" />
              <InfoField label="Contact" :value="property.taxpayer?.contact || '—'" />
              <InfoField label="Email" :value="property.taxpayer?.email || '—'" />
              <InfoField
                label="Address"
                :value="property.taxpayer?.address || '—'"
                colspan
              />
            </div>
          </div>

          <div v-if="activeTab === 1" class="space-y-6">
            <h3 class="text-lg font-bold text-gray-900">Property Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="PIN" :value="property.property?.pin || '010-12-345-678'" />
              <InfoField label="ARP Number" :value="property.property?.arpNumber || '010-12-345'" />
              <InfoField label="Property Type" :value="property.propertyType" />
              <InfoField
                label="Land Classification"
                :value="property.property?.landClassification || 'Residential'"
              />
              <InfoField label="Actual Use" :value="property.property?.actualUse || 'Residential'" />
              <InfoField label="Total Area" :value="`${property.property?.totalArea || '250'} sq.m`" />
              <InfoField label="Survey Number" :value="property.property?.surveyNumber || '—'" />
              <InfoField label="Tax Exempt" :value="property.taxExempt ? 'Yes' : 'No'" />
              <InfoField
                v-if="property.taxExempt"
                label="Exemption notes"
                :value="property.exemptionNotes?.trim() || '—'"
                colspan
              />
            </div>
          </div>

          <div v-if="activeTab === 2" class="space-y-6">
            <h3 class="text-lg font-bold text-gray-900">Technical Property Data</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="North Boundary" :value="property.technical?.northBoundary || '—'" />
              <InfoField label="South Boundary" :value="property.technical?.southBoundary || '—'" />
              <InfoField label="East Boundary" :value="property.technical?.eastBoundary || '—'" />
              <InfoField label="West Boundary" :value="property.technical?.westBoundary || '—'" />
              <InfoField
                label="Area Measurement"
                :value="property.technical?.areaMeasurement || '—'"
              />
              <InfoField
                label="Survey Reference"
                :value="property.technical?.surveyReference || '—'"
              />
              <InfoField label="Building Type" :value="property.technical?.buildingType || '—'" />
              <InfoField label="Number of Floors" :value="property.technical?.floors || '—'" />
              <InfoField
                label="Building Area"
                :value="property.technical?.buildingArea || '—'"
                colspan
              />
            </div>
          </div>

          <div v-if="activeTab === 3" class="space-y-6">
            <h3 class="text-lg font-bold text-gray-900">Uploaded Documents</h3>
            <p class="text-sm text-gray-600">Preview files and mark verification status.</p>
            <div class="space-y-3">
              <DocumentRow
                v-for="doc in documentList"
                :key="doc.type"
                :document="doc"
                show-verify
                @view="onViewDocument"
                @verify="verifyDocument"
              />
            </div>
            <DocumentPreviewModal
              :open="!!previewDoc"
              :document="previewDoc"
              @close="previewDoc = null"
            />
          </div>

          <div v-if="activeTab === 4" class="space-y-6">
            <h3 class="text-lg font-bold text-gray-900">Assessment Decision</h3>

            <div v-if="property.status !== 'Under_Review'" class="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              This application is no longer under review (current status:
              {{ formatStatus(property.status) }}).
            </div>

            <template v-else>
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Assessor Remarks
                </label>
                <textarea
                  v-model="decision.remarks"
                  placeholder="Enter your assessment remarks..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  rows="4"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  class="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                  @click="decision.action = 'approve'"
                >
                  Approve
                </button>
                <button
                  type="button"
                  class="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition"
                  @click="decision.action = 'return'"
                >
                  Return
                </button>
                <button
                  type="button"
                  class="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                  @click="decision.action = 'reject'"
                >
                  Reject
                </button>
              </div>

              <div
                v-if="decision.action === 'approve'"
                class="p-4 bg-green-50 rounded-lg border border-green-200 space-y-3"
              >
                <label class="flex items-center gap-3">
                  <input
                    v-model="decision.activateNow"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-300 text-primary-600"
                  />
                  <span class="text-sm text-green-800">Activate property immediately (Approved → Active)</span>
                </label>
                <button
                  type="button"
                  class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
                  @click="confirmDecision"
                >
                  Confirm Approval
                </button>
              </div>

              <div
                v-if="decision.action === 'return'"
                class="p-4 bg-yellow-50 rounded-lg border border-yellow-200 space-y-3"
              >
                <textarea
                  v-model="decision.returnReason"
                  placeholder="Remarks required — specify corrections for the Assessment Clerk..."
                  class="w-full px-4 py-2 border border-yellow-300 rounded-lg text-sm"
                  rows="3"
                />
                <button
                  type="button"
                  class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg"
                  :disabled="!decision.returnReason.trim()"
                  @click="confirmDecision"
                >
                  Confirm Return
                </button>
              </div>

              <div
                v-if="decision.action === 'reject'"
                class="p-4 bg-red-50 rounded-lg border border-red-200 space-y-3"
              >
                <textarea
                  v-model="decision.rejectReason"
                  placeholder="Rejection reason required..."
                  class="w-full px-4 py-2 border border-red-300 rounded-lg text-sm"
                  rows="3"
                />
                <button
                  type="button"
                  class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
                  :disabled="!decision.rejectReason.trim()"
                  @click="confirmDecision"
                >
                  Confirm Rejection
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePropertyStore, type PropertyDocument } from '@/stores/property'
import InfoField from '@/components/review/InfoField.vue'
import DocumentRow from '@/components/review/DocumentRow.vue'
import DocumentPreviewModal from '@/components/review/DocumentPreviewModal.vue'
import { createEmptyDocuments, documentForViewer } from '@/utils/documents'
import { verifyDocumentApi } from '@/services/documentsApi'
import { parseApiError } from '@/services/apiError'

const router = useRouter()
const route = useRoute()
const propertyStore = usePropertyStore()

const activeTab = ref(0)
const tabs = ['Taxpayer Info', 'Property Info', 'Technical Data', 'Documents', 'Decision']

const propertyId = computed(() => route.params.id as string)
const property = computed(() => propertyStore.getRegistrationById(propertyId.value))

onMounted(async () => {
  await propertyStore.fetchRegistrationById(propertyId.value)
})

const previewDoc = ref<PropertyDocument | null>(null)

const documentList = computed(() => {
  if (!property.value) return []
  const empty = createEmptyDocuments()
  return empty.map((slot) => {
    const existing = property.value!.documents?.find((d) => d.type === slot.type)
    return existing ?? slot
  })
})

const onViewDocument = async (doc: PropertyDocument) => {
  previewDoc.value = await documentForViewer(doc)
}

const verifyDocument = async (doc: PropertyDocument) => {
  if (!property.value) return
  try {
    await verifyDocumentApi(property.value.id, doc.type, 'Verified')
    await propertyStore.fetchRegistrationById(property.value.id)
  } catch (e) {
    alert(parseApiError(e).message)
  }
}

const decision = ref({
  action: null as null | 'approve' | 'return' | 'reject',
  remarks: '',
  activateNow: false,
  returnReason: '',
  rejectReason: '',
})

const formatStatus = (status: string) => status.replace(/_/g, ' ')

const statusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    Under_Review: 'bg-blue-100 text-blue-800',
    Approved: 'bg-green-100 text-green-800',
    Returned: 'bg-yellow-100 text-yellow-800',
    Rejected: 'bg-red-100 text-red-800',
    Active: 'bg-emerald-100 text-emerald-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const confirmDecision = async () => {
  if (!property.value) return
  const id = property.value.id

  try {
    if (decision.value.action === 'approve') {
      await propertyStore.assessorApprove(
        id,
        decision.value.remarks || 'Application approved',
        decision.value.activateNow,
      )
    } else if (decision.value.action === 'return') {
      if (!decision.value.returnReason.trim()) return
      await propertyStore.assessorReturn(id, decision.value.returnReason)
    } else if (decision.value.action === 'reject') {
      if (!decision.value.rejectReason.trim()) return
      await propertyStore.assessorReject(id, decision.value.rejectReason)
    }
    router.push('/assessor/dashboard')
  } catch (e) {
    alert(parseApiError(e).message)
  }
}
</script>
