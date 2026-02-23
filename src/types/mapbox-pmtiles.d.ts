declare module "mapbox-pmtiles/dist/mapbox-pmtiles.js" {
  export const PmTilesSource: {
    SOURCE_TYPE: string;
    getHeader(url: string): Promise<{
      minZoom: number;
      maxZoom: number;
      minLon: number;
      minLat: number;
      maxLon: number;
      maxLat: number;
      vector_layers?: Array<{ id: string }>;
    }>;
  };
}
