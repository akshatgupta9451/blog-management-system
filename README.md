<div align="center">

# Blog Management System

A full-stack MERN blogging platform with rich-text publishing, role-based access, reader engagement, faceted search, image optimization and an admin analytics panel.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

</div>

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## About the Project

**Blog Management System** is a production-style blogging platform built on the MERN stack. Authors write with a rich-text editor and manage drafts, published and archived posts from a personal dashboard. Readers can like, bookmark and search posts, and keep a reading history. Administrators get a dedicated panel to moderate users, posts and comments and to explore platform analytics through interactive charts.

The project puts weight on the parts that are easy to get wrong:

- **Security:** httpOnly cookie sessions with rotating refresh tokens, XSS sanitization, upload checks based on file contents, and role-based authorization on every protected route.
- **Data integrity:** idempotent likes and bookmarks enforced by unique indexes, view counts deduplicated per viewer per day, and cascading deletes that keep every counter correct.
- **Performance:** compound indexes that serve sorting directly from the index, aggregation pipelines, indexed author search, and responsive images served through Cloudinary's CDN.

### User roles

| Role                  | Can do                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| **Reader** (`user`)   | Read, like, bookmark, search, keep a reading history, manage their profile                        |
| **Author** (`author`) | Everything a reader can, plus create, edit and delete their own blogs                             |
| **Admin** (`admin`)   | Everything, plus the admin panel: manage users, roles, all blogs and comments, and view analytics |

New accounts start as readers. Promote one with `npm run make-admin -- you@example.com`, then manage roles from the admin panel.

---

## Features

### Authentication and accounts

- Register, log in and log out with **JWT access and refresh tokens** stored in **httpOnly cookies**. The API also accepts `Authorization: Bearer` tokens.
- **Silent token refresh.** The client retries a failed request after renewing the session, and parallel requests share a single refresh.
- **Refresh-token rotation with reuse detection.** If a stolen token is replayed, the whole session is revoked.
- **Password change.** Changing the password signs out every other device immediately, including their unexpired access tokens.
- **Profile editing** (name, bio, avatar) and **account deletion**, which cascades to the user's blogs, images, likes, history and comments.
- Passwords are hashed with **bcrypt** (12 rounds), and login responses are padded to the same timing whether or not the email exists, so accounts can't be discovered by timing.

### Blogging

- **Rich-text editor** (TipTap) with headings, lists, quotes, code blocks and links.
- **Server-side HTML sanitization** with an allow-list: scripts, event handlers and `javascript:` URLs are stripped.
- **Draft, published and archived** statuses; drafts are visible only to their author and admins.
- **Unique slugs** generated from titles. Published URLs never change, so links don't break.
- **Cover images** that can be uploaded, replaced or removed. Old images are cleaned up from Cloudinary automatically.

### Reader engagement

- **Likes** and **bookmarks**: idempotent and safe against concurrent double clicks.
- **View counter** that counts each viewer once per day, so refreshes don't inflate it. Anonymous viewers are identified by a keyed hash, so raw IP addresses are never stored.
- **Reading history** organised into reading sessions, plus a **Recently viewed** widget.
- **Trending** posts (views + 5 × likes over the last 7 days) and **Popular** posts (all time).

### Search

- A dedicated search page backed by **MongoDB aggregation**:
  - **Keyword** full-text search, ranked by relevance.
  - **Title** contains, **author** name (matches the start of any word), **categories**, **tags** (any or all) and **date** presets or a custom range.
- **Filter counts** next to each option, which stay accurate while other filters are applied.
- Sorting by relevance, newest, oldest, most liked, most viewed or title, with pagination.
- All search state lives in the URL, so searches can be shared and the back button works.

### Dashboards

- **User dashboard:** profile summary, statistics, status breakdown, recent drafts, top posts, recently viewed and an activity timeline.
- **Content pages:** My Blogs, Drafts and Published, plus a **Library** with Bookmarks, Liked posts and Reading history.
- **Activity feed** covering logins, profile and password changes, and blog actions. Entries expire after 180 days.

### Admin panel

- **Dashboard** with headline numbers, users-by-role and blogs-by-status breakdowns, and a 30-day growth chart.
- **Analytics** for 7 days, 30 days, 90 days or 12 months: growth, engagement and views charts, plus top posts, authors and categories.
  - Hand-built SVG charts with tooltips that also work from the keyboard, a "View as table" toggle on every chart, and a colour-blind-safe validated palette.
- **Users:** search by name or email, filter by role, change roles inline, delete users with a full cascade.
- **Blogs:** every status, title search, author filter, inline moderation (publish, archive, restore), edit and delete.
- **Comments:** search and delete whole threads, with counters kept consistent.
- Every `/admin` route is protected by a single `protect → authorize('admin')` middleware.

### Images (Cloudinary)

- **Compression in the browser before upload:** WebP, longest side capped at 2000px, EXIF/GPS metadata stripped. In testing, an 18 MB photo uploaded as 1.7 MB.
- **Incoming transformations on Cloudinary** (resize and `q_auto`), with face-centred avatar crops.
- **Responsive delivery:** `srcset` with `f_auto` and `q_auto`, so browsers get AVIF or WebP at the right size.
- **Secure uploads:**
  - The declared type is checked against the file's real signature (magic bytes), and SVG is blocked.
  - Uploads are signed server-side, so the API secret never reaches the browser.
  - Files get random public IDs, and deletes are limited to the app's own Cloudinary folder.

### UX and engineering

- Responsive layout (checked at 375px), accessible modals, focus management and keyboard support.
- Instant UI updates for likes, bookmarks and removals, rolled back if the request fails.
- Route-level code splitting: the editor and admin panel load only when needed.
- Consistent API responses, centralized error handling and validation with `express-validator`.

---

## Screenshots

> Replace the placeholders below with your own captures. Save images in `docs/screenshots/` using the file names shown.

|                           Home                           |                        Blog details                        |
| :------------------------------------------------------: | :--------------------------------------------------------: |
|         ![Home page](docs/screenshots/home.png)          |     ![Blog details](docs/screenshots/blog-details.png)     |
|                        **Search**                        |                      **Write a blog**                      |
|   ![Search with filters](docs/screenshots/search.png)    |      ![Rich-text editor](docs/screenshots/editor.png)      |
|                    **User dashboard**                    |                   **Profile & settings**                   |
|    ![User dashboard](docs/screenshots/dashboard.png)     |   ![Profile and settings](docs/screenshots/profile.png)    |
|                   **Admin analytics**                    |                      **Admin users**                       |
| ![Admin analytics](docs/screenshots/admin-analytics.png) | ![Admin user management](docs/screenshots/admin-users.png) |

---

## Tech Stack

| Layer        | Technologies                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | React 19, Vite, React Router, Tailwind CSS 4 (+ Typography), Axios, React Hook Form, React Toastify, TipTap               |
| **Backend**  | Node.js 20+, Express 5, Mongoose 9, express-validator, JSON Web Tokens, bcrypt, cookie-parser, multer, sanitize-html      |
| **Database** | MongoDB 5.0+ (MongoDB Atlas recommended); uses full-text search, aggregation pipelines and automatic expiry (TTL) indexes |
| **Media**    | Cloudinary (signed uploads, incoming and on-delivery transformations, CDN)                                                |
| **Tooling**  | ESLint 9, Prettier (with the Tailwind plugin), Nodemon                                                                    |

---

## Folder Structure

```text
blog-management-system/
├── package.json              # Root scripts that run the client and server together
├── client/                   # React single-page app (Vite)
│   ├── index.html
│   ├── vite.config.js        # Dev server + /api proxy to the backend
│   └── src/
│       ├── api/              # Axios instance (cookies, automatic token refresh)
│       ├── components/
│       │   ├── admin/        # Admin sidebar, toolbar, stat tiles
│       │   ├── blog/         # Blog card, editor, form, likes/bookmarks, trending
│       │   ├── charts/       # SVG line, column, bar and stacked charts
│       │   ├── common/       # Search bar, pagination, page header, highlight
│       │   ├── dashboard/    # Activity feed, stat cards, panels
│       │   ├── layout/       # Navbar, footer, sidebar
│       │   ├── library/      # Shared bookmarks/liked/history page
│       │   ├── profile/      # Profile, password and account-deletion forms
│       │   ├── search/       # Search filters and results
│       │   └── ui/           # Button, modal, form fields, image upload, …
│       ├── context/          # Auth provider
│       ├── hooks/            # useAuth, useFetch, useQueryParams, …
│       ├── layouts/          # Main, dashboard and admin layouts
│       ├── pages/            # Route pages (+ pages/admin)
│       ├── routes/           # Router, ProtectedRoute, GuestRoute
│       ├── services/         # API service layer (one module per resource)
│       └── utils/            # Formatting, image URLs, compression, errors
└── server/                   # Express REST API
    ├── scripts/
    │   ├── make-admin.js     # Promote a user to admin
    │   └── sync-indexes.js   # Sync MongoDB indexes + backfill derived fields
    └── src/
        ├── config/           # Environment, database, CORS, Cloudinary presets
        ├── constants/        # Roles, statuses, limits, shared settings
        ├── controllers/      # Thin HTTP handlers
        ├── middlewares/      # auth (protect/authorize), validation, uploads, errors
        ├── models/           # Mongoose schemas + indexes
        ├── routes/           # Route definitions (/auth, /blogs, /users, /search, /admin)
        ├── services/         # Business logic (no req/res)
        ├── utils/            # ApiError, ApiResponse, tokens, sanitization, search helpers
        ├── validators/       # express-validator chains
        ├── app.js            # Express app (middleware + routes)
        └── server.js         # Bootstraps the DB connection and HTTP server
```

The backend has four layers: **routes → middlewares → controllers → services → models**. Controllers only translate HTTP requests and responses; all business rules live in services.

---

## Getting Started

### Prerequisites

- **Node.js 20+** and npm
- A **MongoDB 5.0+** database ([MongoDB Atlas](https://www.mongodb.com/atlas) free tier works)
- A **Cloudinary** account (optional: without it, everything except image uploads works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/blog-management-system.git
cd blog-management-system

# 2. Install server and client dependencies
npm run install:all

# 3. Create environment files and fill in real values
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Create the database indexes (run once, and again after pulling schema changes)
npm run sync-indexes --prefix server

# 5. Start the API and the client (two terminals)
npm run dev:server   # http://localhost:5000/api/v1/health
npm run dev:client   # http://localhost:5173
```

In development, Vite proxies `/api/*` to the Express server, so the browser treats the auth cookies as same-site.

### Create your first admin

Register an account in the app, then promote it:

```bash
npm run make-admin --prefix server -- you@example.com
```

Log out and back in, and the **Admin** link appears in the navbar.

---

## Environment Variables

### Server (`server/.env`)

| Variable                | Required | Default                 | Description                                                                  |
| ----------------------- | :------: | ----------------------- | ---------------------------------------------------------------------------- |
| `NODE_ENV`              |          | `development`           | `production` enables secure, cross-site cookies and hides error stack traces |
| `PORT`                  |          | `5000`                  | HTTP port                                                                    |
| `CORS_ORIGIN`           |          | `http://localhost:5173` | Comma-separated list of allowed frontend origins                             |
| `MONGODB_URI`           |    ✅    |                         | MongoDB connection string                                                    |
| `DB_NAME`               |          | `blog_db`               | Database name                                                                |
| `ACCESS_TOKEN_SECRET`   |    ✅    |                         | Secret for signing access tokens (use a long random string)                  |
| `ACCESS_TOKEN_EXPIRY`   |          | `15m`                   | Access token lifetime                                                        |
| `REFRESH_TOKEN_SECRET`  |    ✅    |                         | Secret for signing refresh tokens (different from the access secret)         |
| `REFRESH_TOKEN_EXPIRY`  |          | `7d`                    | Refresh token lifetime                                                       |
| `CLOUDINARY_CLOUD_NAME` |    ⚠️    |                         | Cloudinary cloud name (needed for image uploads)                             |
| `CLOUDINARY_API_KEY`    |    ⚠️    |                         | Cloudinary API key                                                           |
| `CLOUDINARY_API_SECRET` |    ⚠️    |                         | Cloudinary API secret (server-side only)                                     |
| `CLOUDINARY_FOLDER`     |          | `blog-management`       | Root upload folder; use a different one per environment                      |
| `VIEW_HASH_SECRET`      |          | `ACCESS_TOKEN_SECRET`   | Key used to hash anonymous viewers' IP + user agent                          |

Generate strong secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Client (`client/.env`)

| Variable            | Default                 | Description                                                                                                |
| ------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api/v1`               | API base URL. Keep it relative when the API is served from the same origin (see [Deployment](#deployment)) |
| `VITE_PROXY_TARGET` | `http://localhost:5000` | Backend URL for the Vite dev-server proxy (development only)                                               |

> Never commit `.env` files. They are already listed in `.gitignore`.

---

## Available Scripts

| Location | Command                                     | Description                                                         |
| -------- | ------------------------------------------- | ------------------------------------------------------------------- |
| root     | `npm run install:all`                       | Install server and client dependencies                              |
| root     | `npm run dev:server` / `npm run dev:client` | Start the API (nodemon) / the Vite dev server                       |
| root     | `npm run lint` / `npm run format`           | Lint / format both projects                                         |
| server   | `npm start`                                 | Start the API in production mode                                    |
| server   | `npm run make-admin -- <email>`             | Promote an existing user to admin                                   |
| server   | `npm run sync-indexes`                      | Create missing indexes, drop obsolete ones, backfill derived fields |
| client   | `npm run build` / `npm run preview`         | Build the client for production / preview the build                 |

---

## API Documentation

**Base URL:** `/api/v1`

### Conventions

**Authentication.** Logging in sets `accessToken` and `refreshToken` as httpOnly cookies. API clients may send `Authorization: Bearer <accessToken>` instead. When the access token expires, call `POST /auth/refresh-token`.

**Success response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Blogs fetched",
  "data": { "...": "..." }
}
```

**Error response** (validation errors return `422` with field details):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "Title must be between 5 and 150 characters" }]
}
```

**Pagination.** List endpoints accept `page` and `limit` (max 50) and return:

```json
{
  "page": 1,
  "limit": 10,
  "totalDocs": 42,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

**Access levels:** 🌐 public · 👤 any logged-in user · ✍️ author or admin · 🛡️ admin only.
Some public endpoints return extra detail when you're logged in; for example, a draft's author can view it.

### Auth: `/auth`

| Method | Endpoint                | Access | Description                                                                            |
| ------ | ----------------------- | :----: | -------------------------------------------------------------------------------------- |
| `POST` | `/auth/register`        |   🌐   | Create an account (`name`, `email`, `password`, `confirmPassword`) and start a session |
| `POST` | `/auth/login`           |   🌐   | Log in (`email`, `password`)                                                           |
| `POST` | `/auth/refresh-token`   |   🌐   | Rotate tokens using the refresh cookie (or `refreshToken` in the request body)         |
| `POST` | `/auth/logout`          |   🌐   | End the session and clear the cookies                                                  |
| `GET`  | `/auth/me`              |   👤   | Current user                                                                           |
| `POST` | `/auth/change-password` |   👤   | `currentPassword`, `newPassword`, `confirmPassword`; signs out other devices           |

### Blogs: `/blogs`

| Method            | Endpoint              |     Access     | Description                                                                                                           |
| ----------------- | --------------------- | :------------: | --------------------------------------------------------------------------------------------------------------------- |
| `GET`             | `/blogs`              |       🌐       | Published blogs. Query: `search`, `category`, `tags`, `author`, `from`, `to`, `sort` (e.g. `-views`), `page`, `limit` |
| `GET`             | `/blogs/:slug`        |       🌐       | One blog; records a view and reading history. Includes `isLiked` and `isBookmarked` when logged in                    |
| `GET`             | `/blogs/trending`     |       🌐       | Trending this week (`limit` ≤ 20; cached for 5 minutes)                                                               |
| `GET`             | `/blogs/popular`      |       🌐       | Most liked of all time (`limit` ≤ 20)                                                                                 |
| `GET`             | `/blogs/taxonomy`     |       🌐       | Categories and popular tags, with counts                                                                              |
| `GET`             | `/blogs/me`           |       👤       | The current user's blogs in every status (same query parameters as `/blogs`, plus `status`)                           |
| `GET`             | `/blogs/me/stats`     |       👤       | Totals by status, plus views, likes and comments                                                                      |
| `POST`            | `/blogs`              |       ✍️       | Create a blog. JSON or `multipart/form-data` with an optional `coverImage` file                                       |
| `PATCH`           | `/blogs/:id`          | ✍️ owner/admin | Update any fields. A new `coverImage` replaces the old one; `removeCover=true` clears it                              |
| `DELETE`          | `/blogs/:id`          | ✍️ owner/admin | Delete the blog and its cover, likes, bookmarks, history, views and comments                                          |
| `DELETE`          | `/blogs/:id/cover`    | ✍️ owner/admin | Remove the cover image (safe to repeat)                                                                               |
| `POST` / `DELETE` | `/blogs/:id/like`     |       👤       | Like / unlike (safe to repeat) → `{ liked, likesCount }`                                                              |
| `POST` / `DELETE` | `/blogs/:id/bookmark` |       👤       | Bookmark / remove bookmark (safe to repeat) → `{ bookmarked }`                                                        |

<details>
<summary><strong>Example: create a blog with a cover image</strong></summary>

```bash
curl -X POST http://localhost:5000/api/v1/blogs \
  -H "Authorization: Bearer <accessToken>" \
  -F "title=Getting Started with React" \
  -F "description=A practical walkthrough of the basics." \
  -F "content=<p>Hello <strong>world</strong>, this is my first post.</p>" \
  -F "category=technology" \
  -F "tags=react,javascript" \
  -F "status=published" \
  -F "coverImage=@./cover.jpg"
```

Images must be JPEG, PNG, WebP or GIF, at most 5 MB, one per request. The file's real contents are checked, not just its extension.

</details>

### Users and library: `/users`

| Method   | Endpoint                    | Access | Description                                                         |
| -------- | --------------------------- | :----: | ------------------------------------------------------------------- |
| `PATCH`  | `/users/me`                 |   👤   | Update `name` and `bio`, plus an optional `avatar` file (multipart) |
| `DELETE` | `/users/me`                 |   👤   | Delete the account (requires `password`)                            |
| `GET`    | `/users/me/activity`        |   👤   | Activity feed (paginated)                                           |
| `GET`    | `/users/me/likes`           |   👤   | Liked blogs, newest first                                           |
| `GET`    | `/users/me/bookmarks`       |   👤   | Bookmarked blogs, newest first                                      |
| `GET`    | `/users/me/history`         |   👤   | Reading history (use `limit=4` for "Recently viewed")               |
| `DELETE` | `/users/me/history/:blogId` |   👤   | Remove one entry from the history                                   |
| `DELETE` | `/users/me/history`         |   👤   | Clear the reading history                                           |

### Search: `/search`

| Method | Endpoint  | Access | Description                         |
| ------ | --------- | :----: | ----------------------------------- |
| `GET`  | `/search` |   🌐   | Faceted search over published blogs |

| Parameter                 | Description                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `q`                       | Keywords (full-text across title, tags, description and content)                             |
| `title`                   | Title contains (case-insensitive)                                                            |
| `author`                  | Author name (matches the start of any word: `love` → "Ada Lovelace") or a user id            |
| `category`                | One or more, comma-separated                                                                 |
| `tags`, `tagsMode`        | Comma-separated tags; `any` (default) or `all`                                               |
| `date` / `from`, `to`     | `today`, `week`, `month`, `year` / an ISO date range (`to` includes that whole day)          |
| `sort`                    | `relevance` (default when `q` is set), `newest`, `oldest`, `popular`, `views`, `title`       |
| `page`, `limit`, `facets` | Pagination (capped at the first 1,000 results); set `facets=false` to skip the filter counts |

Response: `{ blogs, pagination, facets: { categories, tags, authors }, applied }`.

### Admin: `/admin` 🛡️

Every route returns `401` without a session and `403` for non-admins.

| Method   | Endpoint                                   | Description                                                                                                  |
| -------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `GET`    | `/admin/overview`                          | Users by role, blogs by status, engagement totals, the last 30 days vs the 30 before, newest users and posts |
| `GET`    | `/admin/analytics?range=7d\|30d\|90d\|12m` | Time series (users, blogs, comments, likes, views) with no gaps, plus top posts, authors and categories      |
| `GET`    | `/admin/users`                             | Query: `search` (name or email), `role`, `sort` (`newest`, `oldest`, `name`), `page`, `limit`                |
| `PATCH`  | `/admin/users/:id/role`                    | `{ role: "user" \| "author" \| "admin" }` (you can't change your own role)                                   |
| `DELETE` | `/admin/users/:id`                         | Delete a user and all of their content                                                                       |
| `GET`    | `/admin/blogs`                             | Every status. Query: `search` (title), `status`, `category`, `author`, `sort`                                |
| `PATCH`  | `/admin/blogs/:id/status`                  | `{ status: "draft" \| "published" \| "archived" }`                                                           |
| `DELETE` | `/admin/blogs/:id`                         | Delete any blog                                                                                              |
| `GET`    | `/admin/comments`                          | Query: `search`, `blog`, `page`, `limit`                                                                     |
| `DELETE` | `/admin/comments/:id`                      | Delete a comment and every reply beneath it                                                                  |

### Health

| Method | Endpoint  | Description                           |
| ------ | --------- | ------------------------------------- |
| `GET`  | `/health` | Uptime and database connection status |

---

## Deployment

The recommended setup is **MongoDB Atlas + an API host + a static frontend host + Cloudinary**.

### 1. Database: MongoDB Atlas

1. Create a cluster and a database user, and allow your API host's IP addresses.
2. Copy the connection string into `MONGODB_URI`.
3. Run `npm run sync-indexes` once against the production database (from your machine or a one-off job on the host).

### 2. API: Render, Railway, Fly.io or any Node host

- **Root directory:** `server`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment:** every server variable above, with `NODE_ENV=production` and `CORS_ORIGIN=https://your-frontend.example.com`.

The app sets `trust proxy` so client IP addresses are read correctly behind the host's load balancer.

### 3. Frontend: Vercel or Netlify

- **Root directory:** `client`
- **Build command:** `npm run build`
- **Output directory:** `dist`

> **Serve the API from the frontend's own domain.** Session cookies are httpOnly. When the frontend and API are on different domains, browsers treat those cookies as third-party, and Safari (and Chrome, increasingly) block them, which logs users out. Route `/api` through the frontend host so the cookies stay first-party.

**Vercel** (`client/vercel.json`): proxy the API and add the single-page-app fallback:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-api.example.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify** (`client/public/_redirects`):

```text
/api/*  https://your-api.example.com/api/:splat  200
/*      /index.html                              200
```

With this setup, keep `VITE_API_BASE_URL=/api/v1`.

### 4. After the first deploy

1. Register your account on the live site.
2. Run `npm run make-admin -- you@example.com` with the production `MONGODB_URI`.
3. Upload a cover image and confirm its public ID in the Cloudinary Media Library starts with your `CLOUDINARY_FOLDER`.

### Production checklist

- [ ] Long, random, **different** `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` set to the exact frontend origin
- [ ] Indexes synced with `npm run sync-indexes`
- [ ] A separate `CLOUDINARY_FOLDER` per environment
- [ ] HTTPS on both the frontend and the API

---

## Future Improvements

- [ ] **Public comments system:** posting, editing, nested replies, comment likes, and live updates via Server-Sent Events. The data model and admin moderation already exist.
- [ ] **Automated test suite in CI** (API integration tests plus Playwright end-to-end tests) with GitHub Actions.
- [ ] **Rate limiting** on authentication, search and uploads (e.g. `express-rate-limit` with a Redis store).
- [ ] **Email verification and password reset** by email.
- [ ] **Multiple sessions per user,** with a "signed-in devices" list and per-device sign-out.
- [ ] **All-or-nothing account deletion** using MongoDB transactions.
- [ ] **Atlas Search** for typo tolerance, search-as-you-type suggestions and better highlighting.
- [ ] **Shared cache and messaging** (Redis) for the trending list, enabling multiple server instances.
- [ ] **Inline images in the editor** (uploads into the post body), and scheduled publishing.
- [ ] **Dark mode** across the app and charts.
- [ ] **SEO:** server-rendered meta tags, Open Graph images, sitemap and RSS feed.
- [ ] **Notifications** for new comments, likes and followers.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

<div align="center">

Made with ❤️ using the MERN stack

</div>
