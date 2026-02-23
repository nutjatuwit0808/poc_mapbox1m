import dynamic from "next/dynamic";

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
      <header className="app-header">
        <h1>POC Mapbox</h1>
      </header>
      <div className="app-map">
        <MapboxViewer />
      </div>
    </main>
  );
}
