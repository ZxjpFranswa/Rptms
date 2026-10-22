<template>
  <div class="space-y-4">
    <!-- Header & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h4 class="text-base font-bold text-gray-900 flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Pictures &amp; Images of the Land
        </h4>
        <p class="text-xs text-gray-500 mt-0.5">
          Visual documentation of land parcel boundaries, topography, road frontage, and on-site improvements.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="canUpload"
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          @click="openUploadModal = true"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Land Photo
        </button>
      </div>
    </div>

    <!-- Category Filter Pills -->
    <div v-if="photos.length > 0" class="flex flex-wrap gap-1.5 pb-1 border-b border-gray-100">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        :class="[
          'px-2.5 py-1 text-xs rounded-full font-medium transition',
          selectedCategory === cat
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        ]"
        @click="selectedCategory = cat"
      >
        {{ cat }}
        <span class="ml-1 opacity-75">({{ countCategory(cat) }})</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8 text-gray-400 text-sm">
      Loading land photos…
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredPhotos.length === 0"
      class="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center bg-gray-50/50"
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-gray-700">No Land Photos Attached Yet</p>
      <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
        Upload pictures of the land lot, boundaries, road frontage, or plants/crops to assist the Assessor with accurate appraisal.
      </p>
      <button
        v-if="canUpload"
        type="button"
        class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
        @click="openUploadModal = true"
      >
        Upload Land Image
      </button>
    </div>

    <!-- Gallery Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="photo in filteredPhotos"
        :key="photo.id"
        class="group relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
      >
        <!-- Thumbnail / Image Container -->
        <div
          class="aspect-video w-full bg-gray-100 overflow-hidden relative cursor-pointer"
          @click="openLightbox(photo)"
        >
          <img
            :src="photo.url"
            :alt="photo.title"
            class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            @error="onImageError"
          />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span class="px-3 py-1.5 bg-black/70 text-white text-xs rounded-lg backdrop-blur-sm flex items-center gap-1.5 font-medium">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              View Full Size
            </span>
          </div>
          <span
            class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm"
          >
            {{ photo.category }}
          </span>
        </div>

        <!-- Info / Caption -->
        <div class="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h5 class="text-sm font-semibold text-gray-900 truncate" :title="photo.title">
              {{ photo.title }}
            </h5>
            <p v-if="photo.caption" class="text-xs text-gray-500 mt-1 line-clamp-2">
              {{ photo.caption }}
            </p>
          </div>

          <div class="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>{{ photo.uploader ?? 'Clerk' }} · {{ formatDate(photo.created_at) }}</span>
            <button
              v-if="canUpload"
              type="button"
              class="text-red-500 hover:text-red-700 font-medium p-1 rounded hover:bg-red-50 transition"
              title="Delete Photo"
              @click.stop="confirmDelete(photo)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div
      v-if="openUploadModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="openUploadModal = false"
    >
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-gray-900 text-base flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Picture of the Land
          </h3>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 text-lg"
            @click="openUploadModal = false"
          >
            ✕
          </button>
        </div>

        <form class="p-6 space-y-4" @submit.prevent="submitUpload">
          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
              Photo Title *
            </label>
            <input
              v-model="uploadForm.title"
              type="text"
              required
              placeholder="e.g. Ground Lot View, Frontage Road, Corner Boundary Marker"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
              Category
            </label>
            <select
              v-model="uploadForm.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option>Ground View</option>
              <option>Frontage / Road Access</option>
              <option>Boundary Marker / Monuments</option>
              <option>Improvements &amp; Crops</option>
              <option>Aerial / Vicinity View</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
              Select Image File *
            </label>
            <div
              class="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition bg-gray-50"
              @click="fileInputRef?.click()"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="onFileSelected"
              />
              <div v-if="selectedFile" class="space-y-1">
                <p class="text-sm font-semibold text-emerald-700 truncate">{{ selectedFile.name }}</p>
                <p class="text-xs text-gray-400">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
              </div>
              <div v-else class="text-xs text-gray-500 space-y-1">
                <svg class="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="font-medium text-gray-700">Click to choose image file</p>
                <p class="text-gray-400">JPG, PNG, WEBP up to 12MB</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
              Notes / Caption (Optional)
            </label>
            <textarea
              v-model="uploadForm.caption"
              rows="2"
              placeholder="e.g. Facing north boundary showing 40 mature coconut trees"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <p v-if="uploadError" class="text-xs text-red-600">{{ uploadError }}</p>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
              @click="openUploadModal = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="uploading || !selectedFile || !uploadForm.title.trim()"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition flex items-center gap-1.5"
            >
              <span v-if="uploading">Uploading…</span>
              <span v-else>Save Photo</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Lightbox Fullscreen Modal -->
    <div
      v-if="activePhoto"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      @click.self="activePhoto = null"
    >
      <div class="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
        <!-- Close Button -->
        <button
          type="button"
          class="absolute -top-10 right-0 text-white/80 hover:text-white p-2 text-xl font-bold"
          @click="activePhoto = null"
        >
          ✕
        </button>

        <!-- Image -->
        <div class="w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
          <img
            :src="activePhoto.url"
            :alt="activePhoto.title"
            class="max-w-full max-h-[75vh] object-contain rounded-lg"
          />
        </div>

        <!-- Lightbox Caption & Details -->
        <div class="w-full mt-3 p-4 bg-white/10 text-white rounded-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500 text-white">
                {{ activePhoto.category }}
              </span>
              <h4 class="font-bold text-base">{{ activePhoto.title }}</h4>
            </div>
            <p v-if="activePhoto.caption" class="text-xs text-white/80 mt-1">
              {{ activePhoto.caption }}
            </p>
          </div>
          <div class="text-right text-xs text-white/60">
            <p>{{ activePhoto.file_name }} ({{ (activePhoto.file_size / 1024).toFixed(0) }} KB)</p>
            <p class="mt-0.5">{{ formatDate(activePhoto.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deleteLandPhotoApi,
  fetchLandPhotosApi,
  uploadLandPhotoApi,
  type LandPhoto,
} from '@/services/assessmentsApi'

interface Props {
  applicationId: string
  canUpload?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canUpload: true,
})

const loading = ref(false)
const uploading = ref(false)
const uploadError = ref('')
const photos = ref<LandPhoto[]>([])
const selectedCategory = ref('All')
const openUploadModal = ref(false)
const activePhoto = ref<LandPhoto | null>(null)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const uploadForm = reactive({
  title: '',
  category: 'Ground View',
  caption: '',
})

const categories = [
  'All',
  'Ground View',
  'Frontage / Road Access',
  'Boundary Marker / Monuments',
  'Improvements & Crops',
  'Aerial / Vicinity View',
]

const countCategory = (cat: string) => {
  if (cat === 'All') return photos.value.length
  return photos.value.filter((p) => p.category === cat).length
}

const filteredPhotos = computed(() => {
  if (selectedCategory.value === 'All') return photos.value
  return photos.value.filter((p) => p.category === selectedCategory.value)
})

const loadPhotos = async () => {
  loading.value = true
  try {
    photos.value = await fetchLandPhotosApi(props.applicationId)
  } catch (e) {
    /* ignore or display error */
  } finally {
    loading.value = false
  }
}

onMounted(loadPhotos)

const onFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    if (!uploadForm.title) {
      // derive title from filename
      uploadForm.title = selectedFile.value.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    }
  }
}

