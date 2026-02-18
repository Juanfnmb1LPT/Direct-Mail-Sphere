import { normalizeProfile, notifyProfileUpdated, PROFILE_KEY } from './profileDefaults'

const API_BASE = 'http://localhost:3001'

const loadCachedProfile = () => {
    try {
        const raw = localStorage.getItem(PROFILE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch (error) {
        return null
    }
}

const cacheProfile = (profile) => {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(normalizeProfile(profile)))
        notifyProfileUpdated()
    } catch (error) {
        // Ignore storage errors.
    }
}

export const profileService = {
    async getProfile() {
        try {
            const response = await fetch(`${API_BASE}/api/profile`)
            if (!response.ok) {
                throw new Error('Failed to load profile')
            }
            const data = await response.json()
            const normalizedProfile = normalizeProfile(data?.profile)
            cacheProfile(normalizedProfile)
            return { ...data, profile: normalizedProfile }
        } catch (error) {
            const cached = loadCachedProfile()
            if (cached) {
                return { success: true, profile: normalizeProfile(cached), fromCache: true }
            }
            return { success: false, message: error?.message || 'Unable to load profile' }
        }
    },

    async updateProfile(profile) {
        const response = await fetch(`${API_BASE}/api/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        })

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}))
            return {
                success: false,
                message: errorBody?.message || 'Unable to update profile'
            }
        }

        const data = await response.json()
        const normalizedProfile = normalizeProfile(data?.profile)
        cacheProfile(normalizedProfile)
        return { ...data, profile: normalizedProfile }
    }
}
