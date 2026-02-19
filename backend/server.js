import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { Resend } from 'resend'
import dotenv from 'dotenv'

const app = express()
const PORT = process.env.PORT || 3001
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', 'env', '.env')
]

envPaths.forEach((envPath) => {
    dotenv.config({ path: envPath, override: false })
})
const cleanEnv = (value) => String(value || '').trim().replace(/^['"]|['"]$/g, '')
const RESEND_API_KEY = cleanEnv(process.env.RESEND_API_KEY)
const RESEND_FROM_EMAIL = cleanEnv(process.env.RESEND_FROM_EMAIL) || 'onboarding@resend.dev'
const RESET_BASE_URL = cleanEnv(process.env.RESET_BASE_URL) || 'http://localhost:5173/reset-password'
const VERIFY_BASE_URL = cleanEnv(process.env.VERIFY_BASE_URL) || 'http://localhost:5173/verify-email'
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'users.json')
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const resetTokens = new Map()
const userResetTokens = new Map()
const verifyTokens = new Map()
const userVerifyTokens = new Map()

let store = { users: [], listings: [] }

const USER_TYPES = new Set(['standard', 'admin'])

const normalizeUserType = (value) => {
    const normalized = String(value || '').toLowerCase().trim()
    return USER_TYPES.has(normalized) ? normalized : 'standard'
}

const defaultStore = {
    users: [
        {
            id: 'user-1',
            username: 'test',
            password: 'test123',
            emailVerified: true,
            userType: 'standard',
            profile: {
                firstName: 'Taylor',
                lastName: 'Morgan',
                email: 'taylor.morgan@example.com',
                phone: '555-123-4567',
                mlsNumber: 'MLS123456',
                agentPhoto: 'https://t4.ftcdn.net/jpg/05/45/89/41/360_F_545894172_fLINXPGJs19SgFvA3P6vTvXN59iScZJ0.jpg',
                companyLogo: ''
            },
            orderHistory: []
        },
        {
            id: 'user-2',
            username: 'admintest',
            password: 'admintest123',
            emailVerified: true,
            userType: 'admin',
            profile: {
                firstName: 'Admin',
                lastName: 'Test',
                email: 'admintest@example.com',
                phone: '555-987-6543',
                mlsNumber: '',
                agentPhoto: '',
                companyLogo: ''
            },
            orderHistory: []
        }
    ],
    listings: []
}

const normalizeUsers = (users = []) =>
    users.map((user) => {
        const { listings, ...rest } = user || {}
        return {
            ...rest,
            userType: normalizeUserType(rest?.userType),
            listings: []
        }
    })

const normalizeListings = (listings = [], users = []) => {
    const validUserIds = new Set(users.map((user) => user.id))
    return listings
        .filter((listing) => listing && listing.userId && validUserIds.has(listing.userId))
        .map((listing) => ({ ...listing }))
}

const getListingsForUser = (userId) =>
    (store.listings || []).filter((listing) => listing.userId === userId)

const setListingsForUser = (userId, incomingListings = []) => {
    const otherUsersListings = (store.listings || []).filter((listing) => listing.userId !== userId)
    const nextUserListings = incomingListings.map((listing) => ({
        ...listing,
        userId
    }))
    store.listings = [...otherUsersListings, ...nextUserListings]
    return nextUserListings
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

        const users = normalizeUsers(parsed.users)
        const legacyListings = parsed.users.flatMap((user) =>
            (user?.listings || []).map((listing) => ({
                ...listing,
                userId: listing?.userId || user.id
            }))
        )

        const sourceListings = Array.isArray(parsed.listings) ? parsed.listings : legacyListings
        const listings = normalizeListings(sourceListings, users)

        store = {
            ...parsed,
            users,
            listings
        }
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

const getUserByHeader = (req) => {
    const userId = req.headers['x-user-id']
    if (!userId) return getPrimaryUser()
    return store.users.find((user) => user.id === userId)
}

const pruneExpiredResetTokens = () => {
    const now = Date.now()
    for (const [token, entry] of resetTokens.entries()) {
        if (!entry || entry.expiresAt <= now) {
            resetTokens.delete(token)
        }
    }
    for (const [userId, token] of userResetTokens.entries()) {
        if (!resetTokens.has(token)) {
            userResetTokens.delete(userId)
        }
    }
}

const buildResetUrl = (token) => {
    try {
        const url = new URL(RESET_BASE_URL)
        url.searchParams.set('token', token)
        return url.toString()
    } catch {
        return `${RESET_BASE_URL}?token=${encodeURIComponent(token)}`
    }
}

const buildVerifyUrl = (token) => {
    try {
        const url = new URL(VERIFY_BASE_URL)
        url.searchParams.set('token', token)
        return url.toString()
    } catch {
        return `${VERIFY_BASE_URL}?token=${encodeURIComponent(token)}`
    }
}

const pruneExpiredVerifyTokens = () => {
    const now = Date.now()
    for (const [token, entry] of verifyTokens.entries()) {
        if (!entry || entry.expiresAt <= now) {
            verifyTokens.delete(token)
        }
    }
    for (const [userId, token] of userVerifyTokens.entries()) {
        if (!verifyTokens.has(token)) {
            userVerifyTokens.delete(userId)
        }
    }
}

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

const ORDER_STATUS_VALUES = new Set(['placed', 'in progress', 'issue', 'done', 'delivered'])

const normalizeOrderStatus = (value) => {
    const normalized = String(value || '').toLowerCase().trim()
    if (normalized === 'done') {
        return 'delivered'
    }
    return ORDER_STATUS_VALUES.has(normalized) ? normalized : 'placed'
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
        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address before logging in. Check your inbox for the verification link.'
            })
        }
        return res.json({
            success: true,
            user: { id: user.id, username: user.username, userType: normalizeUserType(user.userType) },
            profile: user.profile
        })
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' })
})

