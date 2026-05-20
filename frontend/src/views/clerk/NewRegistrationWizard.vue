<template>
  <div class="p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          {{ isEditMode ? 'Edit Property Registration' : 'New Property Registration' }}
        </h2>
        <p class="text-gray-600">
          {{
            isEditMode
              ? 'Update returned application details and resubmit when ready'
              : 'Fill out all required fields to create a new property registration'
          }}
        </p>
        <p v-if="isEditMode && editingRef" class="mt-2 text-sm font-medium text-primary-700">
          Editing {{ editingRef }}
        </p>
      </div>

      <!-- Progress Steps -->
      <div class="mb-8 bg-white rounded-xl shadow-md p-6">
        <div class="flex items-center justify-between">
          <div
            v-for="(step, index) in steps"
            :key="step"
            class="flex-1 flex items-center"
          >
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition',
                currentStep > index ? 'bg-green-600' : currentStep === index ? 'bg-primary-600' : 'bg-gray-300',
              ]"
            >
              <span v-if="currentStep > index" class="text-lg">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="ml-3">
              <p class="text-sm font-semibold text-gray-900">{{ step }}</p>
            </div>
            <div
              v-if="index < steps.length - 1"
              :class="[
                'flex-1 h-1 mx-4 transition',
                currentStep > index ? 'bg-green-600' : 'bg-gray-300',
              ]"
            ></div>
          </div>
        </div>
      </div>

      <!-- Form Steps -->
      <form @submit.prevent="handleNextStep" class="space-y-6">
        <!-- Step 1: Taxpayer Info -->
        <div v-if="currentStep === 0" class="bg-white rounded-xl shadow-md p-8 space-y-6">
          <h3 class="text-xl font-bold text-gray-900">Taxpayer Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              v-model="formData.lastName"
              label="Last Name"
              placeholder="Enter last name"
              required
            />
            <FormInput
              v-model="formData.firstName"
              label="First Name"
              placeholder="Enter first name"
              required
            />
            <FormInput
              v-model="formData.middleName"
              label="Middle Name"
              placeholder="Enter middle name"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="formData.tin"
              label="TIN (Tax Identification Number)"
              placeholder="000-000-000-000"
            />
            <FormInput
              v-model="formData.contact"
              label="Contact Number"
              placeholder="+63 9XX XXX XXXX"
              required
            />
          </div>

          <FormInput
            v-model="formData.email"
            label="Email Address"
            type="email"
            placeholder="taxpayer@example.com"
            required
          />

          <FormInput
            v-model="formData.address"
            label="Residential Address"
            placeholder="Enter complete address"
            required
          />

          <div
            v-if="existingTaxpayerNotice"
            class="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900"
          >
            {{ existingTaxpayerNotice }}
          </div>
        </div>

        <!-- Step 2: Property Details -->
        <div v-if="currentStep === 1" class="bg-white rounded-xl shadow-md p-8 space-y-6">
          <h3 class="text-xl font-bold text-gray-900">Property Details</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="formData.pin"
              label="PIN (Property ID Number)"
              placeholder="Enter PIN"
              required
            />
            <FormInput
              v-model="formData.arpNumber"
              label="ARP Number"
              placeholder="Enter ARP number"
              required
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              v-model="formData.propertyType"
              label="Property Type"
              :options="propertyTypes"
              required
            />
            <FormSelect
              v-model="formData.landClassification"
              label="Land Classification"
              :options="landClassifications"
              required
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              v-model="formData.actualUse"
              label="Actual Use"
              :options="actualUseOptions"
              required
            />
            <FormInput
              v-model="formData.totalArea"
              label="Total Area (sq.m)"
              type="number"
              placeholder="0.00"
              required
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="formData.surveyNumber"
              label="Survey Number"
              placeholder="Enter survey number"
            />
            <div class="flex items-end">
              <label class="flex items-center gap-3">
                <input
                  v-model="formData.taxExempt"
                  type="checkbox"
                  class="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span class="text-sm font-medium text-gray-700">Tax Exempt</span>
              </label>
            </div>
          </div>

          <div v-if="formData.taxExempt" class="space-y-2">
            <label for="exemption-notes" class="block text-sm font-semibold text-gray-900">
              Exemption basis / notes
            </label>
            <textarea
              id="exemption-notes"
              v-model="formData.exemptionNotes"
              rows="3"
              placeholder="e.g. Senior citizen, charitable use, government property (reference ordinance or document)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-y min-h-[5rem]"
            />
            <p class="text-xs text-gray-500">
              Summarize the legal or factual basis for exemption. Upload an Exemption Document on the documents step when applicable.
            </p>
          </div>
        </div>

        <!-- Step 3: Location -->
        <div v-if="currentStep === 2" class="bg-white rounded-xl shadow-md p-8 space-y-6">
          <h3 class="text-xl font-bold text-gray-900">Property Location</h3>
          
          <FormInput
            v-model="formData.street"
            label="Street Address"
            placeholder="Enter street address"
            required
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="formData.barangay"
              label="Barangay"
              placeholder="Enter barangay"
              required
            />
            <FormInput
              v-model="formData.municipality"
              label="Municipality"
              placeholder="Enter municipality"
              required
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="formData.province"
              label="Province"
              placeholder="Enter province"
              required
            />
            <FormInput
              v-model="formData.zip"
              label="ZIP Code"
              placeholder="0000"
              required
            />
          </div>
        </div>

        <!-- Step 4: Technical Data -->
        <div v-if="currentStep === 3" class="bg-white rounded-xl shadow-md p-8 space-y-6">
          <h3 class="text-xl font-bold text-gray-900">Technical Property Data</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="formData.northBoundary"
              label="North Boundary"
              placeholder="Enter boundary details"
            />
            <FormInput
              v-model="formData.southBoundary"
              label="South Boundary"
              placeholder="Enter boundary details"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="formData.eastBoundary"
              label="East Boundary"
              placeholder="Enter boundary details"
            />
            <FormInput
              v-model="formData.westBoundary"
              label="West Boundary"
              placeholder="Enter boundary details"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="formData.areaMeasurement"
              label="Area Measurement (sq.m)"
              type="number"
              placeholder="0.00"
            />
            <FormInput
              v-model="formData.surveyReference"
              label="Survey Reference"
              placeholder="Enter reference"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect
              v-model="formData.buildingType"
              label="Building Type"
              :options="buildingTypes"
            />
            <FormInput
              v-model="formData.floors"
              label="Number of Floors"
              type="number"
              placeholder="0"
            />
            <FormInput
              v-model="formData.buildingArea"
              label="Building Area (sq.m)"
              type="number"
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- Step 5: Document Upload -->
        <div v-if="currentStep === 4" class="bg-white rounded-xl shadow-md p-8 space-y-6">
          <h3 class="text-xl font-bold text-gray-900">Document Upload</h3>
          
          
          <p class="text-sm text-gray-600">
            Upload required supporting documents. Title, Tax Declaration, and Government ID are required before submission.
          </p>
          <DocumentUploadTable v-model="documents" :application-id="editingId || undefined" />
        </div>

        <!-- Step 6: Review & Submit -->
        <div v-if="currentStep === 5" class="bg-white rounded-xl shadow-md p-8 space-y-6">
          <h3 class="text-xl font-bold text-gray-900">Review & Submit</h3>
          
          <div class="space-y-4 bg-gray-50 rounded-lg p-6">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Taxpayer Name</p>
                <p class="font-semibold text-gray-900">
                  {{ formData.lastName }}, {{ formData.firstName }} {{ formData.middleName }}
                </p>
              </div>
              <div>
                <p class="text-gray-600">Contact</p>
                <p class="font-semibold text-gray-900">{{ formData.contact }}</p>
              </div>
              <div>
                <p class="text-gray-600">Property Type</p>
                <p class="font-semibold text-gray-900">{{ formData.propertyType }}</p>
              </div>
              <div>
                <p class="text-gray-600">Total Area</p>
                <p class="font-semibold text-gray-900">{{ formData.totalArea }} sq.m</p>
              </div>
              <div>
                <p class="text-gray-600">Tax exempt</p>
                <p class="font-semibold text-gray-900">{{ formData.taxExempt ? 'Yes' : 'No' }}</p>
              </div>
              <div v-if="formData.taxExempt" class="col-span-2">
                <p class="text-gray-600">Exemption notes</p>
                <p class="font-semibold text-gray-900 whitespace-pre-wrap">
                  {{ formData.exemptionNotes.trim() || '—' }}
                </p>
              </div>
              <div class="col-span-2">
                <p class="text-gray-600">Complete Address</p>
                <p class="font-semibold text-gray-900">
                  {{ formData.street }}, {{ formData.barangay }}, {{ formData.municipality }}, {{ formData.province }}
                </p>
              </div>
              <div class="col-span-2">
                <p class="text-gray-600">Documents</p>
                <p class="font-semibold text-gray-900">
                  {{ uploadedDocCount }} of {{ documents.length }} uploaded
                  <span v-if="missingRequiredDocs.length" class="text-amber-700 font-normal">
                    — missing: {{ missingRequiredDocs.join(', ') }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 7a1 1 0 000 2h6a1 1 0 100-2H8zm0 4a1 1 0 100 2h6a1 1 0 100-2H8z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="font-semibold text-blue-900">Ready to Submit</p>
              <p class="text-sm text-blue-800">Once submitted, your application will be reviewed by the Municipal Assessor.</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between bg-white rounded-xl shadow-md p-6">
          <button
            type="button"
            @click="previousStep"
            :disabled="currentStep === 0"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>

          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="saveDraft"
              class="px-6 py-2 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Save as Draft
            </button>
            <button
              v-if="currentStep < steps.length - 1"
              type="submit"
              class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition"
            >
              Next
            </button>
            <button
              v-else
              type="button"
              @click="submitRegistration"
              class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
            >
              Submit Registration
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FormInput from '@/components/forms/FormInput.vue'
import FormSelect from '@/components/forms/FormSelect.vue'
import DocumentUploadTable from '@/components/forms/DocumentUploadTable.vue'
import {
  createEmptyDocuments,
  documentsForStorage,
  countUploadedDocuments,
  missingRequiredDocuments,
} from '@/utils/documents'
import type { PropertyDocument } from '@/stores/property'
import { usePropertyStore } from '@/stores/property'
import { useTaxpayerStore } from '@/stores/taxpayer'
import { parseApiError } from '@/services/apiError'

const router = useRouter()
const route = useRoute()
const propertyStore = usePropertyStore()

const editingId = ref<string | null>(null)
const isEditMode = computed(() => !!editingId.value)
const editingRef = computed(() => {
  if (!editingId.value) return ''
  return propertyStore.getRegistrationById(editingId.value)?.intakeRef ?? ''
})
const taxpayerStore = useTaxpayerStore()

const existingTaxpayerNotice = ref('')
const currentStep = ref(0)

const steps = [
  'Taxpayer Info',
  'Property Details',
  'Location',
  'Technical Data',
  'Documents',
  'Review & Submit',
]

const propertyTypes = ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Mixed-Use']
const landClassifications = ['Residential', 'Commercial', 'Agricultural', 'Forest', 'Mineral']
const actualUseOptions = ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Institutional']
const buildingTypes = ['Concrete', 'Wood', 'Steel', 'Mixed', 'Stone']
const documents = ref<PropertyDocument[]>(createEmptyDocuments())

const uploadedDocCount = computed(() => countUploadedDocuments(documents.value))
const missingRequiredDocs = computed(() => missingRequiredDocuments(documents.value))

const formData = ref({
  // Step 1
  lastName: '',
  firstName: '',
  middleName: '',
  tin: '',
  address: '',
  contact: '',
  email: '',
  // Step 2
  pin: '',
  arpNumber: '',
  propertyType: '',
  landClassification: '',
  actualUse: '',
  totalArea: '',
  surveyNumber: '',
  taxExempt: false,
  exemptionNotes: '',
  // Step 3
  street: '',
  barangay: '',
  municipality: '',
  province: '',
  zip: '',
  // Step 4
  northBoundary: '',
  southBoundary: '',
  eastBoundary: '',
  westBoundary: '',
  areaMeasurement: '',
  surveyReference: '',
  buildingType: '',
  floors: '',
  buildingArea: '',
})

const ensureDraftApplication = async () => {
  if (editingId.value) return
  const reg = await propertyStore.addRegistration(buildPayload(), true)
  editingId.value = reg.id
}

const handleNextStep = async () => {
  if (currentStep.value === 3) {
    await ensureDraftApplication()
  }
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

watch(
  () => [formData.value.tin, formData.value.lastName, formData.value.firstName],
  async () => {
    if (formData.value.tin) {
      const byTin = await taxpayerStore.findByTin(formData.value.tin)
      if (byTin) {
        existingTaxpayerNotice.value = `Existing taxpayer found: ${byTin.firstName} ${byTin.lastName}`
        return
      }
    }
    if (formData.value.lastName && formData.value.firstName) {
      const byName = await taxpayerStore.findByName(
        formData.value.lastName,
        formData.value.firstName,
      )
      if (byName) {
        existingTaxpayerNotice.value = `Possible match: ${byName.firstName} ${byName.lastName} (TIN: ${byName.tin || 'N/A'})`
        return
      }
    }
    existingTaxpayerNotice.value = ''
  },
)

watch(
  () => formData.value.taxExempt,
  (exempt) => {
    if (!exempt) {
      formData.value.exemptionNotes = ''
    }
  },
)

const buildPayload = () => {
  const taxpayerName = `${formData.value.lastName}, ${formData.value.firstName} ${formData.value.middleName}`.trim()
  return {
    taxpayerName,
    propertyType: formData.value.propertyType,
    barangay: formData.value.barangay,
    taxExempt: formData.value.taxExempt,
    exemptionNotes: formData.value.taxExempt ? formData.value.exemptionNotes.trim() : '',
    taxpayer: {
      lastName: formData.value.lastName,
      firstName: formData.value.firstName,
      middleName: formData.value.middleName,
      tin: formData.value.tin,
      address: formData.value.address,
      contact: formData.value.contact,
      email: formData.value.email,
    },
    property: {
      pin: formData.value.pin,
      arpNumber: formData.value.arpNumber,
      landClassification: formData.value.landClassification,
      actualUse: formData.value.actualUse,
      totalArea: formData.value.totalArea,
      surveyNumber: formData.value.surveyNumber,
    },
    location: {
      street: formData.value.street,
      barangay: formData.value.barangay,
      municipality: formData.value.municipality,
      province: formData.value.province,
      zip: formData.value.zip,
    },
    technical: {
      northBoundary: formData.value.northBoundary,
      southBoundary: formData.value.southBoundary,
      eastBoundary: formData.value.eastBoundary,
      westBoundary: formData.value.westBoundary,
      areaMeasurement: formData.value.areaMeasurement,
      surveyReference: formData.value.surveyReference,
      buildingType: formData.value.buildingType,
      floors: formData.value.floors,
      buildingArea: formData.value.buildingArea,
    },
    documents: documentsForStorage(documents.value),
  }
}

const loadFromProperty = (id: string) => {
  const app = propertyStore.getRegistrationById(id)
  if (!app) return

  editingId.value = id
  const t = app.taxpayer
  if (t) {
    formData.value.lastName = t.lastName
    formData.value.firstName = t.firstName
    formData.value.middleName = t.middleName || ''
    formData.value.tin = t.tin || ''
    formData.value.address = t.address
    formData.value.contact = t.contact
    formData.value.email = t.email
  } else {
    const parts = app.taxpayerName.split(',')
    formData.value.lastName = parts[0]?.trim() || ''
    formData.value.firstName = parts[1]?.trim().split(' ')[0] || ''
  }

  const p = app.property
  if (p) {
    formData.value.pin = p.pin
    formData.value.arpNumber = p.arpNumber
    formData.value.landClassification = p.landClassification
    formData.value.actualUse = p.actualUse
    formData.value.totalArea = p.totalArea
    formData.value.surveyNumber = p.surveyNumber || ''
  }
  formData.value.propertyType = app.propertyType
  formData.value.taxExempt = !!app.taxExempt
  formData.value.exemptionNotes = app.exemptionNotes || ''

  const loc = app.location
  if (loc) {
    formData.value.street = loc.street
    formData.value.barangay = loc.barangay
    formData.value.municipality = loc.municipality
    formData.value.province = loc.province
    formData.value.zip = loc.zip
  } else {
    formData.value.barangay = app.barangay
  }

  const tech = app.technical
  if (tech) {
    formData.value.northBoundary = tech.northBoundary || ''
    formData.value.southBoundary = tech.southBoundary || ''
    formData.value.eastBoundary = tech.eastBoundary || ''
    formData.value.westBoundary = tech.westBoundary || ''
    formData.value.areaMeasurement = tech.areaMeasurement || ''
    formData.value.surveyReference = tech.surveyReference || ''
    formData.value.buildingType = tech.buildingType || ''
    formData.value.floors = tech.floors || ''
    formData.value.buildingArea = tech.buildingArea || ''
  }

  if (app.documents?.length) {
    const empty = createEmptyDocuments()
    documents.value = empty.map((slot) => {
      const existing = app.documents!.find((d) => d.type === slot.type)
      return existing ? { ...slot, ...existing, previewUrl: undefined } : slot
    })
  } else {
    documents.value = createEmptyDocuments()
  }
}

onMounted(async () => {
  const editId = route.query.edit as string | undefined
  const step = route.query.step as string | undefined
  if (editId) {
    await propertyStore.fetchRegistrationById(editId)
    loadFromProperty(editId)
    if (step) {
      const stepIndex = parseInt(step, 10)
      if (!Number.isNaN(stepIndex) && stepIndex >= 0 && stepIndex < steps.length) {
        currentStep.value = stepIndex
      }
    }
  }
})

const saveDraft = async () => {
  const payload = buildPayload()

  try {
    if (editingId.value) {
      await propertyStore.patchRegistration(editingId.value, payload)
      alert(`Draft updated: ${editingRef.value}`)
    } else {
      const reg = await propertyStore.addRegistration(payload, true)
      editingId.value = reg.id
      alert(`Draft saved: ${reg.intakeRef}`)
    }
    router.push('/clerk/dashboard')
  } catch (e) {
    alert(parseApiError(e).message)
  }
}

const submitRegistration = async () => {
  if (!formData.value.street || !formData.value.barangay || !formData.value.municipality || !formData.value.province) {
    alert('Complete location hierarchy is required before submission.')
    currentStep.value = 2
    return
  }

  const missing = missingRequiredDocuments(documents.value)
  if (missing.length) {
    alert(`Please upload required documents: ${missing.join(', ')}`)
    currentStep.value = 4
    return
  }

  const payload = buildPayload()

  try {
    if (editingId.value) {
      const existing = propertyStore.getRegistrationById(editingId.value)
      await propertyStore.patchRegistration(editingId.value, payload)
      if (existing?.status === 'Returned') {
        await propertyStore.resubmitApplication(editingId.value)
        alert(`Application ${editingRef.value} updated and resubmitted for review.`)
      } else if (existing?.status === 'Draft') {
        await propertyStore.submitDraft(editingId.value)
        alert(`Registration submitted: ${editingRef.value}. Status: Under Review`)
      } else {
        alert(`Application ${editingRef.value} updated.`)
      }
    } else {
      const reg = await propertyStore.addRegistration(payload, false)
      alert(`Registration submitted: ${reg.intakeRef}. Status: Under Review`)
    }
    router.push('/clerk/dashboard')
  } catch (e) {
    alert(parseApiError(e).message)
  }
}
</script>
