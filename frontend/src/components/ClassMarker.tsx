import { Marker } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import type { ClassData } from "../types";
import { toAmPm } from "../utils/time";
import { createPortal } from "react-dom";

const buildingIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [64, 64],
    iconAnchor: [32, 64],
});

interface Props {
    classes: ClassData[];
}

export default function ClassMarker({ classes }: Props) {
    if (!classes.length) return null;

    const { latitude, longitude, building_name } = classes[0];

    const [showModal, setShowModal] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const handleMarkerClick = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    // Get all unique section types
    const sectionTypes = Array.from(new Set(classes.map((cls) => cls.section_type)));

    // Filtered list: if none selected, show all
    const filteredClasses =
        selectedTypes.length === 0
            ? classes
            : classes.filter((cls) => selectedTypes.includes(cls.section_type));

    const toggleType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    };

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
                            className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl w-[90%] md:w-[80%] lg:w-[70%] h-[80vh] p-6 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                className="absolute top-3 right-3 w-8 h-8 text-gray-600 hover:cursor-pointer hover:text-gray-800 text-2xl font-bold"
                                onClick={handleCloseModal}
                                aria-label="Close"
                                type="button"
                            >
                                ×
                            </button>

                            {/* Header */}
                            <div className="mb-4">
                                <div className="text-2xl font-bold text-gray-800">{building_name}</div>
                                {classes.length > 1 && (
                                    <div className="text-sm text-gray-600 mt-2">
                                        {classes.length} classes currently in session
                                    </div>
                                )}
                            </div>

                            {/* Filter section */}
                            <div className="mb-4 flex flex-wrap gap-3">
                                {sectionTypes.map((type) => (
                                    <label
                                        key={type}
                                        className={`px-3 py-1 rounded-full border cursor-pointer text-sm ${selectedTypes.includes(type)
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-400 hover:bg-gray-100"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={type}
                                            checked={selectedTypes.includes(type)}
                                            onChange={() => toggleType(type)}
                                            className="hidden"
                                        />
                                        {type}
                                    </label>
                                ))}
                                {selectedTypes.length > 0 && (
                                    <button
                                        className="text-sm text-blue-700 underline ml-2"
                                        onClick={() => setSelectedTypes([])}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Class list */}
                            <div className="overflow-y-auto max-h-[55vh] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                {filteredClasses.map((cls) => (
                                    <div
                                        key={cls.subject + cls.number + cls.section_type + cls.room}
                                        className="p-6 bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 break-words"
                                    >
                                        <div className="font-semibold text-lg text-gray-800 mb-1 truncate">
                                            {cls.subject} {cls.number}
                                        </div>
                                        <div className="text-sm text-gray-700 mb-1 break-words">
                                            {cls.title}
                                        </div>
                                        <div className="text-xs text-gray-600 italic mb-2">
                                            {cls.section_type}
                                        </div>
                                        <div className="text-sm text-gray-800">
                                            {toAmPm(cls.start_time)} – {toAmPm(cls.end_time)} | Room {cls.room}
                                        </div>
                                    </div>
                                ))}
                                {filteredClasses.length === 0 && (
                                    <div className="col-span-full text-center text-gray-600 italic">
                                        No sections match your filter.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
