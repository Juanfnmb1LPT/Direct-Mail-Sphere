<template>
  <div class="templates-container">
    <div class="templates-shell">
      <div class="templates-section">
        <div class="templates-heading">
          <h2>Market a Listing</h2>
          <p class="section-subtitle">Use these cards to showcase your listing clearly and attract attention fast.</p>
        </div>

        <div class="row-carousel">
          <button type="button" class="carousel-arrow" @click="showPreviousFirst" aria-label="Previous market templates">
            &#10094;
          </button>
          <div class="templates-row five-across">
            <button
              v-for="template in firstGroupTemplates"
              :key="template.id"
              type="button"
              :class="['template-tile', { selected: selectedTemplate === template.id }]"
              @click="openTemplateFocus(template.id)"
            >
              <img v-if="template.image" :src="template.image" :alt="template.name" class="template-image" />
              <span class="template-title">{{ template.name }}</span>
            </button>
          </div>
          <button type="button" class="carousel-arrow" @click="showNextFirst" aria-label="Next market templates">
            &#10095;
          </button>
        </div>
      </div>

      <div class="templates-section">
        <div class="templates-heading">
          <h2>Creative marketing to stand out</h2>
          <p class="section-subtitle">A variety of different cards to market your way to customers in unique ways.</p>
        </div>

        <div class="row-carousel">
          <button type="button" class="carousel-arrow" @click="showPreviousSecond" aria-label="Previous creative templates">
            &#10094;
          </button>
          <div class="templates-row five-across">
            <button
              v-for="template in secondGroupTemplates"
              :key="template.id"
              type="button"
              :class="['template-tile', { selected: selectedTemplate === template.id }]"
              @click="openTemplateFocus(template.id)"
            >
              <img v-if="template.image" :src="template.image" :alt="template.name" class="template-image" />
              <span class="template-title">{{ template.name }}</span>
            </button>
          </div>
          <button type="button" class="carousel-arrow" @click="showNextSecond" aria-label="Next creative templates">
            &#10095;
          </button>
        </div>
      </div>

      <div v-if="isFocusOpen && focusedTemplate" class="template-focus-overlay" @click.self="closeTemplateFocus">
        <div class="template-focus-card">
          <button type="button" class="close-focus" @click="closeTemplateFocus" aria-label="Close preview">✕</button>
          <img
            v-if="focusedTemplate.image"
            :src="focusedTemplate.image"
            :alt="focusedTemplate.name"
            class="focus-image"
          />
          <h3 class="focus-title">{{ focusedTemplate.name }}</h3>
          <button type="button" class="use-template-button" @click="goToForm">
            Use this template
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedTemplate = ref('')
const isFocusOpen = ref(false)
const firstStartIndex = ref(0)
const secondStartIndex = ref(0)
const visibleCount = 3

const templates = [
  { id: 'template-1', name: 'Template 1- Spring Clean', image: new URL('../assets/spring_clean.png', import.meta.url).href },
  { id: 'template-2', name: 'Template 2- Listing Coming Soon', image: new URL('../assets/coming_soon_card.png', import.meta.url).href },
  { id: 'template-3', name: 'Template 3 - Just Sold', image: new URL('../assets/template-3-just-sold.png', import.meta.url).href },
  { id: 'template-4', name: 'Template 4 - For Sale', image: new URL('../assets/template-4-for-sale.png', import.meta.url).href },
  { id: 'template-5', name: 'Template 5 - Open House', image: new URL('../assets/template-5-open-house.png', import.meta.url).href },
  { id: 'template-6', name: 'Template 6 - Mult Listings Postcard', image: new URL('../assets/template-6-mult-listings-postcard.png', import.meta.url).href },
  { id: 'template-7', name: 'Template 7 - Review', image: new URL('../assets/template-7-review.png', import.meta.url).href },
  { id: 'template-8', name: "Template 8 - What's your home worth", image: new URL("../assets/template-8-what's-your-home-worth.png", import.meta.url).href },
  { id: 'template-9', name: 'Template 9 - Neighborhood Market Update', image: new URL('../assets/template-9-neighborhood-market-update.png', import.meta.url).href },
  { id: 'template-10', name: 'Template 10 - Local Biz', image: new URL('../assets/template-10-local-biz.png', import.meta.url).href }
]

const marketListingTemplateIds = ['template-2', 'template-3', 'template-4', 'template-5', 'template-6', 'template-9']

const firstTemplatePool = computed(() =>
  templates.filter((template) => marketListingTemplateIds.includes(template.id))
)

const secondTemplatePool = computed(() =>
  templates.filter((template) => !marketListingTemplateIds.includes(template.id))
)

const circularSlice = (pool, start) =>
  Array.from({ length: visibleCount }, (_, index) => pool[(start + index) % pool.length])