app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body || {}

    const cleanedEmail = String(email || '').trim()
    const cleanedFirstName = String(firstName || '').trim()
    const cleanedLastName = String(lastName || '').trim()
    const cleanedPhone = String(phone || '').trim()
    const cleanedPassword = String(password || '').trim()

    if (!cleanedFirstName || !cleanedLastName || !cleanedEmail || !cleanedPhone || !cleanedPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' })
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)
    if (!emailValid) {
        return res.status(400).json({ success: false, message: 'Enter a valid email address.' })
    }

    const newUser = {
        id: `user-${Date.now()}`,
        username: cleanedEmail,
        password: cleanedPassword,
        emailVerified: false,
        userType: 'standard',
        profile: {
            firstName: cleanedFirstName,
            lastName: cleanedLastName,
            email: cleanedEmail,
            phone: cleanedPhone,
            mlsNumber: '',
            agentPhoto: '',
            companyLogo: ''
        },
        orderHistory: []
    }

    store.users.push(newUser)

    try {
        await saveStore()
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to create account.' })
    }

    if (!resend) {
        return res.status(500).json({ success: false, message: 'Email service is not configured.' })
    }

    pruneExpiredVerifyTokens()
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + VERIFY_TOKEN_TTL_MS
    verifyTokens.set(token, { userId: newUser.id, expiresAt })
    userVerifyTokens.set(newUser.id, token)
    const verifyUrl = buildVerifyUrl(token)
    const emailBodyHtml = `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 640px; margin: 0 auto; color: #0f1f3d;">
            <h2 style="margin: 0 0 10px; font-size: 20px;">Verify your Direct Mail Sphere account</h2>
            <p style="margin: 0 0 12px; line-height: 1.5;">Hi ${cleanedFirstName},</p>
            <p style="margin: 0 0 12px; line-height: 1.5;">Thank you for signing up! Please verify your email address by clicking the button below. This link will expire in 24 hours.</p>
            <a href="${verifyUrl}" style="display: inline-block; margin-top: 8px; padding: 10px 16px; background: #3d5aff; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Verify email address</a>
            <p style="margin: 16px 0 0; font-size: 13px; color: #35507f;">If the button does not work, copy and paste this link into your browser:</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #35507f;">${verifyUrl}</p>
        </div>
    `

    try {
        await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: [cleanedEmail],
            subject: 'Verify your Direct Mail Sphere email',
            text: `Verify your email address: ${verifyUrl}`,
            html: emailBodyHtml
        })
    } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        return res.status(500).json({ success: false, message: 'Unable to send verification email.' })
    }

    return res.json({
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        requiresVerification: true
    })
})

