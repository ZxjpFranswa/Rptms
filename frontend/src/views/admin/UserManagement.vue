<template>
  <div class="p-4 sm:p-6">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h2>
          <p class="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        <button
          @click="showAddUserModal = true"
          class="flex items-center gap-2 px-4 sm:px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition self-start sm:self-auto"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              v-model="filterRole"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              <option value="Assessment Clerk">Assessment Clerk</option>
              <option value="Municipal Assessor">Municipal Assessor</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              v-model="filterStatus"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="locked">Locked</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or username..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <DataTable
        title="System Users"
        :columns="userColumns"
        :data="filteredUsers"
        :actions="userActions"
        @action="handleUserAction"
      />
    </div>

    <!-- Add/Edit User Modal -->
    <div
      v-if="showAddUserModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
    >
      <div class="bg-white rounded-t-2xl sm:rounded-xl shadow-lg p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">
          {{ editingUser ? 'Edit User' : 'Add New User' }}
        </h3>

        <div class="space-y-4">
          <input
            v-model="formData.fullName"
            type="text"
            placeholder="Full Name"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            v-model="formData.username"
            type="text"
            placeholder="Username"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            v-model="formData.role"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Role</option>
            <option value="Assessment Clerk">Assessment Clerk</option>
            <option value="Municipal Assessor">Municipal Assessor</option>
            <option value="Administrator">Administrator</option>
          </select>
          <input
            v-model="formData.email"
            type="email"
            placeholder="Email Address"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            v-model="formData.status"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
          </select>

          <!-- Password fields (only for new users) -->
          <template v-if="!editingUser">
            <div class="pt-2">
              <div class="flex items-center gap-2 mb-3">
                <div class="h-px flex-1 bg-gray-200" />
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</span>
                <div class="h-px flex-1 bg-gray-200" />
              </div>

              <!-- Password -->
              <div class="relative">
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Password (min. 8 characters)"
                  class="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  :class="passwordError ? 'border-red-400' : 'border-gray-300'"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803M15 12a3 3 0 11-6 0" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                  </svg>
                </button>
              </div>

              <!-- Password strength indicators -->
              <div v-if="formData.password" class="mt-2 space-y-1.5">
                <div class="flex gap-1">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="h-1 flex-1 rounded-full transition-colors"
                    :class="i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-200'"
                  />
                </div>
                <p class="text-xs" :class="strengthTextColors[passwordStrength]">
                  {{ strengthLabels[passwordStrength] }}
                </p>
              </div>

              <!-- Confirm Password -->
              <div class="relative mt-3">
                <input
                  v-model="formData.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm Password"
                  class="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  :class="confirmError ? 'border-red-400' : 'border-gray-300'"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showConfirmPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803M15 12a3 3 0 11-6 0" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                  </svg>
                </button>
              </div>
              <p v-if="confirmError" class="text-xs text-red-500 mt-1">{{ confirmError }}</p>
            </div>
          </template>

          <!-- Validation error -->
          <p v-if="passwordError" class="text-xs text-red-500">{{ passwordError }}</p>

          <div class="flex gap-3 pt-4">
            <button
              @click="showAddUserModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              @click="saveUser"
              class="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition"
            >
              Save User
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import DataTable, { type Column, type Action } from '@/components/tables/DataTable.vue'
import { useUsersStore, type SystemUser } from '@/stores/users'

const usersStore = useUsersStore()

onMounted(() => {
  void usersStore.fetchAll()
})

const userColumns: Column[] = [
  { key: 'fullName', label: 'Full Name', sortable: true },
  { key: 'username', label: 'Username', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', type: 'status', sortable: true },
  { key: 'lastLogin', label: 'Last Login', type: 'date', sortable: true },
]

const userActions: Action[] = [
  { label: 'Edit', color: 'primary' },
  { label: 'Activate', color: 'primary' },
  { label: 'Deactivate', color: 'warning' },
  { label: 'Lock', color: 'danger' },
]


const filterRole = ref('')
const filterStatus = ref('')
const searchQuery = ref('')
const showAddUserModal = ref(false)
const editingUser = ref<SystemUser | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordError = ref('')
const confirmError = ref('')

const formData = ref({
  fullName: '',
  username: '',
  role: '',
  email: '',
  status: '',
  password: '',
  confirmPassword: '',
})

// Password strength calculation
const passwordStrength = computed(() => {
  const pw = formData.value.password
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
})

const strengthLabels: Record<number, string> = {
  0: '',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
}

const strengthColors: Record<number, string> = {
  1: 'bg-red-400',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-green-500',
}

const strengthTextColors: Record<number, string> = {
  0: 'text-gray-400',
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-600',
  4: 'text-green-600',
}

// Clear errors as user types
watch(() => formData.value.password, () => { passwordError.value = '' })
watch(() => formData.value.confirmPassword, () => { confirmError.value = '' })

const filteredUsers = computed(() => {
  return usersStore.users.filter((user: SystemUser) => {
    const matchesRole = !filterRole.value || user.role === filterRole.value
    const matchesStatus = !filterStatus.value || user.status === filterStatus.value
    const matchesSearch =
      !searchQuery.value ||
      user.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchesRole && matchesStatus && matchesSearch
  })
})

const handleUserAction = (action: Action, row: Record<string, unknown>) => {
  const user = row as unknown as SystemUser
  if (action.label === 'Edit') {
    editingUser.value = user
    formData.value = {
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      email: user.email,
      status: user.status,
    }
    showAddUserModal.value = true
    return
  }

  const statusMap: Record<string, SystemUser['status']> = {
    Activate: 'active',
    Deactivate: 'inactive',
    Lock: 'locked',
  }
  const newStatus = statusMap[action.label]
  if (newStatus) {
    void usersStore.updateUserStatus(user.id, newStatus)
  }
}

const saveUser = async () => {
  // Validate password for new users
  if (!editingUser.value) {
    if (!formData.value.password) {
      passwordError.value = 'Password is required.'
      return
    }
    if (formData.value.password.length < 8) {
      passwordError.value = 'Password must be at least 8 characters.'
      return
    }
    if (formData.value.password !== formData.value.confirmPassword) {
      confirmError.value = 'Passwords do not match.'
      return
    }
  }

  if (!editingUser.value) {
    const newUser: SystemUser = {
      id: '',
      fullName: formData.value.fullName,
      username: formData.value.username,
      role: formData.value.role as SystemUser['role'],
      email: formData.value.email,
      status: formData.value.status as SystemUser['status'],
      lastLogin: new Date().toISOString(),
    }
    await usersStore.saveUser({ ...newUser, password: formData.value.password })
  } else {
    await usersStore.saveUser({
      ...editingUser.value,
      ...formData.value,
      role: formData.value.role as SystemUser['role'],
      status: formData.value.status as SystemUser['status'],
    })
  }
  showAddUserModal.value = false
  editingUser.value = null
  showPassword.value = false
  showConfirmPassword.value = false
  passwordError.value = ''
  confirmError.value = ''
  formData.value = { fullName: '', username: '', role: '', email: '', status: '', password: '', confirmPassword: '' }
}
</script>
