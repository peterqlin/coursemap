# coursemap uiuc

A single-page interactive map that shows classes happening nearby in real time, based on the user's location and time of day.

**Tech Stack:**

* **Frontend:** React + TypeScript + Vite + Leaflet.js
* **Backend:** FastAPI + SQLite
* **Database:** SQLite
* **Other:** Axios for API calls, TailwindCSS

## Setup

### Backend

```bash
cd backend
uv venv
source .venv/bin/activate   # macOS/Linux
.venv\Scripts\activate      # Windows
uv sync
```

Run the backend server:

```bash
uvicorn app:app --reload
```

> Ensure CORS is enabled in `app.py` for `http://localhost:5173`.



### Frontend

```bash
cd frontend
npm install
npm run dev
```

* Open `http://localhost:5173` in your browser.
* The map should request **location access**.



## Features

1. **Real-time location tracking**

   * Uses `navigator.geolocation` or mock mode
   * Map locked to user; no panning/zooming by default

2. **Nearby classes**

   * Automatically fetches classes happening near the user's location
   * Uses backend endpoint `/classes?lat=..&lon=..&day=..&time=..`

3. **Class stacking**

   * Multiple classes in the same building appear as a single marker
   * Clicking shows all classes in a popup

4. **Mock mode for testing**

   * Controlled via `.env` (`VITE_USE_MOCKS=true`)
   * Simulates movement and fixed time of day

5. **Enable location tracking button**

   * Appears if location permission denied

## Testing & Debugging

* **Mock location & time:** edit `.env` or `MOCK_PATH` in `useUserLocation.ts`

## Next Steps / Enhancements

* Color-code classes by department
* Animate user marker for smoother movement
* Add marker clustering for high-density locations
* Filter by course type, department, or time range
* Add mobile-friendly UI and offline caching

## Dependencies

**Backend:**

* `fastapi`
* `uvicorn`
* `sqlite3` (built-in)

**Frontend:**

* `react` + `react-dom`
* `react-leaflet` + `leaflet`
* `axios`
* `vite`
* `typescript`
