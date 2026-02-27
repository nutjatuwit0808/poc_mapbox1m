/**
 * GET /api/filter — filter properties จาก parquet ด้วย DuckDB
 * Query params: property_type, priceMin, priceMax, bedrooms, bathrooms, areaMin, areaMax
 * Returns: GeoJSON FeatureCollection
 */

import { existsSync } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import { PARQUET_FILENAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

const FILTER_LIMIT = 1_000_000;

function getParquetPath(): string {
  return path.join(
    process.cwd(),
    "data-pipeline",
    "processed_data",
    PARQUET_FILENAME
  );
}

function parseNum(val: string | null): number | null {
  if (val == null || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export async function GET(request: NextRequest) {
  try {
    const parquetPath = getParquetPath();
    if (!existsSync(parquetPath)) {
      return NextResponse.json(
        {
          error:
            "Parquet file not found. Run process-data to generate it.",
        },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyType = searchParams.get("property_type")?.trim() || null;
    const priceMin = parseNum(searchParams.get("priceMin"));
    const priceMax = parseNum(searchParams.get("priceMax"));
    const bedrooms = parseNum(searchParams.get("bedrooms"));
    const bathrooms = parseNum(searchParams.get("bathrooms"));
    const areaMin = parseNum(searchParams.get("areaMin"));
    const areaMax = parseNum(searchParams.get("areaMax"));

    const duckdb = await import("@duckdb/node-api");
    const instance = await duckdb.DuckDBInstance.create(":memory:");
    const connection = await duckdb.DuckDBConnection.create(instance);

    try {
      await connection.run("INSTALL spatial; LOAD spatial;");

      const conditions: string[] = [];
      const values: unknown[] = [];

      if (propertyType) {
        conditions.push("property_type = ?");
        values.push(propertyType);
      }
      if (priceMin != null) {
        conditions.push("price >= ?");
        values.push(priceMin);
      }
      if (priceMax != null) {
        conditions.push("price <= ?");
        values.push(priceMax);
      }
      if (bedrooms != null) {
        conditions.push("bedrooms >= ?");
        values.push(bedrooms);
      }
      if (bathrooms != null) {
        conditions.push("bathrooms >= ?");
        values.push(bathrooms);
      }
      if (areaMin != null) {
        conditions.push("usable_area_sqm >= ?");
        values.push(areaMin);
      }
      if (areaMax != null) {
        conditions.push("usable_area_sqm <= ?");
        values.push(areaMax);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const quotedPath = parquetPath.replace(/\\/g, "\\\\").replace(/'/g, "''");
      const sql = `
        SELECT json_object(
          'type', 'Feature',
          'properties', json_object(
            'id', id,
            'property_type', property_type,
            'price', price,
            'bedrooms', bedrooms,
            'bathrooms', bathrooms,
            'usable_area_sqm', usable_area_sqm
          ),
          'geometry', ST_AsGeoJSON(geometry)
        ) as feature
        FROM read_parquet('${quotedPath}')
        ${whereClause}
        LIMIT ${FILTER_LIMIT}
      `;

      const reader = await connection.runAndReadAll(
        sql,
        values.length > 0 ? (values as (string | number)[]) : undefined
      );
      await reader.readAll();

      const rows = reader.getRowObjectsJS();
      const features = rows
        .map((row) => {
          const f = row.feature;
          let feature: GeoJSON.Feature | null = null;
          if (typeof f === "string") {
            try {
              feature = JSON.parse(f) as GeoJSON.Feature;
            } catch {
              return null;
            }
          } else if (f && typeof f === "object") {
            feature = f as unknown as GeoJSON.Feature;
          }
          if (!feature) return null;
          // ST_AsGeoJSON returns string — parse geometry if needed
          if (typeof feature.geometry === "string") {
            try {
              feature.geometry = JSON.parse(feature.geometry) as GeoJSON.Geometry;
            } catch {
              return null;
            }
          }
          return feature;
        })
        .filter((f): f is GeoJSON.Feature => f != null);

      const result: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features,
      };

      return NextResponse.json(result, {
        headers: { "Cache-Control": "no-store" },
      });
    } finally {
      connection.closeSync();
      instance.closeSync();
    }
  } catch (error) {
    console.error("GET /api/filter failed", error);
    return NextResponse.json(
      { error: "Failed to filter properties" },
      { status: 500 }
    );
  }
}
