<template>
  <div class="dashboard-container">
    <div class="dashboard-card">
      <button class="signout-button" type="button" @click="signOut">
        Sign out
      </button>
      <h2>User Dashboard</h2>
      <div class="dashboard-actions">
        <button class="action-tile primary-tile" type="button" @click="createMail">
          <span class="tile-title">Create Mail</span>
          <span class="tile-subtitle">Start a new campaign</span>
        </button>
        <button class="action-tile" type="button" @click="goToMapTest">
          <span class="tile-title">Map Test</span>
          <span class="tile-subtitle">Preview the map view</span>
        </button>
        <button class="action-tile" type="button" @click="goToOrderHistory">
          <span class="tile-title">Order History</span>
          <span class="tile-subtitle">Past campaigns</span>
        </button>
        <button class="action-tile" type="button">
          <span class="tile-title">User Listings</span>
          <span class="tile-subtitle">Manage saved lists</span>
        </button>
        <button class="action-tile" type="button" @click="goToProfile">
          <span class="tile-title">Update Profile</span>
          <span class="tile-subtitle">Edit account details</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const createMail = () => {
  router.push('/create-mail')
}

const goToMapTest = () => {
  router.push('/map-test')
}

const signOut = () => {
  router.push('/login')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToOrderHistory = () => {
  router.push('/orders')
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d6e6ff;
  padding: 24px;
}

.dashboard-card {
  width: 100%;
  max-width: 520px;
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: 1px solid #3d5aff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(61, 90, 255, 0.5);
  text-align: center;
  position: relative;
}

.signout-button {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(82, 129, 255, 0.45);
  background: rgba(11, 26, 56, 0.7);
  color: #c9d8ff;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.signout-button:hover {
  border-color: #5281ff;
  color: #ffffff;
  background: rgba(11, 26, 56, 0.9);
}

.dashboard-card h2 {
  margin: 0 0 24px;
  color: #ffffff;
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.dashboard-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-tile {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  text-align: left;
  padding: 16px;
  border-radius: 14px;
  border: 1.5px solid rgba(82, 129, 255, 0.35);
  background: rgba(11, 26, 56, 0.72);
  color: #c9d8ff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  min-height: 120px;
}

.action-tile:hover {
  border-color: #5281ff;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(82, 129, 255, 0.25);
}

.primary-tile {
  background: linear-gradient(135deg, #4a78ff, #2f58d9);
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(82, 129, 255, 0.35);
  border-color: rgba(82, 129, 255, 0.7);
}

.primary-tile:hover {
  box-shadow: 0 18px 32px rgba(82, 129, 255, 0.45);
}

.tile-title {
  font-size: 1rem;
  font-weight: 700;
}

.tile-subtitle {
  font-size: 0.85rem;
  color: inherit;
  opacity: 0.8;
}
</style>
