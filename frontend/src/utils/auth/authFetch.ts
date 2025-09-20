import * as Public from 'spotifair';
import { backendAuthAxios } from '../axiosInstances';

// const debugUser: Public.User = {
//     id: 'abcd',
//     displayName: 'testUser',
//     imageUrl: null,
//     spotifyId: 'efgh',
//     spotifyUri: 'user:efgh',
//     trackingStartTime: new Date(),
// }

export async function getMe(): Promise<Public.User | null> {
    // TODO: Implement actual authentication
    try {
        const res = await backendAuthAxios.get('/check-session');
        if (res.status !== 200 && !res.data.success) {
            console.error(res.data.error.message);
            throw new Error("Non-successful response for session user");
        }

        const successRes = res.data as Public.HTTPResponseSuccess;
        const user = successRes.data;
        return user;
    } catch (err) {
        console.warn('Failed to get session user from backend', err);
        return null;
    }
}