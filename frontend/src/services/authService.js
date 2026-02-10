const API_BASE = 'http://localhost:3001'
const PROFILE_KEY = 'direct-mail-profile'

const cacheProfile = (profile) => {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
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
        if (data?.profile) {
            cacheProfile(data.profile)
        }
        return data
    }
}
