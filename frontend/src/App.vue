<template>
  <div class="app-shell">
    <nav v-if="showDashboardNav" class="dashboard-nav">
      <div class="dashboard-nav-inner">
        <div class="dashboard-brand">
          <h1 class="dashboard-title">DIRECT MAIL SPHERE</h1>
        </div>
        <div class="dashboard-nav-actions top-actions">
          <a class="nav-link" href="#" @click.prevent="goToHome">HOME</a>
          <a class="nav-link" href="#" @click.prevent="signOut">SIGN OUT</a>
        </div>
        <div class="dashboard-nav-actions menu-actions">
          <RouterLink class="nav-link" :class="{ active: isCreateMailActive }" to="/create-mail">CREATE MAIL</RouterLink>
          <RouterLink class="nav-link" :class="{ active: route.name === 'map-test' }" to="/map-test">MAP TEST</RouterLink>
          <RouterLink class="nav-link" :class="{ active: route.name === 'orders' }" to="/orders">ORDER HISTORY</RouterLink>
          <RouterLink class="nav-link" :class="{ active: route.name === 'listings' }" to="/listings">USER LISTINGS</RouterLink>
          <RouterLink class="nav-link" :class="{ active: route.name === 'profile' }" to="/profile">UPDATE PROFILE</RouterLink>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const dashboardRouteNames = new Set([
  'dashboard',
  'profile',
  'orders',
  'listings',
  'create-mail',
  'create-mail-form',
  'map-test'
])

const showDashboardNav = computed(() => dashboardRouteNames.has(route.name))

const isCreateMailActive = computed(() =>
  ['dashboard', 'create-mail', 'create-mail-form'].includes(route.name)
)

const goToHome = () => {
  router.push('/')
}

const signOut = () => {
  localStorage.removeItem('direct-mail-profile')
  router.push('/login')
}
</script>

<style>
.app-shell {
  min-height: 100vh;
}

.dashboard-nav {
  width: 100%;
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  box-shadow: 0 8px 24px rgba(11, 22, 48, 0.22);
  position: sticky;
  top: 0;
  z-index: 200;
}

.dashboard-nav-inner {
  min-height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 24px 24px 30px;
}

.dashboard-brand {
  text-align: center;
}

.dashboard-title {
  color: #ffffff;
  font-size: clamp(2rem, 4.6vw, 3.4rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.05;
  margin: 0;
}

.dashboard-nav-actions {
  display: flex;
  gap: 14px;
}

.top-actions {
  position: absolute;
  top: 22px;
  right: 24px;
}

.menu-actions {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 16px;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px 22px;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  font-size: 15px;
}

.nav-link:hover,
.nav-link.active {
  text-decoration: underline;
  text-underline-offset: 4px;
}

@media (max-width: 768px) {
  .dashboard-nav-inner {
    min-height: 180px;
    padding: 18px 14px 22px;
  }

  .dashboard-title {
    font-size: clamp(1.5rem, 8vw, 2.3rem);
  }

  .top-actions {
    top: 14px;
    right: 14px;
    gap: 10px;
  }

  .menu-actions {
    left: 14px;
    right: 14px;
    bottom: 12px;
    gap: 8px 14px;
  }

  .nav-link {
    font-size: 13px;
  }
}
</style>
