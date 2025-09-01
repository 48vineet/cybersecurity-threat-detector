@echo off
echo 🚀 Starting Cybersecurity Threat Detector...
echo.
  
echo 📡 Starting Backend Server...
start "Backend Server" cmd /k "cd /d "D:\\My  Projects\\HACKATHON\\cybersecurity-threat-detector\\backend" && npm start"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 🌐 Starting Frontend...
start "Frontend" cmd /k "cd /d "D:\\My  Projects\\HACKATHON\\cybersecurity-threat-detector\\frontend" && npm run dev"

echo.
echo ✅ Both servers started!
echo 📱 Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul
