import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { ClassData } from "../types";

const buildingIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -25],
});

interface Props {
    classes: ClassData[];
}

export default function ClassMarker({ classes }: Props) {
    if (!classes.length) return null;

    const { latitude, longitude, building } = classes[0];

    return (
        <Marker position={[latitude, longitude]} icon={buildingIcon}>
            <Popup>
                <div className="min-w-[200px]">
                    <h3 className="font-bold text-lg mb-1">{building}</h3>

                    {classes.length > 1 && (
                        <p className="text-xs text-gray-500 mb-2">
                            {classes.length} classes in session
                        </p>
                    )}

                    <ul className="divide-y divide-gray-200">
                        {classes.map((cls) => (
                            <li key={cls.id} className="p-2 mb-1 bg-gray-100 rounded-lg">
                                <div className="font-semibold text-sm">
                                    {cls.subject} {cls.number}
                                </div>
                                <div className="text-xs text-gray-600">{cls.title}</div>
                                <div className="text-xs text-gray-500">
                                    {cls.start_time}–{cls.end_time} {cls.room && `| ${cls.room}`}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </Popup>
        </Marker>
    );
}
