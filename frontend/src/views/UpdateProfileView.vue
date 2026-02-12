<template>
  <div class="profile-container">
    <div class="profile-card">
      <button class="back-button" type="button" @click="goToDashboard">
        Back to dashboard
      </button>
      <h2>Update Profile</h2>
      <form @submit.prevent="saveProfile">
        <div class="two-column">
          <div class="form-group">
            <label for="first-name">First name</label>
            <input
              id="first-name"
              v-model.trim="firstName"
              type="text"
              autocomplete="given-name"
              required
            />
          </div>
          <div class="form-group">
            <label for="last-name">Last name</label>
            <input
              id="last-name"
              v-model.trim="lastName"
              type="text"
              autocomplete="family-name"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone">Phone #</label>
          <input
            id="phone"
            v-model="phone"
            type="tel"
            autocomplete="tel"
            placeholder="555-555-5555"
            inputmode="numeric"
          />
        </div>

        <div class="form-group">
          <label for="mls-number">MLS number</label>
          <input
            id="mls-number"
            v-model.trim="mlsNumber"
            type="text"
            autocomplete="off"
            placeholder="MLS123456"
          />
        </div>

        <div class="form-group">
          <label for="agent-photo">Agent photo</label>
          <input
            id="agent-photo"
            v-model.trim="agentPhoto"
            type="url"
            autocomplete="url"
            placeholder="https://www.example.com/agent.jpg"
            @blur="normalizeUrlField('agentPhoto')"
          />
        </div>

        <div class="form-group">
          <label for="company-logo">Company logo</label>
          <input
            id="company-logo"
            v-model.trim="companyLogo"
            type="url"
            autocomplete="url"
            placeholder="https://www.example.com/logo.png"
            @blur="normalizeUrlField('companyLogo')"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-if="success" class="success-message">
          Profile updated.
        </div>

        <button type="submit" class="primary-button" :disabled="saving || loading">
          {{ loading ? 'Loading...' : saving ? 'Saving...' : 'Save changes' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { profileService } from '../services/profileService'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const mlsNumber = ref('')
const agentPhoto = ref('')
const companyLogo = ref('')
const saving = ref(false)
const success = ref(false)
const loading = ref(false)
const error = ref('')

const emailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
)

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

watch(phone, (value) => {
  const formatted = formatPhone(value)
  if (formatted !== value) phone.value = formatted
})

const setProfile = (profile) => {
  firstName.value = profile?.firstName || ''
  lastName.value = profile?.lastName || ''
  email.value = profile?.email || ''
  phone.value = profile?.phone || ''
  mlsNumber.value = profile?.mlsNumber || ''
  agentPhoto.value = profile?.agentPhoto || ''
  companyLogo.value = profile?.companyLogo || ''
}

const loadProfile = async () => {
  error.value = ''
  loading.value = true

  const result = await profileService.getProfile()
  loading.value = false

  if (result?.success) {
    setProfile(result.profile)
  } else {
    error.value = result?.message || 'Unable to load profile'
  }
}

const saveProfile = async () => {
  error.value = ''
  success.value = false
  saving.value = true

  if (!firstName.value || !lastName.value || !email.value) {
    saving.value = false
    error.value = 'First name, last name, and email are required.'
    return
  }

  if (!emailValid.value) {
    saving.value = false
    error.value = 'Enter a valid email address.'
    return
  }

  normalizeUrlField('agentPhoto')
  normalizeUrlField('companyLogo')

  const result = await profileService.updateProfile({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    phone: phone.value,
    mlsNumber: mlsNumber.value,
    agentPhoto: agentPhoto.value,
    companyLogo: companyLogo.value
  })

  saving.value = false

  if (result?.success) {
    setProfile(result.profile)
    success.value = true
  } else {
    error.value = result?.message || 'Unable to update profile'
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const normalizeUrlField = (fieldKey) => {
  const value = String({ agentPhoto, companyLogo }[fieldKey]?.value || '').trim()
  if (!value) return
  if (/^https?:\/\//i.test(value)) {
    const normalized = value.replace(/^(https?:\/\/)(?!www\.)/i, '$1www.')
    if (fieldKey === 'agentPhoto') agentPhoto.value = normalized
    if (fieldKey === 'companyLogo') companyLogo.value = normalized
    return
  }
  if (/^www\./i.test(value)) {
    const normalized = `https://${value}`
    if (fieldKey === 'agentPhoto') agentPhoto.value = normalized
    if (fieldKey === 'companyLogo') companyLogo.value = normalized
    return
  }
  const normalized = `https://www.${value}`
  if (fieldKey === 'agentPhoto') agentPhoto.value = normalized
  if (fieldKey === 'companyLogo') companyLogo.value = normalized
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #d6e6ff;
  padding: 24px;
}

.profile-card {
  width: 100%;
  max-width: 520px;
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: 1px solid #3d5aff;
  border-radius: 12px;
  padding: clamp(2rem, 4vw, 3rem);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(61, 90, 255, 0.5);
  position: relative;
}

.back-button {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(82, 129, 255, 0.45);
  background: rgba(11, 26, 56, 0.7);
  color: #c9d8ff;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  border-color: #5281ff;
  color: #ffffff;
  background: rgba(11, 26, 56, 0.9);
}

.profile-card h2 {
  margin: 0 0 24px;
  color: #ffffff;
  font-size: 1.7rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.3px;
}

.two-column {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #b8c9ff;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid rgba(79, 124, 255, 0.3);
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: rgba(11, 26, 56, 0.8);
  color: #ffffff;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-group input::placeholder {
  color: #7a8fb5;
}

.form-group input:focus {
  outline: none;
  border-color: #5281ff;
  background-color: rgba(11, 26, 56, 0.95);
  box-shadow: 0 0 0 3px rgba(82, 129, 255, 0.15);
}

.primary-button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4a78ff, #2f58d9);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(82, 129, 255, 0.35);
}

.success-message {
  color: #7fe3b1;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.error-message {
  color: #ff8a80;
  margin-bottom: 16px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.12), rgba(255, 107, 107, 0.08));
  border: 1.5px solid rgba(255, 107, 107, 0.4);
  border-radius: 10px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
