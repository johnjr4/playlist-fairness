import * as Public from 'spotifair';

const debugUser: Public.User = {
    id: 'abcd',
    displayName: 'testUser',
    imageUrl: null,
    spotifyId: 'efgh',
    spotifyUri: 'user:efgh',
    trackingStartTime: new Date(),
}

export async function getMe() {
    // TODO: Implement actual authentication
    console.warn("getMe() not yet implemented! Returning debug user");
    return debugUser;
}