const API_BASE = 'http://localhost:3001'

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
        return data
    }
}
