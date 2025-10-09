import { useEffect, useState, useRef } from "react";
import type { Location } from "../types";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export function useUserLocation() {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);
    const watchId = useRef<number | null>(null);

    const startTracking = () => {
        if (USE_MOCKS) {
            setLocation({ lat: 40.102, lon: -88.227 });
            return;
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
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
        }
        watchId.current = null;
    };

    useEffect(() => {
        startTracking();
        return () => stopTracking();
    }, []);

    return { location, error, startTracking, stopTracking };
}
