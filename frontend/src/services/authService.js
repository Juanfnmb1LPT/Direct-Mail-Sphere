import {
    normalizeProfile,
    normalizeUserType,
    notifyProfileUpdated,
    PROFILE_KEY,
    CURRENT_USER_KEY,
    USER_TYPE_KEY
} from './profileDefaults'

const API_BASE = 'http://localhost:3001'

const cacheProfile = (profile) => {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(normalizeProfile(profile)))
        notifyProfileUpdated()
    } catch (error) {
        // Ignore storage errors.
    }
}

const cacheCurrentUser = (userId) => {
    try {
        if (userId) {
            localStorage.setItem(CURRENT_USER_KEY, userId)
        } else {
            localStorage.removeItem(CURRENT_USER_KEY)
        }
    } catch (error) {
        // Ignore storage errors.
    }
}

const cacheUserType = (userType) => {
    try {
        localStorage.setItem(USER_TYPE_KEY, normalizeUserType(userType))
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
        cacheCurrentUser(data?.user?.id)
        cacheUserType(data?.user?.userType)
        return data
    },
    async signup(firstName, lastName, email, phone, password) {
        const response = await fetch(`${API_BASE}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, phone, password })
        })

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}))
            return {
                success: false,
                message: errorBody?.message || 'Signup failed'
            }
        }

        const data = await response.json()
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
    async verifyEmail(token) {
        const response = await fetch(`${API_BASE}/api/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}))
            return {
                success: false,
                message: errorBody?.message || 'Email verification failed'
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
