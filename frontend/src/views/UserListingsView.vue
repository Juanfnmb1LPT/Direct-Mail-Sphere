<template>
  <main>
    <div class="listings-container">
    <div class="listings-layout">
      <div class="listings-header">
        <h2>User Listings</h2>
        <p class="subtitle">Add, edit, or remove your active listings.</p>
      </div>

      <div class="listings-toolbar">
        <input
          v-model.trim="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search by address, city, state, zip, or country"
          aria-label="Search listings"
        />
        <button type="button" class="primary-button" @click="openCreate">
          Add new listing
        </button>
        <button type="button" class="secondary-button" @click="generateRandomListings" title="Generate 20 random test listings">
          Generate test data
        </button>
      </div>

      <div class="listings-list">
        <div v-if="listings.length === 0" class="empty-state">
          <p>No listings yet.</p>
          <button type="button" class="primary-button" @click="openCreate">
            Add your first listing
          </button>
        </div>
        <div v-else-if="filteredListings.length === 0" class="empty-state">
          No listings match your search.
        </div>
        <template v-else>
          <div class="listings-grid">
            <div v-for="listing in visibleListings" :key="listing.id" class="listing-card">
              <div class="listing-image-wrap">
                <img
                  class="listing-image"
                  :src="listing.img1 || fallbackListingImage"
                  :alt="listing.address || 'Listing image'"
                />
              </div>

              <div class="listing-info">
                <h3>{{ formatListingLabel(listing) }}</h3>
                <p class="price">${{ formatNumber(listing.price) }}</p>
                <p class="image-source">Image source: {{ listing.img1 || 'No image URL' }}</p>
              </div>

              <div class="listing-actions">
                <button type="button" class="edit-button" @click="startEdit(listing)">
                  Edit
                </button>
              </div>
            </div>
          </div>

        </template>
      </div>
    </div>

    <div v-if="showModal" class="listings-modal-backdrop" @click="closeModal">
      <div class="listings-modal-card" @click.stop>
        <div v-if="editingId" class="modal-preview-wrap">
          <img
            class="modal-preview-image"
            :src="form.img1 || fallbackListingImage"
            :alt="form.address || 'Listing preview image'"
          />
        </div>
        <h3>{{ editingId ? 'Edit listing' : 'Add listing' }}</h3>
        <form class="listing-form" @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="form-group">
              <label for="address">Address</label>
              <input
                id="address"
                v-model.trim="form.address"
                type="text"
                placeholder="123 Main St"
                autocomplete="street-address"
                required
              />
            </div>

            <div class="form-group">
              <label for="city">City</label>
              <input
                id="city"
                v-model.trim="form.city"
                type="text"
                placeholder="City"
                autocomplete="address-level2"
                required
              />
            </div>

            <div class="form-group">
              <label for="state">State</label>
              <input
                id="state"
                v-model.trim="form.state"
                type="text"
                placeholder="ST"
                autocomplete="address-level1"
                required
              />
            </div>

            <div class="form-group">
              <label for="zip">Zip code</label>
              <input
                id="zip"
                v-model.trim="form.zip"
                type="text"
                placeholder="00000"
                autocomplete="postal-code"
                required
              />
            </div>

            <div class="form-group">
              <label for="country">Country</label>
              <select id="country" v-model="form.country" required>
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
              </select>
            </div>

            <div class="form-group">
              <label for="beds">Num Beds</label>
              <input
                id="beds"
                v-model.number="form.beds"
                type="number"
                min="0"
                step="1"
                placeholder="3"
                required
              />
            </div>

            <div class="form-group">
              <label for="baths">Num Baths</label>
              <input
                id="baths"
                v-model.number="form.baths"
                type="number"
                min="0"
                step="0.5"
                placeholder="2.5"
                required
              />
            </div>

            <div class="form-group">
              <label for="sqft">Square Footage</label>
              <input
                id="sqft"
                v-model.trim="form.sqft"
                type="text"
                inputmode="numeric"
                placeholder="1,850"
                required
                @blur="formatNumberField('sqft')"
              />
            </div>

            <div class="form-group">
              <label for="price">Price</label>
              <input
                id="price"
                v-model.trim="form.price"
                type="text"
                inputmode="numeric"
                placeholder="425,000"
                required
                @blur="formatNumberField('price')"
              />
            </div>

            <div class="form-group span-2">
              <label for="img1">Img 1</label>
              <input
                id="img1"
                v-model.trim="form.img1"
                type="url"
                placeholder="https://www.example.com/photo-1.jpg"
                autocomplete="url"
                required
                @blur="normalizeUrlField('img1')"
              />
            </div>

            <div class="form-group span-2">
              <label for="img2">Img 2</label>
              <input
                id="img2"
                v-model.trim="form.img2"
                type="url"
                placeholder="https://www.example.com/photo-2.jpg"
                autocomplete="url"
                @blur="normalizeUrlField('img2')"
              />
            </div>

            <div class="form-group span-2">
              <label for="img3">Img 3</label>
              <input
                id="img3"
                v-model.trim="form.img3"
                type="url"
                placeholder="https://www.example.com/photo-3.jpg"
                autocomplete="url"
                @blur="normalizeUrlField('img3')"
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="primary-button">
              {{ editingId ? 'Update listing' : 'Add listing' }}
            </button>
            <button type="button" class="ghost-button" @click="closeModal">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getCurrentUserId } from '../services/profileDefaults'

