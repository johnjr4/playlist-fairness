export function roundToDecimals(n: number, numDecimalPlaces: number) {
    const multiplier = Math.pow(10, numDecimalPlaces);
    return Math.round((n + Number.EPSILON) * multiplier) / multiplier;
}