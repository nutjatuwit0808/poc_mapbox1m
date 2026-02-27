/**
 * Filter state สำหรับ property filter panel
 */

export const PROPERTY_TYPES = [
  "Condo",
  "Land",
  "Detached House",
  "Townhouse",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export interface FilterState {
  propertyType: PropertyType | "";
  priceMin: number | "";
  priceMax: number | "";
  bedrooms: number | "";
  bathrooms: number | "";
  areaMin: number | "";
  areaMax: number | "";
  isExpanded: boolean;
  isApplied: boolean;
  filteredGeoJson: GeoJSON.FeatureCollection | null;
  isFilterActive: boolean;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  propertyType: "",
  priceMin: "",
  priceMax: "",
  bedrooms: "",
  bathrooms: "",
  areaMin: "",
  areaMax: "",
  isExpanded: false,
  isApplied: false,
  filteredGeoJson: null,
  isFilterActive: false,
};
