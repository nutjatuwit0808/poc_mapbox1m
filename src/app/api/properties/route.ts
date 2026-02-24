/**
 * GET /api/properties — รายการอสังหาริมทรัพย์สำหรับ sidebar
 * Query: cursor (string), limit (number, default 20)
 * Returns: { items: { id, title }[], nextCursor?: string }
 */

import { NextRequest, NextResponse } from "next/server";

import {
  PROPERTIES_DEFAULT_LIMIT,
  PROPERTIES_MAX_LIMIT,
} from "@/lib/constants";
import type { PropertyItem } from "@/types/properties";

export const dynamic = "force-dynamic";

const MOCK_PROPERTIES: PropertyItem[] = [
  { id: "1", title: "Apartment Central Station" },
  { id: "2", title: "House with Garden - North" },
  { id: "3", title: "Studio Downtown" },
  { id: "4", title: "Villa by the Lake" },
  { id: "5", title: "Loft Industrial District" },
  { id: "6", title: "Family Home Westside" },
  { id: "7", title: "Penthouse Skyline View" },
  { id: "8", title: "Cottage Countryside" },
  { id: "9", title: "Duplex East End" },
  { id: "10", title: "Condominium Riverside" },
  { id: "11", title: "Townhouse Historic District" },
  { id: "12", title: "Bungalow Quiet Street" },
  { id: "13", title: "Apartment Near Park" },
  { id: "14", title: "House with Pool" },
  { id: "15", title: "Studio Harbor View" },
  { id: "16", title: "Villa Mountain View" },
  { id: "17", title: "Loft City Center" },
  { id: "18", title: "Family Home Suburbs" },
  { id: "19", title: "Penthouse Top Floor" },
  { id: "20", title: "Cottage Seaside" },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam
      ? Math.min(Math.max(1, parseInt(limitParam, 10)), PROPERTIES_MAX_LIMIT)
      : PROPERTIES_DEFAULT_LIMIT;

    const startIndex = cursor
      ? MOCK_PROPERTIES.findIndex((p) => p.id === cursor) + 1
      : 0;

    if (startIndex < 0) {
      return NextResponse.json(
        { items: [], nextCursor: undefined },
        { status: 200 }
      );
    }

    const slice = MOCK_PROPERTIES.slice(startIndex, startIndex + limit);
    const nextCursor =
      startIndex + limit < MOCK_PROPERTIES.length
        ? slice[slice.length - 1]?.id
        : undefined;

    return NextResponse.json({
      items: slice,
      ...(nextCursor && { nextCursor }),
    });
  } catch (error) {
    console.error("GET /api/properties ล้มเหลว", error);
    return NextResponse.json(
      { error: "Failed to load properties" },
      { status: 500 }
    );
  }
}
