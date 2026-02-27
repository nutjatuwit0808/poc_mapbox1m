/**
 * Typed API helper สำหรับ /api/filter
 */

import { api } from "@/lib/api";

export interface FilterParams {
  propertyType?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaMin?: number;
  areaMax?: number;
}

export async function fetchFilteredProperties(
  params: FilterParams
): Promise<GeoJSON.FeatureCollection> {
  const searchParams = new URLSearchParams();
  if (params.propertyType) searchParams.set("property_type", params.propertyType);
  if (params.priceMin != null) searchParams.set("priceMin", String(params.priceMin));
  if (params.priceMax != null) searchParams.set("priceMax", String(params.priceMax));
  if (params.bedrooms != null) searchParams.set("bedrooms", String(params.bedrooms));
  if (params.bathrooms != null) searchParams.set("bathrooms", String(params.bathrooms));
  if (params.areaMin != null) searchParams.set("areaMin", String(params.areaMin));
  if (params.areaMax != null) searchParams.set("areaMax", String(params.areaMax));

  const { data } = await api.get<GeoJSON.FeatureCollection>(
    `/api/filter?${searchParams.toString()}`
  );
  return data;
}
