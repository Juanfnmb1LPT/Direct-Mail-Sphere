<template>
  <div class="app-shell">
    <template v-if="showDashboardNav">
      <header class="dashboard-top-header">
        <h1 class="header-title">DIRECT MAIL SPHERE</h1>
        <p class="header-subtitle">The future of marketing</p>
      </header>

      <div class="dashboard-layout">
        <aside class="dashboard-sidebar" :class="{ collapsed: !isSidebarExpanded }">
          <button
            type="button"
            class="sidebar-toggle"
            @click="toggleSidebar"
            :aria-label="isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'"
            :title="isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'"
          >
            {{ isSidebarExpanded ? '⟨⟨' : '⟩⟩' }}
          </button>

          <div class="sidebar-profile-wrap">
            <img
              class="sidebar-profile-image"
              :src="profileImage"
              :alt="`${profileName} profile photo`"
              @error="handleSidebarImageError"
            />
            <span class="sidebar-profile-name">{{ profileName }}</span>
          </div>

          <div class="sidebar-heading-wrap">
            <h2 class="sidebar-heading">Navigation</h2>
          </div>

          <button
            type="button"
            class="mobile-menu-button"
            @click="toggleMobileMenu"
            :aria-expanded="isMobileMenuOpen"
            aria-controls="dashboard-mobile-menu"
          >
            {{ isMobileMenuOpen ? 'Close Menu' : 'Open Menu' }}
          </button>

          <div id="dashboard-mobile-menu" class="mobile-menu-panel" :class="{ open: isMobileMenuOpen }">
            <nav class="sidebar-options" aria-label="Dashboard options">
              <RouterLink class="sidebar-link" :class="{ active: route.name === 'dashboard' }" to="/dashboard">
                <span class="sidebar-icon" aria-hidden="true">⌂</span>
                <span class="sidebar-label">Dashboard</span>
              </RouterLink>

              <RouterLink class="sidebar-link" :class="{ active: isCreateMailActive }" to="/create-mail">
                <span class="sidebar-icon" aria-hidden="true">✉</span>
                <span class="sidebar-label">Create Mail</span>
              </RouterLink>

              <RouterLink class="sidebar-link" :class="{ active: route.name === 'map-test' }" to="/map-test">
                <span class="sidebar-icon" aria-hidden="true">⌖</span>
                <span class="sidebar-label">Map Test</span>
              </RouterLink>

              <RouterLink class="sidebar-link" :class="{ active: route.name === 'orders' }" to="/orders">
                <span class="sidebar-icon" aria-hidden="true">🕘</span>
                <span class="sidebar-label">Order History</span>
              </RouterLink>

              <RouterLink class="sidebar-link" :class="{ active: route.name === 'listings' }" to="/listings">
                <span class="sidebar-icon" aria-hidden="true">▦</span>
                <span class="sidebar-label">User Listings</span>
              </RouterLink>

              <RouterLink class="sidebar-link" :class="{ active: route.name === 'profile' }" to="/profile">
                <span class="sidebar-icon" aria-hidden="true">⚙</span>
                <span class="sidebar-label">Update Profile</span>
              </RouterLink>
            </nav>

            <div class="sidebar-footer">
              <a class="sidebar-link" href="#" @click.prevent="goToHome">
                <span class="sidebar-icon" aria-hidden="true">🏁</span>
                <span class="sidebar-label">Landing Page</span>
              </a>
              <a class="sidebar-link" href="#" @click.prevent="signOut">
                <span class="sidebar-icon" aria-hidden="true">⇦</span>
                <span class="sidebar-label">Sign Out</span>
              </a>
            </div>
          </div>
        </aside>

        <main class="dashboard-main">
          <router-view />
        </main>
      </div>
    </template>

    <router-view v-else />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  defaultProfileImage,
  normalizeProfile,
  notifyProfileUpdated,
  PROFILE_KEY,
  PROFILE_UPDATED_EVENT
} from './services/profileDefaults'

const route = useRoute()
const router = useRouter()
const isSidebarExpanded = ref(true)
const isMobileMenuOpen = ref(false)
const profileImage = ref(defaultProfileImage)
const profileName = ref('User')

const dashboardRouteNames = new Set([
  'dashboard',
  'profile',
  'orders',
  'listings',
  'create-mail',
  'create-mail-form',
  'create-mail-payment',
  'map-test'
])

const showDashboardNav = computed(() => dashboardRouteNames.has(route.name))

const isCreateMailActive = computed(() =>
  ['create-mail', 'create-mail-form', 'create-mail-payment'].includes(route.name)
)

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const goToHome = () => {
  router.push('/')
}

const signOut = () => {
  localStorage.removeItem(PROFILE_KEY)
  notifyProfileUpdated()
  router.push('/')
}

