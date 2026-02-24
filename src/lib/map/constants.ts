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

export const PMTILES_SOURCE_ID = "pmtiles-realestate";
export const CLUSTERS_LAYER_ID = "clusters";
export const UNCLUSTERED_LAYER_ID = "unclustered-point";
export const PMTILES_SOURCE_LAYER_FALLBACK = "real_estate_1M";
