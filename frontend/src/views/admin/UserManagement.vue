<template>
  <div class="p-4 sm:p-6">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Manage municipal staff accounts, role permissions, and credential resets</p>
        </div>
        <button
          @click="openAddModal"
          class="flex items-center gap-2 px-4 sm:px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition self-start sm:self-auto shadow-xs"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4 border border-gray-100 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Role</label>
            <select
              v-model="filterRole"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              <option value="Assessment Clerk">Assessment Clerk</option>
              <option value="Municipal Assessor">Municipal Assessor</option>
              <option value="Revenue Clerk">Revenue Clerk</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Cashier">Cashier</option>
              <option value="Administrator">Administrator</option>
              <option value="Taxpayer">Taxpayer</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Status</label>
            <select
              v-model="filterStatus"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="locked">Locked</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or username..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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

    <!-- 1. Dedicated Reset Password Modal (Staff only - Taxpayer excluded) -->
    <div
      v-if="showResetStaffModal && resetTargetUser"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-700 animate-fadeIn">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-xs">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Reset Staff Password</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">Update credentials for forgotten login</p>
            </div>
          </div>
          <button
            @click="closeResetModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Target Staff Member Summary -->
        <div class="mb-5 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-gray-900 dark:text-white">{{ resetTargetUser.fullName }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ resetTargetUser.email }}</p>
          </div>
          <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-300">
            {{ resetTargetUser.role }}
          </span>
        </div>

        <!-- Feedback banners -->
        <div v-if="resetSuccessMsg" class="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs">
          {{ resetSuccessMsg }}
        </div>
        <div v-if="resetErrorMsg" class="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-800 dark:text-red-200 text-xs">
          {{ resetErrorMsg }}
        </div>

        <form @submit.prevent="submitResetStaffCredentials" class="space-y-4">
          <!-- Editable Username in case they forgot or need to change it -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Staff Username
            </label>
            <input
              v-model="resetForm.username"
              type="text"
              required
              class="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 font-mono"
            />
            <p class="text-[11px] text-gray-400 mt-1">Change username if staff member forgot or requested an updated ID.</p>
          </div>

          <!-- New Password -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <button
                type="button"
                @click="generateTempPassword"
                class="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                + Generate Temp Password
              </button>
            </div>
            <div class="relative">
              <input
                v-model="resetForm.password"
                :type="showResetPassword ? 'text' : 'password'"
                required
                placeholder="Min. 6 characters"
                class="w-full px-3.5 py-2 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                @click="showResetPassword = !showResetPassword"
                class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <svg v-if="!showResetPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              v-model="resetForm.confirmPassword"
              :type="showResetPassword ? 'text' : 'password'"
              required
              placeholder="Re-enter new password"
              class="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div class="pt-3 flex gap-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              @click="closeResetModal"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="resetSaving"
              class="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition text-sm flex items-center justify-center gap-2"
            >
              <svg v-if="resetSaving" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{{ resetSaving ? 'Saving...' : 'Save Credentials' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 2. Taxpayer Exclusion Alert Modal -->
    <div
      v-if="showTaxpayerAlertModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-700 animate-fadeIn">
        <div class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 mx-auto mb-4 flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
          Taxpayer Credentials Protected
        </h3>
        <p class="text-xs text-center text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
          Administrative staff cannot reset or alter passwords for <strong>Taxpayer</strong> accounts. Taxpayers manage their passwords and profile security directly in the self-service Taxpayer Portal.
        </p>
        <button
          @click="showTaxpayerAlertModal = false"
          class="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition"
        >
          Understood
        </button>
      </div>
    </div>

    <!-- 3. Add / Edit User Modal -->
    <div
      v-if="showAddUserModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-5">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ editingUser ? 'Edit System User' : 'Add New System User' }}
          </h3>
          <button
            @click="showAddUserModal = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Taxpayer Exclusion Notice in Edit Modal -->
        <div
          v-if="editingUser && editingUser.role === 'Taxpayer'"
          class="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5"
        >
          <svg class="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>Taxpayer credentials cannot be modified by staff administrators. Taxpayers manage their account directly in the Taxpayer Portal.</span>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              v-model="formData.fullName"
              type="text"
              placeholder="e.g. Juan Dela Cruz"
              class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Username <span v-if="editingUser && editingUser.role !== 'Taxpayer'" class="text-primary-600 text-[11px] font-normal">(Editable if staff forgot username)</span>
            </label>
            <input
              v-model="formData.username"
              type="text"
              :disabled="editingUser?.role === 'Taxpayer'"
              placeholder="username"
              class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono disabled:opacity-50"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                v-model="formData.role"
                class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">Select Role</option>
                <option value="Assessment Clerk">Assessment Clerk</option>
                <option value="Municipal Assessor">Municipal Assessor</option>
                <option value="Revenue Clerk">Revenue Clerk</option>
                <option value="Treasurer">Treasurer</option>
                <option value="Cashier">Cashier</option>
                <option value="Administrator">Administrator</option>
                <option value="Taxpayer">Taxpayer</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                v-model="formData.status"
                class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="email@magarao.gov"
              class="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          <!-- Password fields: Only shown when adding a NEW user (removed from edit mode) -->
          <div v-if="!editingUser" class="pt-2">
            <div class="flex items-center gap-2 mb-3">
              <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Initial Password
              </span>
              <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>

            <!-- Password -->
            <div class="relative">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password (min. 6 characters)"
                class="w-full px-3.5 py-2 pr-10 border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                :class="passwordError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'"
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

            <!-- Confirm Password -->
            <div v-if="formData.password" class="relative mt-3">
              <input
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm password"
                class="w-full px-3.5 py-2 pr-10 border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                :class="confirmError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'"
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

          <!-- Helper notice when editing an existing staff member -->
          <div
            v-else-if="editingUser && editingUser.role !== 'Taxpayer'"
            class="pt-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2"
          >
            <svg class="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>To reset or change this staff member's password, use the <strong>"Reset Password"</strong> action button in the table.</span>
          </div>

          <!-- Validation error -->
          <p v-if="passwordError" class="text-xs text-red-500">{{ passwordError }}</p>

          <div class="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              @click="showAddUserModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
            >
              Cancel
            </button>
            <button
              @click="saveUser"
              class="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition text-sm shadow-xs"
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
import { ref, computed, watch, onMounted, reactive } from 'vue'
import DataTable, { type Column, type Action } from '@/components/tables/DataTable.vue'
import { useUsersStore, type SystemUser } from '@/stores/users'
import { resetStaffPasswordApi } from '@/services/usersApi'
import { parseApiError } from '@/services/apiError'

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
  { label: 'Reset Password', color: 'primary' },
  { label: 'Activate', color: 'primary' },
  { label: 'Deactivate', color: 'warning' },
  { label: 'Lock', color: 'danger' },
]

const filterRole = ref('')
const filterStatus = ref('')
const searchQuery = ref('')

// Add/Edit Modal states
const showAddUserModal = ref(false)
const editingUser = ref<SystemUser | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordError = ref('')
const confirmError = ref('')

// Dedicated Reset Password Modal states (Staff only)
const showResetStaffModal = ref(false)
const resetTargetUser = ref<SystemUser | null>(null)
const showTaxpayerAlertModal = ref(false)
const showResetPassword = ref(false)
const resetSaving = ref(false)
const resetErrorMsg = ref('')
const resetSuccessMsg = ref('')

const resetForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

const formData = ref({
  fullName: '',
  username: '',
  role: '',
  email: '',
  status: '',
  password: '',
  confirmPassword: '',
})

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

const openAddModal = () => {
  editingUser.value = null
  formData.value = {
    fullName: '',
    username: '',
    role: '',
    email: '',
    status: 'active',
    password: '',
    confirmPassword: '',
  }
  passwordError.value = ''
  confirmError.value = ''
  showAddUserModal.value = true
}

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
      password: '',
      confirmPassword: '',
    }
    passwordError.value = ''
    confirmError.value = ''
    showAddUserModal.value = true
    return
  }

  // Staff Password Reset action
  if (action.label === 'Reset Password') {
    // Taxpayer accounts are excluded
    if (user.role === 'Taxpayer') {
      showTaxpayerAlertModal.value = true
      return
    }

    resetTargetUser.value = user
    resetForm.username = user.username
    resetForm.password = ''
    resetForm.confirmPassword = ''
    resetErrorMsg.value = ''
    resetSuccessMsg.value = ''
    showResetPassword.value = false
    showResetStaffModal.value = true
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

const closeResetModal = () => {
  showResetStaffModal.value = false
  resetTargetUser.value = null
}

const generateTempPassword = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const temp = `Staff@${randomNum}`
  resetForm.password = temp
  resetForm.confirmPassword = temp
  showResetPassword.value = true
}

const submitResetStaffCredentials = async () => {
  resetErrorMsg.value = ''
  resetSuccessMsg.value = ''

  if (!resetTargetUser.value) return

  if (resetForm.password.length < 6) {
    resetErrorMsg.value = 'Password must be at least 6 characters.'
    return
  }

  if (resetForm.password !== resetForm.confirmPassword) {
    resetErrorMsg.value = 'Passwords do not match.'
    return
  }

  resetSaving.value = true
  try {
    const res = await resetStaffPasswordApi(resetTargetUser.value.id, {
      username: resetForm.username,
      password: resetForm.password,
    })

    resetSuccessMsg.value = res.message || 'Staff credentials updated successfully!'
    await usersStore.fetchAll()

    setTimeout(() => {
      closeResetModal()
    }, 1500)
  } catch (err) {
    resetErrorMsg.value = parseApiError(err).message
  } finally {
    resetSaving.value = false
  }
}

const saveUser = async () => {
  passwordError.value = ''
  confirmError.value = ''

  // Validate for new users
  if (!editingUser.value) {
    if (!formData.value.password) {
      passwordError.value = 'Password is required.'
      return
    }
    if (formData.value.password.length < 6) {
      passwordError.value = 'Password must be at least 6 characters.'
      return
    }
    if (formData.value.password !== formData.value.confirmPassword) {
      confirmError.value = 'Passwords do not match.'
      return
    }
  }

  try {
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
      const payload: SystemUser = {
        ...editingUser.value,
        fullName: formData.value.fullName,
        username: formData.value.username,
        role: formData.value.role as SystemUser['role'],
        email: formData.value.email,
        status: formData.value.status as SystemUser['status'],
      }
      await usersStore.saveUser(payload)
    }

    showAddUserModal.value = false
    editingUser.value = null
    showPassword.value = false
    showConfirmPassword.value = false
    formData.value = { fullName: '', username: '', role: '', email: '', status: '', password: '', confirmPassword: '' }
  } catch (err) {
    passwordError.value = parseApiError(err).message
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
