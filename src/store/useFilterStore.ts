"use client";

import { create } from "zustand";
import type { FilterState } from "@/types/filter";
import { DEFAULT_FILTER_STATE } from "@/types/filter";

type FilterFields = Omit<
  FilterState,
  "isExpanded" | "isApplied" | "filteredGeoJson" | "isFilterActive"
>;

interface FilterStore extends FilterState {
  setFilters: (filters: Partial<FilterFields>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  toggleExpanded: () => void;
  setFilteredGeoJson: (geoJson: GeoJSON.FeatureCollection | null) => void;
  setFilterActive: (active: boolean) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULT_FILTER_STATE,

  setFilters: (filters) =>
    set((state) => ({
      ...state,
      ...filters,
    })),

  applyFilters: () =>
    set((state) => ({ ...state, isApplied: true, isFilterActive: true })),

  clearFilters: () =>
    set({
      ...DEFAULT_FILTER_STATE,
      isExpanded: false,
    }),

  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

  setFilteredGeoJson: (filteredGeoJson) => set({ filteredGeoJson }),

  setFilterActive: (isFilterActive) => set({ isFilterActive }),
}));
