import type { User } from "../../../backend/src/generated/prisma/client";

export type ClientUser = Omit<User, 'accessToken' | 'refreshToken' | 'playlists' | 'listeningHistory'>