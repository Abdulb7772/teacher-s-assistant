# Teacher Assistant — Course Management Portal

A production-ready **course management web application** for teachers: plan a semester course outline, track topic completion, manage students, record quiz marks with automatic grades (A+ to F), view analytics, and export everything to CSV / Excel / PDF / Print.

Premium SaaS-style UI — dark navy + gold theme, glassmorphism, framer-motion animations — built with a **Next.js (App Router) + TypeScript** frontend and an **Express + TypeScript** backend with MongoDB.

---

## ✨ Features

| Area | Details |
| --- | --- |
| **Authentication** | JWT in secure HttpOnly cookies, bcrypt password hashing, remember-me (7d / 30d sessions), auto-logout on expiry, rate-limited auth endpoints |
| **Landing page** | Hero, about, live course-outline & student-marks previews, features, CTA, sticky glass navbar |
| **Course Outline** | CRUD topics (month, week, lecture no, title, description, learning outcomes, duration, status, completion date, notes), mark complete/revert, month/week/status filters, debounced search, sorting, pagination, sticky table header, PDF export |
| **Students** | CRUD (name, roll no, registration no, email, class 9th/10th), computed quiz count / average / percentage / grade, filters, CSV & Excel export |
| **Quiz Marks** | Unlimited quizzes per student, automatic average / percentage / grade (A+ ≥90, A ≥85, B+ ≥80, B ≥75, C+ ≥70, C ≥65, D ≥50, F <50), live grade preview, CSV / Excel / Print export |
| **Analytics** | 8 stat cards, completion circle, monthly progress bar chart, topic-status donut, grade distribution, student performance leaderboard, activity timeline, upcoming topics |
| **Guest access** | Read-only public course outline + student marks with search & filters (no login required) |
| **Settings** | Update profile, change password, dark/light theme toggle |
| **Security** | Helmet, CORS (credentials), rate limiting, express-mongo-sanitize, xss-clean, express-validator on every endpoint, centralized error handler, `select:false` passwords |
| **UX** | Skeleton loaders, empty states, toasts, confirm dialogs, FAB + keyboard shortcuts (`/` search, `N` new), page transitions, responsive, 404 page, dark theme default |

---

## 🧰 Tech Stack

**Frontend** — Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, React Hook Form, React Hot Toast, Axios, TanStack Table, TanStack React Query, Recharts, Lucide Icons, xlsx, jspdf

**Backend** — Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcryptjs, dotenv, Helmet, Morgan, Express Validator, CORS, Express Rate Limit, Cookie Parser, Compression

---

## 📁 Folder Structure

```
school/
├── client/                      # Next.js frontend
│   ├── app/
│   │   ├── (public)/            # Landing, course-outline, students, students/[id]
│   │   ├── (auth)/              # login, signup
│   │   ├── (protected)/          # dashboard, outline, students/manage, quizzes, analytics, settings (auth required)
│   │   ├── layout.tsx           # Root layout (fonts, providers)
│   │   ├── globals.css          # Tailwind theme + glass utilities
│   │   └── not-found.tsx        # 404 page
│   ├── components/
│   │   ├── ui/                  # 24 reusable components (Button, Modal, DataTable, …)
│   │   └── layouts/             # PublicNavbar/Footer, AuthLayout, AdminLayout (sidebar)
│   ├── contexts/                # AuthContext, ThemeContext
│   ├── hooks/                   # useDebounce, useKeyShortcut, usePaginatedQuery
│   ├── services/                # typed API clients (auth, course, student, quiz, analytics, public)
│   ├── lib/                     # types, constants, grades, formatters, export utils
│   ├── middleware.ts            # route protection (cookie-based)
│   ├── public/logo.png          # app logo
│   └── next.config.mjs          # /api → backend proxy rewrite
│
├── server/                      # Express backend (TypeScript)
│   ├── src/
│   │   ├── config/db.ts         # Mongoose connection
│   │   ├── controllers/         # auth, course, student, quiz, analytics, public
│   │   ├── middleware/          # auth (JWT), validate, errorHandler
│   │   ├── models/              # User, Course, Student, Quiz
│   │   ├── routes/              # versioned API routes
│   │   ├── services/            # query builders, grade computation, aggregations
│   │   ├── utils/               # ApiError, asyncHandler, cookieUtils, gradeUtils
│   │   └── validators/          # express-validator rule sets
│   ├── uploads/                 # future file attachments
│   ├── app.ts                   # Express app assembly
│   └── server.ts                # entry point (connect + listen)
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **18+** (tested on 20/24)
- MongoDB **6+** running locally, or a MongoDB Atlas URI

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. MongoDB setup

**Local:** install MongoDB Community Server and start the service (default URI `mongodb://127.0.0.1:27017`). The database `teacher-assistant` is created automatically.

**Atlas:** create a cluster → Database Access → connect → copy the connection string. Use it as `MONGO_URI`.

### 3. Environment variables

Copy the examples and edit:

```bash
cp server/.env.example server/.env     # set JWT_SECRET (long random string)
cp client/.env.example client/.env
```

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | 5000 | Backend port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/teacher-assistant` | MongoDB connection string |
| `JWT_SECRET` | — | **Required** — sign with a long random secret |
| `JWT_EXPIRES_IN` | 7d | Default session length |
| `JWT_REMEMBER_EXPIRES_IN` | 30d | "Remember me" session length |
| `CLIENT_URL` | http://localhost:3000 | Allowed CORS origin |
| `BACKEND_URL` (client) | http://localhost:5000 | Proxy target for `/api` |

### 4. Run

```bash
# Backend  → http://localhost:5000
cd server && npm run dev

