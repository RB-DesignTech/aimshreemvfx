#!/usr/bin/env bash
set -euo pipefail

function usage() {
  cat <<'USAGE'
Usage: ./deploy.sh [options]

Options:
  --skip-install   Skip installing dependencies (assumes node_modules is up to date).
  --start          Start the production server after building.
  -h, --help       Show this help message.

The script expects pnpm to be available in PATH. It installs dependencies,
builds the Next.js application, and optionally starts the production server.
USAGE
}

SKIP_INSTALL=false
START_SERVER=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-install)
      SKIP_INSTALL=true
      ;;
    --start)
      START_SERVER=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is required but was not found in PATH." >&2
  echo "Install pnpm from https://pnpm.io/installation and retry." >&2
  exit 1
fi

if [[ "$SKIP_INSTALL" == false ]]; then
  echo "Installing dependencies with pnpm..."
  pnpm install --frozen-lockfile
else
  echo "Skipping dependency installation as requested."
fi

echo "Building the Next.js application..."
pnpm build

echo "Build complete."

if [[ "$START_SERVER" == true ]]; then
  echo "Starting the production server (Ctrl+C to stop)..."
  pnpm start
else
  cat <<'INFO'
Deployment build finished.
To serve the production build, run:
  pnpm start
INFO
fi
