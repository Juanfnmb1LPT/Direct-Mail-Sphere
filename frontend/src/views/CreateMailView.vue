<template>
  <div class="create-mail-container">
    <button type="button" class="back-button" @click="goToTemplates">
      <span class="back-icon" aria-hidden="true">←</span>
      <span>Back to templates</span>
    </button>
    <div class="create-mail-wrapper">
      <div class="create-mail-box">
        <h2>{{ selectedTemplateLabel }}</h2>
        <p class="editor-subtitle">Dynamic card editor</p>
        <form @submit.prevent="handleSubmit">
          <div v-if="isTemplateWithListingImport && listingImportField" class="import-block">
            <p class="import-title">Listing import</p>
            <div class="form-group span-2">
              <label :for="listingImportField.id">Import info from listing</label>
            <div class="select-search">
              <input
                :id="listingImportField.id"
                v-model.trim="formData[listingImportField.id]"
                :placeholder="listingImportField.placeholder"
                :autocomplete="listingImportField.autocomplete"
                @focus="onSelectFocus(listingImportField.id)"
                @input="onSelectInput(listingImportField.id)"
                @blur="onSelectBlur(listingImportField)"
              />
              <div
                v-if="isDropdownOpen(listingImportField.id)"
                class="select-dropdown"
              >
                <button
                  v-for="option in filteredOptions(listingImportField)"
                  :key="option.value"
                  type="button"
                  class="select-option"
                  @mousedown.prevent="selectOption(listingImportField.id, option)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
            </div>
            <p class="import-hint">Choose a saved listing to auto-fill the listing details below.</p>
          </div>
          <div class="form-grid">
          <div
            v-for="field in visibleFields"
            :key="field.id"
            class="form-group"
            :class="{ 'span-2': field.fullWidth }"
          >
            <label :for="field.id">{{ field.label }}</label>
            <div v-if="field.type === 'select-search'" class="select-search">
              <input
                :id="field.id"
                v-model.trim="formData[field.id]"
                :placeholder="field.placeholder"
                :autocomplete="field.autocomplete"
                :required="field.required"
                @focus="onSelectFocus(field.id)"
                @input="onSelectInput(field.id)"
                @blur="onSelectBlur(field)"
              />
              <div
                v-if="isDropdownOpen(field.id)"
                class="select-dropdown"
              >
                <button
                  v-for="option in filteredOptions(field)"
                  :key="option.value"
                  type="button"
                  class="select-option"
                  @mousedown.prevent="selectOption(field.id, option)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
            <input
              v-else-if="field.type !== 'textarea' && field.type !== 'file'"
              :id="field.id"
              v-model.trim="formData[field.id]"
              :type="field.type"
              :placeholder="field.placeholder"
              :autocomplete="field.autocomplete"
              :min="field.min"
              :required="field.required"
              @focus="onFieldFocus(field.id)"
              @blur="onFieldBlur(field)"
            />
            <input
              v-else-if="field.type === 'file'"
              :id="field.id"
              type="file"
              :accept="field.accept"
              :required="field.required"
              @change="handleFileChange($event, field.id)"
            />
            <textarea
              v-else
              :id="field.id"
              v-model.trim="formData[field.id]"
              :rows="field.rows || 4"
              :placeholder="field.placeholder"
              :required="field.required"
            ></textarea>
            <p
              v-if="shouldShowUrlHelp(field)"
              class="helper-text"
            >
              Enter a valid URL (example: https://example.com).
            </p>
          </div>
        </div>

        <div v-if="success" class="success-message">
          Draft created. You can refine details next.
        </div>

        <button type="submit" class="primary-button">Create mail</button>
      </form>
    </div>

    <div class="preview-box">
      <div class="preview-header">
        <h3>Preview</h3>
      </div>
      <div class="preview-content">
        <img v-if="showBack && selectedTemplateConfig?.backImage" :src="selectedTemplateConfig.backImage" :alt="selectedTemplateLabel + ' back'" class="preview-image" />
        <img v-else-if="!showBack && selectedTemplateConfig?.image" :src="selectedTemplateConfig.image" :alt="selectedTemplateLabel" class="preview-image" />
      </div>
      <div class="preview-actions">
        <button type="button" class="flip-button" @click="showBack = !showBack">
          Flip
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { profileService } from '../services/profileService'

const route = useRoute()
const router = useRouter()

const success = ref(false)
const formData = ref({})
const fieldState = ref({})
const showBack = ref(false)
const profile = ref(null)
const listings = ref([])
const LISTINGS_KEY = 'direct-mail-listings'
const ORDERS_KEY = 'direct-mail-orders'

const defaultFields = [
  {
    id: 'address',
    label: 'Address',
    type: 'text',
    placeholder: '123 Main St, City, ST 00000',
    autocomplete: 'street-address',
    required: true,
    fullWidth: true
  },
  {
    id: 'audience_size',
    label: 'Audience size',
    type: 'number',
    min: 1,
    placeholder: '250',
    required: true
  },
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Your name',
    autocomplete: 'name',
    required: true
  },
  {
    id: 'header',
    label: 'Header',
    type: 'text',
    placeholder: 'Welcome to our spring offer',
    required: true,
    fullWidth: true
  },
  {
    id: 'bio',
    label: 'Bio',
    type: 'textarea',
    placeholder: 'Short bio or message',
    required: true,
    fullWidth: true,
    rows: 4
  }
]

