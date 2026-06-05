import { GalleryManifestSchema, type ExhibitManifest, type ExhibitAlbum, type ExhibitPhoto } from './schema';

const MOCK_MANIFEST: ExhibitManifest = {
    artist_info: { name: "Mock Artist", uid: "mock-uid" },
    exhibit_info: {
        exhibit_name: "Mock Exhibit",
        artist_statement: "<p>This is a <b>mock</b> statement.</p>",
        settings: {
            bg_color: "#1c1917", // warm stone
            text_color: "#e7e5e4", // white smoke
            accent_color: "#ea580c", // orange 600
            button_color: "#ea580c",
            font_heading: "serif",
            font_body: "sans-serif"
        }
    },
    generated_at: new Date().toISOString(),
    albums: [
        {
            album_name: "Mock Album",
            id: "mock-album-1",
            photos: [
                {
                    lightroom_id: "mock-photo-1",
                    title: "Mock Photo",
                    cover_url: "https://placehold.co/600x400",
                    metadata: { title: "Mock Photo", caption: "A placeholder", quantity: "∞", status: "available" },
                    pricing_matrix: [
                        { size: "8x10", unframed: 50, framed: 150 }
                    ]
                }
            ]
        }
    ]
};

export async function fetchExhibitManifest(): Promise<ExhibitManifest> {
    // Escape hatch for build/dev without S3 access
    if (import.meta.env.USE_MOCK_DATA === 'true') {
        console.warn("Using MOCK_DATA for manifest.");
        return MOCK_MANIFEST;
    }

    const url = import.meta.env.S3_MANIFEST_URL;
    if (!url) {
        throw new Error("S3_MANIFEST_URL is not defined");
    }

    try {
        const response = await fetch(url, { cache: 'no-store' }); // Ensure fresh data on build/request
        if (!response.ok) {
            throw new Error(`Failed to fetch manifest: ${response.statusText}`);
        }

        const rawData = await response.json();

        // Validate with Zod
        const result = GalleryManifestSchema.safeParse(rawData);

        if (!result.success) {
            console.error("Manifest Validation Failed:", result.error);
            throw new Error("Invalid Gallery Manifest format");
        }

        return result.data;
    } catch (e) {
        // In DEV mode, fallback to mock if fetch fails (e.g. 403 or offline)
        if (import.meta.env.DEV) {
            console.warn(`Fetch failed (${e}). Falling back to MOCK data for development.`);
            return MOCK_MANIFEST;
        }
        throw e;
    }
}

export function getAlbumById(manifest: ExhibitManifest, id: string): ExhibitAlbum | undefined {
    return manifest.albums.find(a => a.id === id);
}

export function getPhotoById(album: ExhibitAlbum, photoId: string): ExhibitPhoto | undefined {
    return album.photos.find(p => p.lightroom_id === photoId);
}

export interface NavLinks {
    prev?: string;
    next?: string;
}

export function getPhotoNavigation(album: ExhibitAlbum, currentPhotoId: string): NavLinks {
    const currentIndex = album.photos.findIndex(p => p.lightroom_id === currentPhotoId);
    if (currentIndex === -1) return {};

    const prev = currentIndex > 0 ? album.photos[currentIndex - 1] : undefined;
    const next = currentIndex < album.photos.length - 1 ? album.photos[currentIndex + 1] : undefined;

    return {
        prev: prev ? `/frames/${album.id}/${prev.lightroom_id}` : undefined,
        next: next ? `/frames/${album.id}/${next.lightroom_id}` : undefined,
    };
}
