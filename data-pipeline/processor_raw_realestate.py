"""
ประมวลผล GeoJSON อสังหาริมทรัพย์เป็น Parquet และ PMTiles
Input: .geojson (จาก raw_data)
Output: .parquet และ .pmtiles ใน processed_data
"""

import argparse
import subprocess
import sys
from pathlib import Path

import geopandas as gpd

# ค่าคงที่สำหรับ tippecanoe
CLUSTER_DISTANCE = 50  # รวมจุดที่ใกล้กันภายใน 50 px เป็น cluster
CLUSTER_MAXZOOM = 14  # หยุด cluster ที่ zoom 14 — เหนือนี้แสดงจุดเดี่ยว


def get_default_paths() -> tuple[Path, Path]:
    """คืนค่า (path GeoJSON เริ่มต้น, โฟลเดอร์ output เริ่มต้น)"""
    base = Path(__file__).resolve().parent
    return base / "raw_data" / "real_estate_1M.geojson", base / "processed_data"


def process_geojson_to_parquet_and_pmtiles(
    geojson_path: Path,
    processed_dir: Path,
) -> None:
    """
    อ่าน GeoJSON เขียน Parquet และ PMTiles ไปที่ processed_dir
    สร้าง processed_dir ถ้ายังไม่มี
    """
    if not geojson_path.exists():
        print(f"Error: GeoJSON file not found: {geojson_path}", file=sys.stderr)
        sys.exit(1)

    processed_dir.mkdir(parents=True, exist_ok=True)
    stem = geojson_path.stem

    # 1. เขียน Parquet
    parquet_path = processed_dir / f"{stem}.parquet"
    print(f"Reading GeoJSON: {geojson_path}")
    gdf = gpd.read_file(geojson_path)
    print(f"Writing Parquet: {parquet_path}")
    gdf.to_parquet(parquet_path, index=False)
    print("Parquet done.")

    # 2. สร้าง PMTiles (ผ่าน tippecanoe)
    pmtiles_path = processed_dir / f"{stem}.pmtiles"
    try:
        print(f"Building PMTiles with tippecanoe: {pmtiles_path}")
        result = subprocess.run(
            [
                "tippecanoe",
                "-zg",  # ตรวจจับ minzoom/maxzoom อัตโนมัติจากข้อมูล
                "-r1",  # ปิด drop rate — ไม่ drop จุดที่ zoom ต่ำ (default 2.5 จะ drop เยอะ)
                "--force",  # เขียนทับไฟล์ PMTiles เดิม
                f"--cluster-distance={CLUSTER_DISTANCE}",
                f"--cluster-maxzoom={CLUSTER_MAXZOOM}",
                "--cluster-densest-as-needed",  # cluster แทน drop เมื่อ tile ใหญ่เกิน
                "--extend-zooms-if-still-dropping",  # เพิ่ม maxzoom ถ้ายัง drop อยู่
                "--no-feature-limit",  # ไม่จำกัดจำนวน feature ต่อ tile (default 200K)
                "--no-tile-size-limit",  # ไม่จำกัดขนาด tile (default 500KB)
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
            print("tippecanoe ล้มเหลว", file=sys.stderr)
            sys.exit(1)
        print("PMTiles done.")
    except FileNotFoundError:
        print(
            "ไม่พบ tippecanoe — ติดตั้ง (เช่น brew install tippecanoe) เพื่อสร้าง .pmtiles ข้าม PMTiles",
            file=sys.stderr,
        )


def main() -> None:
    default_geojson, default_processed = get_default_paths()
    parser = argparse.ArgumentParser(
        description="ประมวลผล GeoJSON อสังหาริมทรัพย์เป็น Parquet และ PMTiles"
    )
    parser.add_argument(
        "geojson",
        type=Path,
        nargs="?",
        default=default_geojson,
        help=f"Path ไฟล์ GeoJSON (default: {default_geojson})",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        type=Path,
        default=default_processed,
        help=f"โฟลเดอร์ output สำหรับ .parquet และ .pmtiles (default: {default_processed})",
    )
    args = parser.parse_args()
    process_geojson_to_parquet_and_pmtiles(args.geojson, args.output_dir)


if __name__ == "__main__":
    main()
