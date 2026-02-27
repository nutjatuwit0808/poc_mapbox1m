/**
 * ค่าคงที่เฉพาะแผนที่ — ใช้ใน clusterUtils, layers, interactions
 */

export const MAP_DEFAULT_CENTER: [number, number] = [100.5, 13.7];
export const MAP_DEFAULT_ZOOM = 6;
export const MAP_MAX_ZOOM = 18;
export const MAP_ZOOM_RATE_WHEEL = 1 / 600;
export const MAP_ZOOM_RATE = 1 / 150;
export const MAP_EASE_DURATION_MS = 400;

export const CLUSTER_THRESHOLD_SMALL = 100;
export const CLUSTER_THRESHOLD_LARGE = 750;
export const CLUSTER_COLOR_SMALL = "#51bbd6";
export const CLUSTER_COLOR_MEDIUM = "#F57927";
export const CLUSTER_COLOR_LARGE = "#f28cb1";
export const CLUSTER_RADIUS_SMALL = 20;
export const CLUSTER_RADIUS_MEDIUM = 30;
export const CLUSTER_RADIUS_LARGE = 40;

/** GeoJSON clustering — สอดคล้องกับ tippecanoe (processor_raw_realestate.py) */
export const CLUSTER_RADIUS = 50;
export const CLUSTER_MAX_ZOOM = 14;

export const PMTILES_SOURCE_ID = "pmtiles-realestate";
export const CLUSTERS_LAYER_ID = "clusters";
export const UNCLUSTERED_LAYER_ID = "unclustered-point";
export const PMTILES_SOURCE_LAYER_FALLBACK = "real_estate_1M";

export const FILTERED_SOURCE_ID = "filtered-points";
export const FILTERED_CLUSTERS_LAYER_ID = "filtered-clusters";
export const FILTERED_UNCLUSTERED_LAYER_ID = "filtered-unclustered-point";

/** Paint config สำหรับ unclustered point circle (ใช้ทั้ง PMTiles และ filtered layer) */
export const UNCLUSTERED_CIRCLE_PAINT = {
  "circle-color": "#11b4da",
  "circle-radius": 4,
  "circle-stroke-width": 1,
  "circle-stroke-color": "#fff",
  "circle-emissive-strength": 1,
} as const;
