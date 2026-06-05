import { useState, useMemo, useEffect } from 'react';
import type { ExhibitManifest, ExhibitPhoto } from '../lib/schema';
import { getAlbumById } from '../lib/exhibit-data';
import { cartStore, type CartItem } from '../lib/cart-store';
import { FRAME_STYLES } from '../lib/constants';

interface CartClientProps {
    manifest: ExhibitManifest;
}

export default function CartClient({ manifest }: CartClientProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load & Subscription
    useEffect(() => {
        setCart(cartStore.getItems());
        setIsLoaded(true);

        const handleUpdate = () => setCart(cartStore.getItems());
        window.addEventListener('cart-updated', handleUpdate);
        return () => window.removeEventListener('cart-updated', handleUpdate);
    }, []);


    // Pricing Logic
    const getPrice = (item: CartItem): number => {
        let p: ExhibitPhoto | undefined;
        // Optimization: Try albumId first if available
        if (item.albumId) {
            const album = getAlbumById(manifest, item.albumId);
            p = album?.photos.find(ph => ph.lightroom_id === item.photoId);
        }
        if (!p) {
            // Fallback
            for (const album of manifest.albums) {
                p = album.photos.find(ph => ph.lightroom_id === item.photoId);
                if (p) break;
            }
        }

        if (!p) return 0;
        const matrix = p.pricing_matrix?.find(mx => mx.size === item.variant);
        if (!matrix) return 0;

        return item.isFramed ? matrix.framed : matrix.unframed;
    };

    const totalPrice = useMemo(() => {
        return cart.reduce((sum, item) => sum + getPrice(item), 0);
    }, [cart, manifest]);


    const removeItem = (id: string) => {
        cartStore.removeItem(id);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;

        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocal
            ? 'https://localhost:3000/checkout'
            : 'https://neg.dev/checkout';

        const payload = {
            artistId: manifest.artist_info.uid,
            referrer: window.location.origin,
            items: cart.map(c => {
                const styleObj = FRAME_STYLES.find(f => f.id === c.frameStyle);
                const label = styleObj?.label || "None";
                return {
                    id: c.photoId,
                    albumId: c.albumId,
                    variant: c.variant,
                    frame: c.isFramed,
                    style: label,
                    color: label
                };
            })
        };

        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
        const url = new URL(baseUrl);
        url.searchParams.set('payload', encoded);

        window.location.href = url.toString();
    };

    if (!isLoaded) return <div className="bg-background text-center mt-20 text-foreground/50">Loading Cart...</div>;

    if (cart.length === 0) {
        return (
            <div className="bg-background flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                <h2 className="text-2xl font-light text-foreground">Your cart is empty</h2>
                <a href="/" className="text-foreground border-b border-foreground pb-1 text-sm uppercase tracking-widest hover:text-foreground/70 hover:border-foreground/50 transition-all">Return to Gallery</a>
            </div>
        );
    }

    return (
        <div className="bg-background max-w-4xl mx-auto px-4 sm:px-8 flex flex-col">
            <div className="flex justify-between items-center mb-12 border-b border-foreground/10 pb-4">
                <h1 className="text-xl font-light tracking-widest uppercase text-foreground">YOUR SELECTIONS</h1>
                <span className="text-foreground/50 text-sm">{cart.length} Photo{cart.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex-grow space-y-8">
                {cart.map((item) => {
                    let pItem: ExhibitPhoto | undefined;
                    // Find photo
                    if (item.albumId) {
                        pItem = getAlbumById(manifest, item.albumId)?.photos.find(ph => ph.lightroom_id === item.photoId);
                    }
                    if (!pItem) {
                        for (const a of manifest.albums) { pItem = a.photos.find(ph => ph.lightroom_id === item.photoId); if (pItem) break; }
                    }
                    if (!pItem) {
                        return (
                            <div
                                key={item.id}
                                className="group relative grid grid-cols-12 gap-8 items-center bg-red-900/5 p-6 rounded-lg border border-red-900/20 transition-all"
                            >
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="absolute top-4 right-4 text-neutral-500 hover:text-red-500 transition-colors"
                                    title="Remove Item"
                                >
                                    <span className="text-lg">×</span>
                                </button>

                                <div className="col-span-12 flex flex-col items-center justify-center text-center py-4">
                                    <h3 className="text-lg font-medium  mb-1">
                                        Sold Out
                                    </h3>
                                    <p className="text-sm ">
                                        This photo is no longer available.
                                    </p>
                                </div>
                            </div>
                        );
                    }

                    const itemPrice = getPrice(item);
                    const frameLabel = FRAME_STYLES.find(f => f.id === item.frameStyle)?.label || 'Unknown Frame';
                    const frameCss = FRAME_STYLES.find(f => f.id === item.frameStyle)?.css || '';

                    return (
                        <div
                            key={item.id}
                            className="group relative grid grid-cols-12 gap-8 items-center bg-foreground/5 p-6 rounded-lg border border-foreground/10 transition-all hover:border-foreground/30"
                        >
                            {/* Remove Button */}
                            <button
                                onClick={() => removeItem(item.id)}
                                className="absolute top-4 right-4 text-foreground/40 hover:text-red-500 transition-colors"
                                title="Remove Item"
                            >
                                <span className="text-lg">×</span>
                            </button>

                            {/* Mini Visualizer */}
                            <div className="col-span-3 flex items-center justify-center">
                                <div
                                    className={`relative ${frameCss} bg-white transition-all`}
                                >
                                    {/* Simple Mini Mat - fixed small padding for thumb effect */}
                                    <div className={`${item.isFramed ? 'p-1 bg-white' : ''}`}>
                                        <img src={pItem.cover_url} className="w-full h-auto object-cover max-h-[120px] shadow-sm block" />
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="col-span-6 flex flex-col">
                                <h3 className="text-lg font-medium text-foreground mb-2">{pItem.title}</h3>
                                <div className="space-y-1 text-sm text-foreground/50">
                                    <p>Size: <span className="text-foreground/80">{item.variant}</span></p>
                                    <p>Frame: <span className="text-foreground/80">{item.isFramed ? frameLabel : 'Print Only'}</span></p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="col-span-3 flex flex-col items-end justify-center pr-8">
                                <span className="text-xl font-light text-foreground">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(itemPrice)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Totals */}
            <div className="mt-12 bg-foreground/5 p-8 rounded-lg space-y-6">
                <div className="flex justify-between items-end border-b border-foreground/10 pb-6">
                    <span className="text-foreground/60 text-sm uppercase tracking-widest">Subtotal</span>
                    <span className="text-3xl text-foreground font-light">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalPrice)}
                    </span>
                </div>

                {manifest.user_completed_stripe_setup === false ? (
                    <div className="text-center py-4 bg-yellow-950/20 border border-yellow-500/30 p-4 text-yellow-200 text-sm">
                        The artist has not yet opened their gallery for sales. Please contact them to purchase.
                    </div>
                ) : (
                    <button
                        onClick={handleCheckout}
                        className="w-full bg-button/80 py-4 text-sm uppercase tracking-widest font-bold hover:bg-button transition-opacity shadow-lg"
                    >
                        Proceed to Checkout
                    </button>
                )}

                <a
                    href="/"
                    className="block w-full text-center text-sm uppercase tracking-widest text-foreground hover:text-foreground transition-colors"
                >
                    Continue Shopping
                </a>
            </div>
        </div>
    );
}