const templateOneFields = [
  {
    id: 'first_name',
    label: 'First name',
    type: 'text',
    placeholder: 'John',
    autocomplete: 'given-name',
    required: true
  },
  {
    id: 'last_name',
    label: 'Last name',
    type: 'text',
    placeholder: 'Doe',
    autocomplete: 'family-name',
    required: true
  },
  {
    id: 'phone',
    label: 'Phone #',
    type: 'tel',
    placeholder: '(555) 123-4567',
    autocomplete: 'tel',
    required: true
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
    autocomplete: 'email',
    required: true,
    fullWidth: true
  },
  {
    id: 'mls_number',
    label: 'MLS number',
    type: 'text',
    placeholder: 'MLS123456',
    autocomplete: 'off',
    required: true
  },
  {
    id: 'agent_photo',
    label: 'Agent photo',
    type: 'url',
    placeholder: 'https://example.com/agent.jpg',
    autocomplete: 'url',
    required: true,
    fullWidth: true
  },
  {
    id: 'company_logo',
    label: 'Company logo',
    type: 'url',
    placeholder: 'https://example.com/logo.png',
    autocomplete: 'url',
    required: true,
    fullWidth: true
  },
  {
    id: 'website',
    label: 'Website',
    type: 'url',
    placeholder: 'https://example.com',
    autocomplete: 'url',
    required: true,
    fullWidth: true
  }
]

