<template>
  <div class="house-map-container">
    <!-- Search Form -->
    <div class="search-panel">
      <h2>Property Search</h2>

      <form @submit.prevent="handleSearch">
        <div class="form-row">
          <div class="form-group">
            <label for="city">City:</label>
            <input
              id="city"
              v-model="cityInput"
              type="text"
              placeholder="e.g., Orlando"
              @input="onCityInput"
            />

            <!-- Autocomplete Suggestions for City -->
            <div v-if="suggestions.length > 0" class="suggestions-list">
              <div
                v-for="(suggestion, idx) in suggestions"
                :key="idx"
                class="suggestion-item"
                @click="selectSuggestion(suggestion)"
              >
                {{ suggestion.display }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="state">State:</label>
            <input
              id="state"
              v-model="stateInput"
              type="text"
              placeholder="e.g., FL"
              maxlength="2"
              disabled
            />
          </div>
        </div>

        <div class="form-group">
          <label for="radius">Radius (miles):</label>
          <input
            id="radius"
            v-model.number="formData.radius"
            type="number"
            min="1"
            max="50"
            step="1"
            required
          />
        </div>

        <button type="submit" :disabled="isLoading || !selectedLocation">
          {{ isLoading ? 'Loading...' : 'Search' }}
        </button>
      </form>

      <!-- Status Messages -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="estimatedCount > 0" class="success-message">
        📍 {{ estimatedCount }} properties found in that {{ formData.radius }} mile radius from your selection!
      </div>
    </div>

    <!-- Map Container -->
    <div id="map-container" ref="mapContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for Leaflet default icon
// eslint-disable-next-line no-underscore-dangle
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

// State
const isLoading = ref(false)
const error = ref('')
const estimatedCount = ref(0)
const mapContainer = ref(null)
const cityInput = ref('')
const stateInput = ref('')
const suggestions = ref([])
const selectedLocation = ref(null)
let map = null
let searchCenterMarker = null
let searchRadiusCircle = null

const formData = ref({
  radius: 2
})

// Initialize map
onMounted(() => {
  map = L.map(mapContainer.value).setView([39.8283, -98.5795], 4)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
})

// Watch radius changes and update circle size
watch(
  () => formData.value.radius,
  (newRadius) => {
    if (searchRadiusCircle) {
      const radiusMeters = newRadius * 1609.34
      searchRadiusCircle.setRadius(radiusMeters)
    }
  }
)

// Handle city input and get suggestions
const onCityInput = async (event) => {
  const input = event.target.value.trim()

  if (input.length < 2) {
    suggestions.value = []
    return
  }

  try {
    // Search by city name only
    const params = new URLSearchParams({
      city: input,
      country: 'United States',
      format: 'json',
      limit: '8',
      addressdetails: '1'
    })

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`
    )
    const data = await response.json()

    console.log('City suggestions:', data)

    if (Array.isArray(data) && data.length > 0) {
      suggestions.value = data.map((result) => ({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display: result.display_name
      }))
    } else {
      suggestions.value = []
    }
  } catch (err) {
    console.error('Error fetching suggestions:', err)
    suggestions.value = []
  }
}

// Select a suggestion and store location (don't show marker yet)
const selectSuggestion = (suggestion) => {
  selectedLocation.value = suggestion

  // Extract city name from display string
  const parts = suggestion.display.split(',')
  cityInput.value = parts[0].trim()

  // Extract state - usually after city and before zip/country
  if (parts.length > 1) {
    const stateAndZip = parts[1].trim()
    // Try to extract 2-letter state code
    const stateMatch = stateAndZip.match(/\b([A-Z]{2})\b/)
    if (stateMatch) {
      stateInput.value = stateMatch[1]
    }
  }

  // Clear any existing marker/circle until Search is clicked
  if (searchCenterMarker) {
    map.removeLayer(searchCenterMarker)
    searchCenterMarker = null
  }
  if (searchRadiusCircle) {
    map.removeLayer(searchRadiusCircle)
    searchRadiusCircle = null
  }

  suggestions.value = []
  console.log(
    'Selected location:',
    suggestion.display,
    `(${suggestion.lat}, ${suggestion.lng})`
  )
}

const updateMapView = (lat, lng, radiusMeters) => {
  if (!map) return

  // Remove old marker and circle
  if (searchCenterMarker) {
    map.removeLayer(searchCenterMarker)
  }
  if (searchRadiusCircle) {
    map.removeLayer(searchRadiusCircle)
  }

  console.log(`Placing marker at: ${lat}, ${lng}`)

  // Add center marker (draggable)
  searchCenterMarker = L.marker([lat, lng], {
    draggable: true,
    icon: L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    })
  })
    .bindPopup(`📍 Search Center<br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`)
    .addTo(map)
    .openPopup()

  // Add radius circle
  searchRadiusCircle = L.circle([lat, lng], {
    radius: radiusMeters,
    color: '#4285f4',
    fillColor: '#4285f4',
    fillOpacity: 0.1,
    weight: 2,
    dashArray: '5, 5'
  }).addTo(map)

  // Keep circle synced with marker drag
  searchCenterMarker.on('drag', (event) => {
    const { lat: newLat, lng: newLng } = event.target.getLatLng()
    if (searchRadiusCircle) {
      searchRadiusCircle.setLatLng([newLat, newLng])
    }
  })

  // Update selected location after dragging
  searchCenterMarker.on('dragend', (event) => {
    const { lat: newLat, lng: newLng } = event.target.getLatLng()
    selectedLocation.value = {
      lat: newLat,
      lng: newLng,
      display: `Custom location (${newLat.toFixed(6)}, ${newLng.toFixed(6)})`
    }
    event.target.setPopupContent(
      `📍 Search Center<br/>Lat: ${newLat.toFixed(6)}<br/>Lng: ${newLng.toFixed(6)}`
    )
  })

  // Center map on location
  map.setView([lat, lng], 14)
}

const handleSearch = async () => {
  if (!selectedLocation.value) {
    error.value = 'Please select a location from suggestions'
    return
  }

  isLoading.value = true
  error.value = ''
  estimatedCount.value = 0

  try {
    const location = selectedLocation.value

    console.log(`Searching at: ${location.display}`)
    console.log(`Coordinates: Lat ${location.lat}, Lng ${location.lng}`)
    console.log(`Radius: ${formData.value.radius} miles`)
    // Show marker and circle on map
    const radiusMeters = formData.value.radius * 1609.34
    updateMapView(location.lat, location.lng, radiusMeters)

    // Call /get/circle API to get count with homeowner type filter
    const response = await fetch('/api/houses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        mile: formData.value.radius
      })
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const result = await response.json()
    estimatedCount.value = result.count || 0
    console.log(`Total count: ${estimatedCount.value}`)
  } catch (err) {
    error.value = 'Error fetching count: ' + err.message
    console.error('Search error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.house-map-container {
  display: flex;
  height: 100vh;
  gap: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, sans-serif;
}

.search-panel {
  flex-shrink: 0;
  width: 300px;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.search-panel h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
  position: relative;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group select {
  cursor: pointer;
  background-color: white;
}

.address-input-wrapper {
  position: relative;
}

.form-group input:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
}

.form-group select:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #3367d6;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fee;
  color: #c33;
  border-radius: 4px;
  font-size: 0.9rem;
  border-left: 4px solid #c33;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #efe;
  color: #3c3;
  border-radius: 4px;
  font-size: 0.9rem;
  border-left: 4px solid #3c3;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
  color: #333;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.form-group {
  position: relative;
}

#map-container {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

@media (max-width: 1200px) {
  .house-map-container {
    flex-direction: column;
  }

  .search-panel {
    width: 100%;
    max-height: 300px;
  }

  #map-container {
    flex: 1;
    min-height: 400px;
  }
}
</style>
