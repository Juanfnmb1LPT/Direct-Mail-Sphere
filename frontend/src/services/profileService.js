const API_BASE = 'http://localhost:3001'
const PROFILE_KEY = 'direct-mail-profile'

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
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
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
            if (data?.profile) {
                cacheProfile(data.profile)
            }
            return data
        } catch (error) {
            const cached = loadCachedProfile()
            if (cached) {
                return { success: true, profile: cached, fromCache: true }
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
        if (data?.profile) {
            cacheProfile(data.profile)
        }
        return data
    }
}
