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
            <button onClick={() => move("N")}>↑</button>
            <div>
                <button onClick={() => move("W")}>←</button>
                <button onClick={() => move("E")}>→</button>
            </div>
            <button onClick={() => move("S")}>↓</button>
            {pos && <p style={{ background: "black", color: "white", padding: "2px 6px", borderRadius: "4px" }}>
                Lat: {pos.lat.toFixed(5)}, Lon: {pos.lon.toFixed(5)}
            </p>}
        </div>
    );
}
