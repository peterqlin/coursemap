from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from db import get_connection
from utils import haversine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/classes")
def get_classes(
    lat: float = Query(...),
    lon: float = Query(...),
    day: str = Query(...),
    time_str: str = Query(...),
    radius: float = Query(200)  # meters
):
    conn = get_connection()
    cur = conn.cursor()
    # example endpoint: http://127.0.0.1:8000/classes?lat=40.105757082531156&lon=-88.22811081179489&day=M&time_str=09:00&radius=50
    cur.execute("""
        SELECT s.id AS section_id, c.id AS course_id,
               c.subject, c.number, c.title,
               b.name AS building_name, b.latitude, b.longitude,
               s.room, s.days, s.start_time, s.end_time
        FROM sections s
        JOIN courses c ON s.course_id = c.id
        JOIN buildings b ON s.building_id = b.id
        WHERE s.days LIKE ?
        AND time(?) BETWEEN time(s.start_time) AND time(s.end_time)
        AND b.latitude IS NOT NULL AND b.longitude IS NOT NULL
        """, (f"%{day}%", time_str))
    
    rows = cur.fetchall()
    print(f"{radius=}")

    nearby_classes = []
    for row in rows:
        distance = haversine(lat, lon, row["latitude"], row["longitude"])
        if distance <= radius:
            meeting_info = dict(row)
            meeting_info["distance_m"] = distance
            nearby_classes.append(meeting_info)
    
    # sort by distance
    nearby_classes.sort(key=lambda x: x["distance_m"])
    conn.close()
    return [dict(r) for r in nearby_classes]
