import { normalizeProfile, notifyProfileUpdated, PROFILE_KEY } from './profileDefaults'

const API_BASE = 'http://localhost:3001'

const cacheProfile = (profile) => {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(normalizeProfile(profile)))
        notifyProfileUpdated()
    } catch (error) {
        // Ignore storage errors.
    }
}

export const authService = {
    async login(email, password) {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}))
            return {
                success: false,
                message: errorBody?.message || 'Login failed'
            }
        }

        const data = await response.json()
        cacheProfile(data?.profile)
        return data
    },
    async requestPasswordReset(email) {
        const response = await fetch(`${API_BASE}/api/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        })

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}))
            return {
                success: false,
                message: errorBody?.message || 'Password reminder failed'
            }
        }

        return response.json().catch(() => ({ success: true }))
    },
    async resetPassword(token, password) {
        const response = await fetch(`${API_BASE}/api/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password })
        })

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}))
            return {
                success: false,
                message: errorBody?.message || 'Password reset failed'
            }
        }

        return response.json().catch(() => ({ success: true }))
    }
}
