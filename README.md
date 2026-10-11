# AI Driven Digital Library and Book Recommendation System

React/Vite frontend with an Express API and MongoDB persistence.

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB running locally, or a MongoDB connection URI

## Setup

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env` (`Copy-Item .env.example .env` in PowerShell).
3. Set `MONGODB_URI` and a unique, long `JWT_SECRET` in `.env`.
4. To enable the admin pages, set `ADMIN_EMAIL` and an `ADMIN_PASSWORD` of at least 12 characters. Leave both blank to disable admin account seeding. The API creates or promotes that account when it starts.
5. Start the API and frontend together with `npm run dev:full`. Alternatively, run `npm run server` and `npm run dev` in separate terminals.

The API seeds the starter book catalogue into an empty database. The frontend proxies `/api` requests to `http://localhost:5000` during development. For a separately hosted API, set `VITE_API_URL` to its `/api` base URL and configure `CLIENT_ORIGIN` on the server.

If MongoDB is not installed locally, create a MongoDB Atlas database and put its connection URI (including the database name) in `MONGODB_URI`. The API cannot start until MongoDB is reachable and `JWT_SECRET` is set.

## API features

- Account registration/login with hashed passwords and JWT authentication
- MongoDB-backed book catalogue, cart, and customer order history
- Admin-only catalogue management, order status updates, and dashboard statistics
- Persisted contact form messages
- Book recommendations searched from catalogue title, author, and category

Admin routes require an account matching the configured `ADMIN_EMAIL`. Do not commit `.env` or use example credentials in a deployed environment.