const API_BASE = 'http://localhost:3001'
const ITEMS_PER_PAGE = 6

const getStorageKey = () => {
  const userId = getCurrentUserId()
  return userId ? `direct-mail-listings-${userId}` : 'direct-mail-listings-guest'
}
const fallbackListingImage = new URL('../assets/placeholder.png', import.meta.url).href
const birchUpdatedImage =
  'https://assets.architecturaldesigns.com/cdn-cgi/image/width=3840,quality=75,format=auto,slow-connection-quality=50/plan_assets/325000035/original/290101IY_01_1693600745.jpg'
const cedarUpdatedImage =
  'https://hips.hearstapps.com/hmg-prod/images/imagereader-3-1550604185.jpg'

const getAuthHeaders = () => {
  const userId = getCurrentUserId()
  const headers = { 'Content-Type': 'application/json' }
  if (userId) {
    headers['x-user-id'] = userId
  }
  return headers
}

const listings = ref([])
const editingId = ref('')
const showModal = ref(false)
const searchQuery = ref('')
const visibleCount = ref(ITEMS_PER_PAGE)

const emptyForm = () => ({
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'USA',
  beds: '',
  baths: '',
  sqft: '',
  price: '',
  img1: '',
  img2: '',
  img3: ''
})

const form = ref(emptyForm())

const filteredListings = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return listings.value
  return listings.value.filter((listing) =>
    formatListingLabel(listing).toLowerCase().includes(query)
  )
})

const visibleListings = computed(() =>
  filteredListings.value.slice(0, visibleCount.value)
)

const hasMoreListings = computed(() =>
  visibleCount.value < filteredListings.value.length
)

const loadMoreListings = () => {
  if (!hasMoreListings.value) return
  visibleCount.value += ITEMS_PER_PAGE
}

const handleScroll = () => {
  const scrollPosition = window.scrollY + window.innerHeight
  const pageHeight = document.documentElement.scrollHeight
  const nearBottom = scrollPosition >= pageHeight - 120

  if (window.scrollY <= 8 && visibleCount.value !== ITEMS_PER_PAGE) {
    visibleCount.value = ITEMS_PER_PAGE
    return
  }

  if (!nearBottom) return
  if (visibleCount.value < filteredListings.value.length) {
    visibleCount.value = Math.min(visibleCount.value + ITEMS_PER_PAGE, filteredListings.value.length)
  }
}

