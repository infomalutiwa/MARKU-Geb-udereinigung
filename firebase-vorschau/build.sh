#!/bin/sh
# Kopiert die fertige Seite (Repo-Root) in den Firebase-Vorschauordner.
cd "$(dirname "$0")/.." || exit 1
rm -rf firebase-vorschau/public && mkdir -p firebase-vorschau/public
cp -r index.html impressum.html datenschutz.html assets firebase-vorschau/public/
