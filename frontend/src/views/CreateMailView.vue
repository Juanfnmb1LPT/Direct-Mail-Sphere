<template>
  <div class="create-mail-container">
    <button type="button" class="back-button" @click="goToTemplates">
      Back to templates
    </button>
    <div class="create-mail-box">
      <div class="template-strip">
        <div class="template-row">
          <span class="template-chip selected">{{ selectedTemplateLabel }}</span>
        </div>
      </div>
      <h2>Create Mail</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div
            v-for="field in formFields"
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
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const success = ref(false)
const formData = ref({})
const fieldState = ref({})

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
    id: 'house_image_url',
    label: 'House image URL',
    type: 'url',
    placeholder: 'https://example.com/house.jpg',
    autocomplete: 'url',
    required: true,
    fullWidth: true
  },
  {
    id: 'house_address',
    label: 'House address',
    type: 'text',
    placeholder: '123 Main St',
    autocomplete: 'street-address',
    required: true,
    fullWidth: true
  },
  {
    id: 'city',
    label: 'City',
    type: 'text',
    placeholder: 'City',
    autocomplete: 'address-level2',
    required: true
  },
  {
    id: 'state',
    label: 'State',
    type: 'select-search',
    options: [
      { value: 'AL', label: 'AL - Alabama' },
      { value: 'AK', label: 'AK - Alaska' },
      { value: 'AZ', label: 'AZ - Arizona' },
      { value: 'AR', label: 'AR - Arkansas' },
      { value: 'CA', label: 'CA - California' },
      { value: 'CO', label: 'CO - Colorado' },
      { value: 'CT', label: 'CT - Connecticut' },
      { value: 'DE', label: 'DE - Delaware' },
      { value: 'FL', label: 'FL - Florida' },
      { value: 'GA', label: 'GA - Georgia' },
      { value: 'HI', label: 'HI - Hawaii' },
      { value: 'ID', label: 'ID - Idaho' },
      { value: 'IL', label: 'IL - Illinois' },
      { value: 'IN', label: 'IN - Indiana' },
      { value: 'IA', label: 'IA - Iowa' },
      { value: 'KS', label: 'KS - Kansas' },
      { value: 'KY', label: 'KY - Kentucky' },
      { value: 'LA', label: 'LA - Louisiana' },
      { value: 'ME', label: 'ME - Maine' },
      { value: 'MD', label: 'MD - Maryland' },
      { value: 'MA', label: 'MA - Massachusetts' },
      { value: 'MI', label: 'MI - Michigan' },
      { value: 'MN', label: 'MN - Minnesota' },
      { value: 'MS', label: 'MS - Mississippi' },
      { value: 'MO', label: 'MO - Missouri' },
      { value: 'MT', label: 'MT - Montana' },
      { value: 'NE', label: 'NE - Nebraska' },
      { value: 'NV', label: 'NV - Nevada' },
      { value: 'NH', label: 'NH - New Hampshire' },
      { value: 'NJ', label: 'NJ - New Jersey' },
      { value: 'NM', label: 'NM - New Mexico' },
      { value: 'NY', label: 'NY - New York' },
      { value: 'NC', label: 'NC - North Carolina' },
      { value: 'ND', label: 'ND - North Dakota' },
      { value: 'OH', label: 'OH - Ohio' },
      { value: 'OK', label: 'OK - Oklahoma' },
      { value: 'OR', label: 'OR - Oregon' },
      { value: 'PA', label: 'PA - Pennsylvania' },
      { value: 'RI', label: 'RI - Rhode Island' },
      { value: 'SC', label: 'SC - South Carolina' },
      { value: 'SD', label: 'SD - South Dakota' },
      { value: 'TN', label: 'TN - Tennessee' },
      { value: 'TX', label: 'TX - Texas' },
      { value: 'UT', label: 'UT - Utah' },
      { value: 'VT', label: 'VT - Vermont' },
      { value: 'VA', label: 'VA - Virginia' },
      { value: 'WA', label: 'WA - Washington' },
      { value: 'WV', label: 'WV - West Virginia' },
      { value: 'WI', label: 'WI - Wisconsin' },
      { value: 'WY', label: 'WY - Wyoming' },
      { value: 'DC', label: 'DC - District of Columbia' }
    ],
    placeholder: 'Start typing a state',
    autocomplete: 'address-level1',
    required: true
  },
  {
    id: 'zip_code',
    label: 'Zip code',
    type: 'text',
    placeholder: '00000',
    autocomplete: 'postal-code',
    required: true
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

const templates = [
  { id: 'template-1', name: 'Template 1', fields: templateOneFields },
  { id: 'template-2', name: 'Template 2 - TODO', fields: defaultFields },
  { id: 'template-3', name: 'Template 3 - TODO', fields: defaultFields },
  { id: 'template-4', name: 'Template 4 - TODO', fields: defaultFields },
  { id: 'template-5', name: 'Template 5 - TODO', fields: defaultFields },
  { id: 'template-6', name: 'Template 6 - TODO', fields: defaultFields },
  { id: 'template-7', name: 'Template 7 - TODO', fields: defaultFields },
  { id: 'template-8', name: 'Template 8 - TODO', fields: defaultFields },
  { id: 'template-9', name: 'Template 9 - TODO', fields: defaultFields },
  { id: 'template-10', name: 'Template 10 - TODO', fields: defaultFields }
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

const formFields = computed(() => selectedTemplateConfig.value?.fields || defaultFields)

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
  },
  { immediate: true }
)

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
  if (/^https?:\/\//i.test(value)) return
  formData.value[fieldId] = `https://${value}`
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

const handleSubmit = () => {
  formFields.value
    .filter((field) => field.type === 'url')
    .forEach((field) => normalizeUrlField(field.id))

  const rows = [
    ['template', ...formFields.value.map((field) => field.id)],
    [
      selectedTemplate.value,
      ...formFields.value.map((field) =>
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

.template-strip {
  margin-bottom: 20px;
}

.template-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.template-chip {
  border: 1.5px solid rgba(82, 129, 255, 0.35);
  background: rgba(11, 26, 56, 0.72);
  color: #c9d8ff;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-chip:hover {
  border-color: #5281ff;
  color: #ffffff;
}

.template-chip.selected {
  border-color: #5281ff;
  color: #ffffff;
  background: linear-gradient(135deg, #4a78ff, #2f58d9);
  box-shadow: 0 10px 18px rgba(82, 129, 255, 0.35);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group.span-2 {
  grid-column: 1 / -1;
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
  background: rgba(11, 26, 56, 0.98);
  border: 1px solid rgba(82, 129, 255, 0.6);
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
  color: #c9d8ff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.select-option:hover,
.select-option:focus {
  background: rgba(82, 129, 255, 0.18);
  color: #ffffff;
  outline: none;
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

.helper-text {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #b8c9ff;
}
</style>
