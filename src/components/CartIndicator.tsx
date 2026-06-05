import { useState, useEffect } from 'react';
import { cartStore } from '../lib/cart-store';

export default function CartIndicator() {
    const [count, setCount] = useState(0);

    const updateCount = () => {
        setCount(cartStore.count());
    };

    useEffect(() => {
        updateCount();

        // Listen for updates from other components
        const handleUpdate = () => updateCount();
        window.addEventListener('cart-updated', handleUpdate);

        // Also listen for storage events (cross-tab)
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('cart-updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    // If you want to hide the entire icon when empty, uncomment next line:
    // if (count === 0) return null;

    return (
        <a
            href="/cart"
            className="fixed top-8 right-8 z-[100] flex items-center justify-center w-12 h-12 rounded-full bg-button/80 backdrop-blur-md border border-button hover:bg-button transition-all duration-300 group"
            aria-label="View Cart"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 group-hover:scale-110 transition-transform"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 14.25V6a3.75 3.75 0 10-7.5 0v8.25m-1.5-6h10.5a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-9a2.25 2.25 0 012.25-2.25z" />
            </svg>

            {count > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-accent rounded-full">
                    {count}
                </span>
            )}
        </a>
    );
}
