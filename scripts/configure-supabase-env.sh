#!/usr/bin/env bash

set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
env_file="$project_dir/.env.local"

if [[ ! -f "$env_file" ]]; then
  echo "Missing $env_file" >&2
  exit 1
fi

read -r -p "Paste the Supabase Project URL: " supabase_url
read -r -p "Paste the Supabase publishable key: " supabase_publishable_key
read -r -s -p "Paste the Supabase secret key: " supabase_secret_key
echo

if [[ -z "$supabase_url" || -z "$supabase_publishable_key" || -z "$supabase_secret_key" ]]; then
  echo "All three values are required. No changes were saved." >&2
  exit 1
fi

umask 077
temporary_file="$(mktemp "${TMPDIR:-/tmp}/supabase-env.XXXXXX")"
trap 'rm -f "$temporary_file"' EXIT

while IFS= read -r line || [[ -n "$line" ]]; do
  case "$line" in
    NEXT_PUBLIC_SUPABASE_URL=*)
      printf 'NEXT_PUBLIC_SUPABASE_URL=%s\n' "$supabase_url" >> "$temporary_file"
      ;;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=*)
      printf 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=%s\n' "$supabase_publishable_key" >> "$temporary_file"
      ;;
    SUPABASE_SECRET_KEY=*)
      printf 'SUPABASE_SECRET_KEY=%s\n' "$supabase_secret_key" >> "$temporary_file"
      ;;
    *)
      printf '%s\n' "$line" >> "$temporary_file"
      ;;
  esac
done < "$env_file"

mv "$temporary_file" "$env_file"
trap - EXIT
unset supabase_secret_key

echo "Supabase values saved to .env.local."
