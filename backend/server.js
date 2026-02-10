import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const PORT = process.env.PORT || 3001
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'users.json')

let store = { users: [] }

const defaultStore = {
    users: [
        {
            id: 'user-1',
            username: 'test',
            password: 'test123',
            profile: {
                firstName: 'Taylor',
                lastName: 'Morgan',
                email: 'taylor.morgan@example.com',
                phone: '555-123-4567',
                company: 'Mail Sphere'
            }
        }
    ]
}

const loadStore = async () => {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true })
        const raw = await fs.readFile(DATA_FILE, 'utf-8').catch(() => '')
        if (!raw) {
            store = defaultStore
            await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2))
            return
        }

        const parsed = JSON.parse(raw)
        if (!parsed?.users?.length) {
            store = defaultStore
            await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2))
            return
        }

        store = parsed
    } catch (error) {
        store = defaultStore
    }
}

const saveStore = async () => {
    await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2))
}

const findUserByLogin = (login) =>
    store.users.find(
        (user) =>
            user.username?.toLowerCase() === login.toLowerCase() ||
            user.profile?.email?.toLowerCase() === login.toLowerCase()
    )

const getPrimaryUser = () => store.users[0]

const validateProfile = (profile) => {
    if (!profile?.firstName || !profile?.lastName || !profile?.email) {
        return { ok: false, message: 'First name, last name, and email are required.' }
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
    if (!emailValid) {
        return { ok: false, message: 'Enter a valid email address.' }
    }

    return { ok: true }
}

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.post('/api/login', (req, res) => {
    const { email, password } = req.body || {}
    const user = findUserByLogin(email || '')

    if (user && user.password === password) {
        return res.json({
            success: true,
            user: { id: user.id, username: user.username },
            profile: user.profile
        })
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' })
})

app.get('/api/profile', (req, res) => {
    const user = getPrimaryUser()
    if (!user) {
        return res.status(404).json({ success: false, message: 'Profile not found.' })
    }

    return res.json({ success: true, profile: user.profile })
})

app.put('/api/profile', async (req, res) => {
    const user = getPrimaryUser()
    if (!user) {
        return res.status(404).json({ success: false, message: 'Profile not found.' })
    }

    const updates = req.body || {}
    const nextProfile = {
        ...user.profile,
        ...updates
    }

    const validation = validateProfile(nextProfile)
    if (!validation.ok) {
        return res.status(400).json({ success: false, message: validation.message })
    }

    user.profile = nextProfile

    try {
        await saveStore()
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: 'Unable to save profile.' })
    }

    return res.json({ success: true, profile: user.profile })
})

const startServer = async () => {
    await loadStore()
    app.listen(PORT, () => {
        console.log(`Backend running on http://localhost:${PORT}`)
    })
}

startServer()
