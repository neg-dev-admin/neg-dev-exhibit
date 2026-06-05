export interface FrameStyle {
    id: string;
    label: string;
    css: string;
}

export const FRAME_STYLES: FrameStyle[] = [
    { id: 'none', label: 'No Frame', css: 'border-none shadow-xl' },
    { id: 'black-flat', label: 'Black', css: 'border-[16px] border-neutral-900 shadow-[0_0_50px_-5px_rgba(255,255,255,0.3)]' },
    { id: 'soho-white', label: 'White', css: 'border-[20px] border-neutral-100 shadow-xl' },
    { id: 'soho-maple', label: 'Maple', css: 'border-[20px] border-[#e3cca1] shadow-xl' },
    { id: 'soho-espresso', label: 'Espresso', css: 'border-[20px] border-[#4a3728] shadow-xl' },
];

export const CART_STORAGE_KEY = 'silver_still_cart';
