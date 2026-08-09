#!/usr/bin/env bash
set -e

# Ensure assets/store exists
mkdir -p assets/store

capture_screen() {
  local name=$1
  local filename="assets/store/screenshot_${name}.jpg"
  local raw_png="assets/store/screenshot_${name}_raw.png"

  echo "Capturing current screen from Android emulator for '${name}'..."
  adb exec-out screencap -p > "$raw_png"
  sips -s format jpeg "$raw_png" --out "$filename" > /dev/null
  rm -f "$raw_png"
  echo "✅ Saved $filename"
}

case "$1" in
  presets)
    capture_screen "presets"
    ;;
  scorepad)
    capture_screen "scorepad"
    ;;
  victory)
    capture_screen "victory"
    ;;
  *)
    echo "Usage: ./scripts/capture-adb-screenshots.sh [presets|scorepad|victory]"
    exit 1
    ;;
esac
