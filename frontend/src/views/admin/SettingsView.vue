<template>
  <div class="p-6">
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">System Settings</h2>
        <p class="text-gray-600 mt-1">Configure municipal assessor office preferences</p>
      </div>

      <form class="space-y-6" @submit.prevent="saveSettings">
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Municipality Name</label>
          <input
            v-model="settings.municipalityName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Office Name</label>
          <input
            v-model="settings.officeName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Fiscal Year</label>
            <input
              v-model="settings.fiscalYear"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Session Timeout (minutes)</label>
            <input
              v-model.number="settings.sessionTimeout"
              type="number"
              min="5"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>
        <label class="flex items-center gap-3">
          <input
            v-model="settings.emailNotifications"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-sm font-medium text-gray-700">Enable email notifications for status changes</span>
        </label>

        <button
          type="submit"
          class="px-6 py-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-lg transition"
        >
          Save Settings
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchSettings, updateSettings } from '@/services/settingsApi'
import { parseApiError } from '@/services/apiError'

const settings = ref({
  municipalityName: 'Municipality of Magarao',
  officeName: "Municipal Assessor's Office",
  fiscalYear: 2024,
  sessionTimeout: 30,
  emailNotifications: true,
})

onMounted(async () => {
  try {
    settings.value = { ...settings.value, ...(await fetchSettings()) }
  } catch {
    const stored = localStorage.getItem('rptms_settings')
    if (stored) {
      try {
        settings.value = { ...settings.value, ...JSON.parse(stored) }
      } catch {
        /* ignore */
      }
    }
  }
})

const saveSettings = async () => {
  try {
    settings.value = await updateSettings(settings.value)
    alert('Settings saved successfully.')
  } catch (e) {
    alert(parseApiError(e).message)
  }
}
</script>
