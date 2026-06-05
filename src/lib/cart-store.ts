import { CART_STORAGE_KEY } from './constants';

export interface CartItem {
    id: string; // unique instance id
    photoId: string;
    variant: string;
    isFramed: boolean;
    frameStyle: string;
    albumId: string;
    timestamp: number;
}

class CartStore {
    private get cart(): CartItem[] {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Failed to read cart", e);
            return [];
        }
    }

    private set cart(items: CartItem[]) {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            this.notify();
        } catch (e) {
            console.error("Failed to save cart", e);
        }
    }

    public getItems(): CartItem[] {
        return this.cart;
    }

    public addItem(item: CartItem) {
        const current = this.cart;
        current.push(item);
        this.cart = current;
    }

    public removeItem(id: string) {
        const current = this.cart;
        this.cart = current.filter(i => i.id !== id);
    }

    public clear() {
        this.cart = [];
    }

    public count(): number {
        return this.cart.length;
    }

    private notify() {
        window.dispatchEvent(new Event('cart-updated'));
    }
}

export const cartStore = new CartStore();
