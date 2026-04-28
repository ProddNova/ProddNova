# Urbex Multi-Tool

Private mobile-first web app to help an urbex explorer discover and analyze **potential abandoned locations**.

## Stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- MapLibre GL JS
- OpenStreetMap (Nominatim) + Overpass API
- Minimal backend via Next.js Route Handlers
- MongoDB Atlas Data API (works with free tier)

## Main tools

1. **Map Explorer**
2. **Radius Scanner**
3. **Coordinate Tool**
4. **Abandonment Checklist**
5. **Saved data & PDF export**

## Auth + backend behavior

- Automatic login is enabled.
- Default account auto-created on first boot:
  - **username:** `jack`
  - **password:** `Giacomo090665`
- Auth cookie is HTTP-only.
- Tool outputs can be saved to MongoDB and exported as PDF.

## Environment variables

Create a `.env.local`:

```bash
MONGODB_DATA_API_URL=https://data.mongodb-api.com/app/<your-app-id>/endpoint/data/v1
MONGODB_DATA_API_KEY=<your-data-api-key>
MONGODB_DATA_SOURCE=Cluster0
MONGODB_DATABASE=urbex
AUTH_SECRET=<long-random-secret>
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy on Render

1. Push this repo to GitHub.
2. Create a new **Web Service** on Render.
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Add the env vars listed above.
6. Ensure MongoDB Atlas Data API is enabled on your free cluster.

