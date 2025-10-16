import axios from "axios";
import type { ClassData } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080"; // your FastAPI endpoint

export async function getNearbyClasses(lat: number, lon: number, day: string, time: string): Promise<ClassData[]> {
    const response = await axios.get(`${API_BASE}/classes`, {
        params: { lat, lon, day, time },
    });
    return response.data;
}
