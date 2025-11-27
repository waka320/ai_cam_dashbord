#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$HOME/dashbord/ai_cam_dashbord"
BACKEND_DIR="$PROJECT_DIR/backend"
VENV_DIR="$BACKEND_DIR/.venv"

cd "$BACKEND_DIR"
source "$VENV_DIR/bin/activate"

python -m pip install --upgrade pip
pip install -r requirements.txt

python -m app.jobs.fetch_csv_job
python -m app.jobs.fetch_exmeidai_job

pkill -f "uvicorn app.main:app" || true
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$BACKEND_DIR/app.log" 2>&1 &

sudo nginx -t && sudo systemctl reload nginx
