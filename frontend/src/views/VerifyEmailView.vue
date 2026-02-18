<template>
  <main>
    <div class="verify-email-page">
    <div class="verify-card">
      <div v-if="isVerifying" class="verify-loading">
        <div class="spinner"></div>
        <p>Verifying your email address...</p>
      </div>
      <div v-else-if="success" class="verify-success">
        <div class="success-icon">✓</div>
        <h2>Email verified!</h2>
        <p>{{ message }}</p>
        <button type="button" class="primary-button" @click="goToLogin">
          Log in to your account
        </button>
      </div>
      <div v-else class="verify-error">
        <div class="error-icon">✕</div>
        <h2>Verification failed</h2>
        <p>{{ message }}</p>
        <button type="button" class="secondary-button" @click="goToSignup">
          Create a new account
        </button>
      </div>
    </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '../services/authService'

const route = useRoute()
const router = useRouter()

const isVerifying = ref(true)
const success = ref(false)
const message = ref('')

const verifyEmail = async () => {
  const token = route.query.token

  if (!token) {
    isVerifying.value = false
    success.value = false
    message.value = 'No verification token provided.'
    return
  }

  const result = await authService.verifyEmail(token)

  isVerifying.value = false
  success.value = result.success || false
  message.value = result.message || (result.success ? 'You can now log in.' : 'Please try again.')
}

const goToLogin = () => {
  router.push('/login')
}

const goToSignup = () => {
  router.push('/signup')
}

onMounted(() => {
  verifyEmail()
})
</script>

<style scoped>
.verify-email-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffffff 0%, #e3eeff 52%, #cfdfff 100%);
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  padding: 24px;
}

.verify-card {
  background: #ffffff;
  border: 1px solid #e0e7ff;
  border-radius: 16px;
  padding: 48px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 12px 30px rgba(61, 90, 255, 0.16);
  text-align: center;
}

.verify-loading,
.verify-success,
.verify-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e0e7ff;
  border-top-color: #3d5aff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #18a359, #0f8a40);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
}

.error-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff8a80, #d14646);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
}

.verify-card h2 {
  color: #0f1f3d;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.verify-card p {
  color: #3d4a63;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
}

.primary-button,
.secondary-button {
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.primary-button {
  background: linear-gradient(135deg, #3d5aff 0%, #5281ff 100%);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(61, 90, 255, 0.25);
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(61, 90, 255, 0.35);
}

.secondary-button {
  background: #f1f5ff;
  color: #3d5aff;
  border: 2px solid #3d5aff;
}

.secondary-button:hover {
  background: #e6eeff;
}
</style>
