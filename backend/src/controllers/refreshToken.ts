import type { User } from "../generated/prisma/client.js";
import { spotifyAuthAxios } from "../utils/axiosInstances.js";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "../utils/envLoader.js";
import prisma from "../utils/prismaClient.js";

export async function refreshAccessToken(user: User) {
    try {
        console.log(`Refreshing access token for ${user.displayName}`);
        const tokenResponse = await spotifyAuthAxios.post(
            '/api/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: user.refreshToken,
                client_id: SPOTIFY_CLIENT_ID,
                client_secret: SPOTIFY_CLIENT_SECRET,
            }),
        );
        const { access_token, refresh_token } = tokenResponse.data;

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                accessToken: access_token,
                refreshToken: refresh_token ?? user.refreshToken, // One might not be provided, in which case keep using old one
            },
        })

        console.log(`Successfully refreshed access token for ${user.displayName}`);
        return updatedUser;
    } catch (err) {
        console.error("Failed to refresh/update access token");
        throw err;
    }
}