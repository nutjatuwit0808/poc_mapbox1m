import pandas as pd
import geopandas as gpd
import numpy as np
import time
from pathlib import Path

def generate_realestate_data():
    N = 1_000_000  # จำนวน 1 ล้านจุด
    print(f"🚀 เริ่มสร้างข้อมูลอสังหาฯ จำลอง {N:,} รายการ...")
    start_time = time.time()

    # 1. สุ่มพิกัดให้ครอบคลุมทั่วประเทศไทย
    # Bounding box: lon 97.35-105.64, lat 5.61-20.46
    lons = np.random.uniform(low=97.35, high=105.64, size=N)
    lats = np.random.uniform(low=5.61, high=20.46, size=N)

    # 2. กำหนดประเภทอสังหาฯ แบบกำหนดสัดส่วนความน่าจะเป็น (Probabilities)
    property_types = np.random.choice(
        ['Condo', 'Townhouse', 'Detached House', 'Land'], 
        p=[0.40, 0.30, 0.20, 0.10], 
        size=N
    )

    # 3. สุ่มจำนวนห้องนอน (1-5 ห้อง) และพื้นที่ใช้สอยพื้นฐาน
    bedrooms = np.random.randint(1, 6, size=N)
    
    # ห้องน้ำมักจะสัมพันธ์กับห้องนอน (น้อยกว่าหรือเท่ากับจำนวนห้องนอน 1 ห้อง)
    bathrooms = np.where(bedrooms > 1, bedrooms - np.random.randint(0, 2, size=N), 1)

    # 4. คำนวณพื้นที่ใช้สอย (ตร.ม.) ให้สอดคล้องกับจำนวนห้อง
    base_area = bedrooms * 25  # ตีซะว่าห้องนึงใช้พื้นที่ 25 ตร.ม.
    usable_area = base_area + np.random.randint(10, 50, size=N)

    # 5. สุ่มราคาประเมินต่อตารางเมตร (50,000 - 150,000 บาท) เพื่อคำนวณราคาสุทธิ
    price_per_sqm = np.random.randint(50_000, 150_000, size=N)
    prices = usable_area * price_per_sqm

    # 6. จับยัดลง DataFrame
    df = pd.DataFrame({
        'id': np.arange(1, N + 1),
        'property_type': property_types,
        'price': prices,
        'bedrooms': bedrooms,
        'bathrooms': bathrooms,
        'usable_area_sqm': usable_area,
        'Longitude': lons,
        'Latitude': lats
    })

    # 7. 🧹 คลีนข้อมูลให้สมจริง: กรณีที่เป็น "ที่ดิน (Land)" ต้องไม่มีห้องนอน/ห้องน้ำ 
    is_land = df['property_type'] == 'Land'
    df.loc[is_land, 'bedrooms'] = 0
    df.loc[is_land, 'bathrooms'] = 0
    df.loc[is_land, 'usable_area_sqm'] = np.random.randint(100, 2000, size=is_land.sum()) # พื้นที่ดินกว้างกว่าบ้านปกติ

    # 8. แปลงเป็น GeoDataFrame
    print("🗺️ กำลังแปลงโครงสร้างเป็น GeoDataFrame...")
    gdf = gpd.GeoDataFrame(
        df, 
        geometry=gpd.points_from_xy(df.Longitude, df.Latitude),
        crs="EPSG:4326"
    )
    gdf = gdf.drop(columns=['Longitude', 'Latitude'])

    # 9. Save Data — บันทึกเฉพาะ GeoJSON ลง raw_data (เอาไว้ใช้รัน Tippecanoe สร้าง PMTiles สำหรับโชว์แผนที่)
    output_dir = Path(__file__).resolve().parent.parent / "data-pipeline/raw_data"
    output_dir.mkdir(parents=True, exist_ok=True)
    geojson_file = output_dir / "real_estate_1M.geojson"
    print(f"💾 กำลังเซฟเป็นไฟล์ {geojson_file} (อาจจะใช้เวลา 1-3 นาที เพราะไฟล์ใหญ่ ~350MB)...")
    gdf.to_file(str(geojson_file), driver="GeoJSON")

    end_time = time.time()
    print(f"✅ เสร็จเรียบร้อย! ใช้เวลาไปทั้งหมด {round(end_time - start_time, 2)} วินาที")

if __name__ == "__main__":
    generate_realestate_data()