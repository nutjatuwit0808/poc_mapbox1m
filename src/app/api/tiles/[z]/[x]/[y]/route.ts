/**
 * GET /api/tiles/[z]/[x]/[y] — vector tiles for Mapbox.
 * Returns MVT (application/vnd.mapbox-vector-tile).
 * POC: returns empty valid tile; extend later with PostGIS/GeoJSON.
 */

import { NextRequest, NextResponse } from "next/server";

const MAX_ZOOM = 22;

function getTileBounds(z: number): number {
  return Math.pow(2, z);
}

function isValidTile(z: number, x: number, y: number): boolean {
  if (!Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y)) {
    return false;
  }
  if (z < 0 || z > MAX_ZOOM) {
    return false;
  }
  const max = getTileBounds(z);
  return x >= 0 && x < max && y >= 0 && y < max;
}

export async function GET(
  request: NextRequest,
  context: { params: { z: string; x: string; y: string } }
) {
  try {
    const params = context.params;
    const z = parseInt(params.z, 10);
    const x = parseInt(params.x, 10);
    const y = parseInt(params.y, 10);

    if (!isValidTile(z, x, y)) {
      return NextResponse.json(
        { error: "Invalid tile coordinates" },
        { status: 400 }
      );
    }

    // POC: empty valid MVT (no layers). Mapbox accepts this as "no data" for the tile.
    const buffer = new Uint8Array(0);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.mapbox-vector-tile",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("GET /api/tiles/[z]/[x]/[y] failed", error);
    return NextResponse.json(
      { error: "Failed to load tile" },
      { status: 500 }
    );
  }
}
