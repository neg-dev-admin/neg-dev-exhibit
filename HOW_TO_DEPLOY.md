# How to Deploy Your Gallery to Vercel

This guide provides step-by-step instructions to deploy your custom **neg-dev** portfolio website to Vercel. Because the site is built on **Astro**, it compiles to a highly optimized, static, zero-dependency site that is free to host and load instantly.

---

## Prerequisites

Before deploying, ensure you have:
1. Pushed your copy of the `neg-dev-exhibit` repository to your own GitHub account.
2. Obtained your **S3 Manifest URL** from your **neg-dev** dashboard (displayed under the Exhibit Onboarding flow or inside settings). It will look similar to this:
   `https://neg-dev-exhibit.s3.us-east-2.amazonaws.com/YOUR_USER_ID/gallery/gallery.json`

---

## Step-by-Step Vercel Deployment

1. **Sign In to Vercel**: 
   Go to [Vercel](https://vercel.com/) and log in using your GitHub account.

2. **Create a New Project**:
   * Click the **Add New...** button in your dashboard and select **Project**.
   * Under "Import Git Repository", locate your `neg-dev-exhibit` repository and click **Import**.

3. **Configure Build Settings**:
   * Vercel will automatically detect that this is an **Astro** project and select the correct presets.
   * Leave the **Framework Preset**, **Build Command**, and **Output Directory** settings as their defaults.

4. **Set Environment Variables**:
   Expand the **Environment Variables** section and add the following keys:
   
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `S3_MANIFEST_URL` | `https://.../gallery.json` | **Required**. The URL of your public S3 gallery manifest. |
   | `S3_LOGO_URL` | `https://.../logo.png` | *Optional*. URL override for your site logo. |
   | `S3_ARTIST_URL` | `https://.../artist.jpg` | *Optional*. URL override for your biography photo. |
   | `USE_MOCK_DATA` | `false` | *Optional*. Set to `true` only if testing the build with dummy data. |

5. **Deploy**:
   * Click the **Deploy** button.
   * Vercel will compile the Astro pages and set up the global edge CDN. The build usually takes less than a minute.

---

## Post-Deployment: Link Back to neg-dev

1. Once the deployment finishes, copy your new live URL (e.g., `https://your-portfolio.vercel.app` or your custom domain).
2. Open your **neg-dev** dashboard.
3. Navigate to **Exhibit Settings** (`/exhibit/settings`).
4. Paste the URL (e.g. `your-portfolio.vercel.app` — **without** the `https://` prefix) into the **Exhibit URL** field.
5. Click **Save Settings**.

---

## Updates & Continuous Deployment

Any time you sync new photo albums from your Adobe Lightroom catalog, the **neg-dev** backend automatically pushes an updated `gallery.json` manifest to S3. Since the Astro client fetches the manifest dynamically, **your live portfolio updates instantly without needing a redeploy.**

If you make visual customizations or updates to the code, simply commit and push them to your GitHub repository. Vercel will automatically rebuild and deploy the updates.