watch(searchQuery, () => {
  visibleCount.value = ITEMS_PER_PAGE
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

watch(filteredListings, () => {
  if (visibleCount.value > filteredListings.value.length) {
    visibleCount.value = Math.max(ITEMS_PER_PAGE, filteredListings.value.length)
  }
})

const loadListings = async () => {
  try {
    // Try to load from API first
    const response = await fetch(`${API_BASE}/api/listings`, {
      headers: getAuthHeaders()
    })
    if (response.ok) {
      const data = await response.json()
      const apiListings = data?.listings || []
      if (apiListings.length > 0) {
        listings.value = apiListings
        // Also save to user-specific localStorage as backup
        localStorage.setItem(getStorageKey(), JSON.stringify(apiListings))
        return
      }
    }
  } catch (error) {
    // API is unavailable, fall back to localStorage
  }

  // Fall back to user-specific localStorage
  try {
    const raw = localStorage.getItem(getStorageKey())
    if (raw === null) {
      listings.value = []
      return
    }
    listings.value = JSON.parse(raw)
  } catch (error) {
    listings.value = []
  }
}

const applyListingMigrations = () => {
  // Apply migrations but don't auto-save
  // Migrations only apply to loaded listings from storage/API
  listings.value = listings.value.map((listing) => {
    const updatedListing = { ...listing }

    if (/^300\s+birch\s+hollow\s+rd$/i.test(String(updatedListing.address || '').trim())) {
      updatedListing.img1 = birchUpdatedImage
    }

    if (/cedar\s+point(e)?/i.test(String(updatedListing.address || '').trim())) {
      updatedListing.img1 = cedarUpdatedImage
    }

    if (/^907\s+windrose\s+dr$/i.test(String(updatedListing.address || '').trim())) {
      updatedListing.address = '742 Magnolia Crest Dr'
    }

    const countryRaw = String(updatedListing.country || '').trim()
    if (!countryRaw) {
      updatedListing.country = 'USA'
    } else if (countryRaw.toUpperCase() === 'US') {
      updatedListing.country = 'USA'
    }

    return updatedListing
  })
}

const saveListings = async () => {
  // Save to user-specific localStorage first
  localStorage.setItem(getStorageKey(), JSON.stringify(listings.value))

  // Then sync with API
  try {
    await fetch(`${API_BASE}/api/listings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ listings: listings.value })
    })
  } catch (error) {
    // API is unavailable, data is already saved locally
  }
}

const resetForm = () => {
  form.value = emptyForm()
  editingId.value = ''
}

const openCreate = () => {
  resetForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const generateRandomListings = async () => {
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA']
  const streets = ['Oak Street', 'Maple Avenue', 'Elm Road', 'Cedar Lane', 'Pine Drive', 'Birch Court', 'Willow Way', 'Cherry Circle', 'Ash Boulevard', 'Spruce Place']
  
  const newListings = []
  for (let i = 0; i < 20; i++) {
    const cityIdx = Math.floor(Math.random() * cities.length)
    const price = Math.floor(Math.random() * 900000) + 100000
    const beds = Math.floor(Math.random() * 5) + 1
    const baths = Math.floor(Math.random() * 3) + 1
    const sqft = Math.floor(Math.random() * 3000) + 1000
    
    newListings.push({
      id: `listing-${Date.now()}-${i}`,
      address: `${Math.floor(Math.random() * 9000) + 1000} ${streets[Math.floor(Math.random() * streets.length)]}`,
      city: cities[cityIdx],
      state: states[cityIdx],
      zip: String(Math.floor(Math.random() * 90000) + 10000),
      country: 'USA',
      beds: String(beds),
      baths: String(baths),
      sqft: String(sqft),
      price: String(price),
      img1: 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=400&h=300&fit=crop',
      img2: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      img3: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      userId: getCurrentUserId()
    })
  }
  
  listings.value = [...listings.value, ...newListings]
  await saveListings()
  alert('Added 20 random test listings!')
}

const handleSubmit = () => {
  const normalizedCountryRaw = String(form.value.country || '').trim()
  const normalizedCountry = normalizedCountryRaw.toUpperCase() === 'US' ? 'USA' : (normalizedCountryRaw || 'USA')

  const payload = {
    id: editingId.value || `listing-${Date.now()}`,
    address: form.value.address,
    city: form.value.city,
    state: form.value.state,
    zip: form.value.zip,
    country: normalizedCountry,
    beds: Number(form.value.beds),
    baths: Number(form.value.baths),
    sqft: parseNumeric(form.value.sqft),
    price: parseNumeric(form.value.price),
    img1: form.value.img1,
    img2: form.value.img2,
    img3: form.value.img3
  }

  if (editingId.value) {
    listings.value = listings.value.map((listing) =>
      listing.id === editingId.value ? payload : listing
    )
  } else {
    listings.value = [payload, ...listings.value]
  }

  saveListings()
  closeModal()
}

const startEdit = (listing) => {
  editingId.value = listing.id
  form.value = {
    address: listing.address,
    city: listing.city || '',
    state: listing.state || '',
    zip: listing.zip || '',
    country: String(listing.country || '').trim().toUpperCase() === 'US' ? 'USA' : (listing.country || 'USA'),
    beds: listing.beds,
    baths: listing.baths,
    sqft: formatNumberForInput(listing.sqft),
    price: formatNumberForInput(listing.price),
    img1: listing.img1,
    img2: listing.img2 || '',
    img3: listing.img3 || ''
  }
  showModal.value = true
}

const formatNumberForInput = (value) => {
  const numeric = Number(String(value || '').replace(/[^0-9]/g, ''))
  if (!numeric) return ''
  return numeric.toLocaleString('en-US')
}

const formatNumberField = (fieldId) => {
  const raw = String(form.value[fieldId] || '')
  const digits = raw.replace(/[^0-9]/g, '')
  if (!digits) {
    form.value[fieldId] = ''
    return
  }
  form.value[fieldId] = Number(digits).toLocaleString('en-US')
}

const parseNumeric = (value) => {
  const digits = String(value || '').replace(/[^0-9]/g, '')
  return digits ? Number(digits) : 0
}

const normalizeUrlField = (fieldId) => {
  const raw = String(form.value[fieldId] || '').trim()
  if (!raw) return
  if (/^https?:\/\//i.test(raw)) {
    const normalized = raw.replace(/^(https?:\/\/)(?!www\.)/i, '$1www.')
    form.value[fieldId] = normalized
    return
  }
  if (/^www\./i.test(raw)) {
    form.value[fieldId] = `https://${raw}`
    return
  }
  form.value[fieldId] = `https://www.${raw}`
}

const removeListing = (id) => {
  const target = listings.value.find((listing) => listing.id === id)
  const label = target ? `\n${formatListingLabel(target)}` : ''
  if (!window.confirm(`Delete this listing?${label}`)) return
  listings.value = listings.value.filter((listing) => listing.id !== id)
  if (editingId.value === id) {
    closeModal()
  }
  saveListings()
}

const formatNumber = (value) => Number(value || 0).toLocaleString('en-US')

const formatListingLabel = (listing) => {
  const address = listing.address || ''
  const city = listing.city || ''
  const state = listing.state || ''
  const zip = listing.zip || ''
  const country = String(listing.country || '').trim()
  const normalizedCountry = country.toUpperCase() === 'US' ? 'USA' : country
  return [address, city, state, zip, normalizedCountry].filter(Boolean).join(', ')
}

onMounted(async () => {
  await loadListings()
  applyListingMigrations()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.listings-container {
  min-height: 100vh;
  display: block;
  background: transparent;
  padding: 32px;
}

.listings-layout {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
}

.listings-header h2 {
  margin: 0 0 6px;
  color: #0b1630;
  font-size: 1.8rem;
  font-weight: 700;
  text-align: left;
}

.subtitle {
  text-align: left;
  color: #264173;
  margin: 0 0 24px;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.listings-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 24px;
}

.search-input {
  flex: 1 1 260px;
  min-width: 220px;
  padding: 12px 14px;
  border: 2px solid rgba(15, 31, 61, 0.2);
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: #ecf2ff;
  color: #0b1630;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #5281ff;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(82, 129, 255, 0.15);
}

.listings-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3, 8, 20, 0.7);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 22px 16px;
  overflow-y: auto;
  z-index: 2000;
}

.listings-modal-card {
  width: 100%;
  max-width: 640px;
  background: linear-gradient(135deg, #ffffff 0%, #edf4ff 58%, #dbe8ff 100%);
  border: 1px solid rgba(15, 31, 61, 0.2);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 22px 48px rgba(11, 22, 48, 0.28);
  color: #0b1630;
  max-height: calc(100vh - 44px);
  overflow-y: auto;
  margin: 0 auto;
}

.modal-preview-wrap {
  width: 100%;
  height: 170px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(15, 31, 61, 0.16);
  background: linear-gradient(135deg, #eef4ff 0%, #dce8ff 100%);
  margin-bottom: 14px;
}

.modal-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.listings-modal-card h3 {
  margin: 0 0 16px;
  font-size: 1.35rem;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #264173;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid rgba(15, 31, 61, 0.2);
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: #ecf2ff;
  color: #0b1630;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #5281ff;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(82, 129, 255, 0.15);
}

.form-group.span-2 {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.primary-button {
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #5281ff, #3b6cff);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(82, 129, 255, 0.35);
}

.ghost-button {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(15, 31, 61, 0.24);
  background: #f3f7ff;
  color: #264173;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-button:hover {
  border-color: #5281ff;
  color: #0b1630;
}

.secondary-button {
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: #f0f0f0;
  color: #333;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.secondary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  background: #e0e0e0;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.listing-card {
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  border: 1px solid rgba(15, 31, 61, 0.18);
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(11, 22, 48, 0.12);
  overflow: hidden;
}

.listing-image-wrap {
  width: 100%;
  height: 210px;
  flex-shrink: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #eef4ff 0%, #dce8ff 100%);
}

.listing-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.listing-info {
  padding: 14px 14px 10px;
}

.listing-info h3 {
  margin: 0 0 8px;
  color: #0b1630;
  font-size: 1rem;
  font-weight: 700;
}

.price {
  margin: 0 0 8px;
  font-weight: 700;
  color: #0b1630;
}

.image-source {
  margin: 0;
  color: #3b4f72;
  font-size: 0.82rem;
  line-height: 1.35;
  word-break: break-all;
}

.listing-actions {
  padding: 0 14px 14px;
  display: flex;
  justify-content: center;
}

.edit-button {
  width: min(170px, 100%);
  min-width: 130px;
  padding: 9px 16px;
  border-radius: 10px;
  border: 1px solid rgba(82, 129, 255, 0.65);
  background: linear-gradient(135deg, #4a78ff, #2f58d9);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-button:hover {
  background: linear-gradient(135deg, #6a94ff, #5281ff);
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  color: #264173;
  padding: 24px;
  border-radius: 10px;
  border: 1px dashed rgba(82, 129, 255, 0.45);
  background: rgba(255, 255, 255, 0.55);
}

@media (max-width: 768px) {
  .listings-container {
    padding: 20px;
  }

  .listings-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .listings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
