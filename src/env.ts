/**
 * Validated env vars (client-safe use NEXT_PUBLIC_*).
 * Next.js inlines only literal process.env.KEY at build time — dynamic keys (process.env[key]) are not inlined and stay undefined in the client.
 */
export const env = {
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;
