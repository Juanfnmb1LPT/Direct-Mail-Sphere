<template>
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
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

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
const ORDERS_KEY = 'direct-mail-orders'
const API_BASE = 'http://localhost:3001'

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
    const raw = window.localStorage.getItem(ORDERS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveOrders = (orders) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

const sendCsvToEmail = async ({ recipientEmail, csvContent, templateName }) => {
  const response = await fetch(`${API_BASE}/api/send-csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientEmail, csvContent, templateName })
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

const downloadCsv = (csvContent) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'create-mail.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const normalizeCardNumber = (value) => String(value || '').replace(/\D/g, '')
const normalizeCvv = (value) => String(value || '').replace(/\D/g, '')

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

const addOrderHistoryRecord = () => {
  const order = pendingOrder.value
  if (!order) return

  const now = new Date()
  const newOrder = {
    id: `ORD-${now.getTime()}`,
    name: order.templateName,
    status: 'placed',
    address: order.address,
    createdAt: now.toISOString(),
    date: now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const orders = loadOrders()
  orders.unshift(newOrder)
  saveOrders(orders)
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

    downloadCsv(csv)

    if (!disableResend.value) {
      await sendCsvToEmail({
        recipientEmail: pendingOrder.value.recipientEmail,
        csvContent: csv,
        templateName: pendingOrder.value.templateName
      })
      successMessage.value = `Order submitted. CSV downloaded and sent to ${pendingOrder.value.recipientEmail}.`
    } else {
      successMessage.value = 'Order submitted. CSV downloaded. Resend is disabled.'
    }

    addOrderHistoryRecord()
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
  background: #d6e6ff;
  padding: 28px 20px;
}

.payment-shell {
  max-width: 920px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(15, 31, 61, 0.18);
  box-shadow: 0 16px 40px rgba(11, 22, 48, 0.18);
  padding: 24px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid rgba(15, 31, 61, 0.24);
  background: #ffffff;
  color: #0b1630;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 12px;
  cursor: pointer;
  margin-bottom: 14px;
}

h1 {
  margin: 0;
  color: #0b1630;
  font-size: clamp(1.4rem, 4vw, 2rem);
}

.subtitle {
  margin-top: 8px;
  margin-bottom: 18px;
  color: #264173;
}

.payment-form {
  display: grid;
  gap: 18px;
}

.card-section,
.summary-section {
  border: 1px solid rgba(15, 31, 61, 0.16);
  border-radius: 12px;
  padding: 16px;
  background: #f8fbff;
}

.card-section h2,
.summary-section h2 {
  margin: 0 0 12px;
  font-size: 1.05rem;
  color: #0b1630;
}

.row {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
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
  gap: 6px;
}

label {
  font-size: 0.86rem;
  font-weight: 600;
  color: #0f1f3d;
}

input {
  border: 1px solid rgba(15, 31, 61, 0.24);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.95rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 6px 0;
  color: #0f1f3d;
}

.disable-resend-toggle {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #0f1f3d;
}

.submit-button {
  margin-top: 14px;
  width: 100%;
  border: none;
  border-radius: 10px;
  background: #3d5aff;
  color: #ffffff;
  font-weight: 700;
  padding: 12px 16px;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  margin: 8px 0 0;
  color: #a12f2f;
  font-weight: 600;
}

.success-message {
  margin-top: 14px;
  color: #1f7a3f;
  font-weight: 700;
}

@media (max-width: 720px) {
  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
