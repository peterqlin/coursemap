from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from db import get_connection
from utils import haversine, merge_sections

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/classes")
def get_classes(
    lat: float = Query(...),
    lon: float = Query(...),
    day: str = Query(...),
    time: str = Query(...),
    radius: float = Query(400)  # meters
):
    # Query Supabase / PostgreSQL
    with get_connection() as conn:
        result = conn.execute(
            text("""
                SELECT
                    s.id AS section_id,
                    c.id AS course_id,
                    c.subject,
                    c.number,
                    c.title,
                    b.name AS building_name,
                    b.latitude,
                    b.longitude,
                    s.room,
                    s.days,
                    s.start_time,
                    s.end_time,
                    s.section_type
                FROM sections s
                JOIN courses c ON s.course_id = c.id
                JOIN buildings b ON s.building_id = b.id
                WHERE s.days ILIKE :day_pattern
                  AND ((:time)::time BETWEEN s.start_time::time AND s.end_time::time)
                  AND b.latitude IS NOT NULL AND b.longitude IS NOT NULL
            """),
            {"day_pattern": f"%{day}%", "time": time}
        )

        rows = result.mappings().all()

    nearby_classes = []
    for row in rows:
        distance = haversine(lat, lon, row["latitude"], row["longitude"])
        if distance <= radius:
            meeting_info = dict(row)
            meeting_info["distance_m"] = distance
            nearby_classes.append(meeting_info)

    nearby_classes = merge_sections(nearby_classes)
    nearby_classes.sort(key=lambda x: x["distance_m"])
    return nearby_classes
