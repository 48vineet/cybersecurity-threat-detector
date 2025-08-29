#!/bin/bash
echo "🚀 Starting Cybersecurity Threat Detector..."
echo

echo "📡 Starting Backend Server..."
cd "D:\My  Projects\HACKATHON\cybersecurity-threat-detector\backend"
npm start &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🌐 Starting Frontend..."
cd "D:\My  Projects\HACKATHON\cybersecurity-threat-detector\frontend"
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Both servers started!"
echo "📱 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers..."

trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
