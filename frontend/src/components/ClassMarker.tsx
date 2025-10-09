import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { ClassData } from "../types";
import { toAmPm } from "../utils/time";

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

    const { latitude, longitude, building_name } = classes[0];

    return (
        <Marker position={[latitude, longitude]} icon={buildingIcon}>
            <Popup>
                <div className="min-w-[200px] max-w-[250px]">
                    <div className="font-bold text-lg mb-1">{building_name}</div>

                    {classes.length > 1 && (
                        <div className="text-xs text-gray-500 mb-2">
                            {classes.length} classes in session
                        </div>
                    )}

                    <ul className="divide-y divide-gray-200 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-md">
                        {classes.map((cls) => (
                            <li key={cls.section_id} className="p-2 bg-gray-100 rounded-md mb-1">
                                <div className="font-semibold text-sm">
                                    {cls.subject} {cls.number}
                                </div>
                                <div className="text-xs text-gray-600">{cls.title}</div>
                                <div className="text-xs text-gray-500">
                                    {toAmPm(cls.start_time)} – {toAmPm(cls.end_time)} {cls.room && `| ${cls.room}`}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </Popup>
        </Marker>

    );
}