const buildTemplateTwoFields = (listingOptions) => [
  {
    id: 'listing_import',
    label: 'Import from listing',
    type: 'select-search',
    options: listingOptions,
    placeholder: 'Search listings by address',
    autocomplete: 'off',
    required: false,
    fullWidth: true,
    omitFromExport: true
  },
  {
    id: 'first_name',
    label: 'First name',
    type: 'text',
    placeholder: 'John',
    autocomplete: 'given-name',
    required: true
  },
  {
    id: 'last_name',
    label: 'Last name',
    type: 'text',
    placeholder: 'Doe',
    autocomplete: 'family-name',
    required: true
  },
  {
    id: 'phone',
    label: 'Phone #',
    type: 'tel',
    placeholder: '(555) 123-4567',
    autocomplete: 'tel',
    required: true
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
    autocomplete: 'email',
    required: true,
    fullWidth: true
  },
  {
    id: 'mls_number',
    label: 'MLS number',
    type: 'text',
    placeholder: 'MLS123456',
    autocomplete: 'off',
    required: true
  },
  {
    id: 'agent_photo',
    label: 'Agent photo',
    type: 'url',
    placeholder: 'https://www.example.com/agent.jpg',
    autocomplete: 'url',
    required: true,
    fullWidth: true
  },
  {
    id: 'company_logo',
    label: 'Company logo',
    type: 'url',
    placeholder: 'https://www.example.com/logo.png',
    autocomplete: 'url',
    required: true,
    fullWidth: true
  },
  {
    id: 'listing_address',
    label: 'Address',
    type: 'text',
    placeholder: '123 Main St',
    autocomplete: 'street-address',
    required: true
  },
  {
    id: 'listing_city',
    label: 'City',
    type: 'text',
    placeholder: 'City',
    autocomplete: 'address-level2',
    required: true
  },
  {
    id: 'listing_state',
    label: 'State',
    type: 'text',
    placeholder: 'ST',
    autocomplete: 'address-level1',
    required: true
  },
  {
    id: 'listing_zip',
    label: 'Zip code',
    type: 'text',
    placeholder: '00000',
    autocomplete: 'postal-code',
    required: true
  },
  {
    id: 'listing_img1',
    label: 'Img 1',
    type: 'url',
    placeholder: 'https://www.example.com/photo-1.jpg',
    autocomplete: 'url',
    required: true,
    fullWidth: true
  }
]

const buildTemplateThreeFields = (listingOptions) => [
  {
    id: 'listing_import',
    label: 'Import from listing',
    type: 'select-search',
    options: listingOptions,
    placeholder: 'Search listings by address',
    autocomplete: 'off',
    required: false,
    fullWidth: true,
    omitFromExport: true
  },
  {
    id: 'first_name',
    label: 'First name',
    type: 'text',
    placeholder: 'John',
    autocomplete: 'given-name',
    required: true
  },
  {
    id: 'last_name',
    label: 'Last name',
    type: 'text',
    placeholder: 'Doe',
    autocomplete: 'family-name',
    required: true
  },
  {
    id: 'phone',
    label: 'Phone #',
    type: 'tel',
    placeholder: '(555) 123-4567',
    autocomplete: 'tel',
    required: true
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
    autocomplete: 'email',
    required: true,
    fullWidth: true
  },
  {
    id: 'mls_number',
    label: 'MLS number',
    type: 'text',
    placeholder: 'MLS123456',
    autocomplete: 'off',
    required: true
  },
  {
    id: 'agent_photo',
    label: 'Agent photo',
    type: 'url',
    placeholder: 'https://www.example.com/agent.jpg',
    autocomplete: 'url',
    required: true,
    fullWidth: true
  },
  {
    id: 'company_logo',
    label: 'Company logo',
    type: 'url',
    placeholder: 'https://www.example.com/logo.png',
    autocomplete: 'url',
    required: true,
    fullWidth: true
  },
  {
    id: 'listing_address',
    label: 'Address',
    type: 'text',
    placeholder: '123 Main St',
    autocomplete: 'street-address',
    required: true
  },
  {
    id: 'listing_city',
    label: 'City',
    type: 'text',
    placeholder: 'City',
    autocomplete: 'address-level2',
    required: true
  },
  {
    id: 'listing_state',
    label: 'State',
    type: 'text',
    placeholder: 'ST',
    autocomplete: 'address-level1',
    required: true
  },
  {
    id: 'listing_beds',
    label: 'Num Beds',
    type: 'number',
    min: 0,
    placeholder: '3',
    required: true
  },
  {
    id: 'listing_baths',
    label: 'Num Baths',
    type: 'number',
    min: 0,
    step: 0.5,
    placeholder: '2.5',
    required: true
  },
  {
    id: 'listing_sqft',
    label: 'Square Footage',
    type: 'number',
    min: 1,
    placeholder: '1850',
    required: true
  },
  {
    id: 'listing_price',
    label: 'Price',
    type: 'number',
    min: 1,
    placeholder: '425000',
    required: true
  },
  {
    id: 'listing_img1',
    label: 'Img 1',
    type: 'url',
    placeholder: 'https://www.example.com/photo-1.jpg',
    autocomplete: 'url',
    required: true,
    fullWidth: true
  }
]

