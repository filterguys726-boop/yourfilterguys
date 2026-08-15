#!/usr/bin/env bash

set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
env_file="$project_dir/.env.local"

if [[ ! -f "$env_file" ]]; then
  echo "Missing $env_file" >&2
  exit 1
fi

read -r -s -p "Paste the Square Sandbox Access Token: " square_token
echo
read -r -p "Paste the Square Sandbox Location ID: " square_location

if [[ -z "$square_token" || -z "$square_location" ]]; then
  echo "Both values are required. No changes were saved." >&2
  exit 1
fi

umask 077
temporary_file="$(mktemp "${TMPDIR:-/tmp}/square-env.XXXXXX")"
trap 'rm -f "$temporary_file"' EXIT

while IFS= read -r line || [[ -n "$line" ]]; do
  case "$line" in
    SQUARE_ACCESS_TOKEN=*)
      printf 'SQUARE_ACCESS_TOKEN=%s\n' "$square_token" >> "$temporary_file"
      ;;
    SQUARE_LOCATION_ID=*)
      printf 'SQUARE_LOCATION_ID=%s\n' "$square_location" >> "$temporary_file"
      ;;
    *)
      printf '%s\n' "$line" >> "$temporary_file"
      ;;
  esac
done < "$env_file"

mv "$temporary_file" "$env_file"
trap - EXIT
unset square_token

echo "Square Sandbox values saved to .env.local."
