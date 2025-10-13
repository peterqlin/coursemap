import { Marker } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import type { ClassData } from "../types";
import { toAmPm } from "../utils/time";
import { createPortal } from "react-dom";

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

    const [showModal, setShowModal] = useState(false);

    const handleMarkerClick = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    return (
        <>
            <Marker
                position={[latitude, longitude]}
                icon={buildingIcon}
                eventHandlers={{ click: handleMarkerClick }}
            />

            {showModal &&
                createPortal(
                    <div
                        className="modal-wrapper fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        onClick={handleCloseModal}
                        style={{ boxSizing: "border-box" }}
                    >
                        <div
                            className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl w-[90%] md:w-[80%] lg:w-[70%] max-h-[80vh] p-6 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl font-bold"
                                onClick={handleCloseModal}
                                aria-label="Close"
                            >
                                ×
                            </button>

                            {/* Header */}
                            <div className="mb-6">
                                <div className="text-2xl font-bold text-gray-800">{building_name}</div>
                                {classes.length > 1 && (
                                    <div className="text-sm text-gray-600 mt-1">
                                        {classes.length} classes currently in session
                                    </div>
                                )}
                            </div>

                            {/* Class list */}
                            <div className="overflow-y-auto max-h-[65vh] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                                {classes.map((cls) => (
                                    <div
                                        key={cls.subject + cls.number + cls.section_type}
                                        className="p-6 bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 break-words"
                                    >
                                        {/* Course code */}
                                        <div className="font-semibold text-lg text-gray-800 mb-1 truncate">
                                            {cls.subject} {cls.number}
                                        </div>

                                        {/* Course title */}
                                        <div className="text-sm text-gray-700 mb-1 break-words">
                                            {cls.title}
                                        </div>

                                        {/* Section type */}
                                        <div className="text-xs text-gray-600 italic mb-2">
                                            {cls.section_type}
                                        </div>

                                        {/* Time and room */}
                                        <div className="text-sm text-gray-800">
                                            {toAmPm(cls.start_time)} – {toAmPm(cls.end_time)}{" "}
                                            {cls.room && <span className="text-gray-600">| {cls.room}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
