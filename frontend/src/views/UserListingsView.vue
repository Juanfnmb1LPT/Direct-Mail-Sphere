<template>
  <div class="listings-container">
    <button type="button" class="back-button" @click="goToDashboard">
      Back to dashboard
    </button>

    <div class="listings-card">
      <div class="listings-header">
        <h2>User Listings</h2>
        <p class="subtitle">Add, edit, or remove your active listings.</p>
      </div>

      <div class="listings-toolbar">
        <input
          v-if="listings.length"
          v-model.trim="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search by address, city, state, or zip"
          aria-label="Search listings"
        />
        <button type="button" class="primary-button" @click="openCreate">
          Add new listing
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
        <div v-for="listing in filteredListings" :key="listing.id" class="listing-card">
          <div class="listing-info">
            <h3>{{ formatListingLabel(listing) }}</h3>
            <p>
              {{ listing.beds }} bd · {{ listing.baths }} ba · {{ listing.sqft }} sqft
            </p>
            <p class="price">${{ formatNumber(listing.price) }}</p>
            <div class="image-row">
              <span v-if="listing.img1" class="image-pill">Img 1</span>
              <span v-if="listing.img2" class="image-pill">Img 2</span>
              <span v-if="listing.img3" class="image-pill">Img 3</span>
            </div>
          </div>
          <div class="listing-actions">
            <button type="button" class="outline-button" @click="startEdit(listing)">
              Edit
            </button>
            <button type="button" class="danger-button" @click="removeListing(listing.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-card" @click.stop>
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
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const STORAGE_KEY = 'direct-mail-listings'

const listings = ref([])
const editingId = ref('')
const showModal = ref(false)
const searchQuery = ref('')

const emptyForm = () => ({
  address: '',
  city: '',
  state: '',
  zip: '',
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

const loadListings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    listings.value = raw ? JSON.parse(raw) : []
  } catch (error) {
    listings.value = []
  }
}

const saveListings = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings.value))
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

const handleSubmit = () => {
  const payload = {
    id: editingId.value || `listing-${Date.now()}`,
    address: form.value.address,
    city: form.value.city,
    state: form.value.state,
    zip: form.value.zip,
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
  return [address, city, state, zip].filter(Boolean).join(', ')
}

const goToDashboard = () => {
  router.push('/dashboard')
}

onMounted(() => {
  loadListings()
})
</script>

<style scoped>
.listings-container {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #d6e6ff;
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

.listings-card {
  width: 100%;
  max-width: 900px;
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: 1px solid #3d5aff;
  border-radius: 12px;
  padding: clamp(2rem, 5vw, 3rem);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(61, 90, 255, 0.5);
}

.listings-header h2 {
  margin: 0 0 6px;
  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #b8c9ff;
  margin: 0 0 24px;
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
  justify-content: space-between;
  margin-bottom: 24px;
}

.search-input {
  flex: 1 1 260px;
  min-width: 220px;
  padding: 12px 14px;
  border: 2px solid rgba(79, 124, 255, 0.3);
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: rgba(11, 26, 56, 0.8);
  color: #ffffff;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #5281ff;
  background-color: rgba(11, 26, 56, 0.95);
  box-shadow: 0 0 0 3px rgba(82, 129, 255, 0.15);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3, 8, 20, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}

.modal-card {
  width: 100%;
  max-width: 720px;
  background: linear-gradient(180deg, #0f1f3d 0%, #0b1630 100%);
  border: 1px solid rgba(82, 129, 255, 0.5);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.45);
  color: #ffffff;
}

.modal-card h3 {
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
  color: #b8c9ff;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid rgba(79, 124, 255, 0.3);
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: rgba(11, 26, 56, 0.8);
  color: #ffffff;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #5281ff;
  background-color: rgba(11, 26, 56, 0.95);
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
  border: 1px solid rgba(82, 129, 255, 0.6);
  background: rgba(82, 129, 255, 0.08);
  color: #c9d8ff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-button:hover {
  border-color: #5281ff;
  color: #ffffff;
}

.listings-list {
  display: grid;
  gap: 16px;
}

.listing-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(82, 129, 255, 0.3);
  background: rgba(82, 129, 255, 0.08);
}

.listing-info h3 {
  margin: 0 0 6px;
  color: #ffffff;
  font-size: 1.1rem;
}

.listing-info p {
  margin: 0 0 6px;
  color: #b8c9ff;
}

.price {
  font-weight: 700;
  color: #ffffff;
}

.image-row {
  display: flex;
  gap: 8px;
}

.image-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  background: rgba(82, 129, 255, 0.3);
  color: #ffffff;
}

.listing-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.outline-button {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(82, 129, 255, 0.6);
  background: transparent;
  color: #c9d8ff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.outline-button:hover {
  border-color: #5281ff;
  color: #ffffff;
}

.danger-button {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.6);
  background: rgba(255, 107, 107, 0.1);
  color: #ff8a80;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.danger-button:hover {
  border-color: rgba(255, 107, 107, 0.9);
  color: #ffffff;
  background: rgba(255, 107, 107, 0.3);
}

.empty-state {
  text-align: center;
  color: #b8c9ff;
  padding: 24px;
  border-radius: 10px;
  border: 1px dashed rgba(82, 129, 255, 0.4);
}

@media (max-width: 768px) {
  .listing-card {
    flex-direction: column;
  }

  .listing-actions {
    flex-direction: row;
    justify-content: flex-start;
  }
}
</style>