const templates = [
  { id: 'template-1', name: 'Template 1- Spring Clean Your Finances', fields: templateOneFields, image: new URL('../assets/spring_clean.png', import.meta.url).href, backImage: new URL('../assets/spring_clean_back.png', import.meta.url).href },
  { id: 'template-2', name: 'Template 2- Listing Coming Soon', fields: defaultFields, image: new URL('../assets/coming_soon_card.png', import.meta.url).href, backImage: new URL('../assets/coming_soon_card_back.png', import.meta.url).href },
  { id: 'template-3', name: 'Template 3 - Just Sold', fields: defaultFields, image: new URL('../assets/template-3-just-sold.png', import.meta.url).href, backImage: new URL('../assets/placeholder.png', import.meta.url).href },
  { id: 'template-4', name: 'Template 4 - For Sale', fields: defaultFields, image: new URL('../assets/template-4-for-sale.png', import.meta.url).href, backImage: new URL('../assets/placeholder.png', import.meta.url).href },
  { id: 'template-5', name: 'Template 5 - Open House', fields: defaultFields, image: new URL('../assets/template-5-open-house.png', import.meta.url).href, backImage: new URL('../assets/placeholder.png', import.meta.url).href },
  { id: 'template-6', name: 'Template 6 - Mult Listings Postcard', fields: defaultFields, image: new URL('../assets/template-6-mult-listings-postcard.png', import.meta.url).href, backImage: new URL('../assets/placeholder.png', import.meta.url).href },
  { id: 'template-7', name: 'Template 7 - Review', fields: defaultFields, image: new URL('../assets/template-7-review.png', import.meta.url).href, backImage: new URL('../assets/placeholder.png', import.meta.url).href },
  { id: 'template-8', name: "Template 8 - What's your home worth", fields: defaultFields, image: new URL("../assets/template-8-what's-your-home-worth.png", import.meta.url).href, backImage: new URL('../assets/placeholder.png', import.meta.url).href },
  { id: 'template-9', name: 'Template 9 - Neighborhood Market Update', fields: defaultFields, image: new URL('../assets/template-9-neighborhood-market-update.png', import.meta.url).href, backImage: new URL('../assets/placeholder.png', import.meta.url).href },
  { id: 'template-10', name: 'Template 10 - Local Biz', fields: defaultFields, image: new URL('../assets/template-10-local-biz.png', import.meta.url).href, backImage: new URL('../assets/placeholder.png', import.meta.url).href }
]

const templateFromRoute = computed(() => String(route.query.template || ''))
const selectedTemplate = ref(templateFromRoute.value || templates[0].id)

watch(templateFromRoute, (value) => {
  if (value) selectedTemplate.value = value
})

const selectedTemplateLabel = computed(() => {
  const match = templates.find((template) => template.id === selectedTemplate.value)
  return match ? match.name : 'Template'
})

const selectedTemplateConfig = computed(() =>
  templates.find((template) => template.id === selectedTemplate.value)
)

const formatListingLabel = (listing) => {
  const address = listing.address || ''
  const city = listing.city || ''
  const state = listing.state || ''
  return [address, city, state].filter(Boolean).join(', ')
}

const listingOptions = computed(() =>
  listings.value.map((listing) => ({
    value: listing.id,
    label: formatListingLabel(listing)
  }))
)

const formFields = computed(() => {
  if (selectedTemplate.value === 'template-2') {
    return buildTemplateTwoFields(listingOptions.value)
  }
  if (selectedTemplate.value === 'template-3') {
    return buildTemplateThreeFields(listingOptions.value)
  }
  return selectedTemplateConfig.value?.fields || defaultFields
})

