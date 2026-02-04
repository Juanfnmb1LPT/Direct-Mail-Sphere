import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.post('/api/login', (req, res) => {
    const { email, password } = req.body || {}

    if (email === 'test' && password === 'test123') {
        return res.json({ success: true, user: { username: 'test' } })
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' })
})

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`)
})
