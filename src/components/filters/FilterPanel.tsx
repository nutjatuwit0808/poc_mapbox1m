"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

import { useFilterStore } from "@/store/useFilterStore";
import { fetchFilteredProperties } from "@/lib/api/filter";
import { PROPERTY_TYPES } from "@/types/filter";

export default function FilterPanel() {
  const {
    propertyType,
    priceMin,
    priceMax,
    bedrooms,
    bathrooms,
    areaMin,
    areaMax,
    isExpanded,
    isFilterActive,
    setFilters,
    applyFilters,
    clearFilters,
    toggleExpanded,
    setFilteredGeoJson,
  } = useFilterStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const params: Parameters<typeof fetchFilteredProperties>[0] = {};
      if (propertyType) params.propertyType = propertyType;
      if (priceMin !== "") params.priceMin = Number(priceMin);
      if (priceMax !== "") params.priceMax = Number(priceMax);
      if (bedrooms !== "") params.bedrooms = Number(bedrooms);
      if (bathrooms !== "") params.bathrooms = Number(bathrooms);
      if (areaMin !== "") params.areaMin = Number(areaMin);
      if (areaMax !== "") params.areaMax = Number(areaMax);

      const result = await fetchFilteredProperties(params);
      setFilteredGeoJson(result);
      applyFilters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setError(null);
    clearFilters();
  };

  return (
    <div className="filter-panel" data-expanded={isExpanded}>
      <button
        type="button"
        className="filter-panel-toggle"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Collapse filter" : "Expand filter"}
      >
        {isExpanded ? (
          <>
            <ChevronLeft size={20} aria-hidden />
            <span className="filter-panel-toggle-label">
              <Filter size={16} aria-hidden />
              Filter
            </span>
          </>
        ) : (
          <Filter size={20} aria-hidden />
        )}
      </button>

      {isExpanded && (
        <div className="filter-panel-content">
          <h3 className="filter-panel-title">Filter Properties</h3>

          <div className="filter-panel-field">
            <label htmlFor="filter-property-type">Type</label>
            <select
              id="filter-property-type"
              value={propertyType}
              onChange={(e) =>
                setFilters({
                  propertyType: e.target.value as "" | (typeof PROPERTY_TYPES)[number],
                })
              }
            >
              <option value="">All</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-panel-row">
            <div className="filter-panel-field">
              <label htmlFor="filter-price-min">Price Min</label>
              <input
                id="filter-price-min"
                type="number"
                min={0}
                placeholder="0"
                value={priceMin === "" ? "" : priceMin}
                onChange={(e) =>
                  setFilters({
                    priceMin: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="filter-panel-field">
              <label htmlFor="filter-price-max">Price Max</label>
              <input
                id="filter-price-max"
                type="number"
                min={0}
                placeholder="—"
                value={priceMax === "" ? "" : priceMax}
                onChange={(e) =>
                  setFilters({
                    priceMax: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="filter-panel-row">
            <div className="filter-panel-field">
              <label htmlFor="filter-bedrooms">Bedrooms</label>
              <input
                id="filter-bedrooms"
                type="number"
                min={0}
                placeholder="—"
                value={bedrooms === "" ? "" : bedrooms}
                onChange={(e) =>
                  setFilters({
                    bedrooms: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="filter-panel-field">
              <label htmlFor="filter-bathrooms">Bathrooms</label>
              <input
                id="filter-bathrooms"
                type="number"
                min={0}
                placeholder="—"
                value={bathrooms === "" ? "" : bathrooms}
                onChange={(e) =>
                  setFilters({
                    bathrooms: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="filter-panel-row">
            <div className="filter-panel-field">
              <label htmlFor="filter-area-min">Area Min (m²)</label>
              <input
                id="filter-area-min"
                type="number"
                min={0}
                placeholder="—"
                value={areaMin === "" ? "" : areaMin}
                onChange={(e) =>
                  setFilters({
                    areaMin: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="filter-panel-field">
              <label htmlFor="filter-area-max">Area Max (m²)</label>
              <input
                id="filter-area-max"
                type="number"
                min={0}
                placeholder="—"
                value={areaMax === "" ? "" : areaMax}
                onChange={(e) =>
                  setFilters({
                    areaMax: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {error && (
            <div className="filter-panel-error" role="alert">
              {error}
            </div>
          )}

          <div className="filter-panel-actions">
            <button
              type="button"
              className="filter-panel-btn filter-panel-btn-primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Loading…" : "Submit"}
            </button>
            <button
              type="button"
              className="filter-panel-btn filter-panel-btn-secondary"
              onClick={handleClear}
              disabled={isLoading}
            >
              Clear
            </button>
          </div>

          {isFilterActive && (
            <p className="filter-panel-hint">Filter active — showing filtered points</p>
          )}
        </div>
      )}
    </div>
  );
}
