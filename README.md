# Blogging Platform

A full-stack MERN blogging platform with a rich-text editor, categories, comments, ratings, likes, bookmarks, and an admin dashboard.

**Live stack:**
- **Frontend:** React 18 + Vite, deployed on [Vercel](https://vercel.com)
- **Backend:** Node.js + Express, deployed on [Render](https://render.com)
- **Database:** MongoDB (Atlas)
- **Image storage:** Cloudinary (with local `/uploads` fallback via Multer)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Useful Scripts](#useful-scripts)
- [Troubleshooting](#troubleshooting)

---

## Features

**Public**
- Browse, search, and filter blogs by category
- Trending blogs section
- View blog detail pages with author info, cover image, and rich content
- View public user profiles
- Nested comments and star ratings on blogs

**Authenticated users**
- Register / Login with JWT-based authentication
- Create, edit, and delete their own blog posts (rich-text editor with headings, bold/italic, links, images)
- Upload a cover image / inline images (Cloudinary)
- Like blogs and comments
- Bookmark blogs for later
- Rate blogs (1–5 stars)
- Comment and reply to comments
- Manage their profile (name, bio, avatar)
- Personal dashboard listing their own posts

**Admin**
- Admin dashboard with site-wide stats
- Manage users (view, delete)
- Moderate comments
- Manage categories
- Backfill missing blog cover images (maintenance script/endpoint)

---

## Tech Stack

### Frontend (`/frontend`)
| Package | Purpose |
|---|---|
| React 18 + Vite | UI framework & dev/build tooling |
| React Router DOM v6 | Client-side routing |
| Axios | API requests (with JWT interceptor) |
| Tailwind CSS | Styling |
| React Quill | Rich text editing (where used) |
| React Toastify | Toast notifications |
| Lucide React | Icons |

### Backend (`/backend`)
| Package | Purpose |
|---|---|
| Express | HTTP server & routing |
| Mongoose | MongoDB ODM |
| jsonwebtoken | JWT auth |
| bcryptjs | Password hashing |
| multer | Multipart/form-data file uploads |
| cloudinary | Image hosting |
| helmet | Security headers |
| cors | Cross-origin request handling |
| express-rate-limit | Basic rate limiting |
| morgan | Request logging |
| slugify | URL-friendly slugs for blogs/categories |
| validator | Input validation |

---

## Project Structure

```
blog/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary, Multer setup
│   │   ├── controllers/     # Route handler logic
│   │   ├── middleware/      # auth.js (JWT verification)
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express route definitions
│   │   ├── utils/           # errorHandler, etc.
│   │   └── server.js        # App entry point
│   ├── scripts/
│   │   ├── createAdmin.js       # Promote/create an admin user
│   │   └── backfillCovers.js    # Backfill missing cover images
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/            # Route-level pages (Home, Blog, Login, Dashboard, Admin*, etc.)
    │   ├── components/       # Navbar, Comments, ProtectedRoute, SignupModal
    │   ├── context/          # AuthContext, ThemeContext
    │   ├── services/api.js   # Axios instance + auth token interceptor
    │   ├── utils/media.js    # Resolves relative /uploads paths to full backend URL
    │   └── App.jsx           # Route definitions
    └── package.json
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js ≥ 16
- A MongoDB connection string (local MongoDB or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- (Optional) A [Cloudinary](https://cloudinary.com) account for image uploads

### 1. Clone and install

```bash
git clone <your-repo-url>
cd blog

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Create `backend/.env` (see [Environment Variables](#environment-variables) below).

The frontend doesn't need a `.env` file for local dev — Vite's dev server proxies `/api` and `/uploads` requests to `http://localhost:5000` automatically (see `frontend/vite.config.js`).

### 3. Run both apps

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 4. Create an admin user (optional)

```bash
cd backend
npm run create-admin
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port for the Express server (default: `5000`) |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret used to sign/verify JWTs — must stay the same across restarts, or all existing sessions break |
| `JWT_EXPIRES_IN` | No | Token lifetime, e.g. `7d` (default: `7d`) |
| `CLIENT_URL` | **Yes (production)** | Comma-separated list of allowed frontend origin(s) for CORS, e.g. `https://your-app.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | If using Cloudinary | Cloudinary account name |
| `CLOUDINARY_API_KEY` | If using Cloudinary | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | If using Cloudinary | Cloudinary API secret |

### Frontend (`frontend/.env` — only needed for production builds, e.g. on Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes (production)** | Full URL of the deployed backend API, e.g. `https://your-backend.onrender.com/api` |
| `VITE_API_ORIGIN` | **Yes (production)** | Backend origin *without* `/api`, used to resolve uploaded image paths, e.g. `https://your-backend.onrender.com` |

> Locally these are not required — Vite's dev proxy handles `/api` and `/uploads` automatically.

---

## API Reference

Base URL: `/api`

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create a new account |
| POST | `/login` | No | Log in, returns JWT + user |
| GET | `/me` | Yes | Get the current logged-in user |

### Blogs (`/api/blogs`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | List published blogs |
| GET | `/search` | No | Search blogs |
| GET | `/trending` | No | Trending blogs |
| GET | `/mine` | Yes | Current user's own blogs |
| GET | `/:slug` | No | Get a single blog by slug |
| POST | `/` | Yes | Create a blog |
| PUT | `/:id` | Yes | Update a blog (owner only) |
| DELETE | `/:id` | Yes | Delete a blog (owner only) |

### Categories (`/api/categories`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | List categories |
| POST | `/` | Yes | Create a category |
| PUT | `/:id` | Yes | Update a category |
| DELETE | `/:id` | Yes | Delete a category |

### Comments (`/api/comments`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/blog/:id` | No | List comments for a blog |
| POST | `/blog/:id` | Yes | Add a comment |
| PUT | `/:id` | Yes | Edit a comment (owner only) |
| DELETE | `/:id` | Yes | Delete a comment (owner only) |

### Ratings (`/api/ratings`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/blog/:id` | Yes | Submit/update a 1–5 star rating |

### Interactions (`/api`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/blog/:id/like` | Yes | Toggle like on a blog |
| POST | `/blog/:id/bookmark` | Yes | Toggle bookmark on a blog |
| GET | `/bookmarks` | Yes | List current user's bookmarks |

### Uploads (`/api/uploads`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Yes | Upload an image (`multipart/form-data`, field name `image`) |

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:username` | No | Get public profile by username |
| PUT | `/profile` | Yes | Update current user's profile |

### Admin (`/api/admin`) — requires `role: ADMIN`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | Site-wide stats |
| GET | `/users` | Admin | List all users |
| DELETE | `/users/:id` | Admin | Delete a user |
| GET | `/comments` | Admin | List all comments (moderation) |
| POST | `/backfill-covers` | Admin | Backfill missing blog cover images |

> Authenticated requests must include `Authorization: Bearer <token>`.

---

## Deployment

This project is set up to be deployed as **two separate services**:

### Backend → Render
1. Create a new **Web Service** on [Render](https://render.com), pointing to the `backend` folder of your repo.
2. Build command: `npm install` · Start command: `npm start`
3. Add the backend environment variables listed above (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, Cloudinary keys, etc.).
4. Note the deployed URL, e.g. `https://your-backend.onrender.com`.

### Frontend → Vercel
1. Import the repo into [Vercel](https://vercel.com), set **Root Directory** to `frontend`.
2. Framework preset: Vite · Build command: `npm run build` · Output directory: `dist`.
3. Add environment variables: `VITE_API_URL=https://your-backend.onrender.com/api` and `VITE_API_ORIGIN=https://your-backend.onrender.com`.
4. Deploy. Vercel will give you a production URL, e.g. `https://your-app.vercel.app`.

### Database → MongoDB Atlas
1. Create a free M0 cluster.
2. Whitelist Render's IP (or `0.0.0.0/0` for simplicity) under Network Access.
3. Use the generated connection string as `MONGO_URI` on Render.

> ⚠️ Render's free tier spins the backend down after ~15 minutes of inactivity. The first request after idling can take 30–50 seconds (cold start) — this is expected on the free plan.

---

## Useful Scripts

Run from the `backend` folder:

```bash
npm run dev              # Start backend with nodemon (auto-restart on changes)
npm start                # Start backend in production mode
npm run create-admin     # Interactive script to create/promote an admin user
npm run backfill:covers  # Backfill missing blog cover images
```

Run from the `frontend` folder:

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build → frontend/dist
npm run preview   # Preview the production build locally
```

---

## Troubleshooting

- **CORS errors in the browser console:** Make sure `CLIENT_URL` on the backend matches your deployed frontend domain(s) exactly, and that `VITE_API_URL` on the frontend points to the correct backend URL.
- **"Not authorized" on every logged-in action:** Usually means the `Authorization: Bearer <token>` header isn't reaching the backend, or `JWT_SECRET` isn't set/consistent on the backend. Check the browser DevTools Network tab on a failing request.
- **Logged out right after logging in:** Check that the backend is reachable and `/api/auth/me` isn't failing due to a cold start or misconfigured API URL.
- **Uploaded images not showing:** Confirm `VITE_API_ORIGIN` (frontend) matches the backend's public URL, and Cloudinary credentials are set correctly on the backend.
