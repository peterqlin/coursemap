export interface ClassData {
    id: number;
    subject: string;
    number: string;
    title: string;
    building: string;
    room?: string;
    start_time?: string; // "09:00"
    end_time?: string;   // "09:50"
    latitude: number;
    longitude: number;
}
