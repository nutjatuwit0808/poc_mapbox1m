import dynamic from "next/dynamic";

import FilterPanel from "@/components/filters/FilterPanel";

// โหลดแผนที่แบบ dynamic ไม่ SSR (mapbox-gl ต้องรันบน client)
const MapboxViewer = dynamic(
  () => import("@/components/map/MapboxViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="map-loading" aria-busy="true">
        Loading map…
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <main className="app">
      <FilterPanel />
      <div className="app-map">
        <MapboxViewer />
      </div>
    </main>
  );
}