# Frontend → http://localhost:3000
cd client && npm run dev
```

Production:

```bash
cd server && npm run build && npm start   # compiled to dist/
cd client && npm run build && npm start   # optimized Next.js server
```

---

## 🔌 API Reference

All routes under `/api`. JSON: `{ success, data, pagination?, message? }`. Protected routes require the HttpOnly `token` cookie (set automatically on login/signup).

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Public | `{name, email, password, confirmPassword}` → creates account + logs in |
| POST | `/api/auth/login` | Public | `{email, password, rememberMe?}` → sets cookie |
| POST | `/api/auth/logout` | Public | Clears cookie |
| GET | `/api/auth/profile` | Auth | Current user |
| PATCH | `/api/auth/profile` | Auth | Update `{name?, email?}` |
| PATCH | `/api/auth/password` | Auth | `{currentPassword, newPassword}` |

### Course Outline

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/course` | Auth | List — `search, month, week, status, sortBy, sortOrder, page, limit` |
| POST | `/api/course` | Admin | Create topic |
| PUT | `/api/course/:id` | Admin | Update topic |
| DELETE | `/api/course/:id` | Admin | Delete topic |
| PATCH | `/api/course/:id/status` | Admin | `{status: "pending"\|"completed"}` (sets/clears completionDate) |

### Students

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/students` | Auth | List with computed `quizCount, average, percentage, grade` — filters `class` |
| POST | `/api/students` | Admin | Create student |
| PUT | `/api/students/:id` | Admin | Update student |
| DELETE | `/api/students/:id` | Admin | Delete student **and their quizzes** |

### Quiz Marks

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/quizzes` | Auth | List — `studentId, search, page, limit`; returns `summary {average, percentage, grade}` when `studentId` given |
| POST | `/api/quizzes` | Admin | `{studentId, quizName, totalMarks, obtainedMarks, date?, remarks?}` |
| POST | `/api/quizzes/bulk` | Admin | `{className, quizName, totalMarks, date?}` — creates a marks row for every student in the class |
| PUT | `/api/quizzes/:id` | Admin | Update quiz |
| DELETE | `/api/quizzes/:id` | Admin | Delete quiz |

### Analytics

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/analytics` | Auth | Dashboard payload: totals, completion %, monthly progress, grade distribution, activities, upcoming topics, top students |

### Public (guest, read-only)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/public/course-outline` | Course outline with same filters as `/api/course` |
| GET | `/api/public/students` | Students with performance summary |
| GET | `/api/public/student/:id` | Student detail + quiz history + stats |

### Grade system

`A+` ≥90 · `A` ≥85 · `B+` ≥80 · `B` ≥75 · `C+` ≥70 · `C` ≥65 · `D` ≥50 · `F` <50

---

## 🔒 Security Notes

- Passwords hashed with **bcrypt** (salt rounds 10); never returned by the API (`select: false`)
- JWT stored in **HttpOnly, SameSite=Lax** cookie; `Secure` flag auto-enabled in production
- Auth endpoints rate-limited (20 req/15 min), API rate-limited (200 req/15 min)
- `express-mongo-sanitize` + `xss-clean` + Helmet + `express-validator` on every write endpoint
- Duplicate keys (email/roll no) mapped to friendly 409s; centralized error handler never leaks stack traces in production
- Frontend middleware redirects unauthenticated users away from admin routes; expired sessions trigger auto-logout with a toast

---

## 🗺️ Future Improvements

The architecture already supports these without restructuring:

- **Assignments, Attendance, Mid/Final Exams** — new Mongoose models + `GET/POST/PUT/DELETE` routes following the existing controller/service/validator pattern; quiz grading service is generic and reusable
- **Multiple courses & teachers** — `Course` already has `createdBy`; add a `courseId` field to students/quizzes and a teacher↔course mapping
- **Role management** — `role` enum exists on `User` (`admin | teacher | student`); extend `adminOnly` with a role matrix middleware
- **Notifications** — swap the activity timeline for a `Notification` collection
- **Excel import / PDF upload / attachments** — `server/uploads/` is ready; add Multer + a file route
- **Student & Teacher portals** — separate layouts reusing the existing `AdminLayout` shell and `usePaginatedQuery` data hooks
- **Email verification / password reset** — placeholder link already in the login page; wire a mailer + reset-token flow into `authController`

---

## ☁️ Deployment Guide

### Backend (Render / Railway / Fly.io / any Node host)

1. Push the repo; create a Node service with root `server/`
2. Set env vars from `server/.env.example` (production: `NODE_ENV=production`, real `MONGO_URI` + strong `JWT_SECRET`, `CLIENT_URL` = your frontend domain)
3. Build command: `npm install && npm run build` — Start command: `npm start`
4. Create the first admin account via the signup page

### Frontend (Vercel — recommended)

1. Push to GitHub; in Vercel import the repo, **root directory: `client`**
2. Framework preset: Next.js (auto-detected). Build: `npm run build`
3. Set `BACKEND_URL` to your deployed backend URL (e.g. `https://api.yourdomain.com`) — the `/api` rewrite proxies there
4. Add a `vercel.json`-style CORS check: backend `CLIENT_URL` must be your Vercel domain

### Domain / HTTPS

- Point a subdomain (`app.…`) to the frontend and (`api.…`) to the backend
- Both domains served over HTTPS (free via Vercel/Render) — cookies marked `Secure` automatically in production

---

© Teacher Assistant — built with Next.js, Express, TypeScript & MongoDB.
