/**
 * คลิก cluster/จุดเดี่ยว และ cursor pointer เมื่อ hover
 */

import mapboxgl from "mapbox-gl";
import {
  CLUSTERS_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
  MAP_MAX_ZOOM,
  MAP_EASE_DURATION_MS,
} from "./constants";
import { formatPrice } from "./clusterUtils";

/** ย้าย popup DOM ไปยัง container เพื่อให้ลอยเหนือ cluster labels */
export function movePopupToContainer(
  map: mapboxgl.Map,
  _popup: mapboxgl.Popup,
  container?: HTMLElement
): void {
  if (!container) return;
  requestAnimationFrame(() => {
    const popupEl = map.getContainer().querySelector(".mapboxgl-popup");
    if (popupEl) container.appendChild(popupEl);
  });
}

/** คลิก cluster → ซูมเข้า */
export function addClusterClickInteraction(map: mapboxgl.Map): void {
  map.addInteraction("click-clusters", {
    type: "click",
    target: { layerId: CLUSTERS_LAYER_ID },
    handler: (e: { point: mapboxgl.Point }) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [CLUSTERS_LAYER_ID],
      });
      if (features.length === 0) return;
      const coords = (features[0].geometry as GeoJSON.Point).coordinates;
      const zoom = map.getZoom();
      map.easeTo({
        center: [coords[0], coords[1]],
        zoom: Math.min(zoom + 1, MAP_MAX_ZOOM),
        duration: MAP_EASE_DURATION_MS,
        easing: (t) => t * (2 - t),
      });
    },
  });
}

/** คลิกจุดเดี่ยว → แสดง popup */
export function addUnclusteredClickInteraction(
  map: mapboxgl.Map,
  popupContainer?: HTMLElement
): void {
  map.addInteraction("click-unclustered", {
    type: "click",
    target: { layerId: UNCLUSTERED_LAYER_ID },
    handler: (e) => {
      const feature = (e as { feature?: { geometry: GeoJSON.Point; properties?: Record<string, unknown> } }).feature;
      if (!feature) return;
      const coords = feature.geometry.coordinates;
      const lngLat: [number, number] = [coords[0], coords[1]];
      const props = feature.properties ?? {};
      const price = props.price != null ? Number(props.price) : 0;
      const area =
        props.usable_area_sqm != null ? Number(props.usable_area_sqm) : 0;
      const propertyType = props.property_type ?? "—";
      const bedrooms = props.bedrooms != null ? Number(props.bedrooms) : null;
      const bathrooms = props.bathrooms != null ? Number(props.bathrooms) : null;

      const html = [
        `<strong>${propertyType}</strong>`,
        price > 0 ? `Price: ฿${formatPrice(price)}` : null,
        bedrooms != null ? `Bedrooms: ${bedrooms}` : null,
        bathrooms != null ? `Bathrooms: ${bathrooms}` : null,
        area > 0 ? `Area: ${area} m²` : null,
      ]
        .filter(Boolean)
        .join("<br>");

      const popup = new mapboxgl.Popup()
        .setLngLat(lngLat)
        .setHTML(html || "—")
        .addTo(map);
      movePopupToContainer(map, popup, popupContainer);
    },
  });
}

/** เพิ่ม cursor pointer เมื่อ hover บน layer ที่กำหนด */
export function addCursorPointerForLayers(
  map: mapboxgl.Map,
  layerIds: string[]
): void {
  for (const layerId of layerIds) {
    map.addInteraction(`${layerId}-mouseenter`, {
      type: "mouseenter",
      target: { layerId },
      handler: () => {
        map.getCanvas().style.cursor = "pointer";
      },
    });
    map.addInteraction(`${layerId}-mouseleave`, {
      type: "mouseleave",
      target: { layerId },
      handler: () => {
        map.getCanvas().style.cursor = "";
      },
    });
  }
}
