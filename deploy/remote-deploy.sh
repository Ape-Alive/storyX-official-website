#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/storyx-official-website}"
RELEASE_DIR="${DEPLOY_PATH}/release"
DIST_DIR="${DEPLOY_PATH}/dist"

echo "==> Deploy path: ${DEPLOY_PATH}"
echo "==> Running as: $(whoami)"

if [[ ! -d "${RELEASE_DIR}/dist" ]]; then
  echo "Release package incomplete under ${RELEASE_DIR}/dist"
  exit 1
fi

mkdir -p "${DIST_DIR}"

if [[ ! -w "${DIST_DIR}" ]]; then
  echo "ERROR: ${DIST_DIR} is not writable by $(whoami)."
  echo "On server as root run:"
  echo "  chown -R deploy:deploy ${DEPLOY_PATH}"
  exit 1
fi

# -a 会尝试改 owner/group；deploy 用户通常无权限，改为不保留属主
RSYNC_OPTS=(-a --no-owner --no-group --delete)

echo "==> Sync static files to ${DIST_DIR}"
rsync "${RSYNC_OPTS[@]}" "${RELEASE_DIR}/dist/" "${DIST_DIR}/"

echo "==> Deploy finished"
