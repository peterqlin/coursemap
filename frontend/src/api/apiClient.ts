import axios from "axios";
import type { ClassData } from "../types";

const API_BASE = "http://localhost:8000"; // your FastAPI endpoint

export async function getNearbyClasses(lat: number, lon: number, day: string, time: string): Promise<ClassData[]> {
    const response = await axios.get(`${API_BASE}/classes`, {
        params: { lat, lon, day, time_str: time },
    });
    return response.data;
}
