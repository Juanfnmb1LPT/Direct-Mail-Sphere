export const PROFILE_KEY = 'direct-mail-profile'
export const CURRENT_USER_KEY = 'direct-mail-current-user-id'
export const PROFILE_UPDATED_EVENT = 'direct-mail-profile-updated'

export const getCurrentUserId = () => {
  try {
    return localStorage.getItem(CURRENT_USER_KEY) || null
  } catch (error) {
    return null
  }
}

export const defaultProfileImage =
  'https://t4.ftcdn.net/jpg/05/45/89/41/360_F_545894172_fLINXPGJs19SgFvA3P6vTvXN59iScZJ0.jpg'

export const defaultProfile = {
  firstName: 'Taylor',
  lastName: 'Morgan',
  email: 'taylor.morgan@example.com',
  phone: '555-123-4567',
  mlsNumber: 'MLS123456',
  agentPhoto: defaultProfileImage,
  companyLogo: ''
}

export const normalizeProfile = (profile) => {
  const merged = {
    ...defaultProfile,
    ...(profile || {})
  }

  const image = String(merged.agentPhoto || '').trim()
  merged.agentPhoto = image || defaultProfileImage

  return merged
}

export const notifyProfileUpdated = () => {
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT))
}