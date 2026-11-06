#!/bin/sh
# Kopiert den aktuellen Hauptstand (gewählter Entwurf 1) in die Vorschau.
# Entwurf 2 liegt als Archiv fest in public/version-2.
cd "$(dirname "$0")/.." || exit 1
rm -rf firebase-vorschau/public/version-1 && mkdir -p firebase-vorschau/public/version-1
cp -r index.html impressum.html datenschutz.html assets firebase-vorschau/public/version-1/
