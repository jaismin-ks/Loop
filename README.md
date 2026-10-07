# Loop

A personalized gaming library organizer, discovery platform, and game key store. Built with Flask and React.

**Live demo:** _coming soon_ · No sign-up needed: click **Continue as Guest** on the login page.

---

## Features

- Register, log in, or **continue as a guest** to try everything without an account
- Build your game library and track what you're playing or have completed
- Wishlist games and get notified about price drops
- Get game recommendations based on your library and wishlist
- Buy game keys from the store with a cart and checkout
- Create and manage playlists
- Notifications for price drops and new DLC

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| **Frontend** | React, Vite, Tailwind CSS, GSAP |
| **Backend** | Python, Flask |
| **Database** | SQLite locally, Postgres (Neon) in production |
| **Game data** | [RAWG API](https://rawg.io/apidocs) |
| **Hosting** | Vercel (static frontend and Flask as a serverless function) |
| **CI** | GitHub Actions runs the backend tests on every push |

### Architecture

![System architecture](diagrams/Loop%20System%20Architecture.png)

![Database ERD](diagrams/Loop%20ERD.png)

---

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 20+
- A free RAWG API key from [rawg.io/apidocs](https://rawg.io/apidocs)

### 1. Clone the repo

```bash
git clone https://github.com/jaismin-ks/Loop
cd Loop
```

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `backend/` (see `.env.example`):

```
RAWG_API_KEY=your_rawg_api_key
```

Then start Flask:

```bash
python3 server.py
```

> On Windows use `python` instead of `python3`.

The backend runs on `http://localhost:5001` and creates `backend/loop.db` (SQLite) on first run.

### 3. Start the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Running with Docker

From the project root, create a `.env` file:

```
RAWG_API_KEY=your_rawg_api_key
```

Then:

```bash
docker-compose up --build
```

Open `http://127.0.0.1:5173`. After the first build you can just run `docker-compose up`.

---

## Deploying to Vercel

The repo is already set up for Vercel, so no code changes are needed:

- `vercel.json` builds the React app and serves it as static files
- `api/index.py` runs the Flask app as a serverless function under `/api/*`
- In production the frontend calls `/api/...` on the same domain, so there's no CORS setup

Steps:

1. Push the repo to GitHub.
2. On [vercel.com](https://vercel.com), choose **Add New → Project** and import the repo. Keep the default settings; `vercel.json` handles the build.
3. In the project, open **Storage** and add a **Neon** Postgres database. This sets `DATABASE_URL` for you. Tables are created on first request.
4. Under **Settings → Environment Variables**, add `RAWG_API_KEY`.
5. Redeploy. Every later push to `main` deploys automatically.

> Vercel functions have no permanent disk, which is why production uses Postgres instead of the SQLite file.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RAWG_API_KEY` | Yes | RAWG API key for game data |
| `DATABASE_URL` | Production only | Postgres connection string. If unset, the backend uses `backend/loop.db` (SQLite). |
| `VITE_API_URL` | No | Overrides the backend URL the frontend calls. Defaults to `http://127.0.0.1:5001` in dev and `/api` in production. |

---

## Usage

Most features need you to be signed in. Click **Continue as Guest** on the login or sign-up page to jump straight in, or create an account.

| Feature | How to use |
|---------|------------|
| **Store** | Browse and filter games by genre. Click the heart to wishlist, or add to cart and check out to get a game key. |
| **Library** | View your owned games, filter by status (Playing / Completed), and organize them into playlists. |
| **Wishlist** | See wishlisted games and their current price. Click **Check for Sales** to simulate a price update. Price drops show a sale badge and send a notification. |
| **Recommendations** | Scroll down on the home page after logging in. Recommendations come from the genres in your library and wishlist. |
| **Notifications** | The bell icon in the navbar shows unread price-drop and DLC notifications. |
| **Profile** | Update your email, bio, and password, and view past orders. |

> Prices and game keys are simulated for the project. No real purchases happen.

---

## Project Structure

```
Loop/
├── api/index.py          # Vercel entrypoint, mounts Flask under /api
├── backend/
│   ├── server.py         # Flask app and blueprint registration
│   ├── db.py             # SQLite / Postgres connection and schema
│   ├── rawg.py           # RAWG API helper
│   ├── validators.py     # Request validation
│   ├── test_validators.py
│   └── routes/           # auth, games, library, wishlist, playlists, orders, prices, notifications, recommendations
├── frontend/
│   ├── src/pages/        # Route pages (Home, Store, Library, Wishlist, ...)
│   ├── src/components/   # Shared UI components
│   ├── src/context/      # Logged-in user state
│   └── src/lib/api.js    # Backend base URL
├── diagrams/             # Architecture and ERD diagrams
├── docker-compose.yml
└── vercel.json
```

---

## Running Tests

```bash
python3 -m unittest discover -s backend -p "test_*.py" -v
```

Tests also run automatically on every push via GitHub Actions.

---

## Security Notes

Passwords are hashed with Werkzeug (scrypt) and never sent back to the browser. Accounts created before hashing was added are upgraded automatically on their next login.

This is a school project, so a few things are kept simple on purpose. The API trusts the `user_id` the frontend sends instead of using sessions or tokens, so don't reuse a real password here.