const firstGroupTemplates = computed(() => circularSlice(firstTemplatePool.value, firstStartIndex.value))
const secondGroupTemplates = computed(() => circularSlice(secondTemplatePool.value, secondStartIndex.value))
const focusedTemplate = computed(() => templates.find((template) => template.id === selectedTemplate.value) || null)

const selectTemplate = (templateId) => {
  selectedTemplate.value = templateId
}

const openTemplateFocus = (templateId) => {
  selectTemplate(templateId)
  isFocusOpen.value = true
}

const closeTemplateFocus = () => {
  isFocusOpen.value = false
}

const showPreviousFirst = () => {
  firstStartIndex.value = (firstStartIndex.value - 1 + firstTemplatePool.value.length) % firstTemplatePool.value.length
}

const showNextFirst = () => {
  firstStartIndex.value = (firstStartIndex.value + 1) % firstTemplatePool.value.length
}

const showPreviousSecond = () => {
  secondStartIndex.value = (secondStartIndex.value - 1 + secondTemplatePool.value.length) % secondTemplatePool.value.length
}

const showNextSecond = () => {
  secondStartIndex.value = (secondStartIndex.value + 1) % secondTemplatePool.value.length
}

const goToForm = () => {
  if (!selectedTemplate.value) return
  router.push({ path: '/create-mail/form', query: { template: selectedTemplate.value } })
}
</script>

<style scoped>
.templates-container {
  min-height: 100vh;
  display: block;
  background-color: #d6e6ff;
  width: 100%;
  padding: 32px 28px;
}

.templates-shell {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.templates-section {
  margin-bottom: 36px;
}

.templates-section + .templates-section {
  padding-top: 8px;
}

.templates-heading h2 {
  text-align: left;
  margin: 0;
  color: #0b1630;
  font-weight: 700;
  font-size: clamp(1.6rem, 5vw, 2.1rem);
  letter-spacing: 0.3px;
  margin-bottom: 16px;
}

.section-subtitle {
  margin: -8px 0 14px;
  color: #264173;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
}

.templates-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.row-carousel {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
}

.carousel-arrow {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(15, 31, 61, 0.24);
  background: #ffffff;
  color: #0b1630;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.carousel-arrow:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(11, 22, 48, 0.14);
}

.five-across {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.template-tile {
  text-align: left;
  padding: 0;
  border-radius: 14px;
  border: 1.5px solid rgba(15, 31, 61, 0.2);
  background: #ffffff;
  color: #0b1630;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  position: relative;
}

.template-tile:hover {
  border-color: #3d5aff;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(11, 22, 48, 0.14);
}

.template-tile.selected {
  border-color: #3d5aff;
  border-width: 2px;
  box-shadow: 0 14px 28px rgba(82, 129, 255, 0.32);
  transform: scale(1.04);
}

.template-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.template-title {
  font-size: 1rem;
  font-weight: 700;
  padding: 12px 16px;
  background: rgba(11, 26, 56, 0.9);
  color: #ffffff;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.template-focus {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  font-size: 0.78rem;
  font-weight: 700;
  background: rgba(11, 22, 48, 0.84);
  color: #ffffff;
  padding: 6px 10px;
  border-radius: 999px;
}

.template-focus-overlay {
  position: fixed;
  inset: 0;
  background: rgba(11, 22, 48, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}

.template-focus-card {
  width: min(670px, 86vw);
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 24px 50px rgba(11, 22, 48, 0.35);
  position: relative;
  animation: zoomInCard 0.24s ease-out;
}

.focus-image {
  width: 100%;
  height: min(46vh, 400px);
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(15, 31, 61, 0.15);
}

.focus-title {
  margin: 12px 4px;
  color: #0b1630;
  font-size: 1.15rem;
  font-weight: 700;
}

.close-focus {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(11, 22, 48, 0.85);
  color: #ffffff;
  cursor: pointer;
  font-size: 16px;
  z-index: 2;
}

@keyframes zoomInCard {
  from {
    opacity: 0;
    transform: scale(0.86);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.use-template-button {
  position: static;
  transform: none;
  width: 100%;
  padding: 10px 12px;
  background: linear-gradient(135deg, #5281ff, #3b6cff);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(82, 129, 255, 0.3);
}

.use-template-button:hover {
  background: linear-gradient(135deg, #6a94ff, #5281ff);
  box-shadow: 0 12px 28px rgba(82, 129, 255, 0.45);
  transform: translateY(-1px);
}

@media (max-width: 980px) {
  .row-carousel {
    grid-template-columns: 1fr;
  }

  .carousel-arrow {
    width: 100%;
    border-radius: 10px;
  }

  .templates-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .templates-row {
    grid-template-columns: 1fr;
  }
}
</style>
