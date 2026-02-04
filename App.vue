<template>
  <div id="app">
    <header class="app-header">
      <div class="brand" @click="goHome">
        Direct Mail Sphere
      </div>

      <nav class="nav-actions">
        <button class="nav-button" @click="goHome">Home</button>
        <button class="nav-button" @click="goLogin">Admin</button>
        <button class="nav-button cart-button" @click="goCart">
          🛒 Cart <span class="cart-count">{{ cart.length }}</span>
        </button>

        <div
          class="user-menu"
          @mouseenter="openUserMenu"
          @mouseleave="scheduleCloseUserMenu"
        >
          <button class="user-icon" @click.stop="toggleUserMenu" aria-label="User menu">
            👤
          </button>
          <div
            v-if="showUserMenu"
            class="user-dropdown"
            @mouseenter="openUserMenu"
            @mouseleave="scheduleCloseUserMenu"
          >
            <button class="dropdown-item" @click="goLogin">Login</button>
            <button class="dropdown-item" @click="goLogin">Create an account</button>
          </div>
        </div>
      </nav>
    </header>

    <main class="app-main">
      <section v-if="view === 'home'" class="home">
        <div class="hero">
          <h1>Featured Products</h1>
          <p>Choose a product to start your location search.</p>
        </div>

        <div class="product-grid">
          <article
            v-for="product in products"
            :key="product.id"
            class="product-card"
            @click="goMap(product)"
          >
            <div class="product-art" :style="{ backgroundImage: product.art }"></div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p>{{ product.description }}</p>
              <div class="product-footer">
                <span class="price">{{ product.price }}</span>
                <button class="primary" @click.stop="goMap(product)">Select</button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section v-else-if="view === 'map'" class="map-view">
        <div class="map-header">
          <div class="map-product" v-if="selectedProduct">
            <div class="mini-art" :style="{ backgroundImage: selectedProduct.art }"></div>
            <div>
              <h3>{{ selectedProduct.name }}</h3>
              <p>{{ selectedProduct.description }}</p>
            </div>
          </div>
          <div class="map-actions">
            <button class="nav-button" @click="goHome">Back to Home</button>
            <button class="primary" :disabled="!selectedProduct" @click="addToCart">
              Add to Cart
            </button>
          </div>
        </div>
        <HouseMapComponent />
      </section>

      <section v-else-if="view === 'cart'" class="cart-view">
        <div class="cart-card">
          <h2>Your Cart</h2>
          <p v-if="cart.length === 0">Cart is empty.</p>
          <ul v-else class="cart-list">
            <li v-for="item in cart" :key="item.cartId">
              <span>{{ item.name }}</span>
              <span>{{ item.price }}</span>
            </li>
          </ul>
          <button class="primary" @click="goHome">Continue Shopping</button>
        </div>
      </section>

      <section v-else class="login-view">
        <div class="login-card">
          <h2>Admin Page</h2>
          <p>Login placeholder for structure only.</p>
          <button class="primary" @click="goHome">Back to Home</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HouseMapComponent from './HouseMapComponent.vue'

const view = ref('home')
const showUserMenu = ref(false)
const selectedProduct = ref(null)
const cart = ref([])

const products = ref([
  {
    id: 1,
    name: 'Business Cards',
    description: 'Premium matte or gloss business card packs.',
    price: '$19',
    art: "linear-gradient(135deg, #9b5de5, #f15bb5)"
  },
  {
    id: 2,
    name: 'Postcards',
    description: 'Full-color postcards for local campaigns.',
    price: '$24',
    art: "linear-gradient(135deg, #00bbf9, #00f5d4)"
  },
  {
    id: 3,
    name: 'Flyers',
    description: 'High-impact flyers for neighborhood drops.',
    price: '$29',
    art: "linear-gradient(135deg, #fee440, #f8961e)"
  },
  {
    id: 4,
    name: 'Door Hangers',
    description: 'Targeted door hangers for local outreach.',
    price: '$22',
    art: "linear-gradient(135deg, #f94144, #f3722c)"
  },
  {
    id: 5,
    name: 'Brochures',
    description: 'Tri-fold and bi-fold brochures for services.',
    price: '$27',
    art: "linear-gradient(135deg, #577590, #43aa8b)"
  },
  {
    id: 6,
    name: 'EDDM Bundles',
    description: 'Every Door Direct Mail bundles and labels.',
    price: '$18',
    art: "linear-gradient(135deg, #90be6d, #f9c74f)"
  },
  {
    id: 7,
    name: 'Menu Inserts',
    description: 'Restaurant-ready inserts and promo cards.',
    price: '$21',
    art: "linear-gradient(135deg, #4d908e, #277da1)"
  },
  {
    id: 8,
    name: 'Yard Signs',
    description: 'Durable yard signs for local visibility.',
    price: '$31',
    art: "linear-gradient(135deg, #f9844a, #f94144)"
  },
  {
    id: 9,
    name: 'Direct Mail Letters',
    description: 'Personalized letters and envelopes.',
    price: '$26',
    art: "linear-gradient(135deg, #3a86ff, #8338ec)"
  },
  {
    id: 10,
    name: 'Envelope Printing',
    description: 'Custom printed envelopes for branding.',
    price: '$34',
    art: "linear-gradient(135deg, #06d6a0, #118ab2)"
  }
])

const goHome = () => {
  view.value = 'home'
}

const goMap = (product) => {
  if (product) {
    selectedProduct.value = product
  }
  view.value = 'map'
}

const goLogin = () => {
  view.value = 'login'
  showUserMenu.value = false
}

const goCart = () => {
  view.value = 'cart'
  showUserMenu.value = false
}

const addToCart = () => {
  if (!selectedProduct.value) return
  cart.value.push({
    ...selectedProduct.value,
    cartId: `${selectedProduct.value.id}-${Date.now()}`
  })
  view.value = 'cart'
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

let hideMenuTimeout = null

const openUserMenu = () => {
  if (hideMenuTimeout) {
    clearTimeout(hideMenuTimeout)
    hideMenuTimeout = null
  }
  showUserMenu.value = true
}

const scheduleCloseUserMenu = () => {
  if (hideMenuTimeout) {
    clearTimeout(hideMenuTimeout)
  }
  hideMenuTimeout = setTimeout(() => {
    showUserMenu.value = false
  }, 200)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
}

.app-header {
  height: 64px;
  padding: 0 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  font-weight: 700;
  color: #1f1f1f;
  cursor: pointer;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-button {
  background: #f0f2f5;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.nav-button:hover {
  background: #e4e7ec;
}

.cart-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.cart-count {
  background: #2563eb;
  color: #ffffff;
  border-radius: 999px;
  font-size: 0.75rem;
  padding: 0.1rem 0.45rem;
  font-weight: 600;
}

.user-menu {
  position: relative;
}

.user-icon {
  background: #f0f2f5;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.1rem;
}

.user-dropdown {
  position: absolute;
  right: 0;
  top: 44px;
  background: white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dropdown-item {
  background: transparent;
  border: none;
  padding: 0.5rem;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.app-main {
  padding: 1.5rem;
}

.hero {
  margin-bottom: 1.5rem;
}

.hero h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #1f1f1f;
}

.hero p {
  color: #5f6b7a;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
}

.product-art {
  height: 120px;
  background-size: cover;
  background-position: center;
}

.product-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-info h3 {
  font-size: 1.05rem;
  color: #1f1f1f;
}

.product-info p {
  color: #6b7280;
  font-size: 0.9rem;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.price {
  font-weight: 600;
  color: #111827;
}

.primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.primary:hover {
  background: #1d4ed8;
}

.map-view {
  height: calc(100vh - 96px);
}

.map-header {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
}

.map-product {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mini-art {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
}

.map-actions {
  display: flex;
  gap: 0.75rem;
}

.cart-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.cart-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  min-width: 320px;
}

.cart-list {
  list-style: none;
  margin: 1rem 0;
  display: grid;
  gap: 0.5rem;
}

.cart-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 320px;
}

.login-card h2 {
  margin-bottom: 0.5rem;
}

@media (max-width: 960px) {
  .app-main {
    padding: 1rem;
  }
}
</style>
