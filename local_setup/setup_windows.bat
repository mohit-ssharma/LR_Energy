@echo off
echo ============================================
echo LR ENERGY SCADA - Local Setup Script
echo ============================================
echo.

:: Check if XAMPP is installed
if not exist "C:\xampp\htdocs" (
    echo ERROR: XAMPP not found at C:\xampp
    echo Please install XAMPP first from https://www.apachefriends.org/
    pause
    exit /b 1
)

:: Create project folder
echo Creating project folder...
if not exist "C:\xampp\htdocs\scada-api" mkdir "C:\xampp\htdocs\scada-api"
if not exist "C:\xampp\htdocs\scada-api\api" mkdir "C:\xampp\htdocs\scada-api\api"

:: Copy API files
echo Copying API files...
copy /Y "api\*.php" "C:\xampp\htdocs\scada-api\api\"

echo.
echo ============================================
echo FILES COPIED SUCCESSFULLY!
echo ============================================
echo.
echo Next Steps:
echo.
echo 1. Start XAMPP (Apache + MySQL)
echo.
echo 2. Open phpMyAdmin: http://localhost/phpmyadmin
echo.
echo 3. Create database 'scada_db'
echo.
echo 4. Import schema_local.sql into the database
echo.
echo 5. Test API: http://localhost/scada-api/api/test.php
echo.
echo ============================================
pause
