#!/bin/sh
# Kopiert den aktuellen Stand (Entwurf 2) in die Vorschau. Entwurf 1 liegt fest in public/version-1.
cd "$(dirname "$0")/.." || exit 1
rm -rf firebase-vorschau/public/version-2 && mkdir -p firebase-vorschau/public/version-2
cp -r index.html impressum.html datenschutz.html assets firebase-vorschau/public/version-2/
