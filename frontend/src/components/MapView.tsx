import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useUserLocation } from "../hooks/useUserLocation";
import { getNearbyClasses } from "../api/apiClient";
import type { ClassData, Location } from "../types";
import { getCurrentDay, getCurrentTime, toAmPm } from "../utils/time";
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

    // Helper: group classes by building names
    const groupClasses = (data: ClassData[]) => {
        const grouped: Record<string, ClassData[]> = {};
        for (const cls of data) {
            const key = cls.building_name;
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

    if (!location) return (
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md text-gray-800 px-4 py-2 rounded-lg shadow-md w-max mx-auto">
            <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>Getting your location...</span>
        </div>
    );

    return (
        <div className="relative w-full h-screen">
            {USE_MOCKS && <>
                <div className="absolute top-1/2 left-1/2 z-50 -translate-x-1/2 translate-y-1/6">
                    <MoveArrows pos={mapPos} setPos={setMapPos} />
                </div>
                <div className="absolute top-10 left-10 z-50 bg-black text-white px-2 py-1 rounded">
                    Lat: {mapPos && mapPos.lat.toFixed(5)}, Lon: {mapPos && mapPos.lon.toFixed(5)}<br />
                    Day: {getCurrentDay()}, Time: {toAmPm(getCurrentTime())}
                </div>
            </>
            }
            <MapContainer
                className="fixed"
                center={[location.lat, location.lon]}
                zoom={18}
                minZoom={17}
                maxZoom={18}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom="center"
                doubleClickZoom={false}
                style={{ height: "100vh", width: "100vw" }}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.carto.com/">CARTO</a>' />

                {!USE_MOCKS && <Marker position={[location.lat, location.lon]} icon={userIcon}></Marker>}

                {USE_MOCKS && mapPos && <Marker position={[mapPos.lat, mapPos.lon]} icon={userIcon}></Marker>}

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
        </div>
    );
}
