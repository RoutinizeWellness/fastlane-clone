#!/bin/bash
# Dev mode: frontend hot-reload + backend en paralelo
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

fuser -k 3001/tcp 5173/tcp 2>/dev/null || true

cd "$SCRIPT_DIR/backend" && node server.js &
BPID=$!

cd "$SCRIPT_DIR/frontend" && npm run dev &
FPID=$!

echo "⚡ Dev mode:"
echo "   Frontend (HMR): http://localhost:5173"
echo "   Backend API:    http://localhost:3001"
echo "   Login: demo@fastlane.ai / demo1234"

trap "kill $BPID $FPID 2>/dev/null; echo Stopped." INT TERM
wait
