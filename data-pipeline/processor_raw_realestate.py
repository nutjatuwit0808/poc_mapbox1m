"""
Process raw real estate GeoJSON into Parquet and PMTiles.
Input: .geojson (e.g. from raw_data).
Output: .parquet and .pmtiles in processed_data.
"""

import argparse
import subprocess
import sys
from pathlib import Path

import geopandas as gpd


def get_default_paths() -> tuple[Path, Path]:
    """Return (default_geojson_path, default_processed_dir)."""
    base = Path(__file__).resolve().parent
    return base / "raw_data" / "real_estate_1M.geojson", base / "processed_data"


def process_geojson_to_parquet_and_pmtiles(
    geojson_path: Path,
    processed_dir: Path,
) -> None:
    """
    Read GeoJSON, write Parquet and PMTiles to processed_dir.
    Creates processed_dir if it does not exist.
    """
    if not geojson_path.exists():
        print(f"Error: GeoJSON file not found: {geojson_path}", file=sys.stderr)
        sys.exit(1)

    processed_dir.mkdir(parents=True, exist_ok=True)
    stem = geojson_path.stem

    # 1. Parquet
    parquet_path = processed_dir / f"{stem}.parquet"
    print(f"Reading GeoJSON: {geojson_path}")
    gdf = gpd.read_file(geojson_path)
    print(f"Writing Parquet: {parquet_path}")
    gdf.to_parquet(parquet_path, index=False)
    print("Parquet done.")

    # 2. PMTiles (via tippecanoe)
    pmtiles_path = processed_dir / f"{stem}.pmtiles"
    try:
        print(f"Building PMTiles with tippecanoe: {pmtiles_path}")
        result = subprocess.run(
            [
                "tippecanoe",
                "-zg",
                "-o",
                str(pmtiles_path),
                str(geojson_path),
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            if result.stderr:
                print(result.stderr, file=sys.stderr)
            if result.stdout:
                print(result.stdout, file=sys.stderr)
            print("tippecanoe failed.", file=sys.stderr)
            sys.exit(1)
        print("PMTiles done.")
    except FileNotFoundError:
        print(
            "tippecanoe not found. Install it (e.g. brew install tippecanoe) to generate .pmtiles. Skipping PMTiles.",
            file=sys.stderr,
        )


def main() -> None:
    default_geojson, default_processed = get_default_paths()
    parser = argparse.ArgumentParser(
        description="Process real estate GeoJSON to Parquet and PMTiles."
    )
    parser.add_argument(
        "geojson",
        type=Path,
        nargs="?",
        default=default_geojson,
        help=f"Input GeoJSON path (default: {default_geojson})",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        type=Path,
        default=default_processed,
        help=f"Output directory for .parquet and .pmtiles (default: {default_processed})",
    )
    args = parser.parse_args()
    process_geojson_to_parquet_and_pmtiles(args.geojson, args.output_dir)


if __name__ == "__main__":
    main()
