<template>
  <main>
    <div class="users-page">
      <header class="users-header">
        <div>
          <h1>Users</h1>
          <p class="subtitle">All registered users across Direct Mail Sphere.</p>
          <div class="filter-row">
            <button
              v-for="filter in userFilters"
              :key="filter.value"
              type="button"
              :class="['filter-chip', { active: activeUserFilter === filter.value }]"
              @click="activeUserFilter = filter.value"
            >
              {{ filter.label }}
              <span class="chip-count">{{ countForUserFilter(filter.value) }}</span>
            </button>
          </div>
        </div>
      </header>

      <div class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Username</th>
              <th>Email</th>
              <th>User Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="empty-cell">Loading users...</td>
            </tr>
            <tr v-else-if="error">
              <td colspan="4" class="empty-cell">{{ error }}</td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="4" class="empty-cell">No users found.</td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.user || '—' }}</td>
              <td>{{ user.username || '—' }}</td>
              <td>{{ user.email || '—' }}</td>
              <td>
                <span :class="['role-pill', user.userType === 'admin' ? 'admin' : 'standard']">
                  {{ user.userType }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUserId, isCurrentUserAdmin } from '../services/profileDefaults'

const API_BASE = 'http://localhost:3001'
const users = ref([])
const loading = ref(false)
const error = ref('')
const router = useRouter()
const activeUserFilter = ref('all')
const userFilters = [
  { label: 'All', value: 'all' },
  { label: 'Standard', value: 'standard' },
  { label: 'Admin', value: 'admin' }
]

const filteredUsers = computed(() => {
  if (activeUserFilter.value === 'all') {
    return users.value
  }

  return users.value.filter((entry) => {
    return entry.userType === activeUserFilter.value
  })
})

const countForUserFilter = (filterValue) => {
  if (filterValue === 'all') return users.value.length
  return users.value.filter((entry) => entry.userType === filterValue).length
}

const getAuthHeaders = () => {
  const userId = getCurrentUserId()
  const headers = { 'Content-Type': 'application/json' }
  if (userId) {
    headers['x-user-id'] = userId
  }
  return headers
}

const loadUsers = async () => {
  if (!isCurrentUserAdmin()) {
    await router.replace('/dashboard')
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`${API_BASE}/api/users`, {
      headers: getAuthHeaders()
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || !data?.success) {
      error.value = data?.message || 'Unable to load users.'
      users.value = []
      return
    }

    users.value = Array.isArray(data?.users) ? data.users : []
  } catch (err) {
    error.value = err?.message || 'Unable to load users.'
    users.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
  padding: clamp(2rem, 5vw, 3.5rem);
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  color: #0f1f3d !important;
}

.users-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
  background: #ffffff;
  border: 1px solid #e0e7ff;
  border-radius: 18px;
  padding: clamp(1.5rem, 4vw, 2.2rem);
  box-shadow: 0 12px 30px rgba(61, 90, 255, 0.16);
}

.users-header h1 {
  color: #0f1f3d;
  font-size: clamp(2rem, 5vw, 2.8rem);
  font-weight: 700;
  margin: 0;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.subtitle {
  color: #3d4a63;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(61, 90, 255, 0.55);
  background: rgba(61, 90, 255, 0.12);
  color: #0f1f3d;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-chip:hover {
  border-color: #3d5aff;
  background: rgba(61, 90, 255, 0.2);
}

.filter-chip.active {
  background: linear-gradient(135deg, #5281ff, #3b6cff);
  border-color: transparent;
  box-shadow: 0 10px 22px rgba(61, 90, 255, 0.35);
  color: #ffffff;
}

.chip-count {
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0f1f3d;
}

.users-table-wrap {
  background: #ffffff;
  border: 1px solid #d6e2ff;
  border-radius: 16px;
  padding: clamp(1rem, 3vw, 1.5rem);
  box-shadow: 0 14px 34px rgba(61, 90, 255, 0.2);
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}

.users-table thead th {
  text-align: left;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #3d4a63;
  padding: 14px 16px;
  background: #e6eeff;
  border-bottom: 1px solid rgba(61, 90, 255, 0.35);
}

.users-table tbody tr {
  transition: background 0.2s ease;
}

.users-table tbody tr:nth-child(odd) {
  background: #ffffff;
}

.users-table tbody tr:nth-child(even) {
  background: #d2e0ff;
}

.users-table tbody td {
  padding: 14px 16px;
  color: #0f1f3d;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(61, 90, 255, 0.15);
}

.users-table tbody tr:hover {
  background: rgba(61, 90, 255, 0.22);
}

.empty-cell {
  text-align: center;
  color: #5b6b8f;
  padding: 28px 16px;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.role-pill.admin {
  background: #0f2d66;
  color: #ffffff;
}

.role-pill.standard {
  background: #dbe9ff;
  color: #0f1f3d;
}

@media (max-width: 700px) {
  .users-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .users-table {
    min-width: 520px;
  }
}
</style>
