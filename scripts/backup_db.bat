@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo  GENIUS UNU 2026 - PostgreSQL Database Backup SOP
echo ===================================================

:: Ensure backups folder exists
if not exist "backups" mkdir backups

:: Generate ISO timestamp YYYYMMDD_HHMMSS via PowerShell
for /f %%I in ('powershell -Command "Get-Date -Format 'yyyyMMdd_HHmmss'"') do set TIMESTAMP=%%I
set BACKUP_FILE=backups\genius_db_%TIMESTAMP%.sql

echo [*] Target File: %BACKUP_FILE%
echo [*] Dumping PostgreSQL database from container genius_postgres_dev...

docker exec -t genius_postgres_dev pg_dump -U genius -d genius_2026 --clean --if-exists > "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo [OK] Database backup berhasil dibuat!
    echo [OK] Lokasi: %BACKUP_FILE%
    for %%F in ("%BACKUP_FILE%") do echo [OK] Ukuran File: %%~zF bytes
) else (
    echo [ERROR] Gagal melakukan backup database. Pastikan container Docker genius_postgres_dev sedang berjalan.
    exit /b %ERRORLEVEL%
)

echo ===================================================
