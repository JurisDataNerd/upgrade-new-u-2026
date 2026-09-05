@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo  GENIUS UNU 2026 - PostgreSQL Database Restore SOP
echo ===================================================

set BACKUP_FILE=%~1

if "%BACKUP_FILE%"=="" (
    echo [!] Tidak ada file backup yang dispesifikasikan.
    echo [*] Mencari file cadangan terbaru di folder backups...
    for /f "delims=" %%F in ('dir /b /o:-d backups\genius_db_*.sql 2^>nul') do (
        set BACKUP_FILE=backups\%%F
        goto :found_file
    )
    echo [ERROR] Tidak ditemukan file cadangan di folder backups\
    echo Penggunaan: scripts\restore_db.bat [path_ke_file.sql]
    exit /b 1
)

:found_file
if not exist "%BACKUP_FILE%" (
    echo [ERROR] File backup tidak ditemukan: %BACKUP_FILE%
    exit /b 1
)

echo [*] File Cadangan Target: %BACKUP_FILE%
echo [!] PERINGATAN: Memulihkan database akan menimpa data yang ada saat ini!
echo [*] Menjalankan restore ke container Docker genius_postgres_dev...

docker exec -i genius_postgres_dev psql -U genius -d genius_2026 < "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo [OK] Database berhasil dipulihkan dari %BACKUP_FILE%!
) else (
    echo [ERROR] Terjadi kegagalan saat merestore database.
    exit /b %ERRORLEVEL%
)

echo ===================================================