const isTemplateWithListingImport = computed(() =>
  ['template-2', 'template-3'].includes(selectedTemplate.value)
)

const listingImportField = computed(() =>
  formFields.value.find((field) => field.id === 'listing_import')
)

const visibleFields = computed(() =>
  formFields.value.filter(
    (field) => field.id !== 'listing_import' && !field.omitFromForm
  )
)

const fieldProfileMap = {
  first_name: 'firstName',
  last_name: 'lastName',
  phone: 'phone',
  email: 'email',
  mls_number: 'mlsNumber',
  agent_photo: 'agentPhoto',
  company_logo: 'companyLogo'
}

const applyProfileToForm = (fields) => {
  if (!profile.value || !fields?.length) return

  fields.forEach((field) => {
    const profileKey = fieldProfileMap[field.id]
    if (!profileKey) return
    const value = profile.value?.[profileKey]
    if (value && !formData.value[field.id]) {
      formData.value[field.id] = value
    }
  })
}

const applyListingToForm = (listingId) => {
  const listing = listings.value.find((item) => item.id === listingId)
  if (!listing) return
  if ('listing_address' in formData.value) {
    formData.value.listing_address = listing.address || ''
  }
  if ('listing_city' in formData.value) {
    formData.value.listing_city = listing.city || ''
  }
  if ('listing_state' in formData.value) {
    formData.value.listing_state = listing.state || ''
  }
  if ('listing_zip' in formData.value) {
    formData.value.listing_zip = listing.zip || ''
  }
  if ('listing_beds' in formData.value) {
    formData.value.listing_beds = listing.beds ?? ''
  }
  if ('listing_baths' in formData.value) {
    formData.value.listing_baths = listing.baths ?? ''
  }
  if ('listing_sqft' in formData.value) {
    formData.value.listing_sqft = listing.sqft ?? ''
  }
  if ('listing_price' in formData.value) {
    formData.value.listing_price = listing.price ?? ''
  }
  if ('listing_img1' in formData.value) {
    formData.value.listing_img1 = listing.img1 || ''
  }
}

watch(
  formFields,
  (fields) => {
    formData.value = fields.reduce((acc, field) => {
      acc[field.id] = ''
      return acc
    }, {})
    fieldState.value = fields.reduce((acc, field) => {
      acc[field.id] = { focused: false, touched: false }
      acc[field.id].open = false
      return acc
    }, {})
    applyProfileToForm(fields)
  },
  { immediate: true }
)

const loadProfile = async () => {
  const result = await profileService.getProfile()
  if (result?.success) {
    profile.value = result.profile
    applyProfileToForm(formFields.value)
  }
}

const loadListings = () => {
  try {
    const raw = localStorage.getItem(LISTINGS_KEY)
    listings.value = raw ? JSON.parse(raw) : []
  } catch (error) {
    listings.value = []
  }
}

onMounted(() => {
  loadProfile()
  loadListings()
})

const handleFileChange = (event, fieldId) => {
  const file = event.target.files?.[0]
  formData.value[fieldId] = file ? file.name : ''
}

const onFieldFocus = (fieldId) => {
  if (!fieldState.value[fieldId]) return
  fieldState.value[fieldId].focused = true
}

const onFieldBlur = (field) => {
  if (!fieldState.value[field.id]) return
  fieldState.value[field.id].focused = false
  fieldState.value[field.id].touched = true
  if (field.type === 'url') normalizeUrlField(field.id)
}

const onSelectFocus = (fieldId) => {
  if (!fieldState.value[fieldId]) return
  fieldState.value[fieldId].focused = true
  fieldState.value[fieldId].open = true
}

const onSelectInput = (fieldId) => {
  if (!fieldState.value[fieldId]) return
  fieldState.value[fieldId].open = true
}

