/**
 * อัปเดต label overlay ของ cluster บนแผนที่
 * ใช้ throttle เพื่อลดการ re-render เมื่อ pan/zoom
 */

import mapboxgl from "mapbox-gl";
import { throttle } from "@/lib/throttle";
import { CLUSTERS_LAYER_ID } from "./constants";
import type { ClusterLabel } from "./types";

const THROTTLE_MS = 100;

/** อ่าน cluster features จากแผนที่และอัปเดต labels */
export function updateClusterLabels(
  map: mapboxgl.Map,
  setLabels: (labels: ClusterLabel[]) => void
): void {
  if (!map.getLayer(CLUSTERS_LAYER_ID)) return;
  try {
    const features = map.queryRenderedFeatures({ layers: [CLUSTERS_LAYER_ID] });
    const seen = new Set<string>();
    const labels: ClusterLabel[] = [];
    for (const f of features) {
      const count = f.properties?.point_count;
      if (typeof count !== "number" || count <= 1) continue;
      const coords =
        f.geometry.type === "Point"
          ? (f.geometry as GeoJSON.Point).coordinates
          : null;
      if (!coords || coords.length < 2) continue;
      const key = `${coords[0].toFixed(5)},${coords[1].toFixed(5)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const pt = map.project([coords[0], coords[1]]);
      labels.push({ lng: coords[0], lat: coords[1], x: pt.x, y: pt.y, count });
    }
    setLabels(labels);
  } catch {
    setLabels([]);
  }
}

/** ตั้งค่า listener สำหรับอัปเดต labels เมื่อแผนที่เคลื่อนที่ (throttled) */
export function setupClusterLabelUpdates(
  map: mapboxgl.Map,
  setLabels: (labels: ClusterLabel[]) => void
): void {
  const throttledUpdate = throttle(
    () => updateClusterLabels(map, setLabels),
    THROTTLE_MS
  );

  let rafId: number | null = null;
  const onUpdate = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      throttledUpdate();
    });
  };

  map.once("idle", onUpdate);
  map.on("move", onUpdate);
}
