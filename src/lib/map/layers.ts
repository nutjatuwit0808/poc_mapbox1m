/**
 * เพิ่ม layers (clusters, unclustered) ลงแผนที่
 */

import mapboxgl from "mapbox-gl";
import {
  PMTILES_SOURCE_ID,
  CLUSTERS_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
} from "./constants";
import {
  getClusterColorStepExpression,
  getClusterRadiusStepExpression,
} from "./clusterUtils";

/** เพิ่ม layer วงกลมสำหรับ cluster */
export function addClustersLayer(
  map: mapboxgl.Map,
  sourceLayer: string
): void {
  map.addLayer({
    id: CLUSTERS_LAYER_ID,
    type: "circle",
    source: PMTILES_SOURCE_ID,
    "source-layer": sourceLayer,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": getClusterColorStepExpression(),
      "circle-radius": getClusterRadiusStepExpression(),
      "circle-emissive-strength": 1,
    },
  });
}

/** เพิ่ม layer วงกลมสำหรับจุดเดี่ยว (ไม่ cluster) */
export function addUnclusteredLayer(
  map: mapboxgl.Map,
  sourceLayer: string
): void {
  map.addLayer({
    id: UNCLUSTERED_LAYER_ID,
    type: "circle",
    source: PMTILES_SOURCE_ID,
    "source-layer": sourceLayer,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
      "circle-emissive-strength": 1,
    },
  });
}
