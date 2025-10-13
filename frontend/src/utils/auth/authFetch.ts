import type * as Public from 'spotifair';
import { backendAuthAxios } from '../axiosInstances';
import { isSuccess } from '../resParser';
import type { AxiosResponse } from 'axios';

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
        const res = await backendAuthAxios.get<Public.User>('/check-session');
        if (!isSuccess(res)) {
            const errRes = res as AxiosResponse<Public.HTTPResponseFailure>;
            console.error(errRes.data.error.message);
            throw new Error("Non-successful response for session user");
        }

        const user = res.data.data;
        return user;
    } catch (err) {
        console.warn('Failed to get session user from backend', err);
        return null;
    }
}