app.post('/api/verify-email', async (req, res) => {
    const { token } = req.body || {}
    const cleanedToken = String(token || '').trim()

    if (!cleanedToken) {
        return res.status(400).json({ success: false, message: 'Verification token is required.' })
    }

    pruneExpiredVerifyTokens()
    const entry = verifyTokens.get(cleanedToken)
    if (!entry) {
        return res.status(400).json({ success: false, message: 'Verification link is invalid or expired.' })
    }

    const user = store.users.find((item) => item.id === entry.userId)
    if (!user) {
        verifyTokens.delete(cleanedToken)
        return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    if (user.emailVerified) {
        verifyTokens.delete(cleanedToken)
        userVerifyTokens.delete(user.id)
        return res.json({ success: true, message: 'Email already verified. You can now log in.' })
    }

    user.emailVerified = true

    try {
        await saveStore()
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to verify email.' })
    }

    verifyTokens.delete(cleanedToken)
    userVerifyTokens.delete(user.id)

    return res.json({ success: true, message: 'Email verified successfully! You can now log in.' })
})

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body || {}
    const cleanedEmail = String(email || '').trim()

    if (!cleanedEmail) {
        return res.status(400).json({ success: false, message: 'Email is required.' })
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)
    if (!emailValid) {
        return res.status(400).json({ success: false, message: 'Enter a valid email address.' })
    }

    if (!resend) {
        return res.status(500).json({ success: false, message: 'Resend is not configured.' })
    }

    pruneExpiredResetTokens()
    const user = store.users.find(
        (entry) => entry.profile?.email?.toLowerCase() === cleanedEmail.toLowerCase()
    )

    if (!user) {
        return res.json({
            success: true,
            message: 'If that email exists, we sent your password.'
        })
    }

    const existingToken = userResetTokens.get(user.id)
    if (existingToken) {
        resetTokens.delete(existingToken)
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + RESET_TOKEN_TTL_MS
    resetTokens.set(token, { userId: user.id, expiresAt })
    userResetTokens.set(user.id, token)
    const resetUrl = buildResetUrl(token)
    const emailBodyHtml = `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 640px; margin: 0 auto; color: #0f1f3d;">
            <h2 style="margin: 0 0 10px; font-size: 20px;">Reset your Direct Mail Sphere password</h2>
            <p style="margin: 0 0 12px; line-height: 1.5;">Use the link below to set a new password. This link expires in 15 minutes.</p>
            <a href="${resetUrl}" style="display: inline-block; margin-top: 8px; padding: 10px 16px; background: #3d5aff; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset password</a>
            <p style="margin: 16px 0 0; font-size: 13px; color: #35507f;">If the button does not work, copy and paste this link into your browser:</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #35507f;">${resetUrl}</p>
        </div>
    `

    try {
        const sent = await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: [cleanedEmail],
            subject: 'Reset your Direct Mail Sphere password',
            text: `Reset your Direct Mail Sphere password: ${resetUrl}`,
            html: emailBodyHtml
        })

        if (sent?.error) {
            return res.status(502).json({
                success: false,
                message: sent.error.message || 'Email provider rejected the request.',
                providerError: sent.error
            })
        }

        return res.json({ success: true, message: 'Password reset email sent.' })
    } catch (error) {
        return res.status(502).json({
            success: false,
            message: error?.message || 'Unable to send password reset email.'
        })
    }
})

app.post('/api/reset-password', async (req, res) => {
    const { token, password } = req.body || {}
    const cleanedToken = String(token || '').trim()
    const nextPassword = String(password || '').trim()

    if (!cleanedToken) {
        return res.status(400).json({ success: false, message: 'Reset token is required.' })
    }

    if (!nextPassword) {
        return res.status(400).json({ success: false, message: 'New password is required.' })
    }

    pruneExpiredResetTokens()
    const entry = resetTokens.get(cleanedToken)
    if (!entry) {
        return res.status(400).json({ success: false, message: 'Reset token is invalid or expired.' })
    }

    const user = store.users.find((item) => item.id === entry.userId)
    if (!user) {
        resetTokens.delete(cleanedToken)
        return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    user.password = nextPassword

    try {
        await saveStore()
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to save new password.' })
    }

    resetTokens.delete(cleanedToken)
    userResetTokens.delete(user.id)

    return res.json({ success: true, message: 'Password updated.' })
})

app.get('/api/profile', (req, res) => {
    const user = getUserByHeader(req)
    if (!user) {
        return res.status(404).json({ success: false, message: 'Profile not found.' })
    }

    return res.json({ success: true, profile: user.profile })
})

app.put('/api/profile', async (req, res) => {
    const user = getUserByHeader(req)
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

app.post('/api/send-csv', async (req, res) => {
    const { recipientEmail, csvContent, templateName } = req.body || {}

    const email = String(recipientEmail || '').trim()
    const csv = String(csvContent || '')

    if (!email) {
        return res.status(400).json({ success: false, message: 'Recipient email is required.' })
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailValid) {
        return res.status(400).json({ success: false, message: 'Enter a valid recipient email.' })
    }

    if (!csv) {
        return res.status(400).json({ success: false, message: 'CSV content is required.' })
    }

    if (!resend) {
        return res.status(500).json({ success: false, message: 'Resend is not configured.' })
    }

    try {
        const subjectPrefix = String(templateName || 'Direct Mail Sphere').trim()
        const emailBodyHtml = `
                    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 640px; margin: 0 auto; color: #0f1f3d;">
                        <h2 style="margin: 0 0 10px; font-size: 20px;">Your CSV export is ready</h2>
                        <p style="margin: 0 0 12px; line-height: 1.5;">Attached is your CSV export from Direct Mail Sphere.</p>
                        <p style="margin: 0; font-size: 13px; color: #35507f;">Template: ${subjectPrefix}</p>
                    </div>
                `
        const sent = await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: [email],
            subject: `${subjectPrefix} - CSV export`,
            text: 'Attached is your CSV export from Direct Mail Sphere.',
            html: emailBodyHtml,
            attachments: [
                {
                    filename: 'create-mail.csv',
                    content: Buffer.from(csv).toString('base64')
                }
            ]
        })

        if (sent?.error) {
            return res.status(502).json({
                success: false,
                message: sent.error.message || 'Email provider rejected the request.',
                providerError: sent.error
            })
        }

        const messageId = sent?.data?.id || sent?.id || null
        if (!messageId) {
            return res.status(502).json({
                success: false,
                message: 'Email provider did not return a message id.',
                providerResponse: sent
            })
        }

        return res.json({ success: true, id: messageId })
    } catch (error) {
        return res.status(502).json({
            success: false,
            message: error?.message || 'Unable to send CSV email.'
        })
    }
})

app.get('/api/listings', (req, res) => {
    const user = getUserByHeader(req)
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' })
    }

    return res.json({ success: true, listings: getListingsForUser(user.id) })
})

