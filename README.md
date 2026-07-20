# NJHPS Civil Complaint Cell Management System — Web App

A cloud-based complaint management system for digitally handling civil maintenance
complaints in a township: registration, assignment, tracking, completion, history,
reporting, and analytics.

> **Note:** This is a separate project from any offline desktop version of NJHPS.
> This one is a hosted web app: React/Vite frontend + Node/Express backend +
> MongoDB Atlas, deployed to Vercel/Render.

## What's included

**Backend (`/backend`)** — fully functional REST API
- JWT auth with bcrypt password hashing, role-based access control (`admin`, `operator`)
- Complaint CRUD: registration, search/filter/pagination, status updates with an
  append-only history/audit log, before/after image upload via Cloudinary, QR code
  generation on registration
- Dashboard aggregation endpoint (stat cards + chart data for Recharts)
- Report export endpoints: PDF, Excel (.xlsx), CSV
- Master data CRUD: engineers, contractors, categories, app settings
- Security: helmet, CORS, rate limiting, centralized error handling
- Seed script to create the first admin user and default complaint categories

**Frontend (`/frontend`)** — React + Vite + Tailwind, light/dark mode, mobile-first
- Login, Home (card navigation), Dashboard (charts), Register Complaint (form +
  image upload + QR/slip), Check Status, Complaints List (search/filter/pagination),
  Complaint Detail (status update + history timeline), Reports (export), Complaint
  History (global audit log), Settings (categories/engineers/contractors), Users
  (admin user management)

## What's NOT yet built (next steps)

- SMS / Email / WhatsApp notification sending (the settings toggles exist as
  fields on the `Settings` model, but no provider — Twilio, SendGrid, etc. — is
  wired up yet)
- Automated tests
- Print-optimized CSS for the acknowledgement slip (currently uses the browser's
  default print dialog on the result screen)
- API documentation (e.g. Swagger/OpenAPI)
- Cloud backup/restore tooling (MongoDB Atlas has built-in continuous backups you
  can enable in the Atlas dashboard — no custom code needed for that)

## Local setup

### Backend
```bash
cd backend
cp .env.example .env    # fill in your MongoDB Atlas URI, JWT secret, Cloudinary keys
npm install
npm run seed             # creates the default admin user (admin / ChangeMe@123)
npm run dev               # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env    # set VITE_API_URL if not using the default
npm install
npm run dev               # starts on http://localhost:5173
```

Log in with `admin` / `ChangeMe@123` and **change the password immediately** by
creating a new admin user and deactivating the seed account, or by adding a
password-change endpoint (not yet built — flag if you want this added next).

## Deployment

1. **MongoDB Atlas**: create a free/shared cluster, add a database user, allow
   network access from your backend host (or `0.0.0.0/0` for simplicity), copy
   the connection string into `MONGODB_URI`.
2. **Backend → Render**: create a Web Service pointing at `/backend`, build
   command `npm install`, start command `npm start`, add all `.env` variables
   in the Render dashboard, set `CLIENT_URL` to your deployed frontend URL.
3. **Frontend → Vercel**: import the repo, set root directory to `/frontend`,
   add `VITE_API_URL` pointing at your Render backend URL (e.g.
   `https://njhps-backend.onrender.com/api`).
4. **Cloudinary**: create a free account, copy cloud name / API key / secret
   into the backend `.env`.

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, React Hook Form, Axios, Recharts |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT, bcrypt, RBAC |
| Images | Cloudinary |
| Reports | pdfkit, exceljs |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |
