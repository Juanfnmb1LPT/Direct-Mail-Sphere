<template>
  <div class="order-history-container">
    <div class="order-history-header">
      <h1>Order History</h1>
      <p class="subtitle">Track your direct mail campaigns</p>
    </div>

    <div class="orders-grid">
      <!-- Current Orders -->
      <div class="order-section">
        <div class="section-header">
          <h2>Current Orders</h2>
          <span class="order-count">{{ currentOrders.length }}</span>
        </div>
        <div class="order-list">
          <div v-if="currentOrders.length === 0" class="empty-state">
            <p>No active orders at the moment</p>
          </div>
          <div v-for="order in currentOrders" :key="order.id" class="order-card">
            <div class="order-info">
              <h3>{{ order.name }}</h3>
              <p class="order-id">Order #{{ order.id }}</p>
              <p class="order-date">{{ order.date }}</p>
            </div>
            <div class="order-status">{{ order.status }}</div>
          </div>
        </div>
      </div>

      <!-- Past Orders -->
      <div class="order-section">
        <div class="section-header">
          <h2>Past Orders</h2>
          <span class="order-count">{{ pastOrders.length }}</span>
        </div>
        <div class="order-list">
          <div v-if="pastOrders.length === 0" class="empty-state">
            <p>No completed orders yet</p>
          </div>
          <div v-for="order in pastOrders" :key="order.id" class="order-card">
            <div class="order-info">
              <h3>{{ order.name }}</h3>
              <p class="order-id">Order #{{ order.id }}</p>
              <p class="order-date">{{ order.date }}</p>
            </div>
            <div class="order-status completed">{{ order.status }}</div>
          </div>
        </div>
      </div>

      <!-- Canceled Orders -->
      <div class="order-section">
        <div class="section-header">
          <h2>Canceled Orders</h2>
          <span class="order-count">{{ canceledOrders.length }}</span>
        </div>
        <div class="order-list">
          <div v-if="canceledOrders.length === 0" class="empty-state">
            <p>No canceled orders</p>
          </div>
          <div v-for="order in canceledOrders" :key="order.id" class="order-card">
            <div class="order-info">
              <h3>{{ order.name }}</h3>
              <p class="order-id">Order #{{ order.id }}</p>
              <p class="order-date">{{ order.date }}</p>
            </div>
            <div class="order-status canceled">{{ order.status }}</div>
          </div>
        </div>
      </div>
    </div>

    <button type="button" class="back-button" @click="goToDashboard">
      Back to Dashboard
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data - empty for now
const currentOrders = ref([])
const pastOrders = ref([])
const canceledOrders = ref([])

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.order-history-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #0f1f3d 50%, #0a1a2e 100%);
  padding: clamp(2rem, 5vw, 3rem);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    sans-serif;
}

.order-history-header {
  text-align: center;
  margin-bottom: clamp(2rem, 5vw, 3rem);
}

.order-history-header h1 {
  color: #ffffff;
  font-size: clamp(2rem, 6vw, 2.5rem);
  font-weight: 700;
  margin: 0;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.subtitle {
  color: #b8c9ff;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 500;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(1.5rem, 3vw, 2.5rem);
  margin-bottom: 2rem;
}

.order-section {
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: 1px solid #3d5aff;
  border-radius: 12px;
  padding: clamp(1.5rem, 3vw, 2rem);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(61, 90, 255, 0.5);
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(61, 90, 255, 0.3);
}

.section-header h2 {
  color: #ffffff;
  font-size: 1.3rem;
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.order-count {
  display: inline-block;
  background: linear-gradient(135deg, #5281ff, #3b6cff);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.order-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #b8c9ff;
  font-size: 0.95rem;
  text-align: center;
}

.empty-state p {
  margin: 0;
}

.order-card {
  background: rgba(82, 129, 255, 0.08);
  border: 1px solid rgba(82, 129, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;
  cursor: pointer;
}

.order-card:hover {
  background: rgba(82, 129, 255, 0.15);
  border-color: rgba(82, 129, 255, 0.4);
  transform: translateY(-2px);
}

.order-info h3 {
  color: #ffffff;
  font-size: 1rem;
  margin: 0;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.order-id {
  color: #9ab0ff;
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

.order-date {
  color: #b8c9ff;
  font-size: 0.8rem;
  margin: 0.25rem 0 0 0;
  opacity: 0.8;
}

.order-status {
  display: inline-block;
  background: linear-gradient(135deg, #5281ff, #3b6cff);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  margin-left: 1rem;
}

.order-status.completed {
  background: linear-gradient(135deg, #18a359, #0f8a40);
}

.order-status.canceled {
  background: linear-gradient(135deg, #d74545, #a53535);
}

.back-button {
  display: block;
  margin: 0 auto;
  padding: 10px 20px;
  background: transparent;
  color: #b8c9ff;
  border: 1px solid #3d5aff;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  color: #ffffff;
  border-color: #5281ff;
  background: rgba(82, 129, 255, 0.1);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }

  .order-history-header {
    margin-bottom: 1.5rem;
  }
}
</style>
