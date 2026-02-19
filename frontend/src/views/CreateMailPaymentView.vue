<template>
  <main>
    <div class="payment-container">
    <div class="payment-shell">
      <button type="button" class="back-button" @click="goBackToForm">
        <span aria-hidden="true">←</span>
        <span>Back to form</span>
      </button>

      <h1>Payment</h1>
      <p class="subtitle">Complete your order to generate and send your direct mail CSV.</p>

      <form class="payment-form" @submit.prevent="submitOrder">
        <section class="card-section">
          <h2>Card information</h2>

          <div class="row two-col">
            <div class="field">
              <label for="card_first_name">Card first name</label>
              <input id="card_first_name" v-model.trim="paymentForm.firstName" type="text" autocomplete="cc-given-name" required />
            </div>
            <div class="field">
              <label for="card_last_name">Card last name</label>
              <input id="card_last_name" v-model.trim="paymentForm.lastName" type="text" autocomplete="cc-family-name" required />
            </div>
          </div>

          <div class="row one-col">
            <div class="field">
              <label for="card_number">Credit card number</label>
              <input
                id="card_number"
                v-model.trim="paymentForm.cardNumber"
                type="text"
                inputmode="numeric"
                autocomplete="cc-number"
                placeholder="4242 4242 4242 4242"
                maxlength="23"
                @input="handleCardNumberInput"
                required
              />
            </div>
          </div>

          <div class="row two-col">
            <div class="field">
              <label for="card_expiration">Expiration date</label>
              <input
                id="card_expiration"
                v-model.trim="paymentForm.expiration"
                type="text"
                autocomplete="cc-exp"
                placeholder="MM/YY"
                maxlength="5"
                @input="handleExpirationInput"
                required
              />
            </div>
            <div class="field">
              <label for="card_cvv">Security code</label>
              <input
                id="card_cvv"
                v-model.trim="paymentForm.cvv"
                type="text"
                inputmode="numeric"
                autocomplete="cc-csc"
                placeholder="3-4 digits"
                maxlength="4"
                @input="handleCvvInput"
                required
              />
            </div>
          </div>

          <p v-if="paymentError" class="error-message">{{ paymentError }}</p>
        </section>

        <section class="summary-section">
          <h2>Order total</h2>
          <div class="summary-row">
            <span>Template</span>
            <strong>{{ pendingOrder?.templateName || '—' }}</strong>
          </div>
          <div class="summary-row">
            <span>Total properties marketed</span>
            <strong>{{ pendingOrder?.totalProperties || 0 }}</strong>
          </div>
          <div class="summary-row">
            <span>Email destination</span>
            <strong>{{ pendingOrder?.recipientEmail || '—' }}</strong>
          </div>

          <label class="disable-resend-toggle">
            <input v-model="disableResend" type="checkbox" />
            Disable Resend (download CSV only)
          </label>

          <button type="submit" class="submit-button" :disabled="isSubmitting || !pendingOrder">
            {{ isSubmitting ? 'Submitting order...' : 'Submit order' }}
          </button>
        </section>
      </form>

      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUserId } from '../services/profileDefaults'

const router = useRouter()
const pendingOrder = ref(null)
const disableResend = ref(false)
const paymentError = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const paymentForm = ref({
  firstName: '',
  lastName: '',
  cardNumber: '',
  expiration: '',
  cvv: ''
})

const PENDING_ORDER_KEY = 'direct-mail-pending-order'
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

const loadPendingOrder = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(PENDING_ORDER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const clearPendingOrder = () => {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(PENDING_ORDER_KEY)
}

const loadOrders = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(getStorageKey())
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveOrders = (orders) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getStorageKey(), JSON.stringify(orders))
}

const syncOrderHistoryToApi = async (nextOrders) => {
  const response = await fetch(`${API_BASE}/api/order-history`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ orderHistory: nextOrders })
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.message || 'Unable to save order history.')
  }

  const data = await response.json()
  const savedOrders = Array.isArray(data?.orderHistory) ? data.orderHistory : nextOrders
  saveOrders(savedOrders)
  return savedOrders
}

const sendCsvToEmail = async ({ recipientEmail, csvContent, templateName, fileName }) => {
  const response = await fetch(`${API_BASE}/api/send-csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientEmail, csvContent, templateName, fileName })
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody?.message || 'Unable to send CSV email.')
  }

  return response.json()
}

const csvEscape = (value) => {
  const cell = value === null || value === undefined ? '' : String(value)
  return `"${cell.replace(/"/g, '""')}"`
}

