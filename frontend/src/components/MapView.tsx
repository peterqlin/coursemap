import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useUserLocation } from "../hooks/useUserLocation";
import { getNearbyClasses } from "../api/apiClient";
import type { ClassData, Location } from "../types";
import { getCurrentDay, getCurrentTime } from "../utils/time";
import { haversine } from "../utils/distance";
import "leaflet/dist/leaflet.css";
import ClassMarker from "./ClassMarker";
import MoveArrows from "./MoveArrows";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const userIcon = L.icon({
    iconUrl: "/user.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

function RecenterMap({ lat, lon }: Location) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lon]);
    }, [lat, lon]);
    return null;
}

export default function MapView() {
    const { location, error, startTracking } = useUserLocation();
    const [classGroups, setClassGroups] = useState<Record<string, ClassData[]>>({});
    const [mapPos, setMapPos] = useState<Location | null>(null);
    const lastFetchLocation = useRef<Location | null>(null);

    // Helper: group classes by building coords
    const groupClasses = (data: ClassData[]) => {
        const grouped: Record<string, ClassData[]> = {};
        for (const cls of data) {
            const key = `${cls.latitude.toFixed(5)},${cls.longitude.toFixed(5)}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(cls);
        }
        return grouped;
    };

    useEffect(() => {
        if (location && !mapPos) {
            setMapPos(location);
        }
    }, [location]);

    // Fetch if moved > 30m
    useEffect(() => {
        // if mocking, use fake position
        if (USE_MOCKS) {
            if (!mapPos) return;
            const prev = lastFetchLocation.current;

            if (!prev || haversine(prev.lat, prev.lon, mapPos.lat, mapPos.lon) > 30) {
                const day = getCurrentDay();
                const time = getCurrentTime();

                getNearbyClasses(mapPos.lat, mapPos.lon, day, time)
                    .then((res) => {
                        setClassGroups(groupClasses(res));
                        lastFetchLocation.current = mapPos;
                    })
                    .catch(console.error);
            }
        } else {
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
        }
    }, [location, mapPos]);

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
        <>
            <div style={{ position: "absolute", top: 20, left: 20, zIndex: 1000 }}>
                <MoveArrows pos={mapPos} setPos={setMapPos} />
                <h1 style={{ background: "black", color: "white", padding: "2px 6px", borderRadius: "4px" }}>
                    {getCurrentDay()}, {getCurrentTime()}
                </h1>
            </div>
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

                {!USE_MOCKS && <Marker position={[location.lat, location.lon]} icon={userIcon}>
                    <Popup>You are here</Popup>
                </Marker>}

                {USE_MOCKS && mapPos && <Marker position={[mapPos.lat, mapPos.lon]} icon={userIcon}>
                    <Popup>You are here</Popup>
                </Marker>}

                {(() => {
                    console.debug("Class groups before rendering:", classGroups);
                    return Object.values(classGroups).map((group, i) => {
                        console.debug(`Rendering marker group ${i}:`, group);
                        return <ClassMarker key={i} classes={group} />;
                    });
                })()}

                {!USE_MOCKS && <RecenterMap lat={location.lat} lon={location.lon} />}

                {USE_MOCKS && mapPos && <RecenterMap lat={mapPos.lat} lon={mapPos.lon} />}
            </MapContainer>
        </>
    );
}
