<template>
  <div class="landing-page">
    <!-- Navigation Banner -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h1 class="nav-title">DIRECT MAIL SPHERE</h1>
          <div class="nav-underline"></div>
          <p class="nav-subtitle">
            Revolutionizing direct mail marketing with cutting-edge targeting and campaign management
          </p>
          <p class="nav-description">
            Reach your audience effectively with our advanced platform designed for modern marketers. Create, manage, and track direct mail campaigns all in one place.
          </p>
        </div>
        <a
          v-if="!isSignedIn"
          class="signin-button"
          href="#"
          @click.prevent="goToLogin"
        >
          LOGIN
        </a>
        <a
          v-else
          class="dashboard-button"
          href="#"
          @click.prevent="goToDashboard"
        >
          DASHBOARD
        </a>
      </div>
    </nav>

    <!-- About Platform Section -->
    <section class="about-section">
      <div class="about-container">
        <div class="about-header">
          <h2 class="about-title">Why Direct Mail Sphere?</h2>
          <p class="about-tagline">Where timeless marketing meets modern automation</p>
        </div>

        <div class="about-content">
          <div class="about-column">
            <h3 class="column-title">Designed for Your Success</h3>
            <p class="about-text">
              Direct Mail Sphere is exclusively designed for realtors and brokers who want to transform direct mail into a seamless, elevated experience. With beautifully crafted business cards, eye-catching flyers, and professional postcards, our built-in templates give you the power to create polished marketing materials in minutes.
            </p>
            <p class="about-text">
              Simply create your account, post your listings, and watch as your property details effortlessly auto-fill into your designs — turning every listing into a ready-to-mail marketing masterpiece.
            </p>
          </div>

          <div class="about-column">
            <h3 class="column-title">Precision Targeting at Scale</h3>
            <p class="about-text">
              Direct Mail Sphere connects creativity with precision targeting. Purchase curated mailing lists tailored to the exact area of your listing, or send materials directly to a single address — even your own. Whether you're farming a neighborhood, announcing a new listing, or building brand recognition, you have complete control.
            </p>
            <p class="about-text highlight-text">
              This is your all-in-one command center for direct mail dominance. Elevate your presence, amplify your reach, and let every mailbox become an opportunity.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- What You Can Expect Section -->
    <section class="expectations-section">
      <div class="expectations-container">
        <h2 class="section-title">What You Can Expect</h2>
        
        <div class="cards-grid">
          <!-- Card 1: Coming Soon -->
          <div class="feature-card">
            <div class="card-image-container clickable" @click="openCardModal('coming_soon')">
              <button class="nav-arrow left-arrow" @click.stop="toggleCardSide('coming_soon', 'prev')">
                &#10094;
              </button>
              <img 
                v-if="!showingBack.coming_soon"
                src="@/assets/coming_soon_card.png" 
                alt="Coming Soon Card Front" 
                class="card-image" 
              />
              <img 
                v-else
                src="@/assets/coming_soon_card_back.png" 
                alt="Coming Soon Card Back" 
                class="card-image" 
              />
              <button class="nav-arrow right-arrow" @click.stop="toggleCardSide('coming_soon', 'next')">
                &#10095;
              </button>
            </div>
            <h3 class="card-title">Future Listings Card</h3>
            <p class="card-description">
              A card to advertise a future listing. Get your clients alert ahead of time with beautiful coming soon notifications that build excitement and anticipation.
            </p>
            <span class="card-badge">Feature</span>
          </div>

          <!-- Card 2: Spring Clean -->
          <div class="feature-card">
            <div class="card-image-container clickable" @click="openCardModal('spring_clean')">
              <button class="nav-arrow left-arrow" @click.stop="toggleCardSide('spring_clean', 'prev')">
                &#10094;
              </button>
              <img 
                v-if="!showingBack.spring_clean"
                src="@/assets/spring_clean.png" 
                alt="Spring Clean Card Front" 
                class="card-image" 
              />
              <img 
                v-else
                src="@/assets/spring_clean_back.png" 
                alt="Spring Clean Card Back" 
                class="card-image" 
              />
              <button class="nav-arrow right-arrow" @click.stop="toggleCardSide('spring_clean', 'next')">
                &#10095;
              </button>
            </div>
            <h3 class="card-title">Home Rennovations Card</h3>
            <p class="card-description">
              Alert homeowners that some home renovations are tax deductible. Help your clients understand valuable tax benefits while building your brand as a trusted advisor.
            </p>
            <span class="card-badge">Tax Deductible</span>
          </div>

          <!-- Card 3: More to Come -->
          <div class="feature-card">
            <div class="card-image-container clickable" @click="openCardModal('more_to_come')">
              <button class="nav-arrow left-arrow" @click.stop="toggleCardSide('more_to_come', 'prev')">
                &#10094;
              </button>
              <img
                v-if="!showingBack.more_to_come"
                src="@/assets/spring_clean.png"
                alt="More to Come Card Front"
                class="card-image"
              />
              <img
                v-else
                src="@/assets/spring_clean_back.png"
                alt="More to Come Card Back"
                class="card-image"
              />
              <button class="nav-arrow right-arrow" @click.stop="toggleCardSide('more_to_come', 'next')">
                &#10095;
              </button>
            </div>
            <h3 class="card-title">More to Come</h3>
            <p class="card-description">
              Direct Mail Sphere is growing! We're constantly developing new card designs and marketing solutions to give you more ways to stand out and reach your market.
            </p>
            <span class="card-badge">Growing</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>&copy; 2026 Direct Mail Sphere. All rights reserved.</p>
    </footer>

    <!-- Card Expansion Modal -->
    <div v-if="selectedCard" class="modal-overlay" @click="closeCardModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeCardModal">✕</button>
        <div class="modal-body">
          <button class="modal-nav-arrow left" @click="toggleCardSide(selectedCard, 'prev')">
            &#10094;
          </button>
          <div class="modal-image-container">
            <img 
              v-if="!showingBack[selectedCard]"
              :src="cardImages[selectedCard]?.front" 
              :alt="selectedCard + ' front'"
              class="modal-image"
            />
            <img 
              v-else
              :src="cardImages[selectedCard]?.back" 
              :alt="selectedCard + ' back'"
              class="modal-image"
            />
          </div>
          <button class="modal-nav-arrow right" @click="toggleCardSide(selectedCard, 'next')">
            &#10095;
          </button>
        </div>
        <p class="modal-label">{{ showingBack[selectedCard] ? 'Back' : 'Front' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSignedIn = ref(false)
const selectedCard = ref(null)
const showingBack = ref({
  coming_soon: false,
  spring_clean: false,
  more_to_come: false
})

const cardImages = {
  coming_soon: {
    front: new URL('@/assets/coming_soon_card.png', import.meta.url).href,
    back: new URL('@/assets/coming_soon_card_back.png', import.meta.url).href
  },
  spring_clean: {
    front: new URL('@/assets/spring_clean.png', import.meta.url).href,
    back: new URL('@/assets/spring_clean_back.png', import.meta.url).href
  },
  more_to_come: {
    front: new URL('@/assets/spring_clean.png', import.meta.url).href,
    back: new URL('@/assets/spring_clean_back.png', import.meta.url).href
  }
}

onMounted(() => {
  // Check if user is signed in by looking for cached profile
  const profile = localStorage.getItem('direct-mail-profile')
  isSignedIn.value = !!profile
})

const goToLogin = () => {
  router.push('/login')
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const openCardModal = (cardName) => {
  selectedCard.value = cardName
  showingBack.value[cardName] = false
}

const closeCardModal = () => {
  selectedCard.value = null
}

const toggleCardSide = (cardName, direction) => {
  showingBack.value[cardName] = !showingBack.value[cardName]
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

/* Navigation Bar */
.navbar {
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: none;
  padding: 0;
  box-shadow: 0 8px 24px rgba(11, 22, 48, 0.22);
  position: relative;
  margin: 20px 24px 0;
  border-radius: 16px;
  z-index: 100;
}

.nav-container {
  width: 100%;
  margin: 0;
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 420px;
  position: relative;
}

.nav-brand {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.nav-title {
  font-size: clamp(2rem, 4.8vw, 4.6rem);
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.nav-underline {
  width: min(420px, 62vw);
  height: 2px;
  background: rgba(255, 255, 255, 0.9);
  margin: 14px auto 0;
}

.nav-subtitle {
  margin-top: 20px;
  max-width: 860px;
  font-size: 21px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
}

.nav-description {
  margin-top: 10px;
  max-width: 740px;
  font-size: 15px;
  color: rgba(226, 236, 255, 0.95);
  line-height: 1.6;
}

.signin-button,
.dashboard-button {
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 17px;
}

.signin-button:hover,
.dashboard-button:hover {
  background: transparent;
  color: #ffffff;
  text-decoration: underline;
  text-underline-offset: 4px;
  transform: none;
  box-shadow: none;
}

.signin-button:focus-visible,
.dashboard-button:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 6px;
  border-radius: 4px;
}

/* Hero Section */
.hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
}

.hero-content h2 {
  font-size: 48px;
  font-weight: 700;
  color: #0f1f3d;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 22px;
  color: #3d5aff;
  font-weight: 600;
  margin-bottom: 16px;
}

.hero-description {
  font-size: 16px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 32px;
}

.cta-button {
  padding: 14px 40px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #3d5aff 0%, #5281ff 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(61, 90, 255, 0.3);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(61, 90, 255, 0.4);
}

/* About Platform Section */
.about-section {
  padding: 80px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-top: 1px solid #e0e7ff;
  border-bottom: 1px solid #e0e7ff;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
}

.about-header {
  text-align: center;
  margin-bottom: 60px;
}

.about-title {
  font-size: clamp(2rem, 3.2vw, 2.35rem);
  font-weight: 700;
  color: #0f1f3d;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.about-tagline {
  font-size: 18px;
  color: #3d5aff;
  font-weight: 500;
  line-height: 1.5;
}

.about-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 48px;
  align-items: start;
}

.about-column {
  padding: 32px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e7ff;
  box-shadow: 0 4px 12px rgba(61, 90, 255, 0.08);
  transition: all 0.3s ease;
}

.about-column:hover {
  border-color: #3d5aff;
  box-shadow: 0 8px 24px rgba(61, 90, 255, 0.15);
  transform: translateY(-4px);
}

.column-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f1f3d;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 3px solid #3d5aff;
  display: inline-block;
}

.about-text {
  font-size: 15px;
  color: #555;
  line-height: 1.7;
  margin-bottom: 16px;
}

.about-text:last-child {
  margin-bottom: 0;
}

.highlight-text {
  background: linear-gradient(135deg, rgba(61, 90, 255, 0.1) 0%, rgba(82, 129, 255, 0.1) 100%);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3d5aff;
  font-weight: 500;
  color: #0f1f3d;
}

/* Expectations Section */
.expectations-section {
  padding: 80px 24px;
  background: #ffffff;
}

.expectations-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: clamp(2rem, 3.2vw, 2.35rem);
  font-weight: 700;
  color: #0f1f3d;
  text-align: center;
  margin-bottom: 60px;
  letter-spacing: -0.01em;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  align-items: stretch;
}

.feature-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border: 2px solid #e0e7ff;
  border-radius: 12px;
  overflow: hidden;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: #3d5aff;
  box-shadow: 0 12px 24px rgba(61, 90, 255, 0.15);
}