const onSelectBlur = (field) => {
  if (!fieldState.value[field.id]) return
  fieldState.value[field.id].focused = false
  fieldState.value[field.id].touched = true
  fieldState.value[field.id].open = false
  if (field.type === 'url') normalizeUrlField(field.id)
}

const isDropdownOpen = (fieldId) => Boolean(fieldState.value[fieldId]?.open)

const filteredOptions = (field) => {
  const value = String(formData.value[field.id] || '').toLowerCase()
  return field.options.filter((option) => option.label.toLowerCase().includes(value))
}

const selectOption = (fieldId, option) => {
  formData.value[fieldId] = option.label
  if (fieldState.value[fieldId]) {
    fieldState.value[fieldId].open = false
  }
  if (fieldId === 'listing_import') {
    applyListingToForm(option.value)
  }
}

const getSelectSearchValue = (field) => {
  const rawValue = String(formData.value[field.id] || '').trim().toUpperCase()
  if (!rawValue) return ''
  const byValue = field.options.find((option) => option.value === rawValue)
  if (byValue) return byValue.value
  const byLabel = field.options.find((option) => option.label.toUpperCase() === rawValue)
  if (byLabel) return byLabel.value
  const byPrefix = field.options.find((option) => option.label.toUpperCase().startsWith(rawValue))
  return byPrefix ? byPrefix.value : rawValue
}

const normalizeUrlField = (fieldId) => {
  const value = String(formData.value[fieldId] || '').trim()
  if (!value) return
  if (/^https?:\/\//i.test(value)) {
    formData.value[fieldId] = value.replace(/^(https?:\/\/)(?!www\.)/i, '$1www.')
    return
  }
  if (/^www\./i.test(value)) {
    formData.value[fieldId] = `https://${value}`
    return
  }
  formData.value[fieldId] = `https://www.${value}`
}