const buildCsv = () => {
  const order = pendingOrder.value
  if (!order) return ''
  const headers = Array.isArray(order.csvHeaders) ? order.csvHeaders : []
  const row = Array.isArray(order.csvRow) ? order.csvRow : []
  const totalProperties = Number(order.totalProperties || 0)

  const rows = [
    headers,
    ...Array.from({ length: totalProperties }, () => [...row])
  ]

  return rows.map((csvRow) => csvRow.map(csvEscape).join(',')).join('\n')
}

const sanitizeFileSegment = (value) =>
  String(value || '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const buildCsvFileName = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const datePart = `${year}-${month}-${day}`
  const lastNamePart = sanitizeFileSegment(
    paymentForm.value.lastName || pendingOrder.value?.prefillCardLastName || pendingOrder.value?.formSnapshot?.last_name || 'Unknown'
  )
  const templatePart = sanitizeFileSegment(pendingOrder.value?.templateName || 'Template')
  return `${lastNamePart}-${templatePart} - ${datePart}.csv`
}

const downloadCsv = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

const normalizeCardNumber = (value) => String(value || '').replace(/\D/g, '')
const normalizeCvv = (value) => String(value || '').replace(/\D/g, '')

const formatCardNumber = (value) => {
  const digits = normalizeCardNumber(value).slice(0, 19)
  const groups = digits.match(/.{1,4}/g)
  return groups ? groups.join(' ') : ''
}

const formatExpiration = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

const formatCvv = (value) => normalizeCvv(value).slice(0, 4)

const handleCardNumberInput = (event) => {
  paymentForm.value.cardNumber = formatCardNumber(event?.target?.value)
}

const handleExpirationInput = (event) => {
  paymentForm.value.expiration = formatExpiration(event?.target?.value)
}

const handleCvvInput = (event) => {
  paymentForm.value.cvv = formatCvv(event?.target?.value)
}

const isValidExpirationDate = (value) => {
  const cleaned = String(value || '').trim()
  const match = cleaned.match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/)
  if (!match) return false

  const month = Number(match[1])
  if (!Number.isFinite(month) || month < 1 || month > 12) return false

  const now = new Date()
  const yearPart = match[2]
  const fullYear = yearPart.length === 2 ? 2000 + Number(yearPart) : Number(yearPart)
  if (!Number.isFinite(fullYear)) return false

  const endOfMonth = new Date(fullYear, month, 0, 23, 59, 59, 999)
  return endOfMonth.getTime() >= now.getTime()
}

const validatePaymentForm = () => {
  const firstName = String(paymentForm.value.firstName || '').trim()
  const lastName = String(paymentForm.value.lastName || '').trim()
  const cardNumber = normalizeCardNumber(paymentForm.value.cardNumber)
  const cvv = normalizeCvv(paymentForm.value.cvv)

  if (!firstName || !lastName) {
    return 'Card first and last name are required.'
  }
  if (cardNumber.length < 12 || cardNumber.length > 19) {
    return 'Enter a valid credit card number.'
  }
  if (cvv.length < 3 || cvv.length > 4) {
    return 'Security code must be 3-4 numbers.'
  }
  if (!isValidExpirationDate(paymentForm.value.expiration)) {
    return 'Enter a valid expiration date in MM/YY format.'
  }

  return ''
}

const addOrderHistoryRecord = async () => {
  const order = pendingOrder.value
  if (!order) return

  const now = new Date()
  const newOrder = {
    id: `ORD-${now.getTime()}`,
    name: order.templateName,
    templateId: order.templateId,
    templateName: order.templateName,
    status: 'placed',
    address: order.address,
    recipientEmail: order.recipientEmail,
    totalProperties: Number(order.totalProperties || 0),
    propertiesToAdvertise: Number(order.propertiesToAdvertise || order.totalProperties || 0),
    csvHeaders: Array.isArray(order.csvHeaders) ? order.csvHeaders : [],
    csvRow: Array.isArray(order.csvRow) ? order.csvRow : [],
    formSnapshot: order.formSnapshot && typeof order.formSnapshot === 'object' ? order.formSnapshot : {},
    createdAt: now.toISOString(),
    date: now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const localOrders = loadOrders()
  const localNext = [newOrder, ...localOrders.filter((existing) => existing?.id !== newOrder.id)]
  saveOrders(localNext)

  try {
    const existingResponse = await fetch(`${API_BASE}/api/order-history?ts=${Date.now()}`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    })

    const existingOrders = existingResponse.ok
      ? await existingResponse.json().then((data) => (Array.isArray(data?.orderHistory) ? data.orderHistory : []))
      : []

    const mergedOrders = [newOrder, ...existingOrders.filter((existing) => existing?.id !== newOrder.id)]
    await syncOrderHistoryToApi(mergedOrders)
  } catch {
  }
}

