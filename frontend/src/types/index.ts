export interface ClassData {
    course_id: number;
    subject: string;
    number: string;
    title: string;
    building_name: string;
    latitude: number;
    longitude: number;
    room: string;
    days: string;
    start_time: string; // "09:00"
    end_time: string;   // "09:50"
}

export interface Location {
    lat: number;
    lon: number;
}