<template>
  <main>
    <section class="dashboard-page" :class="{ 'is-entering': showWelcomeAnimation }">
    <div v-if="showWelcomeAnimation" class="login-welcome-overlay" aria-hidden="true">
    </div>
    <div class="dashboard-content">
      <div class="dashboard-hero">
        <p class="welcome-label">Dashboard</p>
        <h2 class="dashboard-heading">Welcome back {{ displayName }}!</h2>
        <p class="dashboard-subtitle">
          {{ isAdmin ? 'Manage platform activity from your admin dashboard.' : 'Choose where you want to go next.' }}
        </p>
      </div>

      <div class="dashboard-grid">
        <RouterLink v-if="!isAdmin" class="dashboard-action-card" to="/create-mail">
          <div class="card-header">
            <span class="card-icon" aria-hidden="true">✉</span>
            <h3>Create Mail</h3>
          </div>
          <p>Pick a template and build your next campaign.</p>
        </RouterLink>

        <RouterLink class="dashboard-action-card" to="/orders">
          <div class="card-header">
            <span class="card-icon" aria-hidden="true">🕘</span>
            <h3>{{ isAdmin ? 'Orders' : 'Order History' }}</h3>
          </div>
          <p>{{ isAdmin ? 'Review orders across all users.' : 'Review previous orders and track campaign activity.' }}</p>
        </RouterLink>

        <RouterLink v-if="isAdmin" class="dashboard-action-card" to="/users">
          <div class="card-header">
            <span class="card-icon" aria-hidden="true">👥</span>
            <h3>Users</h3>
          </div>
          <p>View all user accounts in one place.</p>
        </RouterLink>

        <RouterLink v-if="!isAdmin" class="dashboard-action-card" to="/listings">
          <div class="card-header">
            <span class="card-icon" aria-hidden="true">▦</span>
            <h3>User Listings</h3>
          </div>
          <p>View and manage your available property listings.</p>
        </RouterLink>

        <RouterLink v-if="!isAdmin" class="dashboard-action-card" to="/profile">
          <div class="card-header">
            <span class="card-icon" aria-hidden="true">⚙</span>
            <h3>Update Profile</h3>
          </div>
          <p>Edit your account and contact information.</p>
        </RouterLink>

        <div v-if="!isAdmin" class="dashboard-action-card dashboard-stat-card">
          <p class="stat-note">our records show</p>
          <h3 class="stat-title">Your total orders:</h3>
          <p class="stat-value">0</p>
        </div>

        <div v-if="!isAdmin" class="dashboard-action-card dashboard-stat-card">
          <p class="stat-note">our records show</p>
          <h3 class="stat-title">You marketed to this many people:</h3>
          <p class="stat-value">0</p>
        </div>
      </div>
    </div>
  </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { profileService } from '../services/profileService'
import { getCurrentUserType } from '../services/profileDefaults'

const route = useRoute()
const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const isAdmin = ref(false)
const showWelcomeAnimation = ref(false)
let welcomeTimerId = null

const displayName = computed(() => {
  const first = String(firstName.value || '').trim()
  const last = String(lastName.value || '').trim()
  const combined = `${first} ${last}`.trim()
  return combined || 'Agent'
})

const loadNameFromCachedProfile = () => {
  try {
    const raw = localStorage.getItem('direct-mail-profile')
    const parsed = raw ? JSON.parse(raw) : null
    firstName.value = parsed?.firstName || ''
    lastName.value = parsed?.lastName || ''
  } catch (error) {
    firstName.value = ''
    lastName.value = ''
  }
}

const loadProfile = async () => {
  isAdmin.value = getCurrentUserType() === 'admin'
  loadNameFromCachedProfile()
  const result = await profileService.getProfile()
  if (result?.success && result?.profile) {
    firstName.value = result.profile.firstName || ''
    lastName.value = result.profile.lastName || ''
  }
}

onMounted(() => {
  loadProfile()
  if (route.query?.welcome === '1') {
    showWelcomeAnimation.value = true
    const nextQuery = { ...route.query }
    delete nextQuery.welcome
    router.replace({ path: route.path, query: nextQuery })
    welcomeTimerId = window.setTimeout(() => {
      showWelcomeAnimation.value = false
      welcomeTimerId = null
    }, 1200)
  }
})

onBeforeUnmount(() => {
  if (welcomeTimerId) {
    clearTimeout(welcomeTimerId)
    welcomeTimerId = null
  }
})
</script>

<style scoped>
.dashboard-page {
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 190px);
  background: linear-gradient(135deg, #ffffff 0%, #e3eeff 52%, #cfdfff 100%);
  padding: 30px 24px 34px;
}

.login-welcome-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 50% 38%, rgba(96, 132, 255, 0.28), rgba(96, 132, 255, 0));
  animation: welcome-overlay-fade 1.2s ease forwards;
  z-index: 2;
}

.dashboard-content {
  max-width: 1100px;
  margin: 0 auto;
}

.dashboard-page.is-entering .dashboard-hero,
.dashboard-page.is-entering .dashboard-grid {
  animation: dashboard-rise-in 0.65s ease;
}

.dashboard-hero {
  background: linear-gradient(135deg, #ffffff 0%, #eef5ff 60%, #ddeaff 100%);
  border-radius: 16px;
  padding: 22px 24px;
  border: 1px solid rgba(15, 31, 61, 0.14);
  box-shadow: 0 10px 20px rgba(11, 22, 48, 0.08);
  margin-bottom: 18px;
}

.welcome-label {
  margin: 0;
  color: #264173;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  font-weight: 600;
}

.dashboard-heading {
  margin: 6px 0 0;
  color: #0b1630;
  font-size: clamp(1.8rem, 4.2vw, 2.4rem);
}

.dashboard-subtitle {
  margin: 8px 0 0;
  color: #264173;
  font-weight: 600;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.dashboard-action-card {
  display: block;
  background: linear-gradient(135deg, #f2f7ff 0%, #dbe9ff 55%, #bfd5ff 100%);
  border: 1.5px solid rgba(15, 31, 61, 0.2);
  border-radius: 6px;
  padding: 20px;
  text-decoration: none;
  color: #0b1630;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.card-icon {
  width: 28px;
  min-width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0f2d66;
  font-size: 1.2rem;
}

.dashboard-action-card h3 {
  margin: 0;
  font-size: 1.08rem;
}

.dashboard-action-card p {
  margin: 0;
  color: #264173;
  line-height: 1.4;
}

.dashboard-action-card:hover {
  transform: translateY(-3px);
  border-color: #3d5aff;
  box-shadow: 0 12px 24px rgba(11, 22, 48, 0.14);
}

.dashboard-stat-card {
  cursor: default;
  text-align: center;
}

.dashboard-stat-card .stat-title {
  margin: 0;
  font-size: 1.08rem;
  color: #0b1630;
}

.dashboard-stat-card .stat-note {
  margin: 0 0 6px;
  font-size: 0.78rem;
  color: #3b588a;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dashboard-stat-card .stat-value {
  margin: 8px 0 0;
  font-size: 2rem;
  font-weight: 800;
  color: #0f2d66;
}

@media (max-width: 768px) {
  .dashboard-page {
    min-height: calc(100vh - 180px);
    padding: 24px 14px;
  }

  .dashboard-hero {
    padding: 18px 16px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes dashboard-rise-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes welcome-overlay-fade {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
