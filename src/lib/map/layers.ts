/**
 * เพิ่ม layers (clusters, unclustered, filtered) ลงแผนที่
 */

import mapboxgl from "mapbox-gl";
import {
  PMTILES_SOURCE_ID,
  CLUSTERS_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
  FILTERED_SOURCE_ID,
  FILTERED_CLUSTERS_LAYER_ID,
  FILTERED_UNCLUSTERED_LAYER_ID,
  CLUSTER_RADIUS,
  CLUSTER_MAX_ZOOM,
  MAP_MAX_ZOOM,
  UNCLUSTERED_CIRCLE_PAINT,
} from "./constants";
import {
  getClusterColorStepExpression,
  getClusterRadiusStepExpression,
  buildPropertyPopupHtml,
} from "./clusterUtils";
import { movePopupToContainer } from "./interactions";

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
    paint: { ...UNCLUSTERED_CIRCLE_PAINT },
  });
}

let filteredInteractionsAdded = false;

/** เพิ่มหรืออัปเดต GeoJSON source และ layers สำหรับ filtered points (พร้อม clustering) */
export function setFilteredPointsLayer(
  map: mapboxgl.Map,
  geoJson: GeoJSON.FeatureCollection,
  popupContainer?: HTMLElement
): void {
  const existingSource = map.getSource(FILTERED_SOURCE_ID);
  if (existingSource) {
    (existingSource as mapboxgl.GeoJSONSource).setData(geoJson);
    return;
  }

  map.addSource(FILTERED_SOURCE_ID, {
    type: "geojson",
    data: geoJson,
    generateId: true,
    cluster: true,
    clusterRadius: CLUSTER_RADIUS,
    clusterMaxZoom: CLUSTER_MAX_ZOOM,
  });

  map.addLayer({
    id: FILTERED_CLUSTERS_LAYER_ID,
    type: "circle",
    source: FILTERED_SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": getClusterColorStepExpression(),
      "circle-radius": getClusterRadiusStepExpression(),
      "circle-emissive-strength": 1,
    },
  });

  map.addLayer({
    id: FILTERED_UNCLUSTERED_LAYER_ID,
    type: "circle",
    source: FILTERED_SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: { ...UNCLUSTERED_CIRCLE_PAINT },
  });

  if (!filteredInteractionsAdded) {
    addFilteredClusterClickHandler(map);
    addFilteredUnclusteredClickHandler(map, popupContainer);
    addCursorPointerForFilteredLayers(map);
    filteredInteractionsAdded = true;
  }
}

function addFilteredClusterClickHandler(map: mapboxgl.Map): void {
  map.on("click", FILTERED_CLUSTERS_LAYER_ID, (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [FILTERED_CLUSTERS_LAYER_ID],
    });
    if (features.length === 0) return;
    const clusterId = features[0].properties?.cluster_id;
    if (clusterId == null) return;
    const source = map.getSource(FILTERED_SOURCE_ID) as mapboxgl.GeoJSONSource;
    if (!source?.getClusterExpansionZoom) return;
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;
      const coords = (features[0].geometry as GeoJSON.Point).coordinates;
      map.easeTo({
        center: [coords[0], coords[1]],
        zoom: Math.min(zoom ?? map.getZoom() + 1, MAP_MAX_ZOOM),
      });
    });
  });
}

function addFilteredUnclusteredClickHandler(
  map: mapboxgl.Map,
  popupContainer?: HTMLElement
): void {
  map.on("click", FILTERED_UNCLUSTERED_LAYER_ID, (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [FILTERED_UNCLUSTERED_LAYER_ID],
    });
    if (features.length === 0) return;
    const feature = features[0];
    const coords = (feature.geometry as GeoJSON.Point).coordinates;
    const lngLat: [number, number] = [coords[0], coords[1]];
    const props = feature.properties ?? {};
    const html = buildPropertyPopupHtml(props);

    const popup = new mapboxgl.Popup()
      .setLngLat(lngLat)
      .setHTML(html)
      .addTo(map);
    movePopupToContainer(map, popup, popupContainer);
  });
}

function addCursorPointerForFilteredLayers(map: mapboxgl.Map): void {
  const canvas = map.getCanvas();
  const layers = [FILTERED_CLUSTERS_LAYER_ID, FILTERED_UNCLUSTERED_LAYER_ID];
  for (const layerId of layers) {
    map.on("mouseenter", layerId, () => {
      canvas.style.cursor = "pointer";
    });
    map.on("mouseleave", layerId, () => {
      canvas.style.cursor = "";
    });
  }
}

/** ลบ filtered source และ layers */
export function removeFilteredPointsLayer(map: mapboxgl.Map): void {
  const layers = [FILTERED_UNCLUSTERED_LAYER_ID, FILTERED_CLUSTERS_LAYER_ID];
  for (const layerId of layers) {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
  if (map.getSource(FILTERED_SOURCE_ID)) {
    map.removeSource(FILTERED_SOURCE_ID);
  }
}

/** ซ่อนหรือแสดง PMTiles layers */
export function setPmtilesLayersVisibility(
  map: mapboxgl.Map,
  visible: boolean
): void {
  const visibility = visible ? "visible" : "none";
  if (map.getLayer(CLUSTERS_LAYER_ID)) {
    map.setLayoutProperty(CLUSTERS_LAYER_ID, "visibility", visibility);
  }
  if (map.getLayer(UNCLUSTERED_LAYER_ID)) {
    map.setLayoutProperty(UNCLUSTERED_LAYER_ID, "visibility", visibility);
  }
}
