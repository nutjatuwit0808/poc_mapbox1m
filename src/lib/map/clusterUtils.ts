/**
 * สี/ขนาด cluster และ formatPrice
 * ใช้ constants เดียวกันกับ layer paint เพื่อลดความซ้ำซ้อน
 */

import {
  CLUSTER_THRESHOLD_SMALL,
  CLUSTER_THRESHOLD_LARGE,
  CLUSTER_COLOR_SMALL,
  CLUSTER_COLOR_MEDIUM,
  CLUSTER_COLOR_LARGE,
  CLUSTER_RADIUS_SMALL,
  CLUSTER_RADIUS_MEDIUM,
  CLUSTER_RADIUS_LARGE,
} from "./constants";

/** สร้าง HTML สำหรับ property popup จาก properties object */
export function buildPropertyPopupHtml(props: Record<string, unknown>): string {
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

  return html || "—";
}

/** แปลงราคาเป็นรูปแบบสั้น เช่น 1.5M, 500K */
export function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `${(price / 1_000).toFixed(0)}K`;
  }
  return String(price);
}

/** คืนค่าสีของ cluster ตามจำนวนจุด */
export function getClusterColor(count: number): string {
  if (count >= CLUSTER_THRESHOLD_LARGE) return CLUSTER_COLOR_LARGE;
  if (count >= CLUSTER_THRESHOLD_SMALL) return CLUSTER_COLOR_MEDIUM;
  return CLUSTER_COLOR_SMALL;
}

/** คืนค่าขนาด badge ของ cluster ตามจำนวนจุด */
export function getBadgeSize(count: number): number {
  if (count >= CLUSTER_THRESHOLD_LARGE) return CLUSTER_RADIUS_LARGE;
  if (count >= CLUSTER_THRESHOLD_SMALL) return CLUSTER_RADIUS_MEDIUM;
  return CLUSTER_RADIUS_SMALL;
}

/** คืนค่า Mapbox step expression สำหรับ circle-color จาก constants */
export function getClusterColorStepExpression(): [
  "step",
  ["get", string],
  string,
  number,
  string,
  number,
  string,
] {
  return [
    "step",
    ["get", "point_count"],
    CLUSTER_COLOR_SMALL,
    CLUSTER_THRESHOLD_SMALL,
    CLUSTER_COLOR_MEDIUM,
    CLUSTER_THRESHOLD_LARGE,
    CLUSTER_COLOR_LARGE,
  ];
}

/** คืนค่า Mapbox step expression สำหรับ circle-radius จาก constants */
export function getClusterRadiusStepExpression(): [
  "step",
  ["get", string],
  number,
  number,
  number,
  number,
  number,
] {
  return [
    "step",
    ["get", "point_count"],
    CLUSTER_RADIUS_SMALL,
    CLUSTER_THRESHOLD_SMALL,
    CLUSTER_RADIUS_MEDIUM,
    CLUSTER_THRESHOLD_LARGE,
    CLUSTER_RADIUS_LARGE,
  ];
}
