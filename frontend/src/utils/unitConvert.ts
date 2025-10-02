const msPerSec = 1000;
const msPerMin = msPerSec * 60;
const msPerHour = msPerMin * 60;
const msPerDay = msPerHour * 24;
const msPerYear = msPerDay * 365;

export function msToMin(totalMs: number) {
    const seconds = totalMs / 1000;
    const minutes = Math.floor(seconds / 60);
    return minutes;
}

export function msToHour(totalMs: number, isAbbreviated = false) {
    const hours = Math.floor(totalMs / msPerHour);
    totalMs %= msPerHour;

    const minutes = Math.floor(totalMs / msPerMin);
    totalMs %= msPerMin;

    return `${msTimeHelper(hours, isAbbreviated ? 'hr' : 'hour')}${msTimeHelper(minutes, isAbbreviated ? 'min' : 'minute', true)}`
}

export function msToMore(totalMs: number) {
    const years = Math.floor(totalMs / msPerYear);
    totalMs %= msPerYear;

    const days = Math.floor(totalMs / msPerDay);
    totalMs %= msPerDay;

    const hours = Math.floor(totalMs / msPerHour);
    totalMs %= msPerHour;

    const minutes = Math.floor(totalMs / msPerMin);
    totalMs %= msPerMin;

    return `${msTimeHelper(years, 'year')}${msTimeHelper(days, 'day')}${msTimeHelper(hours, 'hour')}${msTimeHelper(minutes, 'minute', true)}`;
}

function msTimeHelper(val: number, unit: string, isLast = false) {
    if (val <= 0 && !isLast) {
        return '';
    } else if (val === 1) {
        return `${val} ${unit}${isLast ? '' : ', '}`;
    }
    return `${val} ${unit}s${isLast ? '' : ', '}`;
}

export function formatNumber(val: number) {
    return val.toLocaleString();
}