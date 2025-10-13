import type * as Public from "spotifair";

export function numPlaysComparator(ascendingMultipler: number, a: Public.PlaylistTrackHist, b: Public.PlaylistTrackHist) {
    const compVal = a.listeningEvents.length - b.listeningEvents.length;
    if (compVal === 0) {
        // If they're equal, sort by last played
        return lastPlayedAtComparator(ascendingMultipler, a, b);
    }
    return ascendingMultipler * compVal;
}
export function nameComparator(ascendingMultipler: number, a: Public.PlaylistTrackHist, b: Public.PlaylistTrackHist) {
    return ascendingMultipler * (a.track.name.localeCompare(b.track.name));
}
export function playlistOrderComparator(ascendingMultipler: number, a: Public.PlaylistTrackHist, b: Public.PlaylistTrackHist) {
    return ascendingMultipler * (a.playlistPosition - b.playlistPosition);
}
export function lastPlayedAtComparator(ascendingMultipler: number, a: Public.PlaylistTrackHist, b: Public.PlaylistTrackHist) {
    let retVal = null;
    if (a.listeningEvents.length < 1) {
        // If a was never played...
        if (b.listeningEvents.length < 1) {
            // and b was never played, they're equal
            retVal = 0;
        } else {
            // and b was played, it should come after
            retVal = -1;
        }
    } else if (b.listeningEvents.length < 1) {
        // If only a was played, it should come after
        retVal = 1;
    }
    // If any of those were fulfilled, return straightaway
    if (retVal !== null) return ascendingMultipler * retVal;

    const lastA = Date.parse(a.listeningEvents[a.listeningEvents.length - 1].playedAt);
    const lastB = Date.parse(b.listeningEvents[b.listeningEvents.length - 1].playedAt);

    return ascendingMultipler * (lastA - lastB);
}