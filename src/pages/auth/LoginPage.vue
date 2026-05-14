<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100 flex items-center justify-center p-4">
    <!-- Decorative elements -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl" />

    <!-- Login Card -->
    <div class="relative w-full max-w-md">
      <!-- Logo Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-slate-900 mb-2">RPRAMS</h1>
        <p class="text-slate-600">Real Property Registration & Assessment Management</p>
      </div>

      <!-- Login Form Card -->
      <div class="card bg-white border border-slate-100 shadow-soft-lg">
        <form @submit.prevent="handleLogin">
          <!-- Username Field -->
          <div class="mb-6">
            <label class="label">Username</label>
            <input
              v-model="credentials.username"
              type="text"
              placeholder="Enter your username"
              class="input-field"
              required
            />
          </div>

          <!-- Password Field -->
          <div class="mb-6">
            <label class="label">Password</label>
            <input
              v-model="credentials.password"
              type="password"
              placeholder="Enter your password"
              class="input-field"
              required
            />
          </div>

          <!-- Remember Me -->
          <div class="mb-8 flex items-center gap-2">
            <input
              v-model="credentials.rememberMe"
              type="checkbox"
              id="remember"
              class="rounded border-slate-300"
            />
            <label for="remember" class="text-sm text-slate-600">Remember me</label>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {{ errorMessage }}
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full mb-4"
          >
            <span v-if="isLoading" class="inline-block animate-spin mr-2">⌛</span>
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>

          <!-- Demo Credentials Info -->
          <div class="rounded-lg bg-emerald-50 p-4 border border-emerald-200">
            <p class="text-xs font-semibold text-emerald-900 mb-2">Demo Credentials:</p>
            <div class="space-y-1 text-xs text-emerald-800">
              <p><strong>Clerk:</strong> clerk / password</p>
              <p><strong>Assessor:</strong> assessor / password</p>
              <p><strong>Admin:</strong> admin / password</p>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Info -->
      <div class="mt-8 text-center text-sm text-slate-600">
        <p>For security issues, contact the LGU Administration</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, type User } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const credentials = ref({
  username: '',
  password: '',
  rememberMe: false,
})

const isLoading = ref(false)
const errorMessage = ref('')

const demoUsers: Record<string, User> = {
  'clerk': {
    id: '1',
    username: 'clerk',
    fullName: 'Anna Clerk',
    email: 'clerk@lgugov.ph',
    role: 'assessment_clerk',
    accountStatus: 'active',
  },
  'assessor': {
    id: '2',
    username: 'assessor',
    fullName: 'Maria Assessor',
    email: 'assessor@lgugov.ph',
    role: 'assessor',
    accountStatus: 'active',
  },
  'admin': {
    id: '3',
    username: 'admin',
    fullName: 'Admin User',
    email: 'admin@lgugov.ph',
    role: 'administrator',
    accountStatus: 'active',
  },
}

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Validate credentials
    const user = demoUsers[credentials.value.username]
    if (!user || credentials.value.password !== 'password') {
      errorMessage.value = 'Invalid username or password'
      isLoading.value = false
      return
    }

    // Check account status
    if (user.accountStatus === 'locked') {
      errorMessage.value = 'Your account is locked. Please contact the administrator.'
      isLoading.value = false
      return
    }

    if (user.accountStatus === 'inactive') {
      errorMessage.value = 'Your account is inactive. Please contact the administrator.'
      isLoading.value = false
      return
    }

    // Simulate JWT token
    const mockToken = `jwt_token_${user.id}_${Date.now()}`
    authStore.login(mockToken, user)

    // Redirect based on role
    const redirect = route.query.redirect as string
    if (redirect) {
      router.push(redirect)
    } else {
      if (user.role === 'assessment_clerk') {
        router.push('/clerk/dashboard')
      } else if (user.role === 'assessor') {
        router.push('/assessor/dashboard')
      } else if (user.role === 'administrator') {
        router.push('/admin/dashboard')
      }
    }
  } finally {
    isLoading.value = false
  }
}
</script>