const goBackToForm = () => {
  const templateId = pendingOrder.value?.templateId
  router.push({ path: '/create-mail/form', query: templateId ? { template: templateId } : undefined })
}

const submitOrder = async () => {
  paymentError.value = ''
  successMessage.value = ''

  if (!pendingOrder.value) {
    paymentError.value = 'No pending order found. Please complete the form first.'
    return
  }

  const validationMessage = validatePaymentForm()
  if (validationMessage) {
    paymentError.value = validationMessage
    return
  }

  isSubmitting.value = true

  try {
    const csv = buildCsv()
    if (!csv) {
      throw new Error('Unable to build CSV for this order.')
    }

    const exportFileName = buildCsvFileName()

    downloadCsv(csv, exportFileName)

    if (!disableResend.value) {
      await sendCsvToEmail({
        recipientEmail: pendingOrder.value.recipientEmail,
        csvContent: csv,
        templateName: pendingOrder.value.templateName,
        fileName: exportFileName
      })
      successMessage.value = `Order submitted. CSV downloaded and sent to ${pendingOrder.value.recipientEmail}.`
    } else {
      successMessage.value = 'Order submitted. CSV downloaded. Resend is disabled.'
    }

    await addOrderHistoryRecord()
    clearPendingOrder()
  } catch (error) {
    paymentError.value = error?.message || 'Unable to submit order.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  pendingOrder.value = loadPendingOrder()
  if (!pendingOrder.value) {
    paymentError.value = 'No pending order found. Please go back and create mail first.'
    return
  }

  paymentForm.value.firstName = String(pendingOrder.value.prefillCardFirstName || '').trim()
  paymentForm.value.lastName = String(pendingOrder.value.prefillCardLastName || '').trim()
})
</script>

<style scoped>
.payment-container {
  min-height: 100vh;
  display: block;
  background: transparent;
  width: 100%;
  padding: 32px 24px;
  position: relative;
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.payment-shell {
  max-width: 760px;
  margin: 40px auto 0;
  padding: 0;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid rgba(15, 31, 61, 0.24);
  background: #ffffff;
  color: #0b1630;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 12px;
  cursor: pointer;
  margin-bottom: 14px;
  transition: all 0.2s ease;
}

.back-button:hover {
  border-color: #5281ff;
  color: #0b1630;
  background: #f1f5ff;
}

h1 {
  margin: 0;
  color: #0b1630;
  font-size: clamp(1.4rem, 4vw, 2rem);
  text-align: left;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.subtitle {
  margin: 8px 0 20px;
  color: #35507f;
  text-align: left;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 26px;
  width: 100%;
}

.card-section,
.summary-section {
  border: 1px solid rgba(15, 31, 61, 0.22);
  border-radius: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #edf3ff 0%, #d8e5ff 100%);
}

.card-section h2,
.summary-section h2 {
  margin: 0 0 12px;
  font-size: 1rem;
  color: #0b1630;
  text-align: left;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.row {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.one-col {
  grid-template-columns: minmax(0, 1fr);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f1f3d;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

input {
  border: 2px solid rgba(15, 31, 61, 0.2);
  background-color: #ecf2ff;
  color: #0b1630;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

input::placeholder {
  color: #5a6f96;
}

input:focus {
  outline: none;
  border-color: #5281ff;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(82, 129, 255, 0.15);
}

.summary-section {
  align-self: stretch;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 6px 0;
  color: #0f1f3d;
}

.summary-row strong {
  text-align: right;
  word-break: break-word;
}

.disable-resend-toggle {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #0f1f3d;
  font-size: 0.88rem;
  font-weight: 600;
}

.disable-resend-toggle input {
  width: 16px;
  height: 16px;
  accent-color: #2f58d9;
  border-radius: 0;
  box-shadow: none;
}

.submit-button {
  margin-top: 14px;
  width: 100%;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4a78ff, #2f58d9);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(82, 129, 255, 0.28);
  letter-spacing: 0.3px;
}

.submit-button:hover {
  background: linear-gradient(135deg, #6a94ff, #5281ff);
  box-shadow: 0 10px 20px rgba(82, 129, 255, 0.35);
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  margin: 8px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(177, 38, 38, 0.1);
  color: #8e1c1c;
  border: 1px solid rgba(177, 38, 38, 0.35);
  font-size: 0.9rem;
}

.success-message {
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(24, 140, 80, 0.12);
  color: #1b5e3f;
  border: 1px solid rgba(24, 140, 80, 0.35);
  font-size: 0.9rem;
}

@media (max-width: 720px) {
  .payment-container {
    padding: 26px 16px;
  }

  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
