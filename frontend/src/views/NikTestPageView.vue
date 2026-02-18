<template>
  <main>
    <div class="nik-test-root">
    <section class="dashboard-page">
      <div class="dashboard-content">
        <div class="dashboard-hero">
          <p class="welcome-label">Nik test page</p>
          <h2 class="dashboard-heading">Fun projects dashboard</h2>
          <p class="dashboard-subtitle">Each tile is a project we can build together.</p>
        </div>

        <div class="dashboard-grid">
          <button
            v-for="project in projects"
            :key="project.title"
            class="dashboard-action-card project-card"
            type="button"
            @click="openProject(project)"
          >
            <div class="card-header">
              <span class="card-icon" aria-hidden="true">{{ project.icon }}</span>
              <h3>{{ project.title }}</h3>
            </div>
            <p>{{ project.blurb }}</p>
          </button>
        </div>
      </div>
    </section>

    <div v-if="activeProject" class="project-modal" @click.self="closeProject">
      <div class="project-modal-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p class="modal-kicker">Project details</p>
            <h3 class="modal-title">{{ activeProject.title }}</h3>
          </div>
          <button class="modal-close" type="button" @click="closeProject" aria-label="Close">
            ✕
          </button>
        </div>
        <div class="modal-content">
          <p v-if="activeProject.id !== 'volume-control-fun'" class="modal-body">{{ activeProject.details }}</p>
          <div v-else class="volume-module">
            <div class="volume-header">
              <p class="volume-label">Current volume</p>
              <p class="volume-value">{{ volume }}%</p>
            </div>

            <div class="volume-section">
              <div class="volume-section-header">
                <h4 class="volume-section-title">Random button</h4>
                <p class="volume-section-text">Press to set a random volume between 0 and 100%.</p>
              </div>
              <div class="volume-section-actions">
                <button class="volume-button" type="button" @click="setRandomVolume">Random button</button>
              </div>
            </div>

            <div class="volume-section">
              <div class="volume-section-header">
                <h4 class="volume-section-title">Hidden timer</h4>
                <p class="volume-section-text">Start the 10-second timer, then stop it to set volume.</p>
              </div>
              <div class="volume-section-actions">
                <button
                  class="volume-button outline"
                  type="button"
                  :disabled="isTimerRunning"
                  @click="startHiddenTimer"
                >
                  Start hidden timer
                </button>
                <button
                  class="volume-button outline"
                  :class="{ 'is-active': isTimerRunning }"
                  type="button"
                  :disabled="!isTimerRunning"
                  @click="stopHiddenTimer"
                >
                  Stop timer
                </button>
              </div>
              <p v-if="timerSeconds !== null" class="volume-result">
                Hidden timer result: {{ timerResult }}% ({{ timerSeconds }}s)
              </p>
            </div>

            <div class="volume-section">
              <div class="volume-section-header">
                <h4 class="volume-section-title">Draw a circle</h4>
                <p class="volume-section-text">The closer your drawing is to a perfect circle, the higher the volume.</p>
              </div>
              <div class="volume-section-actions">
                <button class="volume-button outline" type="button" @click="clearCanvas">Clear drawing</button>
              </div>
              <div class="volume-draw-area">
                <canvas
                  ref="circleCanvas"
                  class="volume-canvas"
                  width="360"
                  height="240"
                  @pointerdown="startDraw"
                  @pointermove="draw"
                  @pointerup="endDraw"
                  @pointerleave="endDraw"
                ></canvas>
                <p v-if="circleScore !== null" class="volume-score">Circle score: {{ circleScore }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const projects = [
  {
    id: 'volume-control-fun',
    title: 'Volume Control Fun',
    icon: '🧭',
    blurb: 'Play with volume using a random button or a drawn circle.',
    details: 'Pick a volume using a random button or by drawing a circle to set the value.'
  },
  {
    id: 'launch-pad',
    title: 'Launch Pad',
    icon: '🎯',
    blurb: 'Small, fast experiments we can ship in a single session.',
    details: 'Rapid prototypes, tiny utilities, and focused improvements we can finish quickly.'
  },
  {
    id: 'widget-workshop',
    title: 'Widget Workshop',
    icon: '🧩',
    blurb: 'Reusable components and UI ideas for the main app.',
    details: 'Build, test, and polish UI components that can graduate into the product.'
  },
  {
    id: 'prototype-lab',
    title: 'Prototype Lab',
    icon: '🧪',
    blurb: 'Sandbox for testing new flows before rolling them out.',
    details: 'Try risky ideas, explore UX experiments, and validate flows with low stakes.'
  },
  {
    id: 'idea-notes',
    title: 'Idea Notes',
    icon: '📝',
    blurb: 'Quick brainstorms and TODOs we want to explore next.',
    details: 'Capture inspiration, outline user stories, and keep a running backlog of curiosities.'
  },
  {
    id: 'launch-queue',
    title: 'Launch Queue',
    icon: '🚀',
    blurb: 'The shortlist of ideas we want to ship soon.',
    details: 'Prioritized projects ready for build time, along with rough timelines and owners.'
  }
]

const activeProject = ref(null)
const volume = ref(50)
const circleScore = ref(null)
const circleCanvas = ref(null)
const timerResult = ref(null)
const timerSeconds = ref(null)
const isTimerRunning = ref(false)
let isDrawing = false
let points = []
let timerId = null
let timerStart = null

const getNow = () => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now()
  }
  return Date.now()
}

