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

      <form class="listing-form" @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group span-2">
            <label for="address">Address</label>
            <input
              id="address"
              v-model.trim="form.address"
              type="text"
              placeholder="123 Main St, City, ST 00000"
              autocomplete="street-address"
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
              v-model.number="form.sqft"
              type="number"
              min="1"
              step="1"
              placeholder="1850"
              required
            />
          </div>

          <div class="form-group">
            <label for="price">Price</label>
            <input
              id="price"
              v-model.number="form.price"
              type="number"
              min="1"
              step="1"
              placeholder="425000"
              required
            />
          </div>

          <div class="form-group span-2">
            <label for="img1">Img 1</label>
            <input
              id="img1"
              v-model.trim="form.img1"
              type="url"
              placeholder="https://example.com/photo-1.jpg"
              autocomplete="url"
              required
            />
          </div>

          <div class="form-group span-2">
            <label for="img2">Img 2</label>
            <input
              id="img2"
              v-model.trim="form.img2"
              type="url"
              placeholder="https://example.com/photo-2.jpg"
              autocomplete="url"
            />
          </div>

          <div class="form-group span-2">
            <label for="img3">Img 3</label>
            <input
              id="img3"
              v-model.trim="form.img3"
              type="url"
              placeholder="https://example.com/photo-3.jpg"
              autocomplete="url"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="primary-button">
            {{ editingId ? 'Update listing' : 'Add listing' }}
          </button>
          <button
            v-if="editingId"
            type="button"
            class="ghost-button"
            @click="resetForm"
          >
            Cancel
          </button>
        </div>
      </form>

      <div class="listings-list">
        <div v-if="listings.length === 0" class="empty-state">
          No listings yet. Add one above.
        </div>
        <div v-for="listing in listings" :key="listing.id" class="listing-card">
          <div class="listing-info">
            <h3>{{ listing.address }}</h3>
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
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const STORAGE_KEY = 'direct-mail-listings'

const listings = ref([])
const editingId = ref('')

const emptyForm = () => ({
  address: '',
  beds: '',
  baths: '',
  sqft: '',
  price: '',
  img1: '',
  img2: '',
  img3: ''
})

const form = ref(emptyForm())

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

const handleSubmit = () => {
  const payload = {
    id: editingId.value || `listing-${Date.now()}`,
    address: form.value.address,
    beds: Number(form.value.beds),
    baths: Number(form.value.baths),
    sqft: Number(form.value.sqft),
    price: Number(form.value.price),
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
  resetForm()
}

const startEdit = (listing) => {
  editingId.value = listing.id
  form.value = {
    address: listing.address,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    price: listing.price,
    img1: listing.img1,
    img2: listing.img2 || '',
    img3: listing.img3 || ''
  }
}

const removeListing = (id) => {
  listings.value = listings.value.filter((listing) => listing.id !== id)
  if (editingId.value === id) {
    resetForm()
  }
  saveListings()
}

const formatNumber = (value) => Number(value || 0).toLocaleString('en-US')

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

.listing-form {
  margin-bottom: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.form-group span-2 {
  grid-column: 1 / -1;
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
