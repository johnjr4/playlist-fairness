import * as Public from 'spotifair';

interface PlaylistAnalysisProps {
    playlist: Public.PlaylistHist;
    className?: string;
}

function PlaylistAnalysis({ playlist, className }: PlaylistAnalysisProps) {
    return (
        <div className={`block ${className}
            rounded-sm gap-2 py-4 px-3 lg:gap-4 lg:px-5 lg:py-5`}>
            <h1 className='sticky top-20 font-semibold text-4xl'>Your playlist is <span className='text-green-600'>mostly fair</span></h1>
        </div>
    )
}

export default PlaylistAnalysis;