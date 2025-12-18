#!/usr/bin/env python3
"""
Test script untuk menguji API Dynamic Input Fields
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_create_experiment():
    """Test membuat experiment dengan dynamic input fields"""
    
    # Data contoh experiment
    experiment_data = {
        "title": "Pengukuran Kualitas Udara",
        "description": "Monitoring kualitas udara di berbagai lokasi",
        "require_location": True,
        "deadline": "2025-12-31T23:59:59Z",
        "input_fields": [
            {
                "name": "pm25_level",
                "label": "PM2.5 Level (μg/m³)",
                "type": "number",
                "required": True,
                "min_value": 0,
                "max_value": 500,
                "description": "Masukkan tingkat PM2.5 dalam mikrogram per meter kubik"
            },
            {
                "name": "air_quality_index",
                "label": "Air Quality Index",
                "type": "select",
                "required": True,
                "options": ["Good", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy", "Hazardous"]
            },
            {
                "name": "weather_condition",
                "label": "Kondisi Cuaca",
                "type": "radio",
                "required": True,
                "options": ["Cerah", "Berawan", "Hujan", "Mendung", "Berkabut"]
            },
            {
                "name": "pollution_sources",
                "label": "Sumber Polusi yang Terlihat",
                "type": "checkbox",
                "required": False,
                "options": ["Kendaraan", "Pabrik", "Pembakaran", "Konstruksi", "Tidak Ada"]
            },
            {
                "name": "measurement_time",
                "label": "Waktu Pengukuran",
                "type": "datetime",
                "required": True
            },
            {
                "name": "visibility",
                "label": "Jarak Pandang (meter)",
                "type": "number",
                "required": False,
                "min_value": 0,
                "max_value": 10000
            },
            {
                "name": "notes",
                "label": "Catatan Tambahan",
                "type": "textarea",
                "required": False,
                "max_length": 1000,
                "placeholder": "Tambahkan observasi atau catatan khusus"
            }
        ]
    }
    
    print("=== Test Create Experiment ===")
    print(f"POST {BASE_URL}/experiments/")
    print(json.dumps(experiment_data, indent=2))
    
    # Uncomment untuk menjalankan request
    # headers = {"Authorization": "Bearer YOUR_TOKEN_HERE"}
    # response = requests.post(f"{BASE_URL}/experiments/", json=experiment_data, headers=headers)
    # print(f"Response: {response.status_code}")
    # print(response.json())

def test_get_experiment_fields():
    """Test mendapatkan konfigurasi field experiment"""
    experiment_id = 1
    
    print(f"\n=== Test Get Experiment Fields ===")
    print(f"GET {BASE_URL}/experiments/{experiment_id}/fields")
    
    # Uncomment untuk menjalankan request
    # response = requests.get(f"{BASE_URL}/experiments/{experiment_id}/fields")
    # print(f"Response: {response.status_code}")
    # print(json.dumps(response.json(), indent=2))

def test_submit_data():
    """Test submit data ke experiment"""
    experiment_id = 1
    
    submission_data = {
        "geo_lat": -6.2088,
        "geo_lng": 106.8456,
        "data_json": {
            "pm25_level": 55.7,
            "air_quality_index": "Moderate",
            "weather_condition": "Berawan",
            "pollution_sources": ["Kendaraan", "Pabrik"],
            "measurement_time": "2025-06-27T14:30:00Z",
            "visibility": 8000,
            "notes": "Pengukuran dilakukan di area perkotaan dengan lalu lintas padat"
        }
    }
    
    print(f"\n=== Test Submit Data ===")
    print(f"POST {BASE_URL}/experiments/{experiment_id}/submissions")
    print(json.dumps(submission_data, indent=2))
    
    # Uncomment untuk menjalankan request
    # headers = {"Authorization": "Bearer YOUR_TOKEN_HERE"}
    # response = requests.post(f"{BASE_URL}/experiments/{experiment_id}/submissions", json=submission_data, headers=headers)
    # print(f"Response: {response.status_code}")
    # print(response.json())

def test_validation_errors():
    """Test kasus error validasi"""
    experiment_id = 1
    
    # Data dengan error - missing required field
    invalid_data = {
        "geo_lat": -6.2088,
        "geo_lng": 106.8456,
        "data_json": {
            "air_quality_index": "Good",  # Missing pm25_level yang required
            "weather_condition": "InvalidOption",  # Invalid option
            "pollution_sources": ["InvalidSource"]  # Invalid checkbox option
        }
    }
    
    print(f"\n=== Test Validation Errors ===")
    print(f"POST {BASE_URL}/experiments/{experiment_id}/submissions")
    print(json.dumps(invalid_data, indent=2))
    print("Expected errors:")
    print("- PM2.5 Level field is required")
    print("- Invalid weather condition option")
    print("- Invalid pollution source option")

if __name__ == "__main__":
    print("FlashField API Dynamic Input Fields - Test Script")
    print("=" * 50)
    
    test_create_experiment()
    test_get_experiment_fields()
    test_submit_data()
    test_validation_errors()
    
    print("\n" + "=" * 50)
    print("Untuk menjalankan test dengan server:")
    print("1. Jalankan server FastAPI: uvicorn app.main:app --reload")
    print("2. Uncomment baris request di fungsi test")
    print("3. Ganti YOUR_TOKEN_HERE dengan token autentikasi yang valid")
    print("4. Jalankan script ini lagi")
