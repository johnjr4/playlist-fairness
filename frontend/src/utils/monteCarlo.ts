import seedrandom from 'seedrandom';

const fallbackRng = seedrandom('sjdao2084n42j');

// Sample a *uniform* multinomial distribution
function sampleUniform(N: number, k: number, rng: seedrandom.PRNG | null) {
    if (rng === null) rng = fallbackRng;
    // console.log(rng);
    const counts = new Array(k).fill(0);
    for (let i = 0; i < N; i++) {
        counts[Math.floor(rng.quick() * k)]++;
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
    // console.log(middleTerm)
    return log2Factorial(totalNumPlays) - middleTerm - totalNumPlays * Math.log2(k);
}

export function monteCarloFairness(playCounts: number[], rng: seedrandom.PRNG | null = null, totalNumPlays: number | null = null) {
    if (totalNumPlays === null) totalNumPlays = playCounts.reduce((sum, curr) => sum + curr, 0);
    const k = playCounts.length;

    // Ad hoc attempt to lower time when playlist gets long
    let numSamples = 3000;
    if (k > 8000) {
        numSamples = 1000;
    } else if (k > 5000) {
        numSamples = 1400;
    } else if (k > 1000) {
        numSamples = 2000;
    }

    const observedLogLikelihood = multinomialLogLikelihood(playCounts, totalNumPlays);
    // console.log(observedLogLikelihood);

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

// const whatAGameCounts = [1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 2, 0, 2, 0, 1, 2, 1, 2, 3, 0, 1, 3, 3, 1, 1, 0, 1, 1, 0, 1, 1, 2, 3, 3, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 3, 2, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 2, 1, 3, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 3, 0, 2, 0, 1, 2, 0, 2, 2, 2, 2, 2, 2, 2, 1, 2, 0, 1, 3, 0, 2, 2, 0, 1, 1, 0, 0, 0, 2, 0, 1, 1, 2, 0, 1, 1, 3, 0, 2, 1, 0, 2, 2, 1, 1, 3, 0, 0, 0, 0, 3, 2, 1, 0, 0, 0, 1, 2, 3, 1, 0, 0, 1, 1, 0, 1, 2, 1, 2, 1, 1, 1, 2, 2, 0, 3, 0, 2, 0, 1, 2, 0, 0, 1, 1, 0, 2, 2, 0, 1, 1, 3, 0, 1, 2, 1, 1, 1, 1, 3, 0, 1, 2, 2, 1, 2, 1, 1, 3, 2, 1, 1, 1, 0, 0, 2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 3, 2, 2, 0, 2, 2, 2, 3, 0, 1, 0, 4, 3, 3, 2, 0, 2, 1, 2, 1, 1, 5, 3, 5, 0, 0, 0, 2, 3, 2, 0, 1, 1, 1, 1, 3, 2, 3, 1, 4, 1, 2, 2, 1, 1, 3, 1, 0, 1, 2, 2, 2, 1, 0, 5, 2, 3, 2, 2, 1, 0, 0, 0, 2, 1, 1, 0, 1, 2, 2, 1, 3, 0, 1, 2, 0, 2, 1, 2, 2, 2, 0, 2, 0, 2, 1, 0, 3, 1, 2, 1, 2, 2, 0, 1, 1, 0, 0, 2, 3, 1, 3, 1, 0, 2, 2, 0, 3, 0, 0, 2, 2, 1, 0, 1, 2, 1, 1, 3, 2, 3, 0, 3, 0, 1, 2, 1, 2, 1, 0, 3, 1, 1, 1, 0, 1, 2, 1, 0, 1, 0, 0, 1, 2, 3, 1, 0, 0, 1, 0, 1, 0, 0, 2, 2, 1, 2, 2, 2, 1, 2, 2, 1, 3, 0, 0, 1, 1, 1, 2, 2, 1, 2, 1, 1, 1, 2, 0, 1, 1, 0, 1, 0, 1, 2, 2, 2, 2, 4, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 2, 2, 3, 1, 2, 1, 2, 1, 1, 1, 1, 2, 2, 0, 1, 0, 2, 3, 2, 3, 1, 2, 3, 0, 0, 0, 0, 0, 0, 1, 3, 0, 0, 1, 0, 1, 0, 1, 1, 1, 2, 2, 0, 2, 1, 4, 2, 2, 2, 3, 2, 3, 1, 1, 4, 0, 0, 3, 3, 1, 2, 3, 0, 0, 1, 1, 1, 1, 3, 2, 0, 3, 0, 0, 1, 1, 0, 1, 0, 2, 1, 1, 1, 2, 0, 1, 1, 2, 1, 2, 2, 1, 1, 3, 1, 0, 2, 1, 1, 1, 1, 2, 2, 1, 2, 3, 2, 1, 2, 0, 2, 0, 2, 3, 3, 0, 2, 0, 2, 2, 1, 2, 0, 2, 0, 2, 2, 4, 1, 1, 3, 0, 1, 2, 0, 0, 2, 0, 1, 1, 1, 3, 1, 2, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 2, 2, 1, 0, 1, 3, 0, 0, 0, 1, 1, 3, 1, 0, 0, 1, 0, 1, 0, 2, 0, 0, 0, 2, 0, 0, 1, 0, 1, 2, 1, 1, 2, 0, 1, 1, 0, 0, 2, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// const myRng = seedrandom('new-seed');

// console.log(monteCarloFairness(whatAGameCounts, myRng));