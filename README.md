# 🚀 Adulting OS — Life Admin Dashboard

A full-stack MERN application that acts as an **Operating System for Adult Life** — centralizing documents, subscriptions, health, vehicles, warranties, receipts, deliveries, and deadlines into one beautiful dashboard.

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite, Tailwind CSS v4 |
| State | Context API + TanStack React Query |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh token), bcrypt, OTP email |
| File Storage | Cloudinary |
| Email | Nodemailer |
| Scheduler | node-cron (daily at 8AM IST) |
| Charts | Recharts |
| Animations | Framer Motion |

---

## 📦 Project Structure

```
adulting-os/
├── backend/              # Express API
│   ├── config/           # DB, Cloudinary, Nodemailer
│   ├── controllers/      # Business logic (12 controllers)
│   ├── middleware/       # Auth, upload, error, ratelimiter
│   ├── models/           # MongoDB schemas (11 models)
│   ├── routes/           # REST API routes
│   ├── jobs/             # Cron reminder job
│   ├── utils/            # Token helpers, email templates
│   ├── .env.example      # Environment variable template
│   └── server.js         # Entry point
└── frontend/             # React app
    └── src/
        ├── api/          # Axios client + endpoints
        ├── context/      # AuthContext, NotificationContext
        ├── components/   # Layout (Sidebar, Header) + UI primitives
        └── pages/        # All 18 pages
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (free tier works)
- Gmail account (for email reminders)

### 1. Clone & Install

```bash
# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random secret string (min 32 chars) |
| `JWT_REFRESH_SECRET` | Different random secret |
| `CLOUDINARY_CLOUD_NAME` | From cloudinary.com/console |
| `CLOUDINARY_API_KEY` | From cloudinary.com/console |
| `CLOUDINARY_API_SECRET` | From cloudinary.com/console |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail App Password (not regular password) |
| `FRONTEND_URL` | `http://localhost:5173` |

> **Getting Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate

### 3. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

---

## 🔐 Authentication Flow

```
Register → OTP Email Verification → Login
→ Access Token (15min) + Refresh Token (7d, httpOnly cookie)
→ Auto-refresh on expiry
```

Forgot password: Email link → Reset password → Auto login

---

## 📋 API Reference

All endpoints are under `/api/v1/`:

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/verify-otp`, `/auth/forgot-password`, `/auth/reset-password/:token` |
| Dashboard | `GET /dashboard` |
| Documents | `GET/POST /documents`, `GET/PUT/DELETE /documents/:id` |
| Subscriptions | `GET/POST /subscriptions`, `GET/PUT/DELETE /subscriptions/:id`, `GET /subscriptions/analytics` |
| Health | `GET/POST /health`, `GET/PUT/DELETE /health/:id` |
| Vehicles | `GET/POST /vehicles`, CRUD + `/fuel-log`, `/service`, `/analytics` |
| Warranties | `GET/POST /warranties`, `GET/PUT/DELETE /warranties/:id` |
| Receipts | `GET/POST /receipts`, CRUD + `/folders` |
| Deliveries | `GET/POST /deliveries`, CRUD + `PATCH /:id/status` |
| Deadlines | `GET/POST /deadlines`, CRUD + `PATCH /:id/complete` |
| Notifications | `GET /notifications`, mark read, delete, clear |
| Analytics | `GET /analytics` |

---

## ⏰ Reminder System

A daily cron job runs every morning at **8:00 AM IST** and:
1. Checks expiring documents (30 days)
2. Checks subscription renewals (7 days)
3. Checks expiring warranties (14 days)
4. Checks upcoming deadlines (7 days)
5. Checks vehicle insurance/PUC expiry (14 days)
6. Creates in-app notifications
7. Sends email digest to users with email reminders enabled

---

## 🗂 Database Models

11 MongoDB models: `User`, `Document`, `Subscription`, `HealthRecord`, `Vehicle`, `Warranty`, `Receipt`, `Delivery`, `Deadline`, `Notification`

All models include:
- User reference for data isolation
- Timestamps
- Proper indexing for performance
- Full-text search where applicable

---

## 🎨 UI Features

- **Dark mode** glassmorphism design
- **Framer Motion** animations on every card and page transition  
- **Recharts** for spending analytics (area, pie, bar charts)
- **Loading skeletons** for async states
- **Toast notifications** (react-hot-toast)
- **Drag-and-drop** file uploads (react-dropzone)
- **Form validation** (react-hook-form + zod)
- **Responsive** sidebar layout for desktop and mobile

---

## 📱 Modules

| # | Module | Features |
|---|--------|----------|
| 1 | Dashboard | Unified overview, alerts, stats |
| 2 | Document Vault | Upload, expiry tracking, search |
| 3 | Subscriptions | Renewal tracking, monthly spend analytics |
| 4 | Health Records | Reports, prescriptions, family profiles |
| 5 | Vehicles | Insurance, PUC, fuel & service logs |
| 6 | Warranties | Product warranties, invoice upload |
| 7 | Receipts | Organized storage with folders & tags |
| 8 | Deliveries | Status tracking for all platforms |
| 9 | Deadlines | Priority reminders, overdue detection |
| + | Analytics | Charts for all spending categories |
| + | Notifications | In-app + email digest |
| + | Settings | Profile, security, preferences |

---

## 🚧 Architecture Notes

- **File uploads** stream directly to Cloudinary via Multer memory storage (no disk I/O)
- **Refresh tokens** stored in httpOnly cookies (XSS-safe)
- **Rate limiting** on auth endpoints (10 req/15min)
- **Helmet** for HTTP security headers
- **CORS** restricted to frontend URL
- All queries scoped to `user._id` for complete data isolation

---

Made with 🧠 for people who take adulting seriously.
