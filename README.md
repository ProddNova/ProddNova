# Urbex Multi-Tool

Private mobile-first web app to help an urbex explorer discover and analyze **potential abandoned locations**.

## Stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- MapLibre GL JS
- OpenStreetMap (Nominatim) + Overpass API

## Main tools

1. **Map Explorer**
   - Interactive map with marker results.
   - Button to search abandoned-type buildings in the current map area.
2. **Radius Scanner**
   - Input city or coordinates and radius (km).
   - Finds industrial zones, abandoned-tagged buildings, and large structures.
3. **Coordinate Tool**
   - Inspect a coordinate or drop a pin on map.
   - View nearby OSM tags and quick Google Maps / Street View links.
4. **Abandonment Checklist**
   - Quick manual checklist.
   - Computes an abandonment likelihood score.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project structure

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    AbandonmentChecklist.tsx
    CoordinateTool.tsx
    MapExplorerTool.tsx
    MapView.tsx
    RadiusScannerTool.tsx
  lib/
    map-links.ts
    overpass.ts
    types.ts
```

## Notes

- No authentication.
- No backend database.
- Overpass and geocoding requests are client-side only.
- Dark minimal UI optimized for phone screens.
