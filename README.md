# Neg Dev: Exhibit

**Exhibit** is the public-facing gallery frontend for the Neg Dev ecosystem.

It is designed as a **Zero-Dependency Static Site** using [Astro](https://astro.build/) and [React](https://react.dev/). It decouples image hosting and gallery presentation from the main application logic, reading directly from a static JSON manifest hosted on S3.

## Architecture

*   **Framework**: Astro (Static Generation + SSR capability)
*   **Interactivity**: React Components (Cart, Photo Details)
*   **Styling**: Tailwind CSS
*   **Data Source**: AWS S3 (reads `gallery.json` publicly)
*   **State**: LocalStorage (for shopping cart persistence)

### The "Headless" Gallery Pattern
1.  **Backend (`neg-dev`)**: Analyzes Lightroom exports, processes metadata/pricing, and pushes a set of assets + `gallery.json` to an S3 bucket.
2.  **Frontend (`exhibit`)**: Reads this JSON manifest at runtime to generate the gallery UI.
3.  **Checkout**: Handoffs the cart payload back to `neg-dev` for secure processing.

## Key Workflows

### 1. Data Loading
The app fetches a specific `gallery.json` file from S3:
- **URL Structure**: `https://[BUCKET].s3.[REGION].amazonaws.com/[USER_ID]/gallery/gallery.json`
- **Manifest Content**: Contains Album hierarchy, image URLs (thumbnails/covers), metadata (Title, Caption, Exif), and a pre-calculated Pricing Matrix.

### 2. Shopping Cart
The shopping cart (`silver_still_cart`) is entirely client-side, stored in the browser's LocalStorage. It persists selections across sessions but requires no database connection.

### 3. Checkout Handoff
When a user is ready to buy, the `CartClient` constructs a secured payload and redirects to the main application:

- **Target**: `https://neg.dev/checkout?payload=[BASE64_STRING]`
- **Payload Schema**:
  ```typescript
  interface CheckoutPayload {
      artistId: string; // The specific gallery owner
      items: {
          id: string;       // Lightroom Asset ID
          variant: string;  // Size (e.g., "8x10")
          frame: boolean;   
          style: string;    // Frame definition
          color: string;
      }[];
  }
  ```

## Development

### Prerequisites
- Node.js & npm

### Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Access the gallery at `http://localhost:4321`.

3.  **Build for Production**:
    ```bash
    npm run build
    ```
    This generates a static output in the `dist/` directory.

## Project Structure

- `src/pages`: Astro routes (mapping URL paths).
- `src/components`: React components for interactive elements (Cart, Lightbox).
- `src/layouts`: shared Astro layouts.
- `public/`: Static assets (fonts, icons).

## Deployment

This site is designed to be deployed to any static host (Vercel, Netlify, AWS Amplify) or effectively fetched as a pure static bundle. It relies on no server-side secrets for read-only operations.


## Theming & customization
 
### 1. Base CSS Variables
These are injected by `Layout.astro` based on your manifest settings. You can reference them directly in standard CSS files.

| Variable | Description |
| :--- | :--- |
| `--color-bg` | Main Background Color |
| `--color-text` | Main Text Color |
| `--color-accent` | Accent Color (e.g., links, highlights) |
| `--color-button` | Button Background Color |
| `--font-heading` | Font family for headers |
| `--font-body` | Font family for body text |

**CSS Syntax:**

```css
.my-element {
  background-color: var(--color-button);
  color: var(--color-accent);
}
```

### 2. Tailwind Utility Classes
If you are using Tailwind classes in your components (recommended), use these utility names. They map to the variables above.

| Utility Class | Works on... | Maps to... |
| :--- | :--- | :--- |
| `bg-background` | Backgrounds | `--color-bg` |
| `text-foreground` | Text | `--color-text` |
| `bg-accent` / `text-accent` | Backgrounds/Text | `--color-accent` |
| `bg-button` | Backgrounds | `--color-button` |
| `font-sans` | Fonts | `--font-body` |
| `font-heading` | Fonts | `--font-heading` |

**Example:**

```tsx
<div className="bg-background text-foreground font-sans">
  <button className="bg-button text-white">Click Me</button>
</div>
```

### 3. Dynamic Color Scales
We automatically generate lighter and darker shades for your text (`foreground`) and background (`background`). These let you adjust opacity/weight without needing new settings.

*   `50` - `400`: Mixed with White (Lighter)
*   **`500`**: **Your Base Color**
*   `600` - `950`: Mixed with Black (Darker)

**Available Utilities:**
*   `text-foreground-50` ... `text-foreground-950`
*   `bg-background-50` ... `bg-background-950`

**Example:**

```tsx
<!-- Use a lighter version of your main text color for subtitles -->
<p className="text-foreground-300 uppercase tracking-widest">
  Subtitle
</p>

<!-- Use a darker version of your background for a footer -->
<footer className="bg-background-900">
  ...
</footer>
```