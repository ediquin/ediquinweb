#!/usr/bin/env bash
# Empaqueta montana3d.js con Three.js 0.170 (solo lo usado) en un módulo ES minificado.
# Usa three y esbuild ya instalados en Nativzar_videos (sin descargar nada).
# Uso: bash construir.sh [versión] → ../../js/montana3d-<versión>.js  y  lab/montana3d-lab.js
set -euo pipefail
cd "$(dirname "$0")"
VERSION="${1:-20261124-3}"
NM=/home/ediquin/Documents/Claude_projects/Personal_projects/Nativzar_videos/video/felicidad_huesos_v2/node_modules
for SALIDA in "../../js/montana3d-$VERSION.js" lab/montana3d-lab.js; do
  NODE_PATH="$NM" "$NM/.bin/esbuild" montana3d.js --bundle --format=esm --minify --target=es2020 \
    --legal-comments=eof --log-level=warning --outfile="$SALIDA"
done
ls -la "../../js/montana3d-$VERSION.js"; gzip -9c "../../js/montana3d-$VERSION.js" | wc -c | xargs echo "gzip bytes:"
