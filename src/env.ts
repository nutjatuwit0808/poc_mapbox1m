/**
 * ค่าจาก env (client-safe ใช้ NEXT_PUBLIC_*)
 * Next.js จะ inline เฉพาะ process.env.KEY แบบ literal ตอน build — key แบบ dynamic จะไม่ถูก inline และเป็น undefined ใน client
 */
export const env = {
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;
