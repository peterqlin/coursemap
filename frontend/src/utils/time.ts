const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export function getCurrentDay(): string {
    if (USE_MOCKS) return "M"; // mock Monday

    const dayIndex = new Date().getDay(); // 0=Sunday, 1=Monday, ...
    const dayMap = ["U", "M", "T", "W", "R", "F", "S"];
    return dayMap[dayIndex];
}


export function getCurrentTime(): string {
    if (USE_MOCKS) return "14:00"; // 2 PM in 24-hour format
    return new Date().toLocaleTimeString("en-US", { hour12: false }).slice(0, 5);
}
