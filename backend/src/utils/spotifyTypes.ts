export interface SimplifiedPlaylistObject {
    collaborative: boolean,
    description: string,
    external_urls: string[],
    href: string,
    id: string,
    images: ImageObject[] | null,
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

export interface User {
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
    images: ImageObject[] | null,
    product: string,
    type: string,
    uri: string,
}

export interface ImageObject {
    url: string,
    height: number | null,
    width: number | null,
}

export interface PlaylistTrackObject {
    added_at: string | null,
    added_by: {
        external_urls: {
            spotify: string
        },
        href: string,
        id: string,
        type: string,
        uri: string,
    } | null,
    is_local: boolean,
    track: TrackObject | EpisodeObject,
}

export interface TrackObject {
    album: AlbumObject,
    artists: SimplifiedArtistObject[],
    available_markets: string[],
    disc_number: number,
    duration_ms: number,
    explicit: boolean,
    external_ids: {
        isrc: string,
        ean: string,
        upc: string,
    },
    external_urls: {
        spotify: string,
    },
    href: string,
    id: string,
    is_playable: boolean,
    linked_from: {

    },
    restrictions: {
        reason: string,
    }
    name: string,
    popularity: number,
    preview_url: string | null, // deprecated
    track_number: number,
    type: string,
    uri: string,
    is_local: boolean,
}

export interface AlbumObject {
    album_type: string,
    total_tracks: number,
    available_markets: string[],
    external_urls: {
        spotify: string,
    },
    href: string,
    id: string,
    images: ImageObject[] | null,
    name: string,
    release_date: string,
    release_date_precision: string,
    restrictions: {
        reason: string,
    },
    type: string,
    uri: string,
    artists: SimplifiedArtistObject[],
}

export interface SimplifiedArtistObject {
    external_urls: {
        spotify: string,
    },
    href: string,
    id: string,
    name: string,
    type: string,
    uri: string,
}

export interface EpisodeObject {
    audio_preview_url: string | null, // deprecated
    description: string,
    html_description: string,
    duration_ms: number,
    explicit: boolean,
    external_urls: {
        spotify: string,
    },
    href: string,
    id: string,
    images: ImageObject[] | null,
    is_externally_hosted: boolean,
    is_playable: boolean,
    language: string, // deprecated
    languages: string[],
    name: string,
    release_date: string,
    release_date_precision: string,
    resume_point: {
        fully_played: true,
        resume_position_ms: number,
    },
    type: string,
    uri: string,
    restrictions: {
        reason: string,
    }
    show: any, // I'm not doing this
}