# Tech Curious

A project archive site — HTML + Tailwind CSS + vanilla JS frontend, Node/Express backend, image uploads via Cloudinary.

## Structure

```
tech-curious/
├── frontend/
│   ├── index.html      # public landing page + project grid
│   ├── login.html      # admin login
│   ├── admin.html      # upload dashboard (protected)
│   └── js/
│       ├── main.js     # fetches + filters projects on the landing page
│       └── admin.js    # login + upload + delete logic
└── backend/
    ├── server.js
    ├── package.json
    ├── .env.example
    ├── config/cloudinary.js
    ├── middleware/
    │   ├── auth.js      # JWT check for admin-only routes
    │   └── upload.js    # Multer + Cloudinary storage
    ├── routes/
    │   ├── auth.js      # POST /api/auth/login
    │   └── projects.js  # GET/POST/DELETE /api/projects
    └── data/projects.json  # simple JSON "database"
```

## Backend setup

1. `cd backend && npm install`
2. Copy `.env.example` to `.env` and fill in:
   - Your Cloudinary credentials (free account at cloudinary.com → Dashboard)
   - An `ADMIN_ID` / `ADMIN_PASSCODE` of your choice — this is what you'll type into the login page
   - A random `JWT_SECRET` string
3. `npm run dev` (or `npm start`) — runs on `http://localhost:5000` by default

## Frontend setup

No build step — it's plain HTML/CSS/JS with Tailwind loaded via CDN.

1. Open `frontend/index.html` directly, or serve the folder with any static server
   (e.g. VS Code's "Live Server" extension, or `npx serve frontend`)
2. If your backend runs somewhere other than `http://localhost:5000`, update
   `API_BASE` at the top of `frontend/js/main.js` and `frontend/js/admin.js`

## How it works

- **Public page** (`index.html`) calls `GET /api/projects` and renders a filterable grid.
- **Login** (`login.html`) posts to `POST /api/auth/login`; on success it stores a JWT in `localStorage`.
- **Admin dashboard** (`admin.html`) requires that token. Uploading a build sends a
  `multipart/form-data` request to `POST /api/projects` — Multer streams the image straight
  to Cloudinary (nothing is saved to your server's disk), and the returned secure URL is
  saved alongside the project details in `data/projects.json`.
- Deleting a project also deletes the image from Cloudinary via `cloudinary.uploader.destroy`.

## Notes / next steps

- `data/projects.json` is a flat-file "database" — fine for a personal site, but swap it
  for a real database (Postgres, MongoDB, etc.) if this grows or gets concurrent writers.
- The admin check is a single shared ID/passcode, not per-user accounts — enough for a
  one-person project hub, not a multi-admin system.
- Before deploying: set `CLIENT_ORIGIN` in `.env` to your real frontend domain (CORS),
  and never commit your real `.env` file.
