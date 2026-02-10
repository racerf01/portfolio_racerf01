# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## cables.gl Background

The app now mounts a global `cables.gl` canvas background via `src/components/cables-patch-background.tsx`.

1. Export your `cables.gl` patch as a **single javascript file**.
2. Copy the export into `public/patch` so `public/patch/js/patch.js` exists.
3. Optional: set a custom patch directory with `VITE_CABLES_PATCH_DIR` (for example `/hero-patch`).

The main app reads this in `src/App.tsx` and renders the patch canvas behind the main content.

## Contentful work content types

The Work panel fetches entries from Contentful per tab. Defaults match:
- `webdev` -> `webDevProjects`
- `design` -> `design-projects`
- `photos` -> `photosProjects`
- `music` -> `musicProjects`
- `other` -> `otherProjects`

1. Copy `.env.example` to `.env.local`.
2. Set your Contentful values:
   - `VITE_CONTENTFUL_SPACE_ID`
   - `VITE_CONTENTFUL_ENVIRONMENT` (`master` by default)
   - `VITE_CONTENTFUL_DELIVERY_TOKEN`
   - optional overrides:
     - `VITE_CONTENTFUL_CONTENT_TYPE_WEBDEV`
     - `VITE_CONTENTFUL_CONTENT_TYPE_DESIGN`
     - `VITE_CONTENTFUL_CONTENT_TYPE_PHOTOS`
     - `VITE_CONTENTFUL_CONTENT_TYPE_MUSIC`
     - `VITE_CONTENTFUL_CONTENT_TYPE_OTHER`
3. Start the app and open the **Work** route to see Contentful entries in each tab.
