/**
 * GET /api/pmtiles — stream PMTiles file from data-pipeline/processed_data.
 * Supports Range requests required by the PMTiles client.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { open, readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const PMTILES_FILENAME = "real_estate_1M.pmtiles";

function getPmtilesPath(): string {
  return path.join(process.cwd(), "data-pipeline", "processed_data", PMTILES_FILENAME);
}

export async function GET(request: NextRequest) {
  try {
    const filePath = getPmtilesPath();
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "PMTiles file not found. Run process-data and ensure processed_data contains the file." },
        { status: 404 }
      );
    }

    const fileStat = await stat(filePath);
    const size = fileStat.size;
    const rangeHeader = request.headers.get("range");

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : size - 1;
        const chunkSize = end - start + 1;
        const fh = await open(filePath, "r");
        const buffer = Buffer.alloc(chunkSize);
        await fh.read(buffer, 0, chunkSize, start);
        await fh.close();
        return new NextResponse(buffer, {
          status: 206,
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Range": `bytes ${start}-${end}/${size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunkSize),
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Accept-Ranges": "bytes",
        "Content-Length": String(size),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/pmtiles failed", error);
    return NextResponse.json({ error: "Failed to serve PMTiles" }, { status: 500 });
  }
}
