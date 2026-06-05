
export interface ExhibitManifest {
    artist_info: {
        name: string;
        uid: string;
    };
    exhibit_info: {
        artist_name: string;
        exhibit_name: string;
        exhibit_url: string;
        artist_statement: string;
    }

    generated_at: string; // ISO Date
    albums: ExhibitAlbum[];
}

export interface ExhibitAlbum {
    album_name: string;
    id: string; // Lightroom Album ID
    photos: ExhibitPhoto[];
}

export interface ExhibitPhoto {
    lightroom_id: string;
    title: string;
    cover_url?: string; // Public S3 URL (Large)
    // Metadata for display
    metadata?: {
        title?: string;
        caption?: string;
        copyright?: string;
        location?: string;
        city?: string;
        state?: string;
        country?: string;
        quantity?: string | number; // e.g. "8" or "∞"
        status?: "available" | "nfs" | "sold" | "hidden";
        width?: number;
        height?: number;
        // ... other fields
    };
    // Pre-calculated pricing for "Quick Shop"
    pricing_matrix: {
        size: string; // "8x10"
        unframed: number;
        framed: number;
    }[];
    tags?: string[];
    aspect_ratio?: number;
}
