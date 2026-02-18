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

## Features

### Authentication & Security
- **User signup with email verification** - New users must verify their email address via a link sent to their inbox before logging in
- **Secure login system** - Supports login with username or email
- **Password reset flow** - Users can request a password reset link via email with 15-minute token expiry
- **Email verification tokens** - 24-hour verification links for new account activation

### Email Integration (Resend)
- **Verification emails** - Automated email delivery for account verification
- **Password reset emails** - Secure password reset links sent via email
- **CSV export delivery** - Send campaign data exports directly to users via email

### User Management
- **User profiles** - Manage personal information, contact details, MLS numbers, and photos
- **Profile updates** - Edit and save profile information with persistence
- **Default user seeding** - Test user automatically created on first launch

### Direct Mail Campaigns
- **Template selection** - Choose from pre-designed mail templates
- **Campaign creation** - Build and customize direct mail campaigns
- **Address targeting** - Select and manage recipient addresses
- **Order processing** - Complete payment flow for campaign orders

### Order Tracking
- **Order history** - View all past and current direct mail orders
- **Status management** - Track order status (Placed, In Progress, Issue, Done)
- **Filtering & search** - Filter by status and search by date, order number, or address
- **Sortable columns** - Sort orders by date, number, or address
- **Status updates** - Change order status directly from the order history view

### Additional Features
- **Map view** - Visualize target areas and addresses on an interactive map
- **Responsive design** - Modern UI with gradient backgrounds and smooth animations
- **Data persistence** - LocalStorage and JSON file-based data storage
- **Demo data generation** - Seed random orders for testing

## Test credentials
- Username: `test`
- Password: `test123`