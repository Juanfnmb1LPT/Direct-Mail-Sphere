<template>
  <div class="login-page">
    <nav class="login-navbar">
      <div class="login-nav-container">
        <div class="login-brand">
          <h1 class="login-brand-title">DIRECT MAIL SPHERE</h1>
          <div class="login-brand-underline"></div>
          <p class="login-brand-subtitle">
            Direct mail marketing with modern automation.
          </p>
          <p class="login-brand-description">
            Sign in to create, manage, and launch campaigns in minutes.
          </p>
        </div>
        <button type="button" class="login-home-link" @click="goToHome">
          Home
        </button>
      </div>
    </nav>
    <main>
      <div class="login-shell">
      <div class="login-panel">
        <h2 class="panel-title">Sign in</h2>
        <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email or Username:</label>
          <input
            type="text"
            id="email"
            v-model.trim="email"
            placeholder="Enter email or username"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <div class="password-field">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="Enter password"
              autocomplete="current-password"
              required
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
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="loading" class="loading-message">Logging in...</div>
        <div v-if="success" class="success-message">Login successful.</div>

          <button type="submit" class="login-button" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Sign in' }}
          </button>
        </form>

        <div class="secondary-actions">
          <button
            type="button"
            class="link-button"
            style="color: #0b1630;"
            @click="openResetModal"
          >
            Forgot password?
          </button>
          <button
            type="button"
            class="outline-button"
            style="color: #0b1630;"
            @click="goToSignup"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
    </main>

    <div v-if="showResetModal" class="modal-backdrop">
      <form class="modal-card" @submit.prevent="sendResetEmail">
        <h3>Reset your password</h3>
        <p>Please enter your email to receive a reset link.</p>
        <input
          type="email"
          v-model.trim="resetEmail"
          placeholder="you@email.com"
          autocomplete="email"
        />
        <div class="modal-actions">
          <button type="button" class="outline-button" @click="closeResetModal">
            Cancel
          </button>
          <button
            type="submit"
            class="login-button"
            :disabled="resetLoading"
          >
            {{ resetLoading ? 'Sending...' : 'Send email' }}
          </button>
        </div>
        <div v-if="resetError" class="error-message modal-error">
          {{ resetError }}
        </div>
        <div v-if="resetLoading" class="loading-message">Sending email...</div>
        <div v-if="resetSent" class="success-message modal-success">
          If that email exists, we sent a reset link.
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const success = ref(false)
const showResetModal = ref(false)
const resetEmail = ref('')
const resetSent = ref(false)
const resetError = ref('')
const resetLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  success.value = false
  loading.value = true

  try {
    const result = await authService.login(email.value, password.value)
    loading.value = false

    if (result.success) {
      success.value = true
      await router.push({ path: '/dashboard', query: { welcome: '1' } })
    } else {
      error.value = result.message || 'Invalid credentials'
    }
  } catch (err) {
    loading.value = false
    error.value = err?.message || 'An error occurred during login'
  }
}

const openResetModal = () => {
  resetSent.value = false
  resetError.value = ''
  resetEmail.value = email.value
  showResetModal.value = true
}

const closeResetModal = () => {
  showResetModal.value = false
}

const sendResetEmail = async () => {
  resetError.value = ''
  resetSent.value = false
  if (!resetEmail.value) {
    resetError.value = 'Please enter your email address.'
    return
  }

  resetLoading.value = true
  try {
    const result = await authService.requestPasswordReset(resetEmail.value)
    if (result?.success) {
      resetSent.value = true
    } else {
      resetError.value = result?.message || 'Unable to send password email.'
    }
  } catch (err) {
    resetError.value = err?.message || 'Unable to send password email.'
  } finally {
    resetLoading.value = false
  }
}

const goToSignup = () => {
  router.push('/signup')
}

