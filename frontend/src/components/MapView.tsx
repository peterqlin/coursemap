import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useUserLocation } from "../hooks/useUserLocation";
import { getNearbyClasses } from "../api/apiClient";
import type { ClassData } from "../types";
import { getCurrentDay, getCurrentTime } from "../utils/time";
import { haversine } from "../utils/distance";
import "leaflet/dist/leaflet.css";
import ClassMarker from "./ClassMarker";

const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lon]);
    }, [lat, lon]);
    return null;
}

export default function MapView() {
    const { location, error, startTracking } = useUserLocation();
    const [classGroups, setClassGroups] = useState<Record<string, ClassData[]>>({});
    const lastFetchLocation = useRef<{ lat: number; lon: number } | null>(null);

    // Helper: group classes by building coords
    const groupClasses = (data: ClassData[]) => {
        console.log(data[0]);
        const grouped: Record<string, ClassData[]> = {};
        for (const cls of data) {
            const key = `${cls.latitude.toFixed(5)},${cls.longitude.toFixed(5)}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(cls);
        }
        return grouped;
    };

    // Fetch if moved > 30m
    useEffect(() => {
        if (!location) return;
        const prev = lastFetchLocation.current;

        if (!prev || haversine(prev.lat, prev.lon, location.lat, location.lon) > 30) {
            const day = getCurrentDay();
            const time = getCurrentTime();

            getNearbyClasses(location.lat, location.lon, day, time)
                .then((res) => {
                    setClassGroups(groupClasses(res));
                    lastFetchLocation.current = location;
                })
                .catch(console.error);
        }
    }, [location]);

    if (error && error.toLowerCase().includes("denied")) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p>Location access denied. Please enable location tracking to view nearby classes.</p>
                <button
                    onClick={startTracking}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Enable Location Tracking
                </button>
            </div>
        );
    }

    if (!location) return <div>Getting your location...</div>;

    return (
        <MapContainer
            center={[location.lat, location.lon]}
            zoom={17}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            style={{ height: "100vh", width: "100vw" }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <Marker position={[location.lat, location.lon]} icon={userIcon}>
                <Popup>You are here</Popup>
            </Marker>

            {(() => {
                console.debug("Class groups before rendering:", classGroups);
                return Object.values(classGroups).map((group, i) => {
                    console.debug(`Rendering marker group ${i}:`, group);
                    return <ClassMarker key={i} classes={group} />;
                });
            })()}


            <RecenterMap lat={location.lat} lon={location.lon} />
        </MapContainer>
    );
}
