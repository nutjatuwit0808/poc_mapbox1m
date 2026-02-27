"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { PmTilesSource } from "mapbox-pmtiles/dist/mapbox-pmtiles.js";
import { env } from "@/env";
import "mapbox-gl/dist/mapbox-gl.css";

import { useFilterStore } from "@/store/useFilterStore";
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_MAX_ZOOM,
  MAP_ZOOM_RATE_WHEEL,
  MAP_ZOOM_RATE,
  CLUSTERS_LAYER_ID,
  FILTERED_CLUSTERS_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
  loadPmtilesSource,
  addClustersLayer,
  addUnclusteredLayer,
  addClusterClickInteraction,
  addUnclusteredClickInteraction,
  addCursorPointerForLayers,
  setupClusterLabelUpdates,
  updateClusterLabels,
  getClusterColor,
  getBadgeSize,
  setFilteredPointsLayer,
  removeFilteredPointsLayer,
  setPmtilesLayersVisibility,
} from "@/lib/map";
import type { ClusterLabel } from "@/lib/map";

export default function MapboxViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const popupContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(MAP_DEFAULT_ZOOM);
  const [clusterLabels, setClusterLabels] = useState<ClusterLabel[]>([]);

  const filteredGeoJson = useFilterStore((s) => s.filteredGeoJson);
  const isFilterActive = useFilterStore((s) => s.isFilterActive);

  useEffect(() => {
    if (!env.mapboxToken || !containerRef.current) return;

    mapboxgl.accessToken = env.mapboxToken;
    mapboxgl.Style.setSourceType(PmTilesSource.SOURCE_TYPE, PmTilesSource as any);

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.scrollZoom.setWheelZoomRate(MAP_ZOOM_RATE_WHEEL);
    map.scrollZoom.setZoomRate(MAP_ZOOM_RATE);

    const onZoom = () => setZoomLevel(map.getZoom());
    map.on("zoom", onZoom);
    onZoom();

    mapRef.current = map;

    // โหลด PMTiles และเพิ่ม layers + interactions
    map.once("load", async () => {
      try {
        const sourceLayer = await loadPmtilesSource(map);
        addClustersLayer(map, sourceLayer);
        addUnclusteredLayer(map, sourceLayer);
        addClusterClickInteraction(map);
        addUnclusteredClickInteraction(map, popupContainerRef.current ?? undefined);
        addCursorPointerForLayers(map, [CLUSTERS_LAYER_ID, UNCLUSTERED_LAYER_ID]);
        setupClusterLabelUpdates(map, setClusterLabels, () =>
          useFilterStore.getState().isFilterActive
            ? FILTERED_CLUSTERS_LAYER_ID
            : CLUSTERS_LAYER_ID
        );
        setMapReady(true);
      } catch (err) {
        console.error("Failed to load PMTiles source:", err);
      }
    });

    return () => {
      map.off("zoom", onZoom);
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Sync filtered points layer เมื่อ filter เปลี่ยน
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const getActiveClusterLayerId = () =>
      useFilterStore.getState().isFilterActive
        ? FILTERED_CLUSTERS_LAYER_ID
        : CLUSTERS_LAYER_ID;

    const scheduleLabelUpdate = () => {
      map.once("idle", () => {
        updateClusterLabels(map, setClusterLabels, getActiveClusterLayerId);
      });
    };

    if (isFilterActive && filteredGeoJson) {
      setFilteredPointsLayer(map, filteredGeoJson, popupContainerRef.current ?? undefined);
      setPmtilesLayersVisibility(map, false);
      scheduleLabelUpdate();
    } else {
      removeFilteredPointsLayer(map);
      setPmtilesLayersVisibility(map, true);
      scheduleLabelUpdate();
    }
  }, [mapReady, isFilterActive, filteredGeoJson]);

  if (!env.mapboxToken) {
    return (
      <div className="map-error" role="alert">
        Set <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in <code>.env</code> to
        load the map.
      </div>
    );
  }

  return (
    <div className="mapbox-viewer-wrapper">
      <div ref={containerRef} className="mapbox-viewer" />
      <div className="zoom-level-badge">
        Zoom: {Math.round(zoomLevel)}
      </div>
      <div className="cluster-labels-overlay">
        {clusterLabels.map((label) => (
          <div
            key={`${label.lng.toFixed(5)}-${label.lat.toFixed(5)}-${label.count}`}
            className="cluster-label-badge"
            style={{
              left: label.x,
              top: label.y,
              width: getBadgeSize(label.count),
              height: getBadgeSize(label.count),
              backgroundColor: getClusterColor(label.count),
              fontSize: label.count >= 1000 ? 10 : 12,
            }}
          >
            {label.count >= 1000
              ? `${(label.count / 1000).toFixed(1)}k`
              : label.count}
          </div>
        ))}
      </div>
      <div ref={popupContainerRef} className="popup-container" aria-hidden="true" />
    </div>
  );
}
