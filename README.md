# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## cables.gl Background

The app now mounts a global `cables.gl` canvas background via `src/components/cables-patch-background.tsx`.

1. Export your `cables.gl` patch as a **single javascript file**.
2. Copy the export into `public/patch` so `public/patch/js/patch.js` exists.
3. Optional: set a custom patch directory with `VITE_CABLES_PATCH_DIR` (for example `/hero-patch`).

The main app reads this in `src/App.tsx` and renders the patch canvas behind the main content.
