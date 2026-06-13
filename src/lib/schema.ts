import { z } from 'zod';

export const PricingMatrixSchema = z.object({
    size: z.string(),
    unframed: z.number(),
    framed: z.number(),
});

export const PhotoMetadataSchema = z.object({
    title: z.string().optional(),
    caption: z.string().optional(),
    copyright: z.string().optional(),
    location: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    quantity: z.union([z.string(), z.number()]).optional(),
    status: z.enum(['available', 'nfs', 'sold', 'hidden']).optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    is_framed: z.boolean().optional(),
    isFramed: z.boolean().optional(),
});

export const GalleryPhotoSchema = z.object({
    lightroom_id: z.string(),
    title: z.string(),
    cover_url: z.string().optional(),
    metadata: PhotoMetadataSchema.optional(),
    pricing_matrix: z.array(PricingMatrixSchema).optional(),
    tags: z.array(z.string()).optional(),
    aspect_ratio: z.number().optional(),
});

export const GalleryAlbumSchema = z.object({
    album_name: z.string(),
    id: z.string(),
    photos: z.array(GalleryPhotoSchema),
});

export const ArtistInfoSchema = z.object({
    name: z.string(),
    uid: z.string(),
    email: z.string().optional(),
});

export const ExhibitSettingsSchema = z.object({
    // Colors
    bg_color: z.string().optional(), // Main background
    text_color: z.string().optional(), // Body text
    accent_color: z.string().optional(), // Buttons, links, highlights
    button_color: z.string().optional(),

    // Fonts (URL or Name) - simplified for now to generic families or specific Google Fonts if implemented later
    font_heading: z.string().optional(),
    font_body: z.string().optional(),
});

export const ExhibitInfoSchema = z.object({
    exhibit_name: z.string().nullable().optional(),
    artist_statement: z.string().nullable().optional(),
    settings: ExhibitSettingsSchema.optional(),
    enable_gallery_sales: z.boolean().optional(),
});

export const GalleryManifestSchema = z.object({
    artist_info: ArtistInfoSchema,
    exhibit_info: ExhibitInfoSchema.optional(),
    generated_at: z.string(),
    albums: z.array(GalleryAlbumSchema),
    user_completed_stripe_setup: z.boolean().optional(),
});

export type ExhibitManifest = z.infer<typeof GalleryManifestSchema>;
export type ExhibitAlbum = z.infer<typeof GalleryAlbumSchema>;
export type ExhibitPhoto = z.infer<typeof GalleryPhotoSchema>;
export type PricingMatrix = z.infer<typeof PricingMatrixSchema>;