const loadSidebarProfile = () => {
  try {
    const rawProfile = localStorage.getItem(PROFILE_KEY)
    const profile = normalizeProfile(rawProfile ? JSON.parse(rawProfile) : null)
    const first = String(profile?.firstName || '').trim()
    profileName.value = first || 'User'
    profileImage.value = String(profile?.agentPhoto || '').trim() || defaultProfileImage
  } catch (error) {
    profileName.value = 'User'
    profileImage.value = defaultProfileImage
  }
}

const handleSidebarImageError = () => {
  profileImage.value = defaultProfileImage
}

watch(
  () => route.fullPath,
  () => {
    loadSidebarProfile()
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener(PROFILE_UPDATED_EVENT, loadSidebarProfile)
})

onUnmounted(() => {
  window.removeEventListener(PROFILE_UPDATED_EVENT, loadSidebarProfile)
})
</script>

<style>
.app-shell {
  min-height: 100vh;
}

.dashboard-top-header {
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  color: #ffffff;
  text-align: center;
  padding: 28px 16px 24px;
  box-shadow: 0 8px 24px rgba(11, 22, 48, 0.22);
}

.header-title {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ffffff;
}

.header-subtitle {
  margin: 10px 0 0;
  font-size: 1.08rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: calc(100vh - 146px);
}

.dashboard-sidebar {
  width: 320px;
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  box-shadow: 8px 0 24px rgba(11, 22, 48, 0.22);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 22px 16px 18px;
  transition: width 0.25s ease;
}

.dashboard-sidebar.collapsed {
  width: 84px;
}

.sidebar-toggle {
  position: absolute;
  top: 12px;
  right: 10px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.sidebar-heading-wrap {
  padding: 16px 10px 12px;
}

.sidebar-profile-wrap {
  padding-top: 54px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding-left: 10px;
}

.sidebar-profile-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 8px 18px rgba(11, 22, 48, 0.28);
}

.sidebar-profile-name {
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.02em;
}

.sidebar-heading {
  margin: 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.86rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sidebar-options,
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-options {
  margin-top: 8px;
}

.mobile-menu-button {
  display: none;
}

.mobile-menu-panel {
  display: block;
}

.sidebar-footer {
  margin-top: auto;
}

.sidebar-link {
  color: #ffffff;
  text-decoration: none;
  letter-spacing: 0.03em;
  font-weight: 600;
  font-size: 1.02rem;
  border-radius: 10px;
  padding: 12px 12px;
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.2s ease;
}

.sidebar-label {
  white-space: nowrap;
}

.sidebar-link:hover,
.sidebar-link.active {
  background: rgba(255, 255, 255, 0.14);
}

.sidebar-icon {
  width: 22px;
  min-width: 22px;
  text-align: center;
  font-size: 1.05rem;
}

.dashboard-sidebar.collapsed .sidebar-label,
.dashboard-sidebar.collapsed .sidebar-heading {
  display: none;
}

.dashboard-sidebar.collapsed .sidebar-heading-wrap {
  padding-top: 10px;
  padding-bottom: 8px;
}

.dashboard-sidebar.collapsed .sidebar-profile-image {
  width: 28px;
  height: 28px;
}

.dashboard-sidebar.collapsed .sidebar-profile-name {
  display: none;
}

.dashboard-sidebar.collapsed .sidebar-link {
  justify-content: flex-start;
  padding: 10px 10px;
}

.dashboard-main {
  min-width: 0;
}

@media (max-width: 900px) {
  .dashboard-top-header {
    padding: 16px 12px 12px;
  }

  .header-title {
    font-size: clamp(1.5rem, 7vw, 2rem);
  }

  .header-subtitle {
    margin-top: 6px;
    font-size: 0.92rem;
  }

  .dashboard-layout {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .dashboard-sidebar {
    width: 100%;
    padding: 10px 12px 12px;
    box-shadow: 0 8px 24px rgba(11, 22, 48, 0.22);
  }

  .sidebar-toggle {
    display: none;
  }

  .dashboard-sidebar.collapsed {
    width: 100%;
  }

  .dashboard-sidebar.collapsed .sidebar-label,
  .dashboard-sidebar.collapsed .sidebar-heading {
    display: initial;
  }

  .dashboard-sidebar.collapsed .sidebar-link {
    justify-content: flex-start;
    padding: 10px 10px;
  }

  .sidebar-profile-wrap {
    padding-top: 8px;
    justify-content: center;
    padding-left: 0;
  }

  .sidebar-heading-wrap {
    padding: 8px 0 8px;
  }

  .mobile-menu-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 2px;
    border: 1px solid rgba(255, 255, 255, 0.34);
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
    border-radius: 10px;
    padding: 10px 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .mobile-menu-panel {
    display: none;
    margin-top: 6px;
  }

  .mobile-menu-panel.open {
    display: block;
  }
}
</style>
