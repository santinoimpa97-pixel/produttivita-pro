// FIX: The triple-slash directive was causing a type resolution error.
// Replaced it with explicit type declarations to ensure type safety without relying on the problematic reference.
declare module '*.css' {}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
