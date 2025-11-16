#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PROJECT_ROOT="$(cd "${BACKEND_DIR}/.." && pwd)"

VENV_PATH="${VENV_PATH:-${BACKEND_DIR}/.venv}"
PYTHON_BIN="${PYTHON_BIN:-${VENV_PATH}/bin/python}"
REQUIREMENTS_FILE="${BACKEND_DIR}/requirements.txt"

FETCH_CSV_SCHEDULE="${FETCH_CSV_SCHEDULE:-*/5 * * * *}"
EXMEIDAI_SCHEDULE="${EXMEIDAI_SCHEDULE:-30 1 * * *}"

LOG_DIR="${LOG_DIR:-${PROJECT_ROOT}/logs}"
FETCH_LOG="${FETCH_LOG:-${LOG_DIR}/fetch_csv.log}"
EXMEIDAI_LOG="${EXMEIDAI_LOG:-${LOG_DIR}/fetch_csv_exmeidai.log}"

mkdir -p "${LOG_DIR}"

if [ ! -x "${PYTHON_BIN}" ]; then
  echo "[info] virtualenv が見つかりませんでした。作成します: ${VENV_PATH}"
  python3 -m venv "${VENV_PATH}"
fi

echo "[info] 依存関係をインストール/更新します"
"${PYTHON_BIN}" -m pip install --upgrade pip
"${PYTHON_BIN}" -m pip install -r "${REQUIREMENTS_FILE}"

echo "[info] cron エントリを更新します"
CURRENT_CRON="$(mktemp)"
UPDATED_CRON="$(mktemp)"
trap 'rm -f "${CURRENT_CRON}" "${UPDATED_CRON}"' EXIT

crontab -l > "${CURRENT_CRON}" 2>/dev/null || true

grep -v 'app\.jobs\.fetch_csv_job' "${CURRENT_CRON}" | grep -v 'app\.jobs\.fetch_exmeidai_job' > "${UPDATED_CRON}" || true

{
  echo "${FETCH_CSV_SCHEDULE} cd \"${BACKEND_DIR}\" && \"${PYTHON_BIN}\" -m app.jobs.fetch_csv_job >> \"${FETCH_LOG}\" 2>&1"
  echo "${EXMEIDAI_SCHEDULE} cd \"${BACKEND_DIR}\" && \"${PYTHON_BIN}\" -m app.jobs.fetch_exmeidai_job >> \"${EXMEIDAI_LOG}\" 2>&1"
} >> "${UPDATED_CRON}"

crontab "${UPDATED_CRON}"

echo "[done] cron を設定しました。内容は次の通りです:"
crontab -l