const isValidUrl = (value) => {
  if (!value) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const shouldShowUrlHelp = (field) => {
  if (field.type !== 'url') return false
  const state = fieldState.value[field.id]
  if (!state) return false
  return (state.focused || state.touched) && !isValidUrl(formData.value[field.id])
}

const loadOrders = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveOrders = (orders) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

const buildOrderAddress = () => {
  const directAddress = String(formData.value.address || '').trim()
  if (directAddress) return directAddress

  const listingAddress = String(formData.value.listing_address || '').trim()
  const listingCity = String(formData.value.listing_city || '').trim()
  const listingState = String(formData.value.listing_state || '').trim()
  const listingZip = String(formData.value.listing_zip || '').trim()

  const cityState = [listingCity, listingState].filter(Boolean).join(', ')
  const cityStateZip = [cityState, listingZip].filter(Boolean).join(' ')
  const listingFull = [listingAddress, cityStateZip].filter(Boolean).join(', ')

  return listingFull
}

const handleSubmit = () => {
  formFields.value
    .filter((field) => field.type === 'url')
    .forEach((field) => normalizeUrlField(field.id))

  const exportFields = formFields.value.filter((field) => !field.omitFromExport)

  const rows = [
    ['template', ...exportFields.map((field) => field.id)],
    [
      selectedTemplate.value,
      ...exportFields.map((field) =>
        field.type === 'select-search'
          ? getSelectSearchValue(field)
          : formData.value[field.id]
      )
    ]
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

  const now = new Date()
  const newOrder = {
    id: `ORD-${now.getTime()}`,
    name: selectedTemplateLabel.value,
    status: 'placed',
    address: buildOrderAddress(),
    createdAt: now.toISOString(),
    date: now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const orders = loadOrders()
  orders.unshift(newOrder)
  saveOrders(orders)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'create-mail.csv'
  link.click()
  URL.revokeObjectURL(url)
  success.value = true
}

const goToTemplates = () => {
  router.push('/create-mail')
}
</script>

<style scoped>
.create-mail-container {
  min-height: 100vh;
  display: block;
  background: transparent;
  width: 100%;
  padding: 32px 24px;
  position: relative;
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.create-mail-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(380px, 1fr);
  gap: 28px;
  width: 100%;
  max-width: 1320px;
  margin: 40px auto 0;
  align-items: start;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(15, 31, 61, 0.24);
  background: #ffffff;
  color: #0b1630;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  border-color: #5281ff;
  color: #0b1630;
  background: #f1f5ff;
}

.back-icon {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
}

.create-mail-box {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  width: 100%;
  max-width: none;
}

.preview-box {
  background: linear-gradient(135deg, #f4f8ff 0%, #dce8ff 52%, #bfd4fb 100%);
  border: 1px solid rgba(15, 31, 61, 0.18);
  border-radius: 12px;
  box-shadow: 0 14px 30px rgba(11, 22, 48, 0.14);
  padding: 0.9rem;
  width: 100%;
  max-width: none;
  display: flex;
  flex-direction: column;
  position: static;
}

.preview-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.preview-box h3 {
  text-align: center;
  margin: 0;
  color: #0b1630;
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.3px;
}

.flip-button {
  background: linear-gradient(135deg, #4a78ff, #2f58d9);
  color: white;
  border: none;
  border-radius: 6px;
  width: min(164px, 100%);
  padding: 9px 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.flip-button:hover {
  background: linear-gradient(135deg, #6a94ff, #5281ff);
  transform: translateY(-1px);
}

.preview-actions {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

.preview-content {
  height: 420px;
  min-height: 420px;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid rgba(15, 31, 61, 0.22);
  background: linear-gradient(135deg, #dbe8ff 0%, #afc8f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.create-mail-box h2 {
  text-align: left;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  color: #0b1630;
  font-weight: 700;
  font-size: clamp(1.5rem, 5vw, 2rem);
  letter-spacing: 0.3px;
}

.editor-subtitle {
  margin: -18px 0 20px;
  color: #35507f;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.selected-template-heading {
  margin: 0 0 8px;
  color: #264173;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.import-block {
  margin: 0 0 18px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(15, 31, 61, 0.22);
  background: linear-gradient(135deg, #edf3ff 0%, #c9d9fb 100%);
}

.import-title {
  margin: 0 0 12px;
  color: #0b1630;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.3px;
}

.import-hint {
  margin: 10px 0 0;
  color: #3b4f72;
  font-size: 0.85rem;
}

.form-group.span-2 {
  grid-column: 1 / -1;
}

.form-group {
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #0f1f3d;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group select,
.form-group textarea {
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
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5281ff;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(82, 129, 255, 0.15);
}

.select-search {
  position: relative;
}

.select-search input {
  width: 100%;
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 220px;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid rgba(15, 31, 61, 0.22);
  border-radius: 10px;
  padding: 6px;
  z-index: 20;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
}

.select-option {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #0b1630;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.select-option:hover,
.select-option:focus {
  background: rgba(82, 129, 255, 0.18);
  color: #0b1630;
  outline: none;
}

.form-group select {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #4b6189 50%),
    linear-gradient(135deg, #4b6189 50%, transparent 50%);
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
  padding: 12px 16px;
  background: linear-gradient(135deg, #4a78ff, #2f58d9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(82, 129, 255, 0.28);
  letter-spacing: 0.3px;
  margin-top: clamp(0.5rem, 2vw, 1rem);
}

.primary-button:hover {
  background: linear-gradient(135deg, #6a94ff, #5281ff);
  box-shadow: 0 10px 20px rgba(82, 129, 255, 0.35);
  transform: translateY(-1px);
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
  background: rgba(24, 140, 80, 0.12);
  color: #1b5e3f;
  border: 1px solid rgba(24, 140, 80, 0.35);
  font-size: 0.9rem;
}

.helper-text {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #3b4f72;
}

@media (max-width: 1000px) {
  .create-mail-wrapper {
    grid-template-columns: 1fr;
  }

  .preview-box {
    position: static;
  }
}
</style>
