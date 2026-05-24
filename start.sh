#!/bin/bash

# Kill all background jobs spawned by this script on exit
trap "kill 0" EXIT

echo "🚀 Starting DataLens Development Services..."

# 1. Start Python Backend
echo "🐍 Booting FastAPI Backend on port 8000..."
cd Backend
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
fi
echo "📥 Checking and installing Python dependencies..."
pip install -r requirements.txt
uvicorn main:app --reload --port 8000 &
cd ..

# 2. Start Node Frontend
echo "⚛️ Booting React + Vite Frontend on port 5173..."
cd Frontend
echo "📥 Checking and installing Node dependencies..."
npm install
npm run dev &
cd ..

# Wait for background processes to keep shell alive
wait
