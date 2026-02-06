<template>
  <div class="create-mail-container">
    <button type="button" class="back-button" @click="goToDashboard">
      Back to dashboard
    </button>
    <div class="create-mail-box">
      <h2>Create Mail</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="address">Address</label>
          <input
            id="address"
            v-model.trim="address"
            type="text"
            placeholder="123 Main St, City, ST 00000"
            autocomplete="street-address"
            required
          />
        </div>

        <div class="two-column">
          <div class="form-group">
            <label for="audience-size">Audience size</label>
            <input
              id="audience-size"
              v-model.number="audienceSize"
              type="number"
              min="1"
              placeholder="250"
              required
            />
          </div>
          <div class="form-group">
            <label for="name">Name</label>
            <input
              id="name"
              v-model.trim="name"
              type="text"
              placeholder="Your name"
              autocomplete="name"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="header">Header</label>
          <input
            id="header"
            v-model.trim="header"
            type="text"
            placeholder="Welcome to our spring offer"
            required
          />
        </div>

        <div class="form-group">
          <label for="bio">Bio</label>
          <textarea
            id="bio"
            v-model.trim="bio"
            rows="4"
            placeholder="Short bio or message"
            required
          ></textarea>
        </div>

        <div v-if="success" class="success-message">
          Draft created. You can refine details next.
        </div>

        <button type="submit" class="primary-button">Create mail</button>
      </form>

      <button type="button" class="link-button" @click="goToDashboard">
        Back to dashboard
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const address = ref('')
const audienceSize = ref(null)
const name = ref('')
const header = ref('')
const bio = ref('')
const success = ref(false)

const handleSubmit = () => {
  const rows = [
    ['address', 'audience_size', 'name', 'header', 'bio'],
    [address.value, audienceSize.value, name.value, header.value, bio.value]
  ]

  const csv = rows
    .map((row) =>
      row
        .map((value) => {
          const cell = value === null || value === undefined ? '' : String(value)
          return `"${cell.replace(/"/g, '""')}"`
        })
        .join(',')
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'create-mail.csv'
  link.click()
  URL.revokeObjectURL(url)
  success.value = true
}

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.create-mail-container {
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

.create-mail-box {
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: 1px solid #3d5aff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(61, 90, 255, 0.5);
  padding: clamp(2rem, 5vw, 3rem);
  width: 100%;
  max-width: 460px;
}

.create-mail-box h2 {
  text-align: center;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  color: #ffffff;
  font-weight: 700;
  font-size: clamp(1.5rem, 5vw, 2rem);
  letter-spacing: 0.3px;
}

.two-column {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 16px;
}

.form-group {
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
}

.form-group label {
  display: block;
  margin-bottom: clamp(0.5rem, 2vw, 0.75rem);
  color: #b8c9ff;
  font-weight: 600;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: clamp(10px, 2vw, 14px);
  border: 2px solid rgba(79, 124, 255, 0.3);
  border-radius: 10px;
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  background-color: rgba(11, 26, 56, 0.8);
  color: #ffffff;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5281ff;
  background-color: rgba(11, 26, 56, 0.95);
  box-shadow: 0 0 0 3px rgba(82, 129, 255, 0.15);
}

.form-group select {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #9ab0ff 50%),
    linear-gradient(135deg, #9ab0ff 50%, transparent 50%);
  background-position: calc(100% - 20px) calc(1em + 2px),
    calc(100% - 15px) calc(1em + 2px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
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
  margin-top: clamp(0.5rem, 2vw, 1rem);
}

.primary-button:hover {
  background: linear-gradient(135deg, #6a94ff, #5281ff);
  box-shadow: 0 12px 28px rgba(82, 129, 255, 0.45);
  transform: translateY(-2px);
}

.primary-button:active {
  transform: translateY(0);
}

.link-button {
  margin-top: clamp(0.75rem, 2.5vw, 1rem);
  background: none;
  border: none;
  color: #b8c9ff;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  font-weight: 600;
  cursor: pointer;
  padding: 6px 4px;
  transition: color 0.3s ease;
  text-align: center;
  width: 100%;
}

.link-button:hover {
  color: #5281ff;
}

.success-message {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(24, 140, 80, 0.2);
  color: #b8ffda;
  border: 1px solid rgba(24, 140, 80, 0.5);
  font-size: 0.9rem;
}
</style>
