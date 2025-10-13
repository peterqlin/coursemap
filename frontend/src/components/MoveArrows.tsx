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
        <div className="grid place-items-center gap-1">
            <button
                className="bg-black text-white w-6 h-6 flex items-center justify-center rounded"
                onClick={() => move("N")}
            >↑</button>
            <div className="flex gap-1">
                <button
                    className="bg-black text-white w-6 h-6 flex items-center justify-center rounded"
                    onClick={() => move("W")}
                >←</button>
                <button
                    className="bg-black text-white w-6 h-6 flex items-center justify-center rounded"
                    onClick={() => move("S")}
                >↓</button>
                <button
                    className="bg-black text-white w-6 h-6 flex items-center justify-center rounded"
                    onClick={() => move("E")}
                >→</button>
            </div>
        </div>
    );
}
