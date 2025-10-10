export function toSpotifyLink(spotifyUri: string, type: 'track' | 'playlist' | 'user') {
    const tokens = spotifyUri.split(':');
    if (tokens.length !== 3) {
        console.error("Passed spotifyUri has incorrect format");
        return '';
    }
    return `http://open.spotify.com/${type}/${tokens[tokens.length - 1]}`
}