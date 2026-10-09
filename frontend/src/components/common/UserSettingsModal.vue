<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
    @keydown.esc="$emit('close')"
  >
    <!-- Modal Card -->
    <div
      class="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all animate-fadeIn"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/80">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center shadow-xs">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Account Settings</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">Manage your login credentials & interface theme</p>
          </div>
        </div>

        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
          title="Close modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="px-6 pt-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/40 flex gap-6">
        <button
          @click="activeTab = 'credentials'"
          :class="[
            'pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2',
            activeTab === 'credentials'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Login Credentials
        </button>

        <button
          @click="activeTab = 'appearance'"
          :class="[
            'pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2',
            activeTab === 'appearance'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          Theme & Appearance
        </button>
      </div>

      <!-- Content Area -->
      <div class="p-6">
        <!-- Notification Banners -->
        <div v-if="successMsg" class="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-3 animate-fadeIn">
          <svg class="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>{{ successMsg }}</span>
        </div>

        <div v-if="errorMsg" class="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm flex items-center gap-3 animate-fadeIn">
          <svg class="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>{{ errorMsg }}</span>
        </div>

        <!-- TAB 1: CREDENTIALS -->
        <div v-if="activeTab === 'credentials'">
          <!-- Current User Info Header Card -->
          <div class="mb-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                {{ userInitials }}
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ authStore.currentUser?.fullName }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ authStore.currentUser?.email }}</p>
              </div>
            </div>
            <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-300">
              {{ authStore.currentUser?.role }}
            </span>
          </div>

          <form @submit.prevent="handleSaveCredentials" class="space-y-4">
            <!-- Username Input -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Username
              </label>
              <div class="relative">
                <input
                  v-model="form.username"
                  type="text"
                  required
                  placeholder="Enter your username"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition"
                />
                <span class="absolute right-3 top-3 text-xs text-gray-400">Login ID</span>
              </div>
              <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">You will use this username to sign in across the system.</p>
            </div>

            <!-- Divider with label -->
            <div class="pt-2 pb-1 border-t border-gray-100 dark:border-gray-700">
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Change Password (Leave blank to keep unchanged)
              </span>
            </div>

            <!-- Current Password -->
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password <span v-if="form.new_password" class="text-red-500">* Required</span>
              </label>
              <div class="relative">
                <input
                  v-model="form.current_password"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition pr-10"
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg v-if="!showCurrentPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- New Password & Confirm Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div class="relative">
                  <input
                    v-model="form.new_password"
                    :type="showNewPassword ? 'text' : 'password'"
                    placeholder="Min 6 characters"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition pr-10"
                  />
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg v-if="!showNewPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div class="relative">
                  <input
                    v-model="form.confirm_password"
                    :type="showNewPassword ? 'text' : 'password'"
                    placeholder="Repeat new password"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition"
                  />
                </div>
              </div>
            </div>

            <div class="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                @click="$emit('close')"
                class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold shadow-xs flex items-center gap-2 transition"
              >
                <svg v-if="saving" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{{ saving ? 'Saving Changes...' : 'Save Credentials' }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- TAB 2: THEME & APPEARANCE -->
        <div v-else-if="activeTab === 'appearance'" class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Choose your preferred interface theme. Changes apply across all pages instantly and persist for your account.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <!-- Light Mode Option -->
            <button
              type="button"
              @click="setTheme('light')"
              :class="[
                'p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between h-36 relative group',
                theme === 'light'
                  ? 'border-primary-600 bg-primary-50/40 dark:bg-primary-900/20 shadow-md ring-2 ring-primary-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              ]"
            >
              <div class="flex items-center justify-between w-full">
                <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span
                  v-if="theme === 'light'"
                  class="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-600 text-white"
                >
                  Active
                </span>
              </div>
              <div>
                <h4 class="font-bold text-sm text-gray-900 dark:text-white">Light Theme</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Crisp daytime municipal theme</p>
              </div>
            </button>

            <!-- Dark Mode Option -->
            <button
              type="button"
              @click="setTheme('dark')"
              :class="[
                'p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between h-36 relative group',
                theme === 'dark'
                  ? 'border-primary-500 bg-gray-900 text-white shadow-md ring-2 ring-primary-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              ]"
            >
              <div class="flex items-center justify-between w-full">
                <div class="w-10 h-10 rounded-xl bg-indigo-900/50 text-indigo-300 flex items-center justify-center shadow-xs">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <span
                  v-if="theme === 'dark'"
                  class="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-500 text-white"
                >
                  Active
                </span>
              </div>
              <div>
                <h4 class="font-bold text-sm text-gray-900 dark:text-white">Dark Theme</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Reduced eye strain in low-light environments</p>
              </div>
            </button>
          </div>

          <div class="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <svg class="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Your theme preference is saved automatically and remembered each time you log in.</span>
          </div>

          <div class="pt-3 flex justify-end border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              @click="$emit('close')"
              class="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { updateProfileApi } from '@/services/authApi'
import { useTheme } from '@/composables/useTheme'
import { parseApiError } from '@/services/apiError'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()
const { theme, setTheme } = useTheme()

const activeTab = ref<'credentials' | 'appearance'>('credentials')
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

const form = reactive({
  username: '',
  current_password: '',
  new_password: '',
  confirm_password: '',
})

const userInitials = computed(() => {
  const name = authStore.currentUser?.fullName || ''
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
})

// Sync form whenever modal opens
watch(
  () => props.visible,
  (isOpen) => {
    if (isOpen) {
      form.username = authStore.currentUser?.username || ''
      form.current_password = ''
      form.new_password = ''
      form.confirm_password = ''
      successMsg.value = ''
      errorMsg.value = ''
    }
  },
  { immediate: true }
)

const handleSaveCredentials = async () => {
  successMsg.value = ''
  errorMsg.value = ''

  // Validate password confirmation
  if (form.new_password) {
    if (form.new_password.length < 6) {
      errorMsg.value = 'New password must be at least 6 characters long.'
      return
    }
    if (form.new_password !== form.confirm_password) {
      errorMsg.value = 'New password and confirmation do not match.'
      return
    }
    if (!form.current_password) {
      errorMsg.value = 'Please provide your current password to authorize changes.'
      return
    }
  }

  saving.value = true
  try {
    const payload: {
      username?: string
      current_password?: string
      new_password?: string
    } = {}

    if (form.username && form.username !== authStore.currentUser?.username) {
      payload.username = form.username
    }

    if (form.new_password) {
      payload.current_password = form.current_password
      payload.new_password = form.new_password
    }

    if (Object.keys(payload).length === 0) {
      successMsg.value = 'No changes made.'
      saving.value = false
      return
    }

    const res = await updateProfileApi(payload)
    if (res.user) {
      authStore.updateUser(res.user)
    }

    successMsg.value = res.message || 'Credentials updated successfully in the database!'
    form.current_password = ''
    form.new_password = ''
    form.confirm_password = ''
  } catch (err) {
    errorMsg.value = parseApiError(err).message
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.15s ease-out;
}
</style>
