export function msToMin(totalMs: number) {
    const seconds = totalMs / 1000;
    const minutes = Math.floor(seconds / 60);
    return minutes;
}

export function formatNumber(val: number) {
    return val.toLocaleString();
}