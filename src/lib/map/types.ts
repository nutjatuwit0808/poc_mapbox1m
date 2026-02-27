/**
 * Type สำหรับ overlay label ของ cluster บนแผนที่
 */

export interface ClusterLabel {
  lng: number;
  lat: number;
  x: number;
  y: number;
  count: number;
}

/** Properties ของ property feature ที่ใช้แสดง popup (จาก PMTiles หรือ GeoJSON) */
export interface PropertyPopupProps {
  price?: number | string | null;
  usable_area_sqm?: number | string | null;
  property_type?: string | null;
  bedrooms?: number | string | null;
  bathrooms?: number | string | null;
}

