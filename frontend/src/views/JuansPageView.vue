<template>
  <main>
    <div class="juans-page-container">
    <h1>Juan's Page</h1>
    <button type="button" class="action-button" @click="openPersonalWebsite">
      Gaming Website
    </button>
    <button type="button" class="action-button" @click="openBestLanguageLink">
      whats the best coding language:
    </button>
    <button type="button" class="action-button" @click="showHello = true">
      Blow your mind!
    </button>
    <p v-if="showHello" class="hello-text">hello world</p>
  </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const showHello = ref(false)

const openPersonalWebsite = () => {
  window.open('https://store.steampowered.com/app/2379780/Balatro/', '_blank', 'noopener,noreferrer')
}

const openBestLanguageLink = () => {
  window.open('https://www.php.net/', '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.juans-page-container {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 12px;
  text-align: center;
  padding: 24px;
}

h1 {
  margin: 0;
  color: #0b1630;
}

.action-button {
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #4a78ff, #2f58d9);
  color: #ffffff;
  font-weight: 700;
  padding: 10px 16px;
  cursor: pointer;
}

.hello-text {
  margin: 0;
  color: #0b1630;
  font-weight: 600;
  text-align: center;
}
</style>
