<template>
  <div class="space-y-8">
    <div class="card">
      <Stepper v-model="step" :steps="steps" :clickable="true" />

      <!-- Step 1 Owner -->
      <div v-show="step === 0" class="mt-8 space-y-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Owner information</h3>
        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input v-model="form.linkExistingOwner" type="checkbox" class="rounded border-slate-300 dark:border-slate-600" />
          Link existing taxpayer (TIN lookup)
        </label>
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <label class="label">Owner name</label>
            <input v-model="form.ownerName" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" required />
          </div>
          <div>
            <label class="label">TIN</label>
            <input v-model="form.ownerTIN" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" required />
          </div>
          <div class="md:col-span-2">
            <label class="label">Address</label>
            <input v-model="form.ownerAddress" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label class="label">Contact number</label>
            <input v-model="form.contactNumber" type="tel" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" type="email" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div class="flex items-center gap-2 md:col-span-2">
            <input id="taxExempt" v-model="form.taxExempt" type="checkbox" class="rounded border-slate-300" />
            <label for="taxExempt" class="text-sm font-medium text-slate-700 dark:text-slate-300">Tax exempt entity</label>
          </div>
        </div>
      </div>

      <!-- Step 2 Property -->
      <div v-show="step === 1" class="mt-8 space-y-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Property information</h3>
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <label class="label">PIN</label>
            <input v-model="form.pin" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
            <p v-if="pinError" class="mt-1 text-sm text-red-600">{{ pinError }}</p>
          </div>
          <div>
            <label class="label">ARP number</label>
            <input v-model="form.arpNumber" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label class="label">Lot number</label>
            <input v-model="form.lotNumber" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label class="label">Block number</label>
            <input v-model="form.blockNumber" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label class="label">Survey number</label>
            <input v-model="form.surveyNumber" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label class="label">Property type</label>
            <select v-model="form.propertyType" class="select-field dark:border-slate-600 dark:bg-slate-800 dark:text-white">
              <option>Residential</option>
              <option>Commercial</option>
              <option>Industrial</option>
              <option>Agricultural</option>
            </select>
          </div>
          <div>
            <label class="label">Land classification</label>
            <input v-model="form.landClassification" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label class="label">Actual use</label>
            <input v-model="form.actualUse" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label class="label">Total area (sqm)</label>
            <input v-model.number="form.totalArea" type="number" min="0" step="0.01" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
        </div>
        <div>
          <h4 class="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">Location</h4>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="label">Street</label>
              <input v-model="form.street" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label class="label">Barangay</label>
              <input v-model="form.barangay" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" required />
            </div>
            <div>
              <label class="label">Municipality</label>
              <input v-model="form.municipality" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" required />
            </div>
            <div class="md:col-span-2">
              <label class="label">Province</label>
              <input v-model="form.province" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" required />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3 Documents -->
      <div v-show="step === 2" class="mt-8 space-y-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Document upload</h3>
        <div
          class="rounded-xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-950/30"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <p class="text-sm text-slate-700 dark:text-slate-300">Drag and drop files here or</p>
          <label class="btn-primary btn-sm mt-3 inline-block cursor-pointer">
            Browse
            <input type="file" class="hidden" multiple @change="onFilePick" />
          </label>
        </div>
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase text-slate-500">Expected types</p>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="dt in docTypes" :key="dt" variant="info">{{ dt }}</Badge>
          </div>
        </div>
        <ul class="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
          <li v-for="(f, i) in uploads" :key="i" class="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span class="truncate font-medium text-slate-800 dark:text-slate-100">{{ f.name }}</span>
            <Badge :variant="f.status === 'ready' ? 'success' : 'warning'">{{ f.status }}</Badge>
          </li>
          <li v-if="!uploads.length" class="px-4 py-6 text-center text-slate-500">No files staged (demo — files are not uploaded to a server)</li>
        </ul>
      </div>

      <!-- Step 4 Technical -->
      <div v-show="step === 3" class="mt-8 space-y-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Technical information</h3>
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <label class="label">North boundary</label>
            <input v-model="form.northBoundary" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" required />
          </div>
          <div>
            <label class="label">South boundary</label>
            <input v-model="form.southBoundary" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" required />
          </div>
          <div>
            <label class="label">East boundary</label>
            <input v-model="form.eastBoundary" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" required />
          </div>
          <div>
            <label class="label">West boundary</label>
            <input v-model="form.westBoundary" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" required />
          </div>
          <div>
            <label class="label">Area measurement (sqm)</label>
            <input v-model.number="form.areaMeasurement" type="number" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label class="label">Building type</label>
            <input v-model="form.buildingType" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label class="label">Number of floors</label>
            <input v-model.number="form.numberOfFloors" type="number" min="0" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
          <div>
            <label class="label">Building area (sqm)</label>
            <input v-model.number="form.buildingArea" type="number" min="0" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          </div>
        </div>
      </div>

      <!-- Step 5 Verification -->
      <div v-show="step === 4" class="mt-8 space-y-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">System verification</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400">
          Automated checks run against LGU rules. Outcomes drive routing to assessor review or return for correction.
        </p>
        <div v-if="!checksRun" class="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-600 dark:text-slate-400">
          Run automated checks against your draft registration. PIN uniqueness is evaluated against the live register.
        </div>
        <div v-else class="grid gap-4 md:grid-cols-2">
          <div v-for="c in verificationPreview" :key="c.key" class="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <p class="text-xs font-semibold uppercase text-slate-500">{{ c.label }}</p>
            <p
              class="mt-2 text-lg font-semibold"
              :class="c.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
            >
              {{ c.pass ? 'Pass' : 'Fail' }}
            </p>
          </div>
        </div>
        <button type="button" class="btn-secondary" @click="runChecks">Run verification</button>
      </div>

      <div class="mt-10 flex flex-wrap justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-700">
        <button type="button" class="btn-secondary" :disabled="step === 0" @click="step--">Back</button>
        <div class="flex gap-3">
          <button v-if="step < 4" type="button" class="btn-primary" @click="nextStep">Continue</button>
          <button v-else type="button" class="btn-primary" @click="submitRegistration">Submit registration</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Stepper from '@/components/Stepper.vue'
