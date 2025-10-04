export default interface PlaylistMetadata {
    totalMs: number;
    numTracks: number;
}

// Consult playlist_page_fsm in the planning document (although it has since changed)
export type PlaylistHeaderState = 'loading' | 'error' | 'loaded';  // For the data that isn't liable to change while on the playlist page (cover, title)
export type PlaylistHistState = 'loading' | 'error' | 'synced' | 'unsynced' | 'syncing'; // For the things that can/must change with syncing