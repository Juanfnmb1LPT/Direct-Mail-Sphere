<template>
  <main>
    <div class="order-history-container">
    <header class="order-history-header">
      <div class="header-left">
        <h1>Order History</h1>
        <p class="subtitle">{{ isAdmin ? 'Track all orders across all users' : 'Track your direct mail campaigns' }}</p>
        <div class="filter-row">
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            :class="['filter-chip', { active: activeFilter === filter.value }]"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
            <span class="chip-count">{{ countForFilter(filter.value) }}</span>
          </button>
        </div>
        <div class="search-row">
          <input
            v-model.trim="searchQuery"
            type="search"
            class="order-search"
            placeholder="Search by date, order number, or address"
            autocomplete="off"
          />
        </div>
        <p v-if="saveError" class="save-error">{{ saveError }}</p>
      </div>
      <button v-if="!isAdmin" type="button" class="seed-button" @click="addRandomOrders">
        Add 20 random orders
      </button>
    </header>

    <div class="table-shell">
      <table class="orders-table">
        <thead>
          <tr>
            <th>
              <button type="button" class="sort-button" @click="toggleSort('date')">
                Order Date
                <span class="sort-indicator">{{ sortIndicator('date') }}</span>
              </button>
            </th>
            <th>
              <button type="button" class="sort-button" @click="toggleSort('number')">
                Order Number
                <span class="sort-indicator">{{ sortIndicator('number') }}</span>
              </button>
            </th>
            <th>Status</th>
            <th v-if="isAdmin">User</th>
            <th>
              <button type="button" class="sort-button" @click="toggleSort('address')">
                Address
                <span class="sort-indicator">{{ sortIndicator('address') }}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="visibleOrders.length === 0">
            <td class="empty-row" :colspan="isAdmin ? 5 : 4">No orders yet.</td>
          </tr>
          <tr v-for="(order, rowIndex) in visibleOrders" :key="`${order.id}-${order.userId || 'unknown'}-${order.createdAt || ''}-${rowIndex}`">
            <td>{{ formatDate(order) }}</td>
            <td>#{{ order.id }}</td>
            <td>
              <div class="status-cell">
                <template v-if="isAdmin">
                  <select
                    :class="['status-select', `status-select-${statusClass(order.status)}`]"
                    :value="normalizeStatus(order.status)"
                    :disabled="isSavingOrder(order)"
                    @change="updateOrderStatus(order, $event.target.value)"
                  >
                    <option v-for="status in statusOptions" :key="status" :value="status">
                      {{ formatStatus(status) }}
                    </option>
                  </select>
                </template>
                <span v-else :class="['order-status', statusClass(order.status)]">
                  {{ formatStatus(order.status) }}
                </span>
              </div>
            </td>
            <td v-if="isAdmin">{{ order.userName || order.userId || 'Unknown user' }}</td>
            <td class="address-cell">{{ order.address || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { getCurrentUserId, getCurrentUserType } from '../services/profileDefaults'

const ORDERS_KEY_PREFIX = 'direct-mail-orders'
const API_BASE = 'http://localhost:3001'

const getStorageKey = () => {
  const userId = getCurrentUserId()
  return userId ? `${ORDERS_KEY_PREFIX}-${userId}` : `${ORDERS_KEY_PREFIX}-guest`
}

const getAuthHeaders = () => {
  const userId = getCurrentUserId()
  const headers = { 'Content-Type': 'application/json' }
  if (userId) {
    headers['x-user-id'] = userId
  }
  return headers
}

const orders = ref([])
const statusOptions = ['placed', 'in progress', 'issue', 'delivered']
const filters = [
  { label: 'All', value: 'all' },
  { label: 'Placed', value: 'placed' },
  { label: 'In progress', value: 'in progress' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Issue', value: 'issue' }
]
const activeFilter = ref('all')
const searchQuery = ref('')
const visibleCount = ref(20)
const sortKey = ref('date')
const sortDir = ref('desc')
const isAdmin = ref(false)
const savingByOrderKey = ref({})
const saveError = ref('')

const orderKey = (order) => `${order?.id || ''}::${order?.userId || ''}::${order?.createdAt || ''}`

const isSavingOrder = (order) => Boolean(savingByOrderKey.value[orderKey(order)])

const loadOrders = async () => {
  if (typeof window === 'undefined') return []
  try {
    // Try to load from API first
    const response = await fetch(`${API_BASE}/api/order-history?ts=${Date.now()}`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    })
    if (response.ok) {
      const data = await response.json()
      const apiOrders = data?.orderHistory || []
      if (Array.isArray(apiOrders)) {
        window.localStorage.setItem(getStorageKey(), JSON.stringify(apiOrders))
        return apiOrders
      }
    }
  } catch (error) {
    // API is unavailable, fall back to localStorage
  }

  // Fall back to user-specific localStorage
  try {
    const raw = window.localStorage.getItem(getStorageKey())
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const refreshOrders = async () => {
  const loadedOrders = await loadOrders()
  orders.value = loadedOrders.map((order) => ({
    ...order,
    status: normalizeStatus(order.status)
  }))
}

const saveOrders = async (nextOrders) => {
  if (typeof window === 'undefined') return
  // Save to user-specific localStorage first
  window.localStorage.setItem(getStorageKey(), JSON.stringify(nextOrders))

  // Then sync with API
  try {
    await fetch(`${API_BASE}/api/order-history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderHistory: nextOrders })
    })
  } catch (error) {
    // API is unavailable, data is already saved locally
  }
}

const normalizeStatus = (value) => {
  const trimmed = String(value || '').toLowerCase().trim()
  if (trimmed === 'done') return 'delivered'
  return statusOptions.includes(trimmed) ? trimmed : 'placed'
}

const formatStatus = (value) =>
  String(value || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const statusClass = (value) => normalizeStatus(value).replace(' ', '-')

const updateOrderStatus = async (order, nextStatus) => {
  if (!isAdmin.value || !order?.id || !order?.userId) return

  const normalizedNext = normalizeStatus(nextStatus)
  const current = normalizeStatus(order.status)
  if (normalizedNext === current) return

  saveError.value = ''
  const key = orderKey(order)
  const previousStatus = current
  savingByOrderKey.value = { ...savingByOrderKey.value, [key]: true }

  orders.value = orders.value.map((entry) =>
    orderKey(entry) === key ? { ...entry, status: normalizedNext } : entry
  )

  try {
    const response = await fetch(`${API_BASE}/api/order-history/${encodeURIComponent(order.id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status: normalizedNext,
        userId: order.userId,
        createdAt: order.createdAt || ''
      })
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || 'Unable to update status.')
    }

    const savedStatus = normalizeStatus(data?.order?.status || normalizedNext)
    orders.value = orders.value.map((entry) =>
      orderKey(entry) === key ? { ...entry, status: savedStatus } : entry
    )
  } catch (error) {
    orders.value = orders.value.map((entry) =>
      orderKey(entry) === key ? { ...entry, status: previousStatus } : entry
    )
    saveError.value = error?.message || 'Unable to update status.'
  } finally {
    const nextSaving = { ...savingByOrderKey.value }
    delete nextSaving[key]
    savingByOrderKey.value = nextSaving
  }
}

const formatDate = (order) => {
  if (order.date) return order.date
  if (!order.createdAt) return ''
  const parsed = new Date(order.createdAt)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const filteredOrders = computed(() => {
  const filter = activeFilter.value
  let subset = orders.value
  if (filter === 'placed') {
    subset = orders.value.filter((order) => normalizeStatus(order.status) === 'placed')
  } else if (filter === 'in progress') {
    subset = orders.value.filter((order) => normalizeStatus(order.status) === 'in progress')
  } else if (filter === 'delivered') {
    subset = orders.value.filter((order) => normalizeStatus(order.status) === 'delivered')
  } else if (filter === 'issue') {
    subset = orders.value.filter((order) => normalizeStatus(order.status) === 'issue')
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return subset

  return subset.filter((order) => {
    const dateText = String(formatDate(order)).toLowerCase()
    const idText = String(order.id || '').toLowerCase()
    const addressText = String(order.address || '').toLowerCase()
    const userText = String(order.userName || order.userId || '').toLowerCase()
    return (
      dateText.includes(query) ||
      idText.includes(query) ||
      addressText.includes(query) ||
      userText.includes(query)
    )
  })
})

const sortedOrders = computed(() => {
  const direction = sortDir.value === 'asc' ? 1 : -1
  return [...filteredOrders.value].sort((a, b) => {
    if (sortKey.value === 'number') {
      return String(a.id || '').localeCompare(String(b.id || '')) * direction
    }
    if (sortKey.value === 'address') {
      return String(a.address || '').localeCompare(String(b.address || '')) * direction
    }
    const aTime = a.createdAt
      ? new Date(a.createdAt).getTime()
      : Date.parse(a.date || '') || 0
    const bTime = b.createdAt
      ? new Date(b.createdAt).getTime()
      : Date.parse(b.date || '') || 0
    return (aTime - bTime) * direction
  })
})

const visibleOrders = computed(() => sortedOrders.value.slice(0, visibleCount.value))

const countForFilter = (filterValue) => {
  if (filterValue === 'placed') {
    return orders.value.filter((order) => normalizeStatus(order.status) === 'placed').length
  }
  if (filterValue === 'in progress') {
    return orders.value.filter((order) => normalizeStatus(order.status) === 'in progress').length
  }
  if (filterValue === 'delivered') {
    return orders.value.filter((order) => normalizeStatus(order.status) === 'delivered').length
  }
  if (filterValue === 'issue') {
    return orders.value.filter((order) => normalizeStatus(order.status) === 'issue').length
  }
  return orders.value.length
}

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    return
  }
  sortKey.value = key
  sortDir.value = key === 'date' ? 'desc' : 'asc'
}

const sortIndicator = (key) => {
  if (sortKey.value !== key) return ''
  return sortDir.value === 'asc' ? '▲' : '▼'
}

const handleScroll = () => {
  const scrollPosition = window.scrollY + window.innerHeight
  const pageHeight = document.documentElement.scrollHeight
  const nearBottom = scrollPosition >= pageHeight - 120
  if (window.scrollY <= 8 && visibleCount.value !== 20) {
    visibleCount.value = 20
    return
  }
  if (!nearBottom) return
  if (visibleCount.value < filteredOrders.value.length) {
    visibleCount.value = Math.min(visibleCount.value + 20, filteredOrders.value.length)
  }
}

const addRandomOrders = () => {
  const templates = [
    'Template 1- Spring Clean Your Finances',
    'Template 2- Listing Coming Soon',
    'Template 3 - Just Sold',
    'Template 4 - For Sale',
    'Template 5 - Open House',
    'Template 6 - Mult Listings Postcard',
    'Template 7 - Review',
    "Template 8 - What's your home worth",
    'Template 9 - Neighborhood Market Update',
    'Template 10 - Local Biz'
  ]
  const streets = ['Maple Ave', 'Cedar St', 'Oak Dr', 'Elm St', 'Pine Ln']
  const cities = ['Austin', 'Denver', 'Phoenix', 'Raleigh', 'Tampa']
  const states = ['TX', 'CO', 'AZ', 'NC', 'FL']

  const newOrders = Array.from({ length: 20 }, () => {
    const now = new Date()
    const id = `ORD-${now.getTime()}-${Math.floor(Math.random() * 1000)}`
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]
    const address = `${Math.floor(100 + Math.random() * 900)} ${
      streets[Math.floor(Math.random() * streets.length)]
    }, ${cities[Math.floor(Math.random() * cities.length)]}, ${
      states[Math.floor(Math.random() * states.length)]
    }`
    const createdAt = new Date(
      now.getTime() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)
    ).toISOString()

    return {
      id,
      name: templates[Math.floor(Math.random() * templates.length)],
      status,
      address,
      createdAt
    }
  })

  const nextOrders = [...newOrders, ...orders.value]
  orders.value = nextOrders
  saveOrders(nextOrders)
}

const handleWindowFocus = () => {
  refreshOrders()
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    refreshOrders()
  }
}

onMounted(async () => {
  isAdmin.value = getCurrentUserType() === 'admin'
  await refreshOrders()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('focus', handleWindowFocus)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

watch(activeFilter, () => {
  visibleCount.value = 20
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

watch(searchQuery, () => {
  visibleCount.value = 20
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

watch([sortKey, sortDir], () => {
  visibleCount.value = 20
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

watch(filteredOrders, (value) => {
  if (visibleCount.value > value.length) {
    visibleCount.value = Math.max(20, value.length)
  }
})
</script>

<style scoped>
.order-history-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
  padding: clamp(2rem, 5vw, 3.5rem);
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  color: #0f1f3d !important;
}

.order-history-header {
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

.order-history-header h1 {
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

.header-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.search-row {
  margin-top: 12px;
}

.save-error {
  margin: 8px 0 0;
  color: #b42318;
  font-size: 0.88rem;
  font-weight: 600;
}

.order-search {
  width: min(420px, 100%);
  padding: 10px 14px;
  border-radius: 10px;
  border: 2px solid #d0d8ee;
  background: #f8f9ff;
  color: #0f1f3d;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.order-search:focus {
  outline: none;
  border-color: #3d5aff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(61, 90, 255, 0.12);
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

.table-shell {
  background: #ffffff;
  border: 1px solid #d6e2ff;
  border-radius: 16px;
  padding: clamp(1rem, 3vw, 1.5rem);
  box-shadow: 0 14px 34px rgba(61, 90, 255, 0.2);
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}

.orders-table thead th {
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

.sort-button {
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  font: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sort-button:hover {
  color: #1c2b58;
}

.sort-indicator {
  font-size: 0.75rem;
  color: #3d5aff;
}

.orders-table tbody tr {
  transition: background 0.2s ease;
}

.orders-table tbody tr:nth-child(odd) {
  background: #ffffff;
}

.orders-table tbody tr:nth-child(even) {
  background: #d2e0ff;
}

.orders-table tbody td {
  padding: 14px 16px;
  color: #0f1f3d;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(61, 90, 255, 0.15);
}

.orders-table tbody tr:hover {
  background: rgba(61, 90, 255, 0.22);
}

.empty-row {
  text-align: center;
  color: #5b6b8f;
  padding: 28px 16px;
}

.address-cell {
  color: #3d4a63;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.status-select {
  border: 1px solid rgba(15, 31, 61, 0.3);
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f1f3d;
  background: #ffffff;
}

.status-select-placed {
  background: linear-gradient(135deg, #5281ff, #3b6cff);
  color: #ffffff;
  border-color: transparent;
}

.status-select-delivered {
  background: linear-gradient(135deg, #18a359, #0f8a40);
  color: #ffffff;
  border-color: transparent;
}

.status-select-in-progress {
  background: linear-gradient(135deg, #f5c26b, #e2a243);
  color: #0b1630;
  border-color: transparent;
}

.status-select-issue {
  background: linear-gradient(135deg, #ff8a80, #d14646);
  color: #ffffff;
  border-color: transparent;
}

.order-status {
  display: inline-block;
  background: linear-gradient(135deg, #5281ff, #3b6cff);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.order-status.delivered {
  background: linear-gradient(135deg, #18a359, #0f8a40);
}

.order-status.in-progress {
  background: linear-gradient(135deg, #f5c26b, #e2a243);
  color: #0b1630;
}

.order-status.issue {
  background: linear-gradient(135deg, #ff8a80, #d14646);
}

.order-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.seed-button {
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #3d5aff 0%, #5281ff 100%);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(61, 90, 255, 0.25);
  transition: all 0.2s ease;
}

.seed-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(61, 90, 255, 0.35);
}

@media (max-width: 768px) {
  .order-history-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .orders-table {
    min-width: 520px;
  }
}
</style>