import Badge from '@/components/Badge.vue'
import { usePropertiesStore } from '@/stores/properties'
import { useToastStore } from '@/stores/toast'
import type { Document, Property } from '@/stores/properties'

const route = useRoute()
const router = useRouter()
const propertiesStore = usePropertiesStore()
const toast = useToastStore()

const steps = [
  { key: 'owner', label: 'Owner' },
  { key: 'property', label: 'Property' },
  { key: 'documents', label: 'Documents' },
  { key: 'technical', label: 'Technical' },
  { key: 'verify', label: 'Verification' },
]

const step = ref(0)
const pinError = ref('')
const checksRun = ref(false)

const docTypes = [
  'Title',
  'Tax Declaration',
  'Survey Plan',
  'Building Permit',
  'Government ID',
  'Deed of Sale',
  'Supporting Affidavit',
  'Exemption Documents',
]

const form = reactive({
  linkExistingOwner: false,
  ownerName: '',
  ownerTIN: '',
  ownerAddress: '',
  contactNumber: '',
  email: '',
  taxExempt: false,
  pin: '',
  arpNumber: '',
  lotNumber: '',
  blockNumber: '',
  surveyNumber: '',
  propertyType: 'Residential',
  landClassification: '',
  actualUse: '',
  totalArea: 0,
  street: '',
  barangay: '',
  municipality: '',
  province: '',
  northBoundary: '',
  southBoundary: '',
  eastBoundary: '',
  westBoundary: '',
  areaMeasurement: 0,
  buildingType: '',
  numberOfFloors: 0,
  buildingArea: 0,
})

const uploads = ref<{ name: string; status: 'ready' | 'staged' }[]>([])

const hydrateFromProperty = (p: Property) => {
  form.ownerName = p.ownerName
  form.ownerTIN = p.ownerTIN
  form.ownerAddress = ''
  form.street = p.street ?? ''
  form.barangay = p.barangay
  form.municipality = p.municipality
  form.province = p.province
  form.pin = p.pin
  form.arpNumber = p.arpNumber
  form.lotNumber = p.lotNumber ?? ''
  form.blockNumber = p.blockNumber ?? ''
  form.surveyNumber = p.surveyNumber ?? ''
  form.propertyType = p.propertyType
  form.landClassification = p.landClassification ?? ''
  form.actualUse = p.actualUse ?? ''
  form.totalArea = p.totalArea
  const t = p.technicalInfo
  if (t) {
    form.northBoundary = t.northBoundary
    form.southBoundary = t.southBoundary
    form.eastBoundary = t.eastBoundary
    form.westBoundary = t.westBoundary
    form.areaMeasurement = t.areaMeasurement
    form.buildingType = t.buildingType ?? ''
    form.numberOfFloors = t.numberOfFloors ?? 0
    form.buildingArea = t.buildingArea ?? 0
  }
  uploads.value = p.documents.map((d) => ({ name: d.fileName, status: 'ready' as const }))
  checksRun.value = false
  pinError.value = ''
}

let lastHydratedIntake: string | null = null
watch(
  () => route.query.intake,
  (intake) => {
    if (typeof intake !== 'string' || !intake.trim()) {
      lastHydratedIntake = null
      return
    }
    if (intake === lastHydratedIntake) return
    const p = propertiesStore.getPropertyByIntakeRef(intake)
    if (!p) {
      toast.push(`Intake ${intake} was not found.`, 'warning')
      return
    }
    hydrateFromProperty(p)
    lastHydratedIntake = intake
    step.value = 0
    toast.push(`Loaded ${intake} — continue encoding from the wizard.`, 'success')
  },
  { immediate: true },
)

