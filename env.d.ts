/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_GOOGLE_CLIENT_ID: string
  readonly VITE_APP_GOOGLE_CLIENT_SECRET: string
  readonly VITE_APP_GOOGLE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}