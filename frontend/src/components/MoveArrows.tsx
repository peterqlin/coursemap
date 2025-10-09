import type React from "react";
import type { Location } from "../types";

interface MoveArrowsProps {
    pos: Location | null;
    setPos: React.Dispatch<React.SetStateAction<Location | null>>;
}

export default function MoveArrows({ pos, setPos }: MoveArrowsProps) {
    const step = 0.0001; // ~11m per step

    const move = (dir: string) => {
        setPos((p: Location | null) => (p && {
            lat: p.lat + (dir === "N" ? step : dir === "S" ? -step : 0),
            lon: p.lon + (dir === "E" ? step : dir === "W" ? -step : 0),
        }));
    };

    return (
        <div style={{ display: "grid", placeItems: "center", gap: 4 }}>
            <button
                style={{ background: "black", color: "white", padding: "6px 12px", border: "none", borderRadius: 4 }}
                onClick={() => move("N")}
            >↑</button>
            <div>
                <button
                    style={{ background: "black", color: "white", padding: "6px 12px", border: "none", borderRadius: 4 }}
                    onClick={() => move("W")}
                >←</button>
                <button
                    style={{ background: "black", color: "white", padding: "6px 12px", border: "none", borderRadius: 4 }}
                    onClick={() => move("E")}
                >→</button>
            </div>
            <button
                style={{ background: "black", color: "white", padding: "6px 12px", border: "none", borderRadius: 4 }}
                onClick={() => move("S")}
            >↓</button>
            {pos && <p className="bg-black text-white px-2 py-1 rounded">
                Lat: {pos.lat.toFixed(5)}, Lon: {pos.lon.toFixed(5)}
            </p>}
        </div>
    );
}
