/**
 * Typed API helpers for /api/properties.
 * Use the shared api client from @/lib/api for all client-side API calls.
 */

import { api } from "@/lib/api";

export interface PropertyItem {
  id: string;
  title: string;
}

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