app.post('/api/listings', async (req, res) => {
    const user = getUserByHeader(req)
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' })
    }

    const incoming = req.body?.listings || []
    if (!Array.isArray(incoming)) {
        return res.status(400).json({ success: false, message: 'Listings must be an array.' })
    }

    const nextListings = setListingsForUser(user.id, incoming)

    try {
        await saveStore()
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to save listings.' })
    }

    return res.json({ success: true, listings: nextListings })
})

app.put('/api/listings/:id', async (req, res) => {
    const user = getUserByHeader(req)
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' })
    }

    const { id } = req.params
    const updates = req.body || {}

    const index = (store.listings || []).findIndex((l) => l.id === id && l.userId === user.id)
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Listing not found.' })
    }

    store.listings[index] = { ...store.listings[index], ...updates, userId: user.id }

    try {
        await saveStore()
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to update listing.' })
    }

    return res.json({ success: true, listing: store.listings[index] })
})

app.delete('/api/listings/:id', async (req, res) => {
    const user = getUserByHeader(req)
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' })
    }

    const { id } = req.params

    const index = (store.listings || []).findIndex((l) => l.id === id && l.userId === user.id)
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Listing not found.' })
    }

    store.listings.splice(index, 1)

    try {
        await saveStore()
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to delete listing.' })
    }

    return res.json({ success: true })
})

app.get('/api/order-history', async (req, res) => {
    try {
        await loadStore()
    } catch {
        return res.status(500).json({ success: false, message: 'Unable to load order history.' })
    }

    const user = getUserByHeader(req)
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' })
    }

    return res.json({ success: true, orderHistory: user.orderHistory || [] })
})

app.post('/api/order-history', async (req, res) => {
    try {
        await loadStore()
    } catch {
        return res.status(500).json({ success: false, message: 'Unable to load order history.' })
    }

    const user = getUserByHeader(req)
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' })
    }

    const incoming = req.body?.orderHistory || []
    if (!Array.isArray(incoming)) {
        return res.status(400).json({ success: false, message: 'Order history must be an array.' })
    }

    if (!user.orderHistory) {
        user.orderHistory = []
    }

    const existingStatusById = new Map(
        user.orderHistory
            .filter((order) => order && order.id)
            .map((order) => [order.id, normalizeOrderStatus(order.status)])
    )

    // Replace all orders with new ones, ensuring each has a userId.
    // Status is preserved for existing records and defaults to "placed" for new records.
    user.orderHistory = incoming.map((order) => ({
        ...order,
        status: existingStatusById.get(order?.id) || 'placed',
        userId: user.id
    }))

    try {
        await saveStore()
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to save order history.' })
    }

    return res.json({ success: true, orderHistory: user.orderHistory })
})

app.put('/api/order-history/:id', async (req, res) => {
    try {
        await loadStore()
    } catch {
        return res.status(500).json({ success: false, message: 'Unable to load order history.' })
    }

    const user = getUserByHeader(req)
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' })
    }

    const { id } = req.params
    const updates = req.body || {}
    const { status, ...safeUpdates } = updates

    if (!user.orderHistory) {
        user.orderHistory = []
    }

    const index = user.orderHistory.findIndex((o) => o.id === id && o.userId === user.id)
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Order not found.' })
    }

    user.orderHistory[index] = { ...user.orderHistory[index], ...safeUpdates, userId: user.id }

    try {
        await saveStore()
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to update order.' })
    }

    return res.json({ success: true, order: user.orderHistory[index] })
})

const startServer = async () => {
    await loadStore()
    app.listen(PORT, () => {
        console.log(`Backend running on http://localhost:${PORT}`)
    })
}

startServer()
