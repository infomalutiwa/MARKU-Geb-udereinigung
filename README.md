# MARKU Gebäudereinigung & Dienstleistungen – Website

Statische Website (HTML/CSS/JS). Jeder Push auf `neue-webseite` oder `main` lädt die Seite
per GitHub Actions (`.github/workflows/deploy.yml`) automatisch per FTPS zu ALL-INKL hoch.

## Einmalige Einrichtung
Repository → Settings → Secrets and variables → Actions → *New repository secret*:

| Name | Wert |
|---|---|
| `FTP_SERVER` | FTP-Server (z. B. `w022499d.kasserver.com`, siehe KAS → FTP → Info) |
| `FTP_USERNAME` | FTP-Benutzer (`f0192927`) |
| `FTP_PASSWORD` | Passwort des FTP-Benutzers |

Manuell starten: Actions → „Deploy zu ALL-INKL“ → *Run workflow*.
Das Verzeichnis des FTP-Nutzers ist der Domain-Ordner `/xn--marku-gebudeservice-owb.de/` (Domain: marku-gebäudeservice.de).

