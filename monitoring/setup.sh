#!/usr/bin/env bash
# monitoring/setup.sh
#
# One-time setup script: generates the metrics_token file that Prometheus
# uses to authenticate against /api/metrics.
#
# Usage:
#   chmod +x monitoring/setup.sh
#   ./monitoring/setup.sh
#
# Or with a specific token:
#   METRICS_TOKEN=my-custom-token ./monitoring/setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOKEN_FILE="$SCRIPT_DIR/metrics_token"

# Use env var if set, otherwise generate a random 32-byte hex token
if [ -n "$METRICS_TOKEN" ]; then
  TOKEN="$METRICS_TOKEN"
else
  TOKEN=$(openssl rand -hex 32)
fi

echo "$TOKEN" > "$TOKEN_FILE"
echo "✅ Created $TOKEN_FILE"
echo ""
echo "📋 Add this to your .env (and set in docker-compose environment):"
echo ""
echo "   METRICS_TOKEN=$TOKEN"
echo ""
echo "🔒 Keep this token secret! Never commit it to version control."
echo "   metrics_token is already in .gitignore"
