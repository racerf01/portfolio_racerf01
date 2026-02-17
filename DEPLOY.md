# Deploying to Hostinger (test.tagline.cz)

This guide covers deploying the portfolio to Hostinger so it runs at **https://test.tagline.cz**.

## 1. Build the project

From the project root:

```bash
npm run build
```

Output is in the **`dist/`** folder. Do **not** upload the rest of the project—only the contents of `dist/`.

## 2. Domain setup in Hostinger

1. Log in to [Hostinger](https://www.hostinger.com) and open **hPanel**.
2. Go to **Domains** → select **tagline.cz** (or add it if needed).
3. Add subdomain **test**:
   - **Subdomains** → Create subdomain: `test` → document root e.g. `public_html/test` or `test.tagline.cz`.
4. Note the folder where test.tagline.cz points (e.g. `public_html/test` or a subdomain folder).

## 3. Upload files

1. In hPanel open **File Manager**.
2. Go to the folder that serves **test.tagline.cz** (e.g. `public_html/test` or `domains/test.tagline.cz/public_html`).
3. Remove any default files (e.g. `index.html`) if present.
4. Upload **all contents** of your local **`dist/`** folder into this folder (not the `dist` folder itself).  
   You should see at least:
   - `index.html`
   - `assets/` (JS, CSS)
   - `.htaccess` (for SPA routing)
   - `vite.svg` (if used)

The **`.htaccess`** in `dist/` is required so routes like `/work`, `/about`, `/contact` work on direct load and refresh.

## 4. SSL (HTTPS)

1. In hPanel go to **SSL** (or **Security**).
2. Enable a free SSL certificate for **test.tagline.cz** (e.g. Let’s Encrypt).
3. After SSL is active, you can force HTTPS by uncommenting the second block in `public/.htaccess`, then rebuild and re-upload.

## 5. Verify

- Open **https://test.tagline.cz** (or http first if SSL isn’t ready).
- Click through **Home**, **Work**, **About**, **Contact**.
- Open **https://test.tagline.cz/work** (and `/about`, `/contact`) directly and refresh—they should load without 404.

## Quick checklist

- [ ] `npm run build` runs without errors
- [ ] Only **contents of `dist/`** are in the Hostinger folder for test.tagline.cz
- [ ] **`.htaccess`** is present in that folder (from `dist/`)
- [ ] Subdomain **test.tagline.cz** points to that folder
- [ ] SSL enabled for test.tagline.cz (optional but recommended)
