# Mail Sphere Project

Separate frontend (Vue 3 + Vite) and backend (Node + Express) with a basic login page.

## Requirements
- Node.js 18+

## Quick start

### Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on http://localhost:3001

### CSV email setup (Resend)

Each teammate should use their own Resend account and API key.

1. In Resend, create an API key.
2. Create a local env file from the template:

```bash
cd backend
copy .env.example .env
```

3. Update `backend/.env` values:
	- `RESEND_API_KEY=...`
	- `RESEND_FROM_EMAIL=...`

The backend automatically reads env vars from either:
- `backend/.env` (recommended), or
- `env/.env`

Notes:
- `.env` files are ignored by git and stay local.
- If Resend returns a sandbox/testing error, send only to your own Resend account email, or verify a domain in Resend and use a sender address from that domain.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

## Test credentials
- Username: `test`
- Password: `test123`