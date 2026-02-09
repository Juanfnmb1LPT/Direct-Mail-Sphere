<template>
  <div class="templates-container">
    <button type="button" class="back-button" @click="goToDashboard">
      Back to dashboard
    </button>
    <div class="templates-card">
      <h2>Select a Template</h2>
      <p class="templates-subtitle">Choose one of the 10 layouts to start your mailer.</p>

      <div class="templates-grid">
        <button
          v-for="template in templates"
          :key="template.id"
          type="button"
          :class="['template-tile', { selected: selectedTemplate === template.id }]"
          @click="selectedTemplate = template.id"
        >
          <span class="template-title">{{ template.name }}</span>
        </button>
      </div>

      <button
        type="button"
        class="primary-button"
        :disabled="!selectedTemplate"
        @click="goToForm"
      >
        Continue to form
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedTemplate = ref('')

const templates = [
  { id: 'template-1', name: 'Template 1' },
  { id: 'template-2', name: 'Template 2 - TODO' },
  { id: 'template-3', name: 'Template 3 - TODO' },
  { id: 'template-4', name: 'Template 4 - TODO' },
  { id: 'template-5', name: 'Template 5 - TODO' },
  { id: 'template-6', name: 'Template 6 - TODO' },
  { id: 'template-7', name: 'Template 7 - TODO' },
  { id: 'template-8', name: 'Template 8 - TODO' },
  { id: 'template-9', name: 'Template 9 - TODO' },
  { id: 'template-10', name: 'Template 10 - TODO' }
]

const goToForm = () => {
  router.push({ path: '/create-mail/form', query: { template: selectedTemplate.value } })
}

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.templates-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #d6e6ff;
  width: 100%;
  padding: 24px;
  position: relative;
}

.back-button {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(82, 129, 255, 0.45);
  background: rgba(11, 26, 56, 0.7);
  color: #c9d8ff;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  border-color: #5281ff;
  color: #ffffff;
  background: rgba(11, 26, 56, 0.9);
}

.templates-card {
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: 1px solid #3d5aff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(61, 90, 255, 0.5);
  padding: clamp(2rem, 5vw, 3rem);
  width: 100%;
  max-width: 720px;
}

.templates-card h2 {
  text-align: center;
  margin-bottom: 8px;
  color: #ffffff;
  font-weight: 700;
  font-size: clamp(1.6rem, 5vw, 2.1rem);
  letter-spacing: 0.3px;
}

.templates-subtitle {
  text-align: center;
  color: #b8c9ff;
  font-size: 0.95rem;
  margin-bottom: 24px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.template-tile {
  text-align: left;
  padding: 16px;
  border-radius: 14px;
  border: 1.5px solid rgba(82, 129, 255, 0.35);
  background: rgba(11, 26, 56, 0.72);
  color: #c9d8ff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-tile:hover {
  border-color: #5281ff;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(82, 129, 255, 0.25);
}

.template-tile.selected {
  border-color: #5281ff;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(82, 129, 255, 0.35);
  background: linear-gradient(135deg, #4a78ff, #2f58d9);
}

.template-title {
  font-size: 1rem;
  font-weight: 700;
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
}

.primary-button:hover {
  background: linear-gradient(135deg, #6a94ff, #5281ff);
  box-shadow: 0 12px 28px rgba(82, 129, 255, 0.45);
  transform: translateY(-2px);
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
  transform: none;
}
</style>