const verificationPreview = computed(() => {
  const pinOk = !!form.pin && !propertiesStore.pinExists(form.pin)
  const ownOk = !!(form.ownerName?.trim() && form.ownerTIN?.trim())
  const locOk = !!(form.barangay?.trim() && form.municipality?.trim() && form.province?.trim())
  const areaOk = form.totalArea > 0 || form.areaMeasurement > 0
  const boundaryOk = !!(form.northBoundary && form.southBoundary && form.eastBoundary && form.westBoundary)
  const docsOk = uploads.value.length > 0
  const exeOk = !form.taxExempt || !!form.ownerTIN?.trim()
  return [
    { key: 'dup', label: 'Duplicate property', pass: pinOk },
    { key: 'own', label: 'Ownership validation', pass: ownOk },
    { key: 'con', label: 'Data consistency', pass: locOk && areaOk && boundaryOk },
    { key: 'doc', label: 'Documents staged', pass: docsOk },
    { key: 'exe', label: 'Exemption validation', pass: exeOk },
  ]
})

const allVerificationPassed = computed(() => verificationPreview.value.every((c) => c.pass))

const onFilePick = (e: Event) => {
  const t = e.target as HTMLInputElement
  addFiles(t.files)
  t.value = ''
}

const onDrop = (e: DragEvent) => {
  addFiles(e.dataTransfer?.files ?? null)
}

const addFiles = (list: FileList | null | undefined) => {
  if (!list?.length) return
  for (let i = 0; i < list.length; i++) {
    uploads.value.push({ name: list[i].name, status: 'ready' })
  }
}

const nextStep = () => {
  pinError.value = ''
  if (step.value === 1 && form.pin && propertiesStore.pinExists(form.pin)) {
    pinError.value = 'PIN already exists in the system.'
    toast.push('PIN must be unique.', 'error')
    return
  }
  if (step.value < 4) step.value++
}

const runChecks = () => {
  checksRun.value = true
  toast.push(
    allVerificationPassed.value ? 'All verification checks passed.' : 'Some checks failed — review highlighted steps.',
    allVerificationPassed.value ? 'success' : 'warning',
  )
}

const buildDocuments = (): Document[] =>
  uploads.value.map((u, i) => ({
    id: `doc-${i}`,
    type: 'Supporting',
    fileName: u.name,
    uploadDate: new Date().toISOString().split('T')[0],
    status: 'pending' as const,
  }))

const submitRegistration = () => {
  if (!checksRun.value) {
    toast.push('Run system verification on step 5 before submitting.', 'warning')
    return
  }
  if (!allVerificationPassed.value) {
    toast.push('Resolve failed verification checks before submitting.', 'error')
    return
  }
  if (!form.ownerName || !form.pin || !form.barangay) {
    toast.push('Complete required fields before submitting.', 'warning')
    return
  }
  if (propertiesStore.pinExists(form.pin)) {
    toast.push('PIN already exists.', 'error')
    return
  }

  const today = new Date().toISOString().split('T')[0]
  const payload: Omit<Property, 'id' | 'applicationId' | 'intakeReferenceNo' | 'lastUpdated'> = {
    pin: form.pin,
    arpNumber: form.arpNumber || `ARP-${form.pin.slice(-4)}`,
    lotNumber: form.lotNumber,
    blockNumber: form.blockNumber,
    surveyNumber: form.surveyNumber,
    ownerName: form.ownerName,
    ownerTIN: form.ownerTIN,
    street: form.street,
    barangay: form.barangay,
    municipality: form.municipality,
    province: form.province,
    propertyType: form.propertyType,
    landClassification: form.landClassification,
    actualUse: form.actualUse,
    totalArea: form.totalArea || form.areaMeasurement || 0,
    status: 'encoding',
    encodingStatus: 'completed',
    submissionDate: today,
    documents: buildDocuments(),
    technicalInfo: {
      northBoundary: form.northBoundary,
      southBoundary: form.southBoundary,
      eastBoundary: form.eastBoundary,
      westBoundary: form.westBoundary,
      areaMeasurement: form.areaMeasurement || form.totalArea,
      buildingType: form.buildingType,
      numberOfFloors: form.numberOfFloors,
      buildingArea: form.buildingArea,
    },
  }

  const id = propertiesStore.registerProperty(payload)
  if (id) propertiesStore.runAutomatedVerification(id)

  toast.push('Property registration submitted. Intake reference generated.', 'success')
  router.push('/clerk/dashboard')
}
</script>
