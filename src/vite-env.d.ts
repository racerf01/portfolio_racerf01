/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CABLES_PATCH_DIR?: string;
  readonly VITE_CONTENTFUL_SPACE_ID?: string;
  readonly VITE_CONTENTFUL_ENVIRONMENT?: string;
  readonly VITE_CONTENTFUL_DELIVERY_TOKEN?: string;
  readonly VITE_CONTENTFUL_CONTENT_TYPE_WEBDEV?: string;
  readonly VITE_CONTENTFUL_CONTENT_TYPE_DESIGN?: string;
  readonly VITE_CONTENTFUL_CONTENT_TYPE_PHOTOS?: string;
  readonly VITE_CONTENTFUL_CONTENT_TYPE_MUSIC?: string;
  readonly VITE_CONTENTFUL_CONTENT_TYPE_OTHER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
