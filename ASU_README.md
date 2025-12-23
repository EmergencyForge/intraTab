# Atemschutzüberwachung (ASU) - Breathing Apparatus Monitoring System

## Übersicht

Das Atemschutzüberwachungssystem ist eine eigenständige Erweiterung für intraTab, die eine vollständige Überwachung von Atemschutztrupps ermöglicht. Das System arbeitet unabhängig vom bestehenden Tablet-System und bietet eine dedizierte Oberfläche für die Protokollierung von Atemschutzeinsätzen.

## Features

### Hauptfunktionen

- **Echtzeit-Zeitanzeige**: Aktuelle Uhrzeit wird permanent angezeigt (HH:mm)
- **3 Trupp-Bereiche**: 
  - 1. Trupp
  - 2. Trupp
  - Sicherheitstrupp
- **Eieruhr-Timer**: Fortlaufende Zeitmessung bis max. 60 Minuten pro Trupp (statt Barometer)
- **Visuelles Feedback**: Farbliche Warnung bei 40 Min (gelb) und 50 Min (rot)

### Trupp-Informationen

Jeder Trupp kann folgende Informationen erfassen:

1. **Personal**:
   - Truppführer (TF) - Pflichtfeld
   - Truppmann 1 (TM1) - Pflichtfeld
   - Truppmann 2 (TM2) - Optional

2. **Einsatzbeginn**:
   - Anfangsdruck (bar)
   - Einsatzbeginn (Zeitangabe)
   - Auftrag (Menschenrettung, Brandbekämpfung, Erkundung, etc.)

3. **Kontrollen**:
   - 1. Kontrolle (nach 10 Min / 1/3 der Einsatzzeit)
   - 2. Kontrolle (nach 20 Min / 2/3 der Einsatzzeit)

4. **Einsatzende**:
   - Einsatzziel
   - Rückzug (Zeitangabe)
   - Einsatzende (Zeitangabe)
   - Bemerkungsfeld

### Einsatzinformationen

- Einsatznummer (Pflichtfeld)
- Einsatzort (Pflichtfeld)
- Einsatzdatum (Pflichtfeld)
- Überwacher (Pflichtfeld)

### Steuerung

- **Start-Button**: Startet den Timer für einen Trupp
- **Stop-Button**: Stoppt den Timer für einen Trupp
- **Protokoll leeren**: Löscht alle eingegebenen Daten (mit Bestätigung)
- **Daten senden**: Übermittelt das Protokoll an die API

## Installation

Das ASU-System ist bereits in intraTab integriert. Die Installation erfolgt automatisch mit dem intraTab-Resource.

### Konfiguration

Die Konfiguration erfolgt in der `config.lua`:

```lua
-- Atemschutzüberwachung (ASU) Settings
Config.ASUJobs = {
    'police',
    'ambulance',
    'firedepartment',
    'admin'
}

-- ASU Sync Einstellungen (für API-Übertragung der Protokolle)
Config.ASUSync = {
    Enabled = false,  -- Auf true setzen, um die ASU-Synchronisierung zu aktivieren
    APIEndpoint = '',  -- URL zum ASU-Sync API-Endpunkt (z.B. https://deine-url.de/api/asu-sync.php)
    APIKey = 'CHANGE_ME'  -- API-Key deines intraRP
}
```

### Berechtigungen

Nur Spieler mit den in `Config.ASUJobs` definierten Jobs können das ASU-System nutzen.

## Verwendung

### Öffnen des Systems

Das ASU-System kann über folgende Befehle geöffnet werden:

```
/asueberwachung
```

oder

```
/asu
```

### Workflow

1. **System öffnen**: `/asueberwachung` eingeben
2. **Einsatzinformationen eingeben**: Einsatznummer, Ort, Datum, Überwacher
3. **Trupp starten**: 
   - Personal eingeben (TF und TM1 sind Pflicht)
   - Anfangsdruck und Auftrag eingeben
   - "Start"-Button klicken
4. **Timer läuft**: Die Eieruhr zeigt die fortlaufende Einsatzzeit
5. **Kontrollen durchführen**: Druckwerte oder Status in die Kontrollfelder eintragen
6. **Trupp beenden**:
   - "Stop"-Button klicken
   - Rückzug und Einsatzende werden automatisch mit aktueller Zeit gefüllt
7. **Daten senden**: Mit "Daten senden" wird das Protokoll an die API übermittelt

### Tastenkombinationen

- **ESC**: Schließt das ASU-System

## API-Synchronisierung

### Datenformat

Die API erhält folgende Datenstruktur:

```json
{
  "intraRP_API_Key": "YOUR_API_KEY",
  "timestamp": 1234567890,
  "type": "asu_protocol",
  "data": {
    "missionNumber": "E-2024-001",
    "missionLocation": "Hauptstraße 123",
    "missionDate": "2024-12-23",
    "supervisor": "Max Mustermann",
    "trupp1": {
      "truppNumber": 1,
      "elapsedTime": 1234,
      "tf": "John Doe",
      "tm1": "Jane Smith",
      "tm2": "Bob Johnson",
      "startPressure": "300",
      "startTime": "14:30",
      "mission": "Brandbekämpfung",
      "check1": "200 bar - OK",
      "check2": "100 bar - OK",
      "objective": "2. OG Zimmer 5",
      "retreat": "15:00",
      "end": "15:15",
      "remarks": "Erfolgreicher Einsatz"
    },
    "trupp2": { ... },
    "trupp3": { ... },
    "timestamp": "2024-12-23T14:30:00.000Z"
  }
}
```

### API-Endpunkt erstellen

Erstelle einen PHP-Endpunkt ähnlich wie `emd-sync.php`:

```php
<?php
// asu-sync.php

// API-Key aus Config
$validAPIKey = 'YOUR_API_KEY';

// Request verarbeiten
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// API-Key prüfen
if (!isset($data['intraRP_API_Key']) || $data['intraRP_API_Key'] !== $validAPIKey) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid API Key']);
    exit;
}

// Daten verarbeiten
if ($data['type'] === 'asu_protocol') {
    $protocol = $data['data'];
    
    // Hier Daten in Datenbank speichern oder verarbeiten
    // ...
    
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Protocol received']);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data type']);
}
?>
```

## Commands (Server)

### /asuprotokolle

Zeigt alle gespeicherten Protokolle an (nur für Admins).

```
/asuprotokolle
```

## Exports

### Client-seitig

```lua
-- ASU-System öffnen
exports['intraTab']:openASU()

-- ASU-System schließen
exports['intraTab']:closeASU()
```

### Server-seitig

```lua
-- Daten an API senden
exports['intraTab']:sendASUData(data)

-- Alle gespeicherten Protokolle abrufen
local protocols = exports['intraTab']:getASUProtocols()
```

## Technische Details

### Dateien

- **Client**: `client/asu_client.lua`
- **Server**: `server/asu_server.lua`
- **HTML**: `html/index.html` (ASU-Container integriert)
- **CSS**: `html/css/asueberwachung.css`
- **JavaScript**: `html/js/asueberwachung.js`

### Framework-Unterstützung

- QBCore
- ESX
- Standalone (mit eingeschränkter Funktionalität)

### Timer-System

- Maximale Einsatzzeit: 60 Minuten
- Aktualisierung: 1 Sekunde
- Warnstufe 1: Ab 40 Minuten (gelbe Farbe)
- Warnstufe 2: Ab 50 Minuten (rote Farbe, blinkend)
- Automatischer Stop bei 60 Minuten

## Unabhängigkeit

Das ASU-System ist vollständig unabhängig vom bestehenden Tablet-System:

- **Separate UI**: Eigene Benutzeroberfläche
- **Eigene Befehle**: `/asueberwachung` und `/asu`
- **Keine Interferenz**: Funktioniert parallel zum Tablet
- **Eigene NUI**: Separate NUI-Callbacks und Event-Handler

## Troubleshooting

### ASU öffnet sich nicht

- Überprüfen Sie, ob Ihr Job in `Config.ASUJobs` eingetragen ist
- Prüfen Sie die F8-Console auf Fehlermeldungen
- Stellen Sie sicher, dass das Resource korrekt geladen wurde

### Timer funktioniert nicht

- Prüfen Sie, ob der Start-Button geklickt wurde
- Überprüfen Sie die Browser-Console (F12) auf JavaScript-Fehler

### Daten werden nicht gesendet

- Stellen Sie sicher, dass `Config.ASUSync.Enabled = true` ist
- Überprüfen Sie den API-Endpunkt und API-Key
- Prüfen Sie, ob alle Pflichtfelder ausgefüllt sind
- Prüfen Sie Server-Logs auf Fehler

## Support

Bei Fragen oder Problemen wenden Sie sich an EmergencyForge.de oder erstellen Sie ein Issue im GitHub-Repository.
