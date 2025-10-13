from math import radians, cos, sin, asin, sqrt

def haversine(lat1, lon1, lat2, lon2):
    """Calculate the great-circle distance between two points on Earth (in meters)."""
    # convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    # haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    c = 2*asin(sqrt(a))
    R = 6371000  # Radius of earth in meters
    return R * c

def merge_sections(section_list):
    """Scans the list of sections and removes any sections that share the same name, time, and location as another section."""
    seen = set()
    merged = []
    for section in section_list:
        key = (
            section.get("title"),
            section.get("start_time"),
            section.get("end_time"),
            section.get("section_type"),
            section.get("building_name")
        )
        if key not in seen:
            seen.add(key)
            merged.append(section)
    return merged