const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.login-page {
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

.login-navbar {
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: none;
  padding: 0;
  box-shadow: 0 8px 24px rgba(11, 22, 48, 0.22);
  position: relative;
  margin: 20px 24px 0;
  border-radius: 16px;
  z-index: 1;
}

.login-nav-container {
  width: 100%;
  margin: 0;
  padding: 28px 32px 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 260px;
  position: relative;
}

.login-brand {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
}

.login-brand-title {
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: clamp(2rem, 4.6vw, 3.4rem);
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
}

.login-brand-underline {
  width: min(320px, 62vw);
  height: 2px;
  background: rgba(255, 255, 255, 0.9);
  margin: 6px auto 0;
}

.login-brand-subtitle {
  margin: 8px 0 0;
  max-width: 680px;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
}

.login-brand-description {
  margin: 0;
  max-width: 640px;
  font-size: 14px;
  color: rgba(226, 236, 255, 0.95);
  line-height: 1.6;
}

.login-home-link {
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

.login-home-link:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.login-shell {
  width: 100%;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem) 0;
  margin: 0 auto;
}

.login-panel {
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

.form-group input::placeholder {
  color: #6b7c9f;
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

.login-button {
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

.login-button:hover {
  background: linear-gradient(135deg, #6a94ff, #5281ff);
  box-shadow: 0 12px 28px rgba(82, 129, 255, 0.45);
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0);
}

.secondary-actions {
  margin-top: clamp(0.75rem, 2.5vw, 1rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.link-button {
  background: none;
  border: none;
  color: #0b1630;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  font-weight: 600;
  cursor: pointer;
  padding: 6px 4px;
  transition: color 0.3s ease;
  text-align: left;
}

.link-button:hover {
  color: #0f1f3d;
}

.outline-button {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid rgba(61, 90, 255, 0.6);
  background: rgba(61, 90, 255, 0.08);
  color: #0b1630;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-panel .secondary-actions .link-button {
  color: #0b1630;
}

.login-panel .secondary-actions .outline-button {
  color: #0b1630;
  border-color: rgba(15, 31, 61, 0.35);
}

.outline-button:hover {
  border-color: #3d5aff;
  color: #0f1f3d;
  box-shadow: 0 8px 18px rgba(82, 129, 255, 0.25);
  transform: translateY(-1px);
}

.outline-button:active {
  transform: translateY(0);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(11, 22, 48, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}

.modal-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff !important;
  border: 1px solid #e0e7ff !important;
  border-radius: 16px;
  padding: clamp(2rem, 5vw, 3rem);
  box-shadow: 0 12px 30px rgba(61, 90, 255, 0.18) !important;
  color: #0f1f3d !important;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-card h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f1f3d !important;
}

.modal-card p {
  margin: 0;
  color: #3d4a63 !important;
  font-size: 0.95rem;
  line-height: 1.5;
}

.modal-card input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid #d0d8ee !important;
  background-color: #f8f9ff !important;
  color: #0f1f3d !important;
  font-size: 0.95rem;
}

.modal-card input:focus {
  outline: none;
  border-color: #3d5aff !important;
  background-color: #ffffff !important;
  box-shadow: 0 0 0 3px rgba(61, 90, 255, 0.12) !important;
}

.modal-card input:-webkit-autofill,
.modal-card input:-webkit-autofill:hover,
.modal-card input:-webkit-autofill:focus,
.modal-card input:-webkit-autofill:active {
  -webkit-text-fill-color: #0f1f3d;
  box-shadow: 0 0 0 1000px #f8f9ff inset;
  transition: background-color 9999s ease-out, color 9999s ease-out;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-actions .login-button,
.modal-actions .outline-button {
  width: auto;
  margin-top: 0;
  padding: 10px 16px;
}

.modal-actions .outline-button {
  background: rgba(61, 90, 255, 0.08);
  border-color: rgba(15, 31, 61, 0.35);
}

.modal-actions .outline-button:hover {
  border-color: #3d5aff;
  color: #0f1f3d;
}

.modal-success {
  margin-bottom: 0;
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

.demo-credentials {
  margin-top: clamp(1.5rem, 4vw, 2rem);
  padding-top: clamp(1rem, 3vw, 1.5rem);
  border-top: 1px solid rgba(61, 90, 255, 0.3);
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  color: #3d4a63;
  background: linear-gradient(135deg, rgba(61, 90, 255, 0.08), rgba(82, 129, 255, 0.04));
  padding: clamp(1rem, 3vw, 1.5rem);
  border-radius: 12px;
  border: 1px solid rgba(61, 90, 255, 0.18);
}

.demo-credentials p {
  margin: clamp(0.3rem, 1.5vw, 0.5rem) 0;
}

.demo-credentials strong {
  color: #0b1630;
}

.demo-credentials code {
  background-color: rgba(82, 129, 255, 0.2);
  color: #5281ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

@media (max-width: 480px) {
  .login-container {
    padding: clamp(1rem, 5vw, 2rem);
  }

  .login-box {
    padding: clamp(1.5rem, 4vw, 2rem);
  }

  .login-button {
    font-size: 0.95rem;
  }
}
</style>
