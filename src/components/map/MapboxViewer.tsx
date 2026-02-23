"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { PmTilesSource } from "mapbox-pmtiles/dist/mapbox-pmtiles.js";
import { env } from "@/env";
import "mapbox-gl/dist/mapbox-gl.css";

const DEFAULT_CENTER: [number, number] = [100.5, 13.7];
const DEFAULT_ZOOM = 6;
const MAX_ZOOM = 18;
const PMTILES_SOURCE_ID = "pmtiles-realestate";
const PMTILES_LAYER_ID = "pmtiles-points";

interface ClusterLabel {
  lng: number;
  lat: number;
  x: number;
  y: number;
  count: number;
}

function getPmtilesUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/api/pmtiles`;
}

function updateClusterLabels(map: mapboxgl.Map, setLabels: (labels: ClusterLabel[]) => void): void {
  if (!map.getLayer(PMTILES_LAYER_ID)) return;
  try {
    const features = map.queryRenderedFeatures({ layers: [PMTILES_LAYER_ID] });
    const seen = new Set<string>();
    const labels: ClusterLabel[] = [];
    for (const f of features) {
      const count = f.properties?.point_count;
      if (typeof count !== "number" || count <= 1) continue;
      const coords = f.geometry.type === "Point" ? (f.geometry as GeoJSON.Point).coordinates : null;
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

async function loadPmtilesSourceAndLayers(map: mapboxgl.Map, setLabels: (labels: ClusterLabel[]) => void): Promise<void> {
  try {
    const url = getPmtilesUrl();
    const header = await PmTilesSource.getHeader(url);

    if (!map.isStyleLoaded()) return;

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

    const sourceLayer = header.vector_layers?.[0]?.id ?? "real_estate_1M";

    map.addLayer({
      id: PMTILES_LAYER_ID,
      type: "circle",
      source: PMTILES_SOURCE_ID,
      "source-layer": sourceLayer,
      paint: {
        "circle-color": "#2563eb",
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["coalesce", ["get", "point_count"], 1],
          1, 6,
          10, 14,
          100, 22,
          1000, 30,
        ],
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#1d4ed8",
        "circle-opacity": 0.85,
      },
    });

    let rafId: number | null = null;
    const onUpdate = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateClusterLabels(map, setLabels);
      });
    };
    map.once("idle", onUpdate);
    map.on("move", onUpdate);
  } catch (err) {
    console.error("Failed to load PMTiles source:", err);
  }
}

export default function MapboxViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [clusterLabels, setClusterLabels] = useState<ClusterLabel[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM);

  useEffect(() => {
    if (!env.mapboxToken || !containerRef.current) return;

    mapboxgl.accessToken = env.mapboxToken;
    mapboxgl.Style.setSourceType(PmTilesSource.SOURCE_TYPE, PmTilesSource as any);

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      maxZoom: MAX_ZOOM,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const onZoom = () => setZoomLevel(map.getZoom());
    map.on("zoom", onZoom);
    onZoom();

    const onMoveEnd = () => {
      const zoom = map.getZoom();
      const snappedZoom = Math.round(zoom);
      if (zoom !== snappedZoom) {
        map.easeTo({ zoom: snappedZoom });
      }
    };
    map.on("moveend", onMoveEnd);

    mapRef.current = map;

    map.once("load", () => {
      loadPmtilesSourceAndLayers(map, setClusterLabels);
    });

    return () => {
      map.off("zoom", onZoom);
      map.off("moveend", onMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  if (!env.mapboxToken) {
    return (
      <div className="map-error" role="alert">
        Set <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in <code>.env</code> to load the map.
      </div>
    );
  }

  return (
    <div className="mapbox-viewer-wrapper" style={{ position: "relative", width: "100%", height: "100%", minHeight: "400px" }}>
      <div ref={containerRef} className="mapbox-viewer" style={{ width: "100%", height: "100%", minHeight: "400px" }} />
      <div
        className="zoom-level-badge"
        style={{
          position: "absolute",
          top: 10,
          right: 54,
          padding: "4px 8px",
          background: "rgba(255,255,255,0.9)",
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          color: "#374151",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          pointerEvents: "none",
          fontFamily: "ui-monospace, monospace",
        }}
      >
        Zoom: {Math.round(zoomLevel)}
      </div>
      <div
        className="cluster-labels-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {clusterLabels.map((label, i) => (
          <div
            key={`${label.lng.toFixed(5)}-${label.lat.toFixed(5)}-${label.count}`}
            style={{
              position: "absolute",
              left: label.x,
              top: label.y,
              transform: "translate(-50%, -50%) translateZ(0)",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            {label.count}
          </div>
        ))}
      </div>
    </div>
  );
}
