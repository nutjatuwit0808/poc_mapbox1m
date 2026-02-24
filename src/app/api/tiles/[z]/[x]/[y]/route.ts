/**
 * GET /api/tiles/[z]/[x]/[y] — vector tiles สำหรับ Mapbox
 * Returns MVT (application/vnd.mapbox-vector-tile)
 * POC: คืนค่า empty valid tile; ขยายต่อด้วย PostGIS/GeoJSON ได้
 */

import { NextRequest, NextResponse } from "next/server";

import { TILES_MAX_ZOOM } from "@/lib/constants";

function getTileBounds(z: number): number {
  return Math.pow(2, z);
}

function isValidTile(z: number, x: number, y: number): boolean {
  if (!Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y)) {
    return false;
  }
  if (z < 0 || z > TILES_MAX_ZOOM) {
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

    // POC: empty valid MVT (ไม่มี layers) — Mapbox ยอมรับเป็น "no data"
    const buffer = new Uint8Array(0);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.mapbox-vector-tile",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("GET /api/tiles/[z]/[x]/[y] ล้มเหลว", error);
    return NextResponse.json(
      { error: "Failed to load tile" },
      { status: 500 }
    );
  }
}
