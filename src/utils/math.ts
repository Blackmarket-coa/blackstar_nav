import { numbersOnly } from './format';

type DistanceUnit = 'meters' | 'kilometers' | 'miles';

export function percentage(percent: number, number: number): number {
    return (percent / 100) * number;
}

export function haversine([lat1, lon1]: [number, number], [lat2, lon2]: [number, number], unit: DistanceUnit = 'meters'): number {
    const toRadian = (angle: number) => (Math.PI / 180) * angle;
    const distance = (a: number, b: number) => (Math.PI / 180) * (a - b);
    const RADIUS_OF_EARTH_IN_M = 6371000;

    const dLat = distance(lat2, lat1);
    const dLon = distance(lon2, lon1);

    lat1 = toRadian(lat1);
    lat2 = toRadian(lat2);

    const a = Math.pow(Math.sin(dLat / 2), 2) + Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.asin(Math.sqrt(a));

    let finalDistance = RADIUS_OF_EARTH_IN_M * c;

    if (unit === 'kilometers') {
        finalDistance /= 1000;
    } else if (unit === 'miles') {
        finalDistance /= 1609.34;
    }

    return finalDistance;
}

export function calculateTip(tip: string | number, subtotal: number): number {
    let amount: string | number = tip;
    if (typeof tip === 'string' && tip.endsWith('%')) {
        amount = percentage(numbersOnly(tip), subtotal);
    }

    amount = parseInt(String(amount), 10);
    return Number.isNaN(amount) ? 0 : amount;
}
