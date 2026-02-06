<template>
  <div class="signup-container">
    <div class="signup-box">
      <h2>Create Account</h2>
      <form @submit.prevent="handleSignup">
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
          <label for="phone">Phone number</label>
          <input
            id="phone"
            v-model.trim="phone"
            type="tel"
            autocomplete="tel"
            placeholder="555-555-5555"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
          />
          <div class="strength-row">
            <span class="strength-label">Strength:</span>
            <span :class="['strength-value', strengthClass]">{{ strengthLabel }}</span>
          </div>
          <ul class="strength-list">
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
          <label for="confirm-password">Re-enter password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
          />
          <p v-if="confirmPassword && !passwordsMatch" class="helper-text">
            Passwords do not match.
          </p>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">Account created. Please log in.</div>

        <button type="submit" class="primary-button" :disabled="!canSubmit">
          Create account
        </button>
      </form>

      <button type="button" class="link-button" @click="goToLogin">
        Back to login
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)

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

const isStrong = computed(() =>
  Object.values(passwordRules.value).every(Boolean)
)

const canSubmit = computed(() =>
  firstName.value &&
    lastName.value &&
    email.value &&
    phone.value &&
    password.value &&
    confirmPassword.value &&
    passwordsMatch.value &&
    isStrong.value
)

const handleSignup = () => {
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

  success.value = true
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #d6e6ff;
  width: 100%;
  padding: 24px;
}

.signup-box {
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: 1px solid #3d5aff;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(61, 90, 255, 0.5);
  padding: clamp(2rem, 5vw, 3rem);
  width: 100%;
  max-width: 520px;
}

.signup-box h2 {
  text-align: center;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  color: #ffffff;
  font-weight: 700;
  font-size: clamp(1.5rem, 5vw, 2rem);
  letter-spacing: 0.3px;
}

.two-column {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
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

.form-group input:focus {
  outline: none;
  border-color: #5281ff;
  background-color: rgba(11, 26, 56, 0.95);
  box-shadow: 0 0 0 3px rgba(82, 129, 255, 0.15);
}

.strength-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
  color: #b8c9ff;
  font-size: 0.85rem;
}

.strength-value {
  font-weight: 700;
}

.strength-value.weak {
  color: #ff8a80;
}

.strength-value.medium {
  color: #f5c26b;
}

.strength-value.strong {
  color: #7dffa5;
}

.strength-list {
  margin: 10px 0 0;
  padding-left: 18px;
  color: #7a8fb5;
  font-size: 0.85rem;
  display: grid;
  gap: 6px;
}

.strength-list li {
  display: flex;
  gap: 8px;
  align-items: center;
}

.requirement-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid rgba(184, 201, 255, 0.6);
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.strength-list li.met .requirement-box::after {
  content: '✓';
  color: #0b1630;
  background: #7dffa5;
  width: 100%;
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-weight: 700;
}

.strength-list li.met {
  color: #7dffa5;
}

.helper-text {
  margin-top: 8px;
  color: #ff8a80;
  font-size: 0.85rem;
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

.primary-button {
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

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.primary-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #6a94ff, #5281ff);
  box-shadow: 0 12px 28px rgba(82, 129, 255, 0.45);
  transform: translateY(-2px);
}

.link-button {
  margin-top: 16px;
  background: none;
  border: none;
  color: #b8c9ff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 4px;
  transition: color 0.3s ease;
  text-align: left;
}

.link-button:hover {
  color: #5281ff;
}
</style>
