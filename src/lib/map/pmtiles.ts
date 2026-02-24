/**
 * URL และโหลด PMTiles source ลงแผนที่
 */

import mapboxgl from "mapbox-gl";
import { PmTilesSource } from "mapbox-pmtiles/dist/mapbox-pmtiles.js";
import { PMTILES_SOURCE_ID, PMTILES_SOURCE_LAYER_FALLBACK } from "./constants";

/** คืนค่า URL ของ PMTiles API */
export function getPmtilesUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/api/pmtiles`;
}

/** โหลด PMTiles source ลงแผนที่ — คืนค่า source layer name สำหรับใช้ใน layers */
export async function loadPmtilesSource(map: mapboxgl.Map): Promise<string> {
  const url = getPmtilesUrl();
  const header = await PmTilesSource.getHeader(url);

  if (!map.isStyleLoaded()) {
    throw new Error("Map style not loaded");
  }

  const bounds: [number, number, number, number] = [
    header.minLon,
    header.minLat,
    header.maxLon,
    header.maxLat,
  ];

  map.addSource(PMTILES_SOURCE_ID, {
    type: PmTilesSource.SOURCE_TYPE,
    url,
    minzoom: header.minZoom,
    maxzoom: header.maxZoom,
    bounds,
  } as mapboxgl.AnySourceData);

  return header.vector_layers?.[0]?.id ?? PMTILES_SOURCE_LAYER_FALLBACK;
}
