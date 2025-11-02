#!/bin/bash

# Start backend
echo "Starting backend..."
cd Landlord_App-BACKEND
./new_venv/bin/python working_app.py &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend..."
cd ../Landlord_App-FRONTEND
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend running on http://localhost:5000"
echo "Frontend running on http://localhost:3000"
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait