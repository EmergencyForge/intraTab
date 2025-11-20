![intraRP Logo](https://raw.githubusercontent.com/intraRP/intraRP/refs/heads/main/.github/intrarp_banner.png)

# intraTab - Die perfekte Ergänzung für [intraRP](https://github.com/intraRP/intraRP)

Mit **intraTab** lässt sich intraRP ganz einfach auch in FiveM benutzen! Einfach die Ressource in das entsprechende Verzeichnis des FiveM-Servers ziehen, gewünschte Anpassungen an der `config.lua` vornehmen (wichtig: Der Link zur intraRP-Installation) und startbereit ist die Ingame-Integration. Das System befindet sich in aktuell in Entwicklung und wird stetig verändert.

## Vorschau

![448823451-8fd365d9-45f4-4daa-8193-a8a6c09f2e5a](https://github.com/user-attachments/assets/b1280a84-fc57-432b-a02a-2b83c58211c2)

![448823450-a544d98e-39a7-4da8-af40-181b07abc86c](https://github.com/user-attachments/assets/ec19c309-8c08-415b-9af0-8a1cf2056089)

## Ingame-Konfiguration

Mit entsprechenden Rechten kann die Konfiguration nun auch **direkt im Spiel** vorgenommen werden, ohne die `config.lua` Datei zu bearbeiten. Die Einstellungen werden persistent gespeichert und können **live im Betrieb** angepasst werden!

### Zugriff auf die Konfiguration

Um auf das Konfigurationsmenü zuzugreifen, benötigen Sie die entsprechende ACE-Berechtigung:

```
add_ace group.admin intrarp.config allow
```

Alternativ können Sie auch die allgemeine `command` Berechtigung nutzen.

### Befehle

- `/intrarp-config` oder `/intratab-config` - Öffnet das Konfigurationsmenü
- `/intrarp-reloadconfig` - Lädt die Konfiguration aus der Datei neu

### Konfigurierbare Einstellungen

Über das Ingame-Menü können folgende Einstellungen angepasst werden:

**Allgemeine Einstellungen:**
- Framework-Erkennung (Auto/QBCore/ESX)
- IntraRP URL
- Debug-Modus
- Öffnungstaste (F1-F10)

**Item Anforderungen:**
- Item erforderlich (Ja/Nein)
- Name des erforderlichen Items

**Erlaubte Jobs:**
- Jobs hinzufügen oder entfernen
- Dynamische Verwaltung der Job-Liste

**Animation & Prop:**
- Prop-Verwendung aktivieren/deaktivieren
- Prop-Model ändern

**EMD Synchronisierung:**
- EMD Sync aktivieren/deaktivieren
- PHP Endpoint konfigurieren
- API Key eingeben
- Sync-Intervall anpassen

### Live-Updates

Alle Änderungen werden in Echtzeit auf alle verbundenen Clients übertragen. Nach einer Konfigurationsänderung müssen die Spieler nicht neu verbinden - die Einstellungen werden automatisch aktualisiert.

### Persistenz

Die Runtime-Konfiguration wird in der Datei `runtime_config.json` gespeichert. Diese Datei wird automatisch erstellt und sollte **nicht** in die Versionskontrolle aufgenommen werden (bereits in `.gitignore` konfiguriert).

### Fallback

Die `config.lua` Datei bleibt weiterhin als Fallback und für Standard-Einstellungen erhalten. Beim ersten Start werden die Werte aus `config.lua` in die Runtime-Konfiguration übernommen
