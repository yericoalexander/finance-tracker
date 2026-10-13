#!/usr/bin/env bash

# ─────────────────────────────────────────────────────────────────────────────
# Finance Tracker — Script Uji Manual Endpoint /api/capture
# ─────────────────────────────────────────────────────────────────────────────
# Penggunaan:
#   ./scripts/test-capture.sh <DEVICE_TOKEN> <PATH_TO_IMAGE> [BASE_URL]
#
# Contoh:
#   ./scripts/test-capture.sh 4f8a... sample-receipt.png
#   ./scripts/test-capture.sh 4f8a... sample-receipt.jpg http://localhost:3000
# ─────────────────────────────────────────────────────────────────────────────

set -e

DEVICE_TOKEN="${1:-$DEVICE_TOKEN}"
IMAGE_PATH="${2}"
BASE_URL="${3:-http://localhost:3000}"

if [ -z "$DEVICE_TOKEN" ] || [ -z "$IMAGE_PATH" ]; then
  echo "❌ Penggunaan:"
  echo "   $0 <DEVICE_TOKEN> <PATH_TO_IMAGE> [BASE_URL]"
  echo ""
  echo "Contoh:"
  echo "   $0 a1b2c3d4... ./fixtures/struk.png"
  exit 1
fi

if [ ! -f "$IMAGE_PATH" ]; then
  echo "❌ File gambar tidak ditemukan: $IMAGE_PATH"
  exit 1
fi

ENDPOINT="${BASE_URL}/api/capture"

echo "📡 Mengirim screenshot ke: ${ENDPOINT}"
echo "📁 File: ${IMAGE_PATH}"
echo "--------------------------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${ENDPOINT}" \
  -H "Authorization: Bearer ${DEVICE_TOKEN}" \
  -F "image=@${IMAGE_PATH}")

HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: ${HTTP_STATUS}"
echo "Response Body:"
echo "${BODY}"
echo "--------------------------------------------------------"

if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Permintaan berhasil diproses!"
else
  echo "⚠️ Permintaan menghasilkan kode status non-200"
fi
