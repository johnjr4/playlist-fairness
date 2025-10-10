import seedrandom, { alea } from 'seedrandom';

const fallbackRng = alea('sjdao2084n42j');

// Sample a *uniform* multinomial distribution
function sampleUniform(N: number, k: number, rng: seedrandom.PRNG | null) {
    if (rng === null) rng = fallbackRng;
    // console.log(rng);
    const counts = new Array(k).fill(0);
    for (let i = 0; i < N; i++) {
        counts[Math.floor(rng() * k)]++;
    }
    return counts;
}

// Split N samples across k categories in an array as evenly as possible
function getIdealArray(N: number, k: number) {
    const res = Math.floor(N / k);
    const rem = N % k;
    const ideal = new Array(k).fill(res);
    for (let i = 0; i < rem; i++) {
        ideal[i] += 1;
    }
    return ideal;
}

// Use Stirling's approximation (https://en.wikipedia.org/wiki/Stirling%27s_approximation) to approximate log_2(n!)
function log2Factorial(n: number) {
    return n * Math.log(n) - n;
}

function multinomialLogLikelihood(playCounts: number[], totalNumPlays: number) {
    const k = playCounts.length;
    const middleTerm = playCounts.reduce((acc, curr) => acc + (curr > 0 ? log2Factorial(curr) : 0), 0);
    return log2Factorial(totalNumPlays) - middleTerm - totalNumPlays * Math.log2(k);
}

export function monteCarloFairness(playCounts: number[], rng: seedrandom.PRNG | null = null, totalNumPlays: number | null = null) {
    if (totalNumPlays === null) totalNumPlays = playCounts.reduce((sum, curr) => sum + curr, 0);
    const k = playCounts.length;

    let numSamples = 1000;

    const observedLogLikelihood = multinomialLogLikelihood(playCounts, totalNumPlays);

    let numSamplesLessExtreme = 0;
    for (let i = 0; i < numSamples; i++) {
        const sample = sampleUniform(totalNumPlays, k, rng);
        const sampleLogLikelihood = multinomialLogLikelihood(sample, totalNumPlays);
        if (sampleLogLikelihood <= observedLogLikelihood) numSamplesLessExtreme++;
    }
    // Ensure that ideal case is in there
    numSamples += 1;
    const idealCounts = getIdealArray(totalNumPlays, k);
    const idealLogLikelihood = multinomialLogLikelihood(idealCounts, totalNumPlays);
    if (idealLogLikelihood <= observedLogLikelihood) numSamplesLessExtreme++;

    return numSamplesLessExtreme / numSamples;
}