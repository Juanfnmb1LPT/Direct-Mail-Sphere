<template>
  <div class="profile-container">
    <div class="profile-layout">
      <div class="profile-header">
        <img
          class="agent-avatar"
          :src="agentPhotoPreview"
          alt="Agent photo"
          @error="handleAvatarError"
        />
        <div class="profile-summary">
          <h2>Update Profile</h2>
          <p class="saved-name">{{ savedDisplayName }}</p>
          <p class="saved-email">{{ savedDisplayEmail }}</p>
        </div>
      </div>

      <form @submit.prevent="saveProfile" class="profile-form">
        <div class="columns-grid">
          <div class="form-column">
            <div class="form-group">
              <label for="first-name">First name</label>
              <input
                id="first-name"
                v-model.trim="firstName"
                type="text"
                autocomplete="given-name"
                :disabled="!isEditing || saving || loading"
                required
              />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                v-model.trim="email"
                type="email"
                autocomplete="email"
                :disabled="!isEditing || saving || loading"
                required
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
                :disabled="!isEditing || saving || loading"
              />
            </div>
          </div>

          <div class="form-column">
            <div class="form-group">
              <label for="last-name">Last name</label>
              <input
                id="last-name"
                v-model.trim="lastName"
                type="text"
                autocomplete="family-name"
                :disabled="!isEditing || saving || loading"
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
                :disabled="!isEditing || saving || loading"
              />
            </div>

            <div class="form-group">
              <label for="agent-photo">Agent photo</label>
              <input
                id="agent-photo"
                v-model.trim="agentPhoto"
                type="url"
                autocomplete="url"
                :placeholder="defaultAgentPhotoUrl"
                :disabled="!isEditing || saving || loading"
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
                :disabled="!isEditing || saving || loading"
                @blur="normalizeUrlField('companyLogo')"
              />
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-if="success" class="success-message">
          Profile updated.
        </div>

        <button
          type="submit"
          class="primary-button"
          :disabled="saving || loading"
        >
          {{ loading ? 'Loading...' : saving ? 'Saving...' : isEditing ? 'Save' : 'Edit' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { profileService } from '../services/profileService'
import { defaultProfileImage, normalizeProfile } from '../services/profileDefaults'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const mlsNumber = ref('')
const defaultAgentPhotoUrl = defaultProfileImage
const agentPhoto = ref(defaultAgentPhotoUrl)
const companyLogo = ref('')
const saving = ref(false)
const success = ref(false)
const loading = ref(false)
const error = ref('')
const isEditing = ref(false)
const savedProfile = ref({ firstName: '', lastName: '', email: '' })

const agentPhotoPreview = computed(() =>
  String(agentPhoto.value || '').trim() || defaultAgentPhotoUrl
)

const savedDisplayName = computed(() => {
  const first = String(savedProfile.value?.firstName || '').trim()
  const last = String(savedProfile.value?.lastName || '').trim()
  return `${first} ${last}`.trim() || 'No name saved'
})

const savedDisplayEmail = computed(() =>
  String(savedProfile.value?.email || '').trim() || 'No email saved'
)

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
  const resolved = normalizeProfile(profile)
  firstName.value = resolved.firstName || ''
  lastName.value = resolved.lastName || ''
  email.value = resolved.email || ''
  phone.value = resolved.phone || ''
  mlsNumber.value = resolved.mlsNumber || ''
  agentPhoto.value = String(resolved.agentPhoto || '').trim() || defaultAgentPhotoUrl
  companyLogo.value = resolved.companyLogo || ''
  savedProfile.value = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value
  }
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
  if (!isEditing.value) {
    error.value = ''
    success.value = false
    isEditing.value = true
    return
  }

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
    isEditing.value = false
  } else {
    error.value = result?.message || 'Unable to update profile'
  }
}

const normalizeUrlField = (fieldKey) => {
  const value = String({ agentPhoto, companyLogo }[fieldKey]?.value || '').trim()
  if (!value) return
  if (/^https?:\/\//i.test(value)) {
    if (fieldKey === 'agentPhoto') agentPhoto.value = value
    if (fieldKey === 'companyLogo') companyLogo.value = value
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

const handleAvatarError = (event) => {
  if (event?.target?.src !== defaultAgentPhotoUrl) {
    event.target.src = defaultAgentPhotoUrl
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: block;
  background-color: #d6e6ff;
  padding: 32px;
}

.profile-layout {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
}

.profile-summary h2 {
  margin: 0;
  color: #0b1630;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.agent-avatar {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 3px solid #5281ff;
  box-shadow: 0 8px 18px rgba(82, 129, 255, 0.35);
}

.saved-name {
  margin: 6px 0 2px;
  color: #0b1630;
  font-size: 1.05rem;
  font-weight: 700;
}

.saved-email {
  margin: 0;
  color: #264173;
  font-size: 0.95rem;
  font-weight: 600;
}

.profile-form {
  width: 100%;
}

.columns-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 28px;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #0f1f3d;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid rgba(15, 31, 61, 0.2);
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: #ffffff;
  color: #0b1630;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-group input::placeholder {
  color: #6f84aa;
}

.form-group input:focus {
  outline: none;
  border-color: #5281ff;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(82, 129, 255, 0.15);
}

.form-group input:disabled {
  background-color: #ecf2ff;
  color: #5a6f93;
  cursor: not-allowed;
}

.primary-button {
  width: 220px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4a78ff, #2f58d9);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 6px;
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
  color: #1b5e3f;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: left;
}

.error-message {
  color: #d14646;
  margin-bottom: 16px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.12), rgba(255, 107, 107, 0.08));
  border: 1.5px solid rgba(255, 107, 107, 0.4);
  border-radius: 10px;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 500;
}

@media (max-width: 900px) {
  .profile-container {
    padding: 24px 16px;
  }

  .columns-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .primary-button {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .profile-header {
    align-items: flex-start;
  }

  .agent-avatar {
    width: 88px;
    height: 88px;
  }

  .profile-summary h2 {
    font-size: 1.45rem;
  }
}
</style>
