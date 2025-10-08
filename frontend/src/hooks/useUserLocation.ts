import { useEffect, useState, useRef } from "react";

export interface Location {
    lat: number;
    lon: number;
}

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const MOCK_PATH: Location[] = [
    { lat: 40.102, lon: -88.227 }, // e.g., UIUC Main Quad
    { lat: 40.103, lon: -88.227 },
    { lat: 40.104, lon: -88.226 },
    { lat: 40.105, lon: -88.225 },
    { lat: 40.106, lon: -88.224 },
];

export function useUserLocation() {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);
    const watchId = useRef<number | null>(null);
    const mockIndex = useRef(0);

    const startTracking = () => {
        if (USE_MOCKS) {
            // simulate movement along MOCK_PATH every 3s
            const interval = setInterval(() => {
                setLocation(MOCK_PATH[mockIndex.current]);
                mockIndex.current = (mockIndex.current + 1) % MOCK_PATH.length;
            }, 3000);

            watchId.current = window.setInterval(() => { }, 3000);
            setError(null);
            return () => clearInterval(interval);
        }

        if (!navigator.geolocation) {
            setError("Geolocation not supported by this browser.");
            return;
        }

        watchId.current = navigator.geolocation.watchPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                setError(null);
            },
            (err) => {
                setError(err.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000,
            }
        );
    };

    const stopTracking = () => {
        if (USE_MOCKS && watchId.current !== null) {
            clearInterval(watchId.current);
        } else if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
        }
        watchId.current = null;
    };

    useEffect(() => {
        startTracking();
        return () => stopTracking();
    }, []);

    return { location, error, startTracking, stopTracking, isMock: USE_MOCKS };
}
