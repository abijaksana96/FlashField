#!/usr/bin/env python3
"""
Script untuk memperbarui database dengan field email verification dan dynamic input fields
"""

import sys
import os
from sqlalchemy import text, inspect

# Tambahkan path aplikasi
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def check_column_exists(table_name, column_name):
    """Cek apakah kolom sudah ada di tabel"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def add_column_if_not_exists(table_name, column_name, column_definition):
    """Tambahkan kolom jika belum ada"""
    if not check_column_exists(table_name, column_name):
        try:
            with engine.connect() as conn:
                # Untuk PostgreSQL (Neon.tech)
                sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}"
                conn.execute(text(sql))
                conn.commit()
                print(f"✅ Kolom {column_name} berhasil ditambahkan ke tabel {table_name}")
                return True
        except Exception as e:
            print(f"❌ Error menambahkan kolom {column_name}: {e}")
            return False
    else:
        print(f"⚠️  Kolom {column_name} sudah ada di tabel {table_name}")
        return False

def main():
    print("🚀 Memperbarui database Neon.tech dengan fitur baru...")
    print("=" * 50)
    
    success_count = 0
    total_changes = 0
    
    try:
        # Tambahkan kolom ke tabel users
        print("\n👤 Memperbarui tabel users...")
        user_columns = [
            ("is_email_verified", "BOOLEAN DEFAULT FALSE"),
            ("email_verification_token", "VARCHAR(255)"),
            ("email_verification_token_expires", "TIMESTAMP")
        ]
        
        for col_name, col_def in user_columns:
            total_changes += 1
            if add_column_if_not_exists("users", col_name, col_def):
                success_count += 1
        
        # Tambahkan kolom ke tabel experiments
        print("\n🧪 Memperbarui tabel experiments...")
        experiment_columns = [
            ("input_fields", "JSONB DEFAULT '[]'::jsonb"),
            ("require_location", "BOOLEAN DEFAULT FALSE")
        ]
        
        for col_name, col_def in experiment_columns:
            total_changes += 1
            if add_column_if_not_exists("experiments", col_name, col_def):
                success_count += 1
        
        # Update tabel submissions - ubah geo_lat dan geo_lng menjadi nullable
        print("\n📊 Memperbarui tabel submissions...")
        try:
            with engine.connect() as conn:
                # Cek apakah kolom geo_lat dan geo_lng sudah nullable
                inspector = inspect(engine)
                columns = inspector.get_columns("submissions")
                
                geo_lat_nullable = False
                geo_lng_nullable = False
                data_json_exists = False
                
                for col in columns:
                    if col['name'] == 'geo_lat':
                        geo_lat_nullable = col['nullable']
                    elif col['name'] == 'geo_lng':
                        geo_lng_nullable = col['nullable']
                    elif col['name'] == 'data_json':
                        data_json_exists = True
                
                # Tambahkan kolom data_json jika belum ada
                if not data_json_exists:
                    total_changes += 1
                    if add_column_if_not_exists("submissions", "data_json", "JSONB DEFAULT '{}'::jsonb"):
                        success_count += 1
                
                # Ubah geo_lat dan geo_lng menjadi nullable jika belum
                if not geo_lat_nullable:
                    try:
                        conn.execute(text("ALTER TABLE submissions ALTER COLUMN geo_lat DROP NOT NULL"))
                        conn.commit()
                        print("✅ Kolom geo_lat berhasil diubah menjadi nullable")
                        success_count += 1
                    except Exception as e:
                        print(f"⚠️  geo_lat mungkin sudah nullable: {e}")
                    total_changes += 1
                
                if not geo_lng_nullable:
                    try:
                        conn.execute(text("ALTER TABLE submissions ALTER COLUMN geo_lng DROP NOT NULL"))
                        conn.commit()
                        print("✅ Kolom geo_lng berhasil diubah menjadi nullable")
                        success_count += 1
                    except Exception as e:
                        print(f"⚠️  geo_lng mungkin sudah nullable: {e}")
                    total_changes += 1
                        
        except Exception as e:
            print(f"❌ Error memperbarui tabel submissions: {e}")
        
        # Ringkasan
        print("\n" + "=" * 50)
        print(f"📋 RINGKASAN MIGRASI:")
        print(f"✅ Berhasil: {success_count}/{total_changes} perubahan")
        
        if success_count > 0:
            print("\n🎯 Langkah selanjutnya:")
            print("  1. Restart aplikasi FastAPI")
            print("  2. Test endpoint baru untuk email verification") 
            print("  3. Test dynamic input fields pada experiment")
            print("  4. Cek database di Neon.tech console untuk memastikan")
        else:
            print("\n✅ Semua kolom sudah up-to-date!")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Error umum: {e}")
        print("\n💡 Tips troubleshooting:")
        print("1. Pastikan koneksi ke Neon.tech stabil")
        print("2. Periksa DATABASE_URL di file .env")
        print("3. Pastikan user database memiliki permission untuk ALTER TABLE")
        print("4. Cek log error di atas untuk detail masalah")
        return 1

if __name__ == "__main__":
    exit(main())