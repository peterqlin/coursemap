# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend
```bash
cd backend
uv sync                                    # install dependencies
uvicorn app:app --reload --port 8000       # run dev server
uv add <package>                           # add a dependency
```

### Frontend
```bash
cd frontend
npm install                                # install dependencies
npm run dev                                # run dev server (http://localhost:5173)
npm run build                             # production build (tsc -b && vite build)
npm run lint                              # run ESLint
```

### Testing the API directly
```
http://127.0.0.1:8000/classes?lat=40.105&lon=-88.228&day=M&time=09:00&radius=400
```

Day codes: `M T W R F S U` (Monday through Sunday). Time is 24-hour `HH:MM`.

---

## Architecture

**CoursemapUIUC** shows classes currently in session near the user's real-time GPS location on a Leaflet map of UIUC campus.

### Data Flow
1. `useUserLocation` hook continuously tracks GPS position via `watchPosition`
2. `MapView` triggers a fetch to `GET /classes` when user moves >30 meters
3. Backend queries SQLite, filters by Haversine distance, deduplicates sections
4. Frontend groups results by `building_name` and renders `ClassMarker` per building
5. Clicking a marker opens a modal (React Portal at `document.body`) with filterable class cards

### Backend (`backend/`)
- **`app.py`** — Single FastAPI endpoint `GET /classes`. Queries SQLite joining `sections`, `courses`, and `buildings` tables, runs Haversine filter, deduplicates via `merge_sections`, sorts by distance.
- **`db.py`** — SQLite connection with row factory. Database path: `../data/classes_fa25_updated.db` (gitignored, local only). Commented-out Supabase/PostgreSQL config exists for future migration.
- **`utils.py`** — `haversine()` (meters) and `merge_sections()` (deduplicates sections with same title/time/type/building).

### Frontend (`frontend/src/`)
- **`components/MapView.tsx`** — Owns `classGroups` state and fetch logic. Map is locked (no pan/zoom); it recenters on the user. CartoDB light tiles, zoom 18.
- **`components/ClassMarker.tsx`** — Building marker that opens a filterable modal via React Portal. Filters by section type (LEC, LAB, DIS, etc.).
- **`components/MoveArrows.tsx`** — Overlay for mock mode navigation (±0.0001° per step, ~11m).
- **`hooks/useUserLocation.ts`** — Returns `{lat, lon}` from real GPS or a fixed UIUC location in mock mode.
- **`api/apiClient.ts`** — Axios wrapper: `getNearbyClasses(lat, lon, day, time)`.
- **`utils/time.ts`** — `getCurrentDay()` → day code, `getCurrentTime()` → `HH:MM`, `toAmPm()` → 12-hour display.
- **`utils/distance.ts`** — Frontend Haversine (mirrors backend).
- **`types/index.ts`** — `ClassData` and `Location` interfaces.

### Mock Mode
Set `VITE_USE_MOCKS=true` in `frontend/.env`. Fixes location to `(40.10750, -88.22720)` and time to Monday 14:00. The MoveArrows overlay lets you simulate walking to trigger new fetches.

### Deployment
Docker multi-stage build in `dockerfile` (Python 3.13-slim + uv). Deployed to Fly.io (`fly.toml`, Chicago `ord` region, autoscales to 0). Backend serves on port 8080 in production.

---

## Key Conventions

- **Backend SQL:** Use `?` placeholders (SQLite parameterized queries).
- **Frontend naming:** PascalCase components, camelCase hooks/utils.
- **Frontend scrollbars:** Use `scrollbar-thin` (from `tailwind-scrollbar` plugin, imported in `index.css`).
- **Haversine** is implemented identically in both `backend/utils.py` and `frontend/src/utils/distance.ts` — keep them in sync.
- **`uv`** for all Python dependency changes; never use pip directly.
