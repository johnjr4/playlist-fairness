import * as Public from 'spotifair';
import type { AnalysisStats, PlaylistHistState } from '../utils/types/playlistPage';
import { monteCarloFairness } from '../utils/monteCarlo';
import seedrandom from 'seedrandom';
import { evaluateFairness, fairColor, fairColorSmall, isFair, top20Plays } from '../utils/fairness';
import type { JSX } from 'react';
import { roundToDecimals } from '../utils/numberUtils';
import PlaylistTrackCard from './PlaylistTrackCard';

interface PlaylistAnalysisProps {
    filteredTracks: Public.PlaylistTrackHist[] | null;
    state: PlaylistHistState;
    selectedTrack: Public.PlaylistTrackHist | null;
    className?: string;
}

interface PlaylistAnalysisContent {
    header: JSX.Element | undefined;
    stats?: AnalysisStats;
}

function getAnalysis(state: PlaylistHistState, filteredTracks: Public.PlaylistTrackHist[] | null): PlaylistAnalysisContent {
    switch (state) {
        case 'loading':
            return {
                header: undefined,
            };
        case 'error':
            return {
                header: getAnalysisHeader('Your playlist', 'encountered a problem', 'neutral'),
            }
        case 'syncing':
            return {
                header: getAnalysisHeader('Your playlist is', 'syncing...', 'neutral'),
            }
        case 'unsynced':
            return {
                header: getAnalysisHeader('Your playlist is', 'not synced', 'neutral'),
            }
        case 'synced':
            if (filteredTracks!.length < 1) {
                return {
                    header: getAnalysisHeader('Your playlist', 'has no tracks', 'neutral'),
                }
            }
            // TODO: Actually display the analysis score somehow
            const stats = getAnalysisStats(filteredTracks!);
            if (stats.totalPlays <= 0) {
                return {
                    header: getAnalysisHeader('Your playlist', 'has no activity', 'neutral'),
                }
            }
            // const scoreAnalysis = (stats!.fairnessScore > 0 ? <span className='text-green-600'>mostly fair</span> : <span className='text-red-400'>mostly unfair</span>)
            return {
                header: getAnalysisHeader('Your playlist is', stats.fairness, stats.isFair ? 'fair' : 'unfair'),
                stats: stats,
            }
        default:
            return {
                header: <>Something went wrong</>
            }
    }
}

function getAnalysisHeader(startText: string, statusText: string, statusType: 'unfair' | 'fair' | 'neutral') {
    const textColor = statusType === 'neutral' ? 'text-gray-500' : fairColor(statusType === 'fair');
    return <>{startText} <span className={textColor}>{statusText}</span></>
}

function getAnalysisStats(filteredTracks: Public.PlaylistTrackHist[]): AnalysisStats {
    const newRng = seedrandom(filteredTracks.length.toString());
    const trackPlayCounts = filteredTracks.map(pt => pt.listeningEvents.length);
    const totalPlays = trackPlayCounts.reduce((acc, count) => acc + count, 0);
    const avgPlays = totalPlays / filteredTracks.length;
    const fairnessScore = monteCarloFairness(trackPlayCounts, newRng, totalPlays);
    const fairness = evaluateFairness(fairnessScore);
    return {
        trackCounts: trackPlayCounts,
        totalPlays: totalPlays,
        avgPlays: avgPlays,
        fairnessScore: fairnessScore,
        fairness: fairness,
        isFair: isFair(fairness),
        top20Share: top20Plays(trackPlayCounts) / totalPlays,
    }
}

function getDisabledStyling(state: PlaylistHistState) {
    return (state === 'synced') ? undefined : 'opacity-70 pointer-events-none';
}

function PlaylistAnalysis({ filteredTracks, selectedTrack, className, state }: PlaylistAnalysisProps) {
    const { header, stats } = getAnalysis(state, filteredTracks);
    return (
        <div className={`block ${className}
            rounded-sm gap-2 py-4 px-3 lg:gap-4 lg:px-5 lg:py-5 ${getDisabledStyling(state)}`}>
            <div className='sticky top-20 flex flex-col gap-5'>
                <h1 className={`font-semibold text-4xl ${state === 'synced' ? undefined : 'opacity-30'}`}>{header}</h1>
                {
                    stats &&
                    <div className='flex flex-col gap-2'>
                        <AnalysisStat header='Likelihood' tip='assuming equal chance for all songs'>
                            More likely than {!stats.isFair && 'only'} about <span className={`font-semibold ${fairColorSmall(stats.isFair)}`}>
                                {roundToDecimals(stats.fairnessScore * 100, 2)}%
                            </span> of distributions
                        </AnalysisStat>
                        <AnalysisStat header='Plays' tip={`${roundToDecimals(stats.avgPlays, 2)} play${stats.avgPlays === 1 ? '' : 's'}/track`}>
                            <span className='font-semibold'>{stats.totalPlays}</span> play{stats.totalPlays === 1 ? '' : 's'}
                        </AnalysisStat>
                        <AnalysisStat header='Pareto' >
                            Top {stats.trackCounts.length >= 5 ? '20% of tracks account' : 'track accounts'} for <span className={`font-semibold ${fairColorSmall(stats.isFair)}`}>
                                {roundToDecimals(stats.top20Share * 100, 2)}%
                            </span> of the plays
                        </AnalysisStat>
                        <AnalysisStat header='Track' tip={!selectedTrack ? 'select a track to see more info' : undefined}>
                            {selectedTrack && <PlaylistTrackCard playlistTrack={selectedTrack} stats={stats} />}
                        </AnalysisStat>
                    </div>
                }
            </div>
        </div>
    )
}

function AnalysisStat({ header, children, tip }: { header: string, children: React.ReactNode, tip?: string }) {
    return (
        <div>
            <h2 className='font-semibold text-dark-highlight'>{header}:</h2>
            <div className=''>{children}</div>
            {tip && <p className='text-sm text-dark-highlight'>({tip})</p>}
        </div>
    )
}

export default PlaylistAnalysis;