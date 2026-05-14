<template>
  <div class="card">
    <DataTable :data="users" :columns="columns" :page-size="8">
      <template #cell-role="{ row }">
        <Badge variant="info">{{ roleLabel(row.role) }}</Badge>
      </template>
      <template #cell-accountStatus="{ row }">
        <Badge :variant="statusVariant(row.accountStatus)">{{ row.accountStatus }}</Badge>
      </template>
      <template #row-actions="{ row }">
        <div class="flex flex-wrap justify-end gap-2">
          <button type="button" class="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300" @click="openEdit(row)">
            Edit
          </button>
          <button
            v-if="row.accountStatus !== 'active'"
            type="button"
            class="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            @click="activate(row)"
          >
            Activate
          </button>
          <button
            v-if="row.accountStatus !== 'locked'"
            type="button"
            class="text-sm font-medium text-amber-700 hover:text-amber-800"
            @click="openLockConfirm(row)"
          >
            Lock
          </button>
          <button type="button" class="text-sm font-medium text-blue-600 hover:text-blue-700" @click="openResetConfirm(row)">
            Reset password
          </button>
        </div>
      </template>
    </DataTable>
  </div>

  <Modal v-model:open="editOpen" title="Edit user" confirm-label="Save changes" @confirm="saveEdit">
    <div v-if="editTarget" class="space-y-4">
      <p class="text-xs text-slate-500 dark:text-slate-400">Username: <strong>{{ editTarget.username }}</strong> (immutable)</p>
      <div>
        <label class="label">Full name</label>
        <input v-model="editForm.fullName" type="text" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
      </div>
      <div>
        <label class="label">Role</label>
        <select v-model="editForm.role" class="select-field dark:border-slate-600 dark:bg-slate-800 dark:text-white">
          <option value="assessment_clerk">Assessment Clerk</option>
          <option value="assessor">Municipal Assessor</option>
          <option value="administrator">Administrator</option>
        </select>
      </div>
    </div>
  </Modal>

  <Modal v-model:open="lockOpen" title="Lock account?" confirm-label="Lock user" @confirm="confirmLock">
    <p v-if="pendingUser" class="text-sm text-slate-600 dark:text-slate-400">
      User <strong>{{ pendingUser.username }}</strong> will be unable to sign in until an administrator activates the account again.
    </p>
  </Modal>

  <Modal v-model:open="resetOpen" title="Reset password?" confirm-label="Queue reset" @confirm="confirmReset">
    <p v-if="pendingUser" class="text-sm text-slate-600 dark:text-slate-400">
      A password reset workflow will be queued for <strong>{{ pendingUser.username }}</strong> (integrates with your mailer / IdP in production).
    </p>
  </Modal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'
import Modal from '@/components/Modal.vue'
import { useDirectoryUserStore, type DirectoryUser, type DirectoryRole } from '@/stores/directoryUsers'
import { useAuditLogStore } from '@/stores/auditLog'
import { useToastStore } from '@/stores/toast'
import { storeToRefs } from 'pinia'

const directory = useDirectoryUserStore()
const audit = useAuditLogStore()
const toast = useToastStore()
const { users } = storeToRefs(directory)

const columns = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'username', label: 'Username' },
  { key: 'role', label: 'Role' },
  { key: 'accountStatus', label: 'Account Status' },
  { key: 'lastLogin', label: 'Last Login' },
]

const roleLabel = (r: DirectoryRole) => {
  const m: Record<DirectoryRole, string> = {
    assessment_clerk: 'Assessment Clerk',
    assessor: 'Municipal Assessor',
    administrator: 'Administrator',
  }
  return m[r]
}

const statusVariant = (s: string) => {
  if (s === 'active') return 'success' as const
  if (s === 'locked') return 'danger' as const
  return 'warning' as const
}

const log = (row: DirectoryUser, type: string, prev: string, next: string) => {
  audit.addEntry({
    user: 'admin',
    transactionType: type,
    date: new Date().toISOString(),
    previousValue: prev,
    newValue: next,
    actionStatus: 'success',
  })
}

const editOpen = ref(false)
const editTarget = ref<DirectoryUser | null>(null)
const editForm = reactive({
  fullName: '',
  role: 'assessment_clerk' as DirectoryRole,
})

const openEdit = (row: DirectoryUser) => {
  editTarget.value = row
  editForm.fullName = row.fullName
  editForm.role = row.role
  editOpen.value = true
}

const saveEdit = () => {
  const row = editTarget.value
  if (!row) return
  const prevRole = row.role
  const prevName = row.fullName
  directory.updateUser(row.id, { fullName: editForm.fullName.trim(), role: editForm.role })
  log(row, 'USER_UPDATE', `${prevName}|${prevRole}`, `${editForm.fullName.trim()}|${editForm.role}`)
  toast.push('User profile updated.', 'success')
  editOpen.value = false
}

const activate = (row: DirectoryUser) => {
  const prev = row.accountStatus
  directory.updateUser(row.id, { accountStatus: 'active' })
  log(row, 'USER_ACTIVATE', prev, 'active')
  toast.push('User activated.', 'success')
}

const lockOpen = ref(false)
const resetOpen = ref(false)
const pendingUser = ref<DirectoryUser | null>(null)

const openLockConfirm = (row: DirectoryUser) => {
  pendingUser.value = row
  lockOpen.value = true
}

const confirmLock = () => {
  const row = pendingUser.value
  if (!row) return
  const prev = row.accountStatus
  directory.updateUser(row.id, { accountStatus: 'locked' })
  log(row, 'USER_LOCK', prev, 'locked')
  toast.push('User locked.', 'warning')
  lockOpen.value = false
}

const openResetConfirm = (row: DirectoryUser) => {
  pendingUser.value = row
  resetOpen.value = true
}

const confirmReset = () => {
  const row = pendingUser.value
  if (!row) return
  log(row, 'USER_RESET_PASSWORD', '-', 'queued')
  toast.push(`Password reset queued for ${row.username}.`, 'info')
  resetOpen.value = false
}
</script>
