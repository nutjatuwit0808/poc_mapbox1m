/**
 * Validated env vars (client-safe use NEXT_PUBLIC_*).
 * Extend as needed for Supabase, Mapbox, etc.
 */

function getEnv(key: string, required = false): string {
  const value = process.env[key];
  if (required && (value == null || value === "")) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value ?? "";
}

export const env = {
  mapboxToken: getEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN"),
  supabaseUrl: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
} as const;