const openProject = (project) => {
  activeProject.value = project
}

const closeProject = () => {
  timerResult.value = null
  timerSeconds.value = null
  stopHiddenTimer(true)
  activeProject.value = null
}

const setVolume = (value) => {
  const nextValue = Math.max(0, Math.min(100, Math.round(value)))
  volume.value = nextValue
}

const setRandomVolume = () => {
  circleScore.value = null
  setVolume(Math.random() * 100)
}

const startHiddenTimer = () => {
  if (isTimerRunning.value) {
    return
  }
  timerResult.value = null
  timerSeconds.value = null
  timerStart = getNow()
  isTimerRunning.value = true
  timerId = window.setTimeout(() => {
    stopHiddenTimer()
  }, 10000)
}

const stopHiddenTimer = (silent = false) => {
  if (!isTimerRunning.value || timerStart === null) {
    return
  }
  if (timerId) {
    clearTimeout(timerId)
    timerId = null
  }
  const elapsedMs = Math.min(10000, getNow() - timerStart)
  const elapsedSeconds = Math.round((elapsedMs / 1000) * 10) / 10
  const percent = Math.round((elapsedMs / 10000) * 100)
  timerSeconds.value = elapsedSeconds
  setVolume(percent)
  if (!silent) {
    timerResult.value = percent
  }
  isTimerRunning.value = false
  timerStart = null
}

const getCanvasContext = () => {
  const canvas = circleCanvas.value
  if (!canvas) {
    return null
  }
  return canvas.getContext('2d')
}

const getCanvasPoint = (event) => {
  const canvas = circleCanvas.value
  if (!canvas) {
    return null
  }
  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

const startDraw = (event) => {
  const ctx = getCanvasContext()
  const point = getCanvasPoint(event)
  if (!ctx || !point) {
    return
  }
  isDrawing = true
  points = [point]
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#3d5aff'
  ctx.beginPath()
  ctx.moveTo(point.x, point.y)
}

const draw = (event) => {
  if (!isDrawing) {
    return
  }
  const ctx = getCanvasContext()
  const point = getCanvasPoint(event)
  if (!ctx || !point) {
    return
  }
  points.push(point)
  ctx.lineTo(point.x, point.y)
  ctx.stroke()
}

const computeCircleScore = () => {
  if (points.length < 10) {
    return 0
  }
  const centroid = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  )
  centroid.x /= points.length
  centroid.y /= points.length
  const distances = points.map((point) => {
    const dx = point.x - centroid.x
    const dy = point.y - centroid.y
    return Math.sqrt(dx * dx + dy * dy)
  })
  const mean = distances.reduce((sum, value) => sum + value, 0) / distances.length
  if (mean === 0) {
    return 0
  }
  const variance = distances.reduce((sum, value) => sum + (value - mean) ** 2, 0) / distances.length
  const deviation = Math.sqrt(variance)
  const baseScore = Math.max(0, 1 - deviation / mean)
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const closureDistance = Math.hypot(firstPoint.x - lastPoint.x, firstPoint.y - lastPoint.y)
  const closurePenalty = Math.max(0, 1 - closureDistance / (mean * 1.15))
  const weightedScore = baseScore * closurePenalty
  const scaledScore = Math.pow(Math.max(0, weightedScore), 1.8) * 100
  return Math.max(0, Math.min(100, Math.round(scaledScore)))
}

const endDraw = () => {
  if (!isDrawing) {
    return
  }
  isDrawing = false
  const score = computeCircleScore()
  circleScore.value = score
  setVolume(score)
}

const clearCanvas = () => {
  const ctx = getCanvasContext()
  if (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }
  points = []
  circleScore.value = null
}
</script>

