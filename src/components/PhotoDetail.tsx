import { useState, useMemo, useEffect } from 'react';
import type { NavLinks } from '../lib/exhibit-data';
import type { ExhibitPhoto } from '../lib/schema';
import { cartStore } from '../lib/cart-store';
import { FRAME_STYLES } from '../lib/constants';

interface PhotoDetailProps {
    photo: ExhibitPhoto;
    nav: NavLinks;
    albumId: string;
    enableGallerySales?: boolean;
}

export default function PhotoDetail({ photo, nav, albumId, enableGallerySales = true }: PhotoDetailProps) {
    const [selectedSizeKey, setSelectedSizeKey] = useState<string>(
        photo.pricing_matrix?.[0]?.size || ''
    );
    // We now track frameStyle directly. 'none' implies unframed.
    const isAlreadyFramed = photo.metadata?.is_framed === true || photo.metadata?.isFramed === true;
    const [frameStyle, setFrameStyle] = useState<string>(isAlreadyFramed ? 'artist' : 'none');
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    // Filter Logic: Check if size is frameable (Max 20x30)
    const isFrameableSize = useMemo(() => {
        if (!selectedSizeKey) return true;
        const parts = selectedSizeKey.toLowerCase().split('x').map(s => parseFloat(s.trim()));
        if (parts.length < 2) return true;
        // If any dimension exceeds 30, it's too big (20x30 is max)
        const maxDim = Math.max(parts[0], parts[1]);
        return maxDim <= 30;
    }, [selectedSizeKey]);

    // Auto-reset frame if size becomes too big
    useEffect(() => {
        if (!isAlreadyFramed && !isFrameableSize && frameStyle !== 'none') {
            setFrameStyle('none');
        }
    }, [selectedSizeKey, isFrameableSize, frameStyle, isAlreadyFramed]);

    const isFramed = isAlreadyFramed || frameStyle !== 'none';

    // Pricing Logic
    const selectedPricing = useMemo(() => {
        return photo.pricing_matrix?.find((p) => p.size === selectedSizeKey);
    }, [photo.pricing_matrix, selectedSizeKey]);

    const currentPrice = selectedPricing
        ? isFramed
            ? selectedPricing.framed
            : selectedPricing.unframed
        : null;

    const title = photo.metadata?.title || photo.title;

    // Visualizer Logic: Dynamic Mat Calculation
    const matPaddingPercent = useMemo(() => {
        // Parse variant "8x10"
        const parts = selectedSizeKey.toLowerCase().split('x').map(s => parseFloat(s.trim()));
        if (parts.length < 1 || isNaN(parts[0])) return 5;

        // Visual width (print + 2 inches each side)
        const printWidth = parts[0];
        const totalWidth = printWidth + 4;
        const ratio = 2 / totalWidth;

        return ratio * 100;
    }, [selectedSizeKey]);

    // Visualizer Logic: Aspect Ratio / Cropping / Orientation
    const cropAspectRatio = useMemo(() => {
        const parts = selectedSizeKey.split('x').map(Number);
        if (parts.length !== 2) return 'auto';

        let [w, h] = parts;
        // Check photo orientation
        const photoRatio = photo.aspect_ratio || (photo.metadata?.width && photo.metadata?.height ? photo.metadata.width / photo.metadata.height : 1);

        // Swap dims if orientation mismatch
        // Landscape Photo (>1) but Portrait Print (w<h) -> Swap
        if (photoRatio > 1 && w < h) [w, h] = [h, w];
        // Portrait Photo (<1) but Landscape Print (w>h) -> Swap
        if (photoRatio < 1 && w > h) [w, h] = [h, w];

        return `${w}/${h}`;
    }, [selectedSizeKey, photo]);


    // Format price
    const formattedPrice = currentPrice
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(currentPrice)
        : 'N/A';

    const handleAddToCart = () => {
        // Add to Cart Store
        cartStore.addItem({
            id: crypto.randomUUID(),
            photoId: photo.lightroom_id,
            variant: selectedSizeKey,
            isFramed: isFramed,
            frameStyle: frameStyle,
            albumId: albumId,
            timestamp: Date.now()
        });

        // Redirect to cart
        window.location.href = '/cart';
    };

    useEffect(() => {
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' && nav.next) {
                window.location.href = nav.next;
            } else if (e.key === 'ArrowLeft' && nav.prev) {
                window.location.href = nav.prev;
            } else if (e.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('keyup', handleKeyUp);
        return () => window.removeEventListener('keyup', handleKeyUp);
    }, [nav.next, nav.prev]);

    // Helper to render metadata item
    const MetaItem = ({ label, value }: { label: string, value?: string | number }) => {
        if (!value) return null;
        return (
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-foreground/50">{label}</span>
                <span className="text-sm font-light text-foreground">{value}</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-hidden">

            {/* Viewport Navigation Arrows */}
            {nav.prev && (
                <a
                    href={nav.prev}
                    className="fixed left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-button/80 hover:bg-button transition-all duration-300 z-30"
                >
                    <span className="text-2xl font-light pb-1 pr-0.5">‹</span>
                </a>
            )}
            {nav.next && (
                <a
                    href={nav.next}
                    className="fixed right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-button/80 hover:bg-button transition-all duration-300 z-30"
                >
                    <span className="text-2xl font-light pb-1 pl-0.5">›</span>
                </a>
            )}

            <div className="flex-grow flex items-start justify-center pt-20 p-12 w-full min-h-screen relative z-10 transition-all duration-500">

                <div
                    className={`relative transition-all duration-500 ease-in-out ${FRAME_STYLES.find(f => f.id === frameStyle)?.css || ''}`}
                    style={{ transitionProperty: 'border, box-shadow' }}
                >
                    {!isAlreadyFramed && frameStyle !== 'none' && (
                        <div className="bg-white" style={{ padding: `${matPaddingPercent}%` }}>
                            <div
                                className="relative overflow-hidden shadow-inner bg-neutral-100"
                                style={{
                                    aspectRatio: cropAspectRatio,
                                    maxHeight: '60vh', // Constrain height
                                    maxWidth: '100%',
                                    width: 'auto'
                                }}
                            >
                                <img
                                    src={photo.cover_url}
                                    alt={title}
                                    className="w-full h-full object-cover block"
                                />
                            </div>
                        </div>
                    )}

                    {(isAlreadyFramed || frameStyle === 'none') && (
                        <div
                            className="relative overflow-hidden shadow-2xl"
                            style={{
                                aspectRatio: cropAspectRatio,
                                maxHeight: '75vh', // Allow slightly larger if unframed/pre-framed
                                maxWidth: '100%',
                            }}
                        >
                            <img
                                src={photo.cover_url}
                                alt={title}
                                className="w-full h-full object-cover block"
                            />
                        </div>
                    )}
                </div>

            </div>

            {/* Slide-Up Menu */}
            {enableGallerySales && (
                <div
                    className={`fixed inset-x-0 bottom-0 bg-accent/80 backdrop-blur-md border-t border-foreground/10 transition-transform duration-500 ease-in-out z-40 pb-36 pt-8 px-8 flex justify-center ${isMenuOpen ? 'translate-y-0' : 'translate-y-[120%]'
                        }`}
                >
                    <div className="w-full max-w-4xl flex flex-col gap-6 items-center justify-center">
    
                        <div className="flex flex-col w-full gap-8">
    
                            <div className="flex flex-col items-center">
                                <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2">Print Size</label>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {photo.pricing_matrix?.map((pm) => (
                                        <button
                                            key={pm.size}
                                            onClick={() => setSelectedSizeKey(pm.size)}
                                            className={`px-4 py-2 text-xs border transition-all duration-200 ${selectedSizeKey === pm.size
                                                ? 'border-accent text-background bg-accent'
                                                : 'border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground'
                                                }`}
                                        >
                                            {pm.size}
                                        </button>
                                    ))}
                                </div>
                            </div>
    
                            {/* Row 2: Frame Selector (Replaces simple Toggle) */}
                            {isAlreadyFramed ? (
                                <div className="flex flex-col items-center w-full py-2">
                                    <span className="text-sm font-light text-foreground bg-accent/10 border border-accent/20 px-4 py-2 rounded">
                                        This print comes framed - see photo
                                    </span>
                                </div>
                            ) : (
                                <div className={`flex flex-col items-center w-full transition-opacity duration-300 ${!isFrameableSize ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                                    <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-2">
                                        {isFrameableSize ? 'Frame Style' : 'Framing Unavailable for Large Prints'}
                                    </label>
                                    <div className="flex gap-2 overflow-x-auto max-w-full pb-2 no-scrollbar mask-linear-fade px-4">
                                        {FRAME_STYLES.map(style => (
                                            <button
                                                key={style.id}
                                                onClick={() => isFrameableSize && setFrameStyle(style.id)}
                                                disabled={!isFrameableSize}
                                                className={`px-4 py-2 text-xs border whitespace-nowrap transition-all duration-200 ${frameStyle === style.id
                                                    ? 'border-accent text-background bg-accent'
                                                    : 'border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground'
                                                    }`}
                                            >
                                                {style.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
    
                            {/* Row 3: Add to Cart */}
                            <div className="flex flex-col items-center w-full max-w-md mx-auto pt-4 gap-4">
                                <div className="text-3xl font-light text-foreground">
                                    {formattedPrice}
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-button/80 p-4 text-sm uppercase tracking-widest font-bold hover:bg-button transition-opacity shadow-lg"
                                >
                                    Add to Cart
                                </button>
                            </div>
    
                        </div>
                    </div>
                </div>
            )}
    
    
    
            {/* Sticky Bottom Stripe */}
            <div className="flex md:flex-row flex-col fixed bottom-0 left-0 right-0 z-50 bg-accent/20 backdrop-blur-sm border-t border-foreground/20 py-6 px-8 flex justify-between items-center shadow-2xl">
    
                {/* Column 1: Metadata */}
                <div className={`${isMenuOpen ? 'hidden md:flex' : 'flex'} flex-col md:flex-row items-center gap-8 overflow-x-auto no-scrollbar mask-linear-fade`}>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-light tracking-wide text-foreground uppercase">{title}</h1>
                        <h2 className="text-sm font-light  text-foreground/60">{photo.metadata?.location}</h2>
                    </div>
    
                    <div className="flex flex-col">
    
                        {photo.metadata?.caption && <span className="text-xs text-foreground/60">{photo.metadata.caption}</span>}
                    </div>
    
                    {/* Metadata Fields */}
                    <div className="flex md:flex-row gap-8 border-l border-foreground/10">
                        {/* Show "Framed" or "Print Only" status in strip */}
    
                        <MetaItem label="City" value={photo.metadata?.city} />
                        <MetaItem label="State" value={photo.metadata?.state} />
                        <MetaItem label="Country" value={photo.metadata?.country} />
                        {photo.metadata?.quantity !== "∞" && <MetaItem label="Limited Edition" value={photo.metadata?.quantity} />}
                    </div>
                </div>
    
                {/* Column 2: Toggle Button */}
                {enableGallerySales && (
                    <div className="flex md:flex-shrink-0 p-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`w-12 h-12 flex items-center justify-center rounded-full bg-button/80 hover:bg-button/90 transition-all duration-300 ${isMenuOpen ? 'rotate-45' : ''}`}
                            aria-label="Toggle Menu"
                        >
                            <span className="text-2xl font-light leading-none relative top-[-1px]">+</span>
                        </button>
                    </div>
                )}
    
            </div>

        </div >
    );
}
