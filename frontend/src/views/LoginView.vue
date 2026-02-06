<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Mail Sphere Project</h2>
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
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="secondary-actions">
        <button type="button" class="link-button" @click="openResetModal">
          Forgot password?
        </button>
        <button type="button" class="outline-button" @click="goToSignup">
          Sign up
        </button>
      </div>

      <div class="demo-credentials">
        <p><strong>Test Credentials:</strong></p>
        <p>Username: <code>test</code></p>
        <p>Password: <code>test123</code></p>
      </div>
    </div>

    <div v-if="showResetModal" class="modal-backdrop" @click="closeResetModal">
      <div class="modal-card" @click.stop>
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
          <button type="button" class="login-button" @click="sendResetEmail">
            Send email
          </button>
        </div>
        <div v-if="resetSent" class="success-message modal-success">
          If that email exists, we sent a reset link.
        </div>
      </div>
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

const handleLogin = async () => {
  error.value = ''
  success.value = false
  loading.value = true

  try {
    const result = await authService.login(email.value, password.value)
    loading.value = false

    if (result.success) {
      success.value = true
      await router.push('/dashboard')
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
  resetEmail.value = email.value
  showResetModal.value = true
}

const closeResetModal = () => {
  showResetModal.value = false
}

const sendResetEmail = () => {
  resetSent.value = true
}

const goToSignup = () => {
  router.push('/signup')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #d6e6ff;
  width: 100%;
}

.login-box {
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: 1px solid #3d5aff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(61, 90, 255, 0.5);
  padding: clamp(2rem, 5vw, 3rem);
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.login-box h2 {
  text-align: center;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  color: #ffffff;
  font-weight: 700;
  font-size: clamp(1.5rem, 5vw, 2rem);
  letter-spacing: 0.3px;
}

.form-group {
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
}

.form-group label {
  display: block;
  margin-bottom: clamp(0.5rem, 2vw, 0.75rem);
  color: #b8c9ff;
  font-weight: 600;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  padding: clamp(10px, 2vw, 14px);
  border: 2px solid rgba(79, 124, 255, 0.3);
  border-radius: 10px;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
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
  color: #b8c9ff;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #5281ff;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

.login-button {
  width: 100%;
  padding: clamp(12px, 2vw, 14px);
  background: linear-gradient(135deg, #5281ff, #3b6cff);
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
}

.link-button {
  background: none;
  border: none;
  color: #b8c9ff;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  font-weight: 600;
  cursor: pointer;
  padding: 6px 4px;
  transition: color 0.3s ease;
  text-align: left;
}

.link-button:hover {
  color: #5281ff;
}

.outline-button {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid rgba(82, 129, 255, 0.6);
  background: rgba(82, 129, 255, 0.08);
  color: #c9d8ff;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.outline-button:hover {
  border-color: #5281ff;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(82, 129, 255, 0.25);
  transform: translateY(-1px);
}

.outline-button:active {
  transform: translateY(0);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3, 8, 20, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}

.modal-card {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: 1px solid rgba(82, 129, 255, 0.5);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.45);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-card h3 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-card p {
  margin: 0;
  color: #b8c9ff;
  font-size: 0.95rem;
}

.modal-card input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid rgba(79, 124, 255, 0.3);
  background-color: rgba(11, 26, 56, 0.8);
  color: #ffffff;
  font-size: 0.95rem;
}

.modal-card input:focus {
  outline: none;
  border-color: #5281ff;
  box-shadow: 0 0 0 3px rgba(82, 129, 255, 0.15);
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
  color: #b8c9ff;
  background: linear-gradient(135deg, rgba(82, 129, 255, 0.1), rgba(61, 90, 255, 0.05));
  padding: clamp(1rem, 3vw, 1.5rem);
  border-radius: 10px;
  border: 1px solid rgba(61, 90, 255, 0.2);
}

.demo-credentials p {
  margin: clamp(0.3rem, 1.5vw, 0.5rem) 0;
}

.demo-credentials strong {
  color: #ffffff;
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