<style scoped>
.dashboard-page {
  min-height: calc(100vh - 190px);
  background: linear-gradient(135deg, #ffffff 0%, #e3eeff 52%, #cfdfff 100%);
  padding: 30px 24px 34px;
}

.dashboard-content {
  max-width: 1100px;
  margin: 0 auto;
}

.dashboard-hero {
  background: linear-gradient(135deg, #ffffff 0%, #eef5ff 60%, #ddeaff 100%);
  border-radius: 16px;
  padding: 22px 24px;
  border: 1px solid rgba(15, 31, 61, 0.14);
  box-shadow: 0 10px 20px rgba(11, 22, 48, 0.08);
  margin-bottom: 18px;
}

.welcome-label {
  margin: 0;
  color: #264173;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  font-weight: 600;
}

.dashboard-heading {
  margin: 6px 0 0;
  color: #0b1630;
  font-size: clamp(1.8rem, 4.2vw, 2.4rem);
}

.dashboard-subtitle {
  margin: 8px 0 0;
  color: #264173;
  font-weight: 600;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.dashboard-action-card {
  display: block;
  background: linear-gradient(135deg, #f2f7ff 0%, #dbe9ff 55%, #bfd5ff 100%);
  border: 1.5px solid rgba(15, 31, 61, 0.2);
  border-radius: 6px;
  padding: 20px;
  text-decoration: none;
  color: #0b1630;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.project-card {
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.card-icon {
  width: 28px;
  min-width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0f2d66;
  font-size: 1.2rem;
}

.dashboard-action-card h3 {
  margin: 0;
  font-size: 1.08rem;
}

.dashboard-action-card p {
  margin: 0;
  color: #264173;
  line-height: 1.4;
}

.dashboard-action-card:hover {
  transform: translateY(-3px);
  border-color: #3d5aff;
  box-shadow: 0 12px 24px rgba(11, 22, 48, 0.14);
}

.project-modal {
  position: fixed;
  inset: 0;
  background: rgba(10, 18, 38, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 20;
}

.project-modal-card {
  width: min(560px, 100%);
  background: linear-gradient(135deg, #ffffff 0%, #eef5ff 70%, #ddeaff 100%);
  border-radius: 16px;
  border: 1px solid rgba(15, 31, 61, 0.14);
  box-shadow: 0 18px 36px rgba(11, 22, 48, 0.2);
  padding: 22px 24px;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.modal-kicker {
  margin: 0;
  color: #264173;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  font-weight: 600;
}

.modal-title {
  margin: 6px 0 0;
  color: #0b1630;
  font-size: 1.4rem;
}

.modal-body {
  margin: 16px 0 0;
  color: #264173;
  line-height: 1.5;
}

.modal-content {
  margin-top: 12px;
}

.volume-module {
  display: grid;
  gap: 16px;
}

.volume-section {
  border-radius: 14px;
  border: 1px solid rgba(15, 31, 61, 0.14);
  background: rgba(255, 255, 255, 0.7);
  padding: 16px;
  display: grid;
  gap: 12px;
}

.volume-section-header {
  display: grid;
  gap: 6px;
}

.volume-section-title {
  margin: 0;
  color: #0b1630;
  font-size: 1.05rem;
}

.volume-section-text {
  margin: 0;
  color: #264173;
}

.volume-section-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.volume-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.volume-label {
  margin: 0;
  color: #264173;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  font-weight: 600;
}

.volume-value {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #0b1630;
}

.volume-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.volume-button {
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #5281ff, #3b6cff);
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(11, 22, 48, 0.12);
}

.volume-button.outline {
  background: transparent;
  color: #0b1630;
  border: 1px solid rgba(15, 31, 61, 0.2);
  box-shadow: none;
}

.volume-button.is-active {
  background: linear-gradient(135deg, #0f2d66, #1c3f9a);
  color: #ffffff;
  border-color: transparent;
}

.volume-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.volume-draw-area {
  display: grid;
  gap: 12px;
}

.volume-instructions {
  margin: 0;
  color: #264173;
}

.volume-canvas {
  width: 100%;
  max-width: 480px;
  height: auto;
  border-radius: 12px;
  border: 1px solid rgba(15, 31, 61, 0.2);
  background: #ffffff;
  touch-action: none;
}

.volume-score {
  margin: 0;
  color: #264173;
  font-weight: 600;
}

.volume-result {
  margin: 0;
  color: #264173;
  font-weight: 600;
}

.modal-close {
  border: none;
  background: rgba(15, 31, 61, 0.08);
  color: #0b1630;
  font-size: 1rem;
  line-height: 1;
  border-radius: 999px;
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.dashboard-stat-card {
  cursor: default;
  text-align: center;
}

.dashboard-stat-card .stat-title {
  margin: 0;
  font-size: 1.08rem;
  color: #0b1630;
}

.dashboard-stat-card .stat-note {
  margin: 0 0 6px;
  font-size: 0.78rem;
  color: #3b588a;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dashboard-stat-card .stat-value {
  margin: 8px 0 0;
  font-size: 2rem;
  font-weight: 800;
  color: #0f2d66;
}

@media (max-width: 768px) {
  .dashboard-page {
    min-height: calc(100vh - 180px);
    padding: 24px 14px;
  }

  .dashboard-hero {
    padding: 18px 16px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