const submitUpload = async () => {
  if (!selectedFile.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    const formData = new FormData()
    formData.append('title', uploadForm.title)
    formData.append('category', uploadForm.category)
    if (uploadForm.caption) formData.append('caption', uploadForm.caption)
    formData.append('file', selectedFile.value)

    const saved = await uploadLandPhotoApi(props.applicationId, formData)
    photos.value.unshift(saved)
    openUploadModal.value = false
    selectedFile.value = null
    uploadForm.title = ''
    uploadForm.caption = ''
  } catch (e: any) {
    uploadError.value = e?.response?.data?.message || 'Failed to upload photo. Please try again.'
  } finally {
    uploading.value = false
  }
}

const confirmDelete = async (photo: LandPhoto) => {
  if (!confirm(`Are you sure you want to delete "${photo.title}"?`)) return
  try {
    await deleteLandPhotoApi(props.applicationId, photo.id)
    photos.value = photos.value.filter((p) => p.id !== photo.id)
  } catch (e) {
    alert('Failed to delete photo.')
  }
}

const openLightbox = (photo: LandPhoto) => {
  activePhoto.value = photo
}

const onImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  // fallback placeholder
  target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" fill="%239ca3af" font-family="sans-serif" font-size="14" text-anchor="middle">Image Preview</text></svg>'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
