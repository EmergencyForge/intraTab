# Atemschutzüberwachung - Schnellstart-Anleitung

## Installation

1. **Resource installiert**: Das ASU-System ist bereits Teil von intraTab
2. **Server neu starten**: `restart intraTab` oder Server-Neustart

## Konfiguration

Öffne `config.lua` und passe an:

```lua
-- ASU System aktivieren/deaktivieren
Config.ASUEnabled = true  -- auf false setzen, um ASU komplett zu deaktivieren

-- Jobs die ASU nutzen dürfen
Config.ASUJobs = {
    'police',
    'ambulance',
    'firedepartment',
    'admin'
}

-- API-Synchronisierung (optional)
Config.ASUSync = {
    Enabled = true,  -- auf true setzen zum Aktivieren
    APIEndpoint = 'https://deine-domain.de/api/asu-sync.php'
    -- Hinweis: API-Key wird von Config.EMDSync.APIKey übernommen
}

-- Stelle sicher, dass der API-Key in Config.EMDSync gesetzt ist:
Config.EMDSync = {
    APIKey = 'DEIN_API_KEY_HIER'  -- Dieser Key wird für ASU und EMD verwendet
}
```

## Verwendung

### Für Spieler

```
/asueberwachung  (oder /asu)
```

### Workflow

1. Befehl eingeben
2. Einsatzinformationen ausfüllen
3. Trupp-Personal eingeben
4. "Start" klicken
5. Kontrollen durchführen
6. "Stop" klicken
7. "Daten senden" für API-Upload

## API-Endpunkt (Optional)

Siehe `api_example/` Ordner für:
- PHP-Endpunkt Beispiel
- Datenbank-Schema
- Vollständige Dokumentation

## Befehle

### Spieler
- `/asueberwachung` - Öffnet ASU-Interface
- `/asu` - Kurzform

### Admin (Server-Console)
- `/asuprotokolle` - Zeigt gespeicherte Protokolle

## Tastenkombinationen

- `ESC` - Schließt ASU-Interface

## Problembehebung

### ASU öffnet sich nicht
- Prüfe ob Config.ASUEnabled = true gesetzt ist
- Job-Berechtigung prüfen (Config.ASUJobs)
- F8 Console auf Fehler prüfen

### Daten werden nicht gesendet
- Config.ASUSync.Enabled = true setzen
- API-Endpunkt prüfen
- API-Key in Config.EMDSync.APIKey prüfen
- Pflichtfelder ausfüllen

## Weitere Informationen

Vollständige Dokumentation: `ASU_README.md`
API Dokumentation: `api_example/README.md`
