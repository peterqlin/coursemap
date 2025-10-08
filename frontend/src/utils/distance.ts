export function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // meters
    const phi_1 = (lat1 * Math.PI) / 180;
    const phi_2 = (lat2 * Math.PI) / 180;
    const delta_phi = ((lat2 - lat1) * Math.PI) / 180;
    const delta_lambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(delta_phi / 2) ** 2 +
        Math.cos(phi_1) * Math.cos(phi_2) *
        Math.sin(delta_lambda / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // meters
}
