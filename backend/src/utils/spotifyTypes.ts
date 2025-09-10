export interface SpotifySimplifiedPlaylistObject {
    collaborative: boolean,
    description: string,
    external_urls: string[],
    href: string,
    id: string,
    images: SpotifyImageObject[] | null,
    name: string,
    owner: {
        external_urls: {
            spotify: string,
        },
        href: string,
        id: string,
        type: string,
        uri: string,
        display_name: string | null,
    },
    public: boolean,
    snapshot_id: string,
    tracks: {
        href: string,
        total: number,
    },
    type: string,
    uri: string,
}

export interface SpotifyUser {
    country: string,
    display_name: string | null,
    email: string,
    explicit_content: {
        filter_enabled: boolean,
        filter_locked: boolean,
    },
    extrenal_urls: {
        spotify: string
    },
    followers: {
        href: null,
        total: number,
    },
    href: string,
    id: string,
    images: SpotifyImageObject[] | null,
    product: string,
    type: string,
    uri: string,
}

export interface SpotifyImageObject {
    url: string,
    height: number | null,
    width: number | null,
}