.card-title {
  font-size: 23px;
  font-weight: 700;
  color: #0f1f3d;
  margin: 24px 24px 16px 24px;
  line-height: 1.35;
}

.card-description {
  font-size: 15.5px;
  color: #555;
  line-height: 1.65;
  margin: 0 24px 20px 24px;
  flex-grow: 1;
}

.card-badge {
  display: inline-block;
  background: #3d5aff;
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 24px;
}

.card-image-container {
  width: 100%;
  height: 220px;
  margin: 0;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.card-image-container.clickable {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.card-image-container.clickable:hover {
  transform: scale(1.02);
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  opacity: 0;
}

.card-image-container.clickable:hover .nav-arrow {
  opacity: 1;
}

.nav-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow.left-arrow {
  left: 8px;
}

.nav-arrow.right-arrow {
  right: 8px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.feature-card:hover .card-image {
  transform: scale(1.05);
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 28px;
  color: #555;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f0f0f0;
  color: #000;
}

.modal-body {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  position: relative;
}

.modal-image-container {
  flex: 1;
  max-width: 400px;
}

.modal-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
  max-height: 80vh;
  object-fit: contain;
}

.modal-nav-arrow {
  background: #3d5aff;
  color: #ffffff;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.modal-nav-arrow:hover {
  background: #5281ff;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(61, 90, 255, 0.3);
}

.modal-label {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Footer */
.footer {
  background: #0f1f3d;
  color: #c9d8ff;
  text-align: center;
  padding: 24px;
  margin-top: auto;
  border-top: 1px solid #3d5aff;
}

.footer p {
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content h2 {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 18px;
  }

  .nav-title {
    letter-spacing: 0.05em;
  }

  .nav-subtitle {
    margin-top: 16px;
    font-size: 18px;
  }

  .nav-description {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.55;
  }

  .navbar {
    margin: 14px 14px 0;
    border-radius: 10px;
  }

  .nav-container {
    min-height: 310px;
    padding: 22px 16px;
  }

  .signin-button,
  .dashboard-button {
    top: 14px;
    right: 14px;
    font-size: 14px;
  }

  .section-title {
    font-size: 28px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .about-title {
    font-size: 28px;
  }

  .about-tagline {
    font-size: 16px;
  }

  .about-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .about-column {
    padding: 24px;
  }

  .column-title {
    font-size: 18px;
  }

  .about-text {
    font-size: 14px;
  }

  .modal-body {
    flex-direction: column;
    gap: 16px;
  }

  .modal-nav-arrow {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .modal-image-container {
    max-width: 100%;
  }

  .modal-content {
    padding: 24px;
    width: 95%;
  }
}
</style>
