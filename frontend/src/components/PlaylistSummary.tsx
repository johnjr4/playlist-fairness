import * as Public from 'spotifair';

interface PlaylistSummaryProps {
    playlist: Public.PlaylistHist;
}

function PlaylistSummary({ playlist }: PlaylistSummaryProps) {
    return (
        <div className='my-4'>
            <h1 className='font-bold text-4xl'>Your playlist is <span className='text-green-600'>mostly fair</span></h1>
        </div>
    )
}

export default PlaylistSummary;