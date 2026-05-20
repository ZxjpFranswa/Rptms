<template>
  <div class="min-h-screen flex bg-gradient-to-br from-primary-50 to-primary-100">
    <!-- Left side - Branding -->
    <div class="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-primary-800 text-white">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <AppLogo size="lg" />
          <h1 class="text-2xl font-bold">Magarao</h1>
        </div>
        <p class="text-primary-200">Municipal Government</p>
      </div>
      <div>
        <h2 class="text-4xl font-bold mb-4">Real Property Tax Management System</h2>
        <p class="text-primary-100 text-lg">
          Streamlined property assessment and tax management for the Municipal Assessor's Office
        </p>
      </div>
      <div class="text-sm text-primary-200">© 2024 Magarao Municipal Government. All rights reserved.</div>
    </div>

    <!-- Right side - Login Form -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12">
      <div class="w-full max-w-md mx-auto">
        <!-- Mobile Header -->
        <div class="mb-8 lg:mb-12">
          <div class="flex lg:hidden items-center gap-2 mb-6">
            <AppLogo />
            <h1 class="text-xl font-bold text-gray-900">Magarao RPTMS</h1>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p class="text-gray-600">Sign in to your account to continue</p>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
        >
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-semibold text-gray-900 mb-2">
              Username
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition"
              placeholder="Enter your username"
              :disabled="isLoading"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition"
                placeholder="Enter your password"
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                :disabled="isLoading"
              >
                <svg
                  v-if="showPassword"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-primary-700 hover:bg-primary-800 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition mt-8"
          >
            <span v-if="!isLoading">Sign In</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4" />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing in...
            </span>
          </button>
        </form>


      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLogo from '@/components/common/AppLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const result = await authStore.login(username.value, password.value)
    if (result.success) {
      router.push('/')
    } else {
      errorMessage.value = result.error || 'Login failed. Please try again.'
    }
  } catch {
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
