export type Fairness = 'extremely unfair' | 'very unfair' | 'mostly unfair' | 'mostly fair' | 'very fair' | 'extremely fair';

export function evaluateFairness(fairnessScore: number) {
    if (fairnessScore > 0.97) {
        return 'extremely fair';
    }
    if (fairnessScore > 0.85) {
        return 'very fair';
    }
    if (fairnessScore > 0.5) {
        return 'mostly fair';
    }
    if (fairnessScore > 0.3) {
        return 'mostly unfair';
    }
    if (fairnessScore > 0.2) {
        return 'very unfair';
    }
    return 'extremely unfair';
}

export function isFair(fairnessEval: Fairness) {
    return fairnessEval === 'extremely fair' || fairnessEval === 'very fair' || fairnessEval === 'mostly fair';
}

export function fairColor(isFair: boolean) {
    return isFair ? 'text-fair' : 'text-unfair';
}

export function fairColorSmall(isFair: boolean) {
    return isFair ? 'text-fair-small' : 'text-unfair-small';
}

export function top20Plays(trackCounts: number[]) {
    const numTracks = trackCounts.length;
    trackCounts.sort((a, b) => b - a);
    if (numTracks < 5) {
        return trackCounts[0];
    }
    console.log(trackCounts);
    const top20 = trackCounts.slice(0, Math.floor(numTracks / 5));
    console.log(top20);
    return top20.reduce((sum, curr) => sum + curr, 0);
}