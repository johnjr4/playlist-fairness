import * as Public from 'spotifair';
import type { AnalysisStats, PlaylistHistState } from '../utils/types/playlistPage';
import { monteCarloFairness } from '../utils/monteCarlo';
import { alea } from 'seedrandom';
import { evaluateFairness, fairColor, fairColorSmall, isFair, top20Plays } from '../utils/fairness';
import { useMemo, type JSX } from 'react';
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
                    stats: getEmptyStats(),
                }
            }
            // TODO: Actually display the analysis score somehow
            const stats = getAnalysisStats(filteredTracks!);
            if (stats.totalPlays <= 0) {
                return {
                    header: getAnalysisHeader('Your playlist', 'has no activity', 'neutral'),
                    stats: stats,
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
    const newRng = alea(filteredTracks.length.toString());

    const trackPlayCounts = filteredTracks.map(pt => pt.listeningEvents.length);
    const totalPlays = trackPlayCounts.reduce((acc, count) => acc + count, 0);
    const avgPlays = totalPlays / filteredTracks.length;
    const fairnessScore = monteCarloFairness(trackPlayCounts, newRng, totalPlays);
    const fairness = evaluateFairness(fairnessScore);
    const top20Share = top20Plays(trackPlayCounts) / totalPlays;
    return {
        trackCounts: trackPlayCounts,
        totalPlays: totalPlays,
        avgPlays: avgPlays,
        fairnessScore: fairnessScore,
        fairness: fairness,
        isFair: isFair(fairness),
        top20Share: top20Share,
    }
}

function getEmptyStats(): AnalysisStats {
    return {
        trackCounts: [0],
        totalPlays: 0,
        avgPlays: 0,
        fairnessScore: 0,
        fairness: 'extremely unfair',
        isFair: false,
        top20Share: 0,
    }
}

function getDisabledStyling(state: PlaylistHistState) {
    return (state === 'synced') ? undefined : 'opacity-70 pointer-events-none';
}

interface DisplayStatHelper {
    header: string;
    tip?: string;
    content: React.ReactNode;
}

function getTransformedDisplayStat(helper: DisplayStatHelper, className?: string) {
    return (
        <AnalysisStat header={helper.header} tip={helper.tip} className={className}>
            {helper.content}
        </AnalysisStat>
    )
}

function getLikelihoodDisplayStat(stats: AnalysisStats, className?: string) {
    const header = 'Likelihood';
    if (stats.totalPlays <= 0) {
        return getTransformedDisplayStat({
            header,
            content: <>Calculated once playlist has activity</>,
            tip: 'may take several minutes to sync'
        }, className);
    }

    return getTransformedDisplayStat({
        header,
        tip: 'assuming equal chance for all songs',
        content: (
            <>
                More likely than {!stats.isFair && 'only'} about <span className={`font-semibold ${fairColorSmall(stats.isFair)}`}>
                    {roundToDecimals(stats.fairnessScore * 100, 2)}%
                </span> of distributions
            </>
        )
    }, className);
}

function getPlaysDisplayStat(stats: AnalysisStats, className?: string) {
    const header = 'Plays';
    if (stats.totalPlays <= 0) {
        return getTransformedDisplayStat({
            header,
            content: (<><span className='font-semibold'>0</span> plays</>)
        }, className);
    }
    return getTransformedDisplayStat({
        header,
        content: (<>
            <span className='font-semibold'>
                {stats.totalPlays.toLocaleString()}
            </span> play{stats.totalPlays === 1 ? '' : 's'} <span className='text-xs lg:text-sm text-dark-highlight'>
                ({roundToDecimals(stats.avgPlays, 2).toLocaleString()} per track)
            </span>
        </>)
    }, className);
}

function getParetoDisplayStat(stats: AnalysisStats, className?: string) {
    const header = 'Pareto';
    if (stats.totalPlays <= 0) {
        return getTransformedDisplayStat({
            header,
            content: (<>Calculated once playlist has activity</>)
        }, className);
    }
    return getTransformedDisplayStat({
        header,
        content: (<>
            Top {stats.trackCounts.length >= 5 ? '20% of tracks have' : 'track has'} <span className={`font-semibold ${fairColorSmall(stats.isFair)}`}>
                {roundToDecimals(stats.top20Share * 100, 2)}%
            </span> of the plays
        </>)
    }, className);
}

function PlaylistAnalysis({ filteredTracks, selectedTrack, className, state }: PlaylistAnalysisProps) {
    const { header, stats } = useMemo(() => getAnalysis(state, filteredTracks), [state, filteredTracks]);
    return (
        <div className={`
            block ${className}
            rounded-sm 
            gap-2 lg:gap-4 
            py-4 px-2 sm:px-3 lg:px-5 lg:py-5
            ${getDisabledStyling(state)}
        `}>
            <div className='md:sticky md:top-20 flex flex-col
            gap-2 xl:gap-5'>
                <h1 className={`
                text-center
                    font-semibold
                    text-xl sm:text-2xl lg:text-3xl
                    ${state === 'synced' ? undefined : 'opacity-30'}

                `}>
                    {header}
                </h1>
                {
                    stats &&
                    <div className='w-full flex flex-col gap-2'>
                        <div className='w-full flex md:flex-col gap-2 md:gap-2'>
                            {getLikelihoodDisplayStat(stats, 'grow-2')}
                            {getParetoDisplayStat(stats, 'grow-2')}
                            {getPlaysDisplayStat(stats, 'grow-1')}
                            {/* <div className='flex md:flex-col justify-between gap-1.5 md:gap-2'>
                            </div> */}
                        </div>
                        <AnalysisStat header='Track' className='hidden md:block max-w-60'>
                            <PlaylistTrackCard playlistTrack={selectedTrack} stats={stats} className='' />
                        </AnalysisStat>
                    </div>
                }
            </div>
        </div>
    )
}

function AnalysisStat({ header, children, tip, className }: { header: string, children: React.ReactNode, tip?: string, className?: string }) {
    return (
        <div className={`${className} grow basis-0`}>
            <h2 className='font-semibold text-dark-highlight text-sm lg:text-base' style={{ lineHeight: 'normal' }}>{header}:</h2>
            <div className='text-sm lg:text-base' style={{ lineHeight: 'normal' }}>{children}</div>
            {tip && <p className='hidden md:block text-xs lg:text-sm text-dark-highlight' style={{ lineHeight: 'normal' }}>({tip})</p>}
        </div>
    )
}

export default PlaylistAnalysis;