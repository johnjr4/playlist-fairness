import * as Public from 'spotifair';
import type { PlaylistHistState } from '../utils/types/playlistMeta';

interface PlaylistAnalysisProps {
    playlist: Public.PlaylistHist | null;
    state: PlaylistHistState;
    className?: string;
}

function getAnaylsisText(state: PlaylistHistState, fairnessScore: number) {
    switch (state) {
        case 'loading':
            return <>{''}</>;
        case 'error':
            return <>Your playlist <span className='text-gray-500'>encountered a problem</span></>;
        case 'syncing':
            return <>Your playlist is <span className='text-gray-500'>syncing...</span></>
        case 'unsynced':
            return <>Your playlist is <span className='text-gray-500'>not synced</span></>
        case 'synced':
            // TODO: Actually display the analysis score somehow
            const scoreAnalysis = (fairnessScore > 0 ? <span className='text-green-600'>mostly fair</span> : <span className='text-red-400'>mostly unfair</span>)
            return <>Your playlist is {scoreAnalysis}</>;
        default:
            return <>Something went wrong</>;
    }
}

function getDisabledStyling(state: PlaylistHistState) {
    return (state === 'synced') ? undefined : 'opacity-70 pointer-events-none';
}

function PlaylistAnalysis({ playlist, className, state }: PlaylistAnalysisProps) {
    const length = playlist?.tracks.length ?? 0; // Just to get the compiler to shut up about unused playlist
    return (
        <div className={`block ${className}
            rounded-sm gap-2 py-4 px-3 lg:gap-4 lg:px-5 lg:py-5 ${getDisabledStyling(state)}`}>
            <h1 className={`sticky top-20 font-semibold text-4xl ${state === 'synced' ? undefined : 'opacity-30'}`}>{getAnaylsisText(state, length - 40)}</h1>
        </div>
    )
}

export default PlaylistAnalysis;