<template>
  <div class="dashboard-container">
    <div class="dashboard-card">
      <button class="signout-button" type="button" @click="signOut">
        Sign out
      </button>
      <h2>User Dashboard</h2>
      <div class="dashboard-actions">
        <button class="primary-button" type="button">Create Mail</button>
        <button class="secondary-button" type="button">View Orders</button>
        <button class="secondary-button" type="button">Order History</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const signOut = () => {
  router.push('/login')
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #5281ff, #3b6cff);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 22px rgba(82, 129, 255, 0.3);
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgba(82, 129, 255, 0.4);
}

.secondary-button {
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1.5px solid rgba(82, 129, 255, 0.45);
  background: rgba(11, 26, 56, 0.7);
  color: #c9d8ff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  border-color: #5281ff;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(82, 129, 255, 0.25);
}
</style>
