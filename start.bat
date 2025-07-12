@echo off
echo Starting ReWear - Community Clothing Exchange...
echo.

echo Checking if MongoDB is running...
netstat -an | findstr :27017 >nul
if %errorlevel% neq 0 (
    echo WARNING: MongoDB doesn't seem to be running on port 27017
    echo Please start MongoDB before running this script
    echo.
    pause
    exit /b 1
)

echo MongoDB is running!
echo.

echo Starting development servers...
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:5000
echo.

npm run dev 