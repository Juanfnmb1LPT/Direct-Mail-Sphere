<template>
  <div class="reset-page">
    <nav class="reset-navbar">
      <div class="reset-nav-container">
        <div class="reset-brand">
          <h1 class="reset-brand-title">DIRECT MAIL SPHERE</h1>
          <div class="reset-brand-underline"></div>
          <p class="reset-brand-subtitle">Reset your password</p>
          <p class="reset-brand-description">
            Set a new password for your account. This link expires after 15 minutes.
          </p>
        </div>
        <button type="button" class="reset-home-link" @click="goToLogin">
          Back to login
        </button>
      </div>
    </nav>

    <div class="reset-shell">
      <div class="reset-panel">
        <h2 class="panel-title">Choose a new password</h2>

        <div v-if="tokenMissing" class="error-message">
          Reset token is missing. Please request a new reset link.
        </div>

        <form v-else @submit.prevent="submitReset">
          <div class="form-group">
            <label for="new-password">New password</label>
            <div class="password-field">
              <input
                id="new-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Enter a new password"
                required
                @focus="isPasswordFocused = true"
                @blur="isPasswordFocused = false"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <svg
                  v-if="showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div v-if="showPasswordRules" class="strength-row">
              <span class="strength-label">Strength:</span>
              <span :class="['strength-value', strengthClass]">{{ strengthLabel }}</span>
            </div>
            <ul v-if="showPasswordRules" class="strength-list">
              <li :class="{ met: passwordRules.length }">
                <span class="requirement-box" aria-hidden="true"></span>
                At least 8 characters
              </li>
              <li :class="{ met: passwordRules.upper }">
                <span class="requirement-box" aria-hidden="true"></span>
                One uppercase letter
              </li>
              <li :class="{ met: passwordRules.lower }">
                <span class="requirement-box" aria-hidden="true"></span>
                One lowercase letter
              </li>
              <li :class="{ met: passwordRules.number }">
                <span class="requirement-box" aria-hidden="true"></span>
                One number
              </li>
              <li :class="{ met: passwordRules.special }">
                <span class="requirement-box" aria-hidden="true"></span>
                One special character
              </li>
            </ul>
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirm password</label>
            <div class="password-field">
              <input
                id="confirm-password"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Re-enter your new password"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
                :title="showConfirmPassword ? 'Hide password' : 'Show password'"
              >
                <svg
                  v-if="showConfirmPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <p v-if="confirmPassword && !passwordsMatch" class="helper-text">
              Passwords do not match.
            </p>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>
          <div v-if="loading" class="loading-message">Updating password...</div>
          <div v-if="success" class="success-message">
            Password updated. You can sign in now.
          </div>

          <button type="submit" class="reset-button" :disabled="loading">
            {{ loading ? 'Updating...' : 'Update password' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '../services/authService'

const route = useRoute()
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const success = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isPasswordFocused = ref(false)

const token = computed(() => String(route.query.token || '').trim())
const tokenMissing = computed(() => !token.value)
const showPasswordRules = computed(() => isPasswordFocused.value || password.value.length > 0)

const passwordRules = computed(() => ({
  length: password.value.length >= 8,
  upper: /[A-Z]/.test(password.value),
  lower: /[a-z]/.test(password.value),
  number: /[0-9]/.test(password.value),
  special: /[^A-Za-z0-9]/.test(password.value)
}))

const strengthScore = computed(() =>
  Object.values(passwordRules.value).filter(Boolean).length
)

const strengthLabel = computed(() => {
  if (strengthScore.value <= 2) return 'Weak'
  if (strengthScore.value === 3 || strengthScore.value === 4) return 'Medium'
  return 'Strong'
})

const strengthClass = computed(() => {
  if (strengthScore.value <= 2) return 'weak'
  if (strengthScore.value === 3 || strengthScore.value === 4) return 'medium'
  return 'strong'
})

const passwordsMatch = computed(() => password.value === confirmPassword.value)
const isStrong = computed(() => Object.values(passwordRules.value).every(Boolean))

const submitReset = async () => {
  error.value = ''
  success.value = false

  if (!isStrong.value) {
    error.value = 'Password is not strong enough.'
    return
  }

  if (!passwordsMatch.value) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    const result = await authService.resetPassword(token.value, password.value)
    if (result?.success) {
      success.value = true
      password.value = ''
      confirmPassword.value = ''
      setTimeout(() => {
        router.push('/login')
      }, 4000)
    } else {
      error.value = result?.message || 'Unable to reset password.'
    }
  } catch (err) {
    error.value = err?.message || 'Unable to reset password.'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.reset-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  padding-bottom: clamp(2rem, 4vw, 3rem);
  background: linear-gradient(135deg, #ffffff 0%, #e3eeff 52%, #cfdfff 100%);
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  --dms-text-muted: #0b1630;
  --dms-border-soft: rgba(11, 22, 48, 0.35);
}

.reset-navbar {
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: none;
  padding: 0;
  box-shadow: 0 8px 24px rgba(11, 22, 48, 0.22);
  position: relative;
  margin: 20px 24px 0;
  border-radius: 16px;
  z-index: 1;
}

.reset-nav-container {
  width: 100%;
  margin: 0;
  padding: 28px 32px 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 240px;
  position: relative;
}

.reset-brand {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
}

.reset-brand-title {
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: clamp(2rem, 4.6vw, 3.2rem);
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
}

.reset-brand-underline {
  width: min(320px, 62vw);
  height: 2px;
  background: rgba(255, 255, 255, 0.9);
  margin: 6px auto 0;
}

.reset-brand-subtitle {
  margin: 8px 0 0;
  max-width: 680px;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
}

.reset-brand-description {
  margin: 0;
  max-width: 640px;
  font-size: 14px;
  color: rgba(226, 236, 255, 0.95);
  line-height: 1.6;
}

.reset-home-link {
  position: absolute;
  top: 22px;
  right: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.reset-home-link:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.reset-shell {
  width: 100%;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem) 0;
  margin: 0 auto;
}

.reset-panel {
  background: #ffffff;
  border: 1px solid #e0e7ff;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(61, 90, 255, 0.18);
  padding: clamp(2rem, 5vw, 3rem);
}

.panel-title {
  margin: 0 0 1.5rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: #0f1f3d;
}

.form-group {
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
}

.form-group label {
  display: block;
  margin-bottom: clamp(0.5rem, 2vw, 0.75rem);
  color: #0f1f3d;
  font-weight: 600;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  padding: clamp(10px, 2vw, 14px);
  border: 2px solid #d0d8ee;
  border-radius: 10px;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  background-color: #f8f9ff;
  color: #0f1f3d;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3d5aff;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(61, 90, 255, 0.12);
}

.password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-field input {
  width: 100%;
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5b6b8f;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #3d5aff;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

.strength-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #3d4a63;
}

.strength-label {
  color: #5b6b8f;
}

.strength-value {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(61, 90, 255, 0.1);
  color: #3d5aff;
}

.strength-value.weak {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.strength-value.medium {
  background: rgba(245, 194, 107, 0.2);
  color: #c77b12;
}

.strength-value.strong {
  background: rgba(64, 255, 144, 0.18);
  color: #18a359;
}

.strength-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  gap: 8px;
  color: #3d4a63;
  font-size: 0.85rem;
}

.strength-list li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-list li.met {
  color: #18a359;
  font-weight: 600;
}

.requirement-box {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  border: 1.5px solid #9aaccc;
  background: transparent;
}

.strength-list li.met .requirement-box {
  border-color: #18a359;
  background: #18a359;
}

.helper-text {
  margin: 8px 0 0;
  color: #d14646;
  font-size: 0.85rem;
  font-weight: 600;
}

.reset-button {
  width: 100%;
  padding: clamp(12px, 2vw, 14px);
  background: linear-gradient(135deg, #3d5aff 0%, #5281ff 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(82, 129, 255, 0.3);
  letter-spacing: 0.3px;
  margin-top: clamp(0.5rem, 2vw, 1rem);
}

.reset-button:hover {
  background: linear-gradient(135deg, #6a94ff, #5281ff);
  box-shadow: 0 12px 28px rgba(82, 129, 255, 0.45);
  transform: translateY(-2px);
}

.reset-button:active {
  transform: translateY(0);
}

.error-message {
  color: #ff8a80;
  margin-bottom: clamp(0.75rem, 2.5vw, 1rem);
  padding: clamp(10px, 2vw, 12px);
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.12), rgba(255, 107, 107, 0.08));
  border: 1.5px solid rgba(255, 107, 107, 0.4);
  border-radius: 10px;
  text-align: center;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  font-weight: 500;
}

.loading-message {
  color: #b8c9ff;
  margin-bottom: clamp(0.75rem, 2.5vw, 1rem);
  padding: clamp(10px, 2vw, 12px);
  background: rgba(82, 129, 255, 0.12);
  border: 1.5px solid rgba(82, 129, 255, 0.3);
  border-radius: 10px;
  text-align: center;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  font-weight: 500;
}

.success-message {
  color: #7dffa5;
  margin-bottom: clamp(0.75rem, 2.5vw, 1rem);
  padding: clamp(10px, 2vw, 12px);
  background: rgba(64, 255, 144, 0.12);
  border: 1.5px solid rgba(64, 255, 144, 0.3);
  border-radius: 10px;
  text-align: center;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  font-weight: 600;
}

@media (max-width: 480px) {
  .reset-button {
    font-size: 0.95rem;
  }
}
</style>
