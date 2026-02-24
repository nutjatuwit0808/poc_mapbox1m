/**
 * Typed API helpers สำหรับ /api/properties
 * ใช้ shared api client จาก @/lib/api สำหรับ client-side API calls
 */

import { api } from "@/lib/api";
import type { PropertyItem } from "@/types/properties";

export type { PropertyItem };

export interface PropertiesResponse {
  items: PropertyItem[];
  nextCursor?: string;
}

export async function fetchProperties(params?: {
  cursor?: string;
  limit?: number;
}): Promise<PropertiesResponse> {
  const { data } = await api.get<PropertiesResponse>("/api/properties", {
    params: { cursor: params?.cursor, limit: params?.limit },
  });
  return data;
}
