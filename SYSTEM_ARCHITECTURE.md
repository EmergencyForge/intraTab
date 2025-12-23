# Atemschutzüberwachung - System Architecture

## Overview

The Atemschutzüberwachung (ASU) system is a completely independent module that extends intraTab without modifying existing functionality. It provides a comprehensive breathing apparatus monitoring interface for FiveM servers.

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FiveM Client                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐              ┌────────────────────────┐  │
│  │  Existing       │              │  ASU System            │  │
│  │  Tablet System  │              │  (New Module)          │  │
│  │                 │              │                        │  │
│  │  client/        │              │  client/               │  │
│  │  main.lua       │              │  asu_client.lua        │  │
│  │                 │              │                        │  │
│  │  Command:       │              │  Commands:             │  │
│  │  /intrarp       │              │  /asueberwachung       │  │
│  │  F9 key         │              │  /asu                  │  │
│  └────────┬────────┘              └───────────┬────────────┘  │
│           │                                   │                │
│           │                                   │                │
│  ┌────────▼────────────────────────────────────▼───────────┐  │
│  │              NUI (User Interface)                       │  │
│  ├──────────────────────────────┬──────────────────────────┤  │
│  │  Tablet UI                   │  ASU UI                  │  │
│  │  ┌──────────────────┐        │  ┌──────────────────┐   │  │
│  │  │ index.html       │        │  │ index.html       │   │  │
│  │  │ (iframe)         │        │  │ (asuContainer)   │   │  │
│  │  │                  │        │  │                  │   │  │
│  │  │ script.js        │        │  │ asueberwachung.js│   │  │
│  │  │ style.css        │        │  │ asueberwachung.css   │  │
│  │  └──────────────────┘        │  └──────────────────┘   │  │
│  └──────────────────────────────┴──────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ Network Events
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                         FiveM Server                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐              ┌────────────────────────┐  │
│  │  Existing       │              │  ASU System            │  │
│  │  Server Logic   │              │  (New Module)          │  │
│  │                 │              │                        │  │
│  │  server/        │              │  server/               │  │
│  │  main.lua       │              │  asu_server.lua        │  │
│  │  emd_sync.lua   │              │                        │  │
│  │                 │              │  Events:               │  │
│  │                 │              │  - asu:sendData        │  │
│  │                 │              │  - asu:sendDataResponse│  │
│  └─────────────────┘              └───────────┬────────────┘  │
│                                               │                │
│  ┌────────────────────────────────────────────┘                │
│  │                                                              │
│  │  ┌──────────────────────────────────────────────────┐      │
│  │  │           Config (config.lua)                    │      │
│  │  ├──────────────────────────────────────────────────┤      │
│  │  │  Config.ASUJobs = { ... }                        │      │
│  │  │  Config.ASUSync = { ... }                        │      │
│  │  └──────────────────────────────────────────────────┘      │
│  │                                                              │
│  └──────────────────────────────────────────────────────────── │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ HTTPS POST
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                       External API Server                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PHP Endpoint (asu-sync.php)                             │  │
│  │  - Receives protocol data                                │  │
│  │  - Validates API key                                     │  │
│  │  - Stores to database or file                            │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                    │
│  ┌─────────────────────────▼──────────────────────────────┐   │
│  │  MySQL Database (optional)                             │   │
│  │  - asu_protocols table                                 │   │
│  │  - asu_trupps table                                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Opening ASU Interface

```
Player → /asueberwachung command
    ↓
client/asu_client.lua (OpenASU)
    ↓
Check job permissions (Config.ASUJobs)
    ↓
SetNuiFocus(true, true)
    ↓
SendNUIMessage({ type: "openASU" })
    ↓
asueberwachung.js (openASU)
    ↓
Display ASU UI
```

### 2. Timer Operation

```
User clicks "Start" button
    ↓
startTrupp(truppNum) in asueberwachung.js
    ↓
timer.running = true
    ↓
setInterval() updates every 1 second
    ↓
updateTruppDisplay() updates:
    - Time display (MM:SS)
    - Progress bar (0-100%)
    - Warning colors (40min, 50min)
    ↓
Auto-stop at 60 minutes
```

### 3. Data Submission

```
User clicks "Daten senden"
    ↓
sendData() in asueberwachung.js
    ↓
Validate required fields
    ↓
fetch() to NUI callback 'sendASUData'
    ↓
client/asu_client.lua RegisterNUICallback
    ↓
TriggerServerEvent('asu:sendData', data)
    ↓
server/asu_server.lua RegisterNetEvent
    ↓
Store protocol locally
    ↓
SendASUDataToAPI() (if enabled)
    ↓
PerformHttpRequest() to Config.ASUSync.APIEndpoint
    ↓
PHP endpoint receives data
    ↓
Validate API key
    ↓
Save to database/file
    ↓
Return success/error response
    ↓
TriggerClientEvent('asu:sendDataResponse')
    ↓
Display notification to user
```

## Component Details

### Client Side (client/asu_client.lua)

**Responsibilities:**
- Framework detection (QBCore/ESX)
- Job permission validation
- Command registration
- NUI communication
- Event handling

**Key Functions:**
- `OpenASU()` - Opens interface
- `CloseASU()` - Closes interface
- `GetPlayerCharacterData()` - Gets player info
- `HasAllowedJob()` - Checks permissions

### Server Side (server/asu_server.lua)

**Responsibilities:**
- Data reception and validation
- Protocol storage
- API synchronization
- Admin commands

**Key Functions:**
- `SendASUDataToAPI()` - Sends to external API
- Event handler for 'asu:sendData'
- Command '/asuprotokolle'

**Exports:**
- `sendASUData(data)` - Send to API
- `getASUProtocols()` - Get stored protocols

### User Interface

#### HTML (index.html + asueberwachung container)
- Separate container: `#asuContainer`
- 3 trupp sections
- Form inputs and controls
- Action buttons

#### CSS (asueberwachung.css)
- Orange/red theme
- Responsive design
- Visual timer feedback
- Warning states

#### JavaScript (asueberwachung.js)
- Timer management
- Form validation
- Data collection
- NUI callbacks

**Key Functions:**
- `startTrupp(n)` - Start timer
- `stopTrupp(n)` - Stop timer
- `updateTruppDisplay(n)` - Update UI
- `getAllData()` - Collect form data
- `sendData()` - Submit to server
- `clearAll()` - Reset form

## Configuration

### Config.lua Structure

```lua
-- Job permissions
Config.ASUJobs = {
    'police',
    'ambulance',
    'firedepartment',
    'admin'
}

-- API synchronization
Config.ASUSync = {
    Enabled = false,
    APIEndpoint = ''
    -- API key is taken from Config.EMDSync.APIKey
}
```

## Independence from Existing System

### No File Modifications
- ✓ `client/main.lua` - Unchanged
- ✓ `server/main.lua` - Unchanged
- ✓ `server/emd_sync.lua` - Unchanged
- ✓ `html/js/script.js` - Unchanged
- ✓ `html/css/style.css` - Unchanged

### Separate Components
- ✓ Own Lua files (asu_client.lua, asu_server.lua)
- ✓ Own commands (/asueberwachung, /asu)
- ✓ Own NUI container (#asuContainer)
- ✓ Own event names (asu:*)
- ✓ Own configuration (Config.ASU*)

### Parallel Operation
- Both systems can run simultaneously
- No interference between tablet and ASU
- Independent NUI focus management
- Separate event handlers

## Data Format

### Protocol Structure

```lua
{
    missionNumber = "E-2024-001",
    missionLocation = "Hauptstraße 123",
    missionDate = "2024-12-23",
    supervisor = "Max Mustermann",
    trupp1 = {
        truppNumber = 1,
        elapsedTime = 1800, -- seconds
        tf = "John Doe",
        tm1 = "Jane Smith",
        tm2 = "Bob Johnson",
        startPressure = "300",
        startTime = "14:30",
        mission = "Brandbekämpfung",
        check1 = "200 bar - OK",
        check2 = "100 bar - OK",
        objective = "2. OG Zimmer 5",
        retreat = "15:00",
        end = "15:15",
        remarks = "Erfolgreicher Einsatz"
    },
    trupp2 = { ... },
    trupp3 = { ... },
    timestamp = "2024-12-23T14:30:00.000Z"
}
```

## Security Considerations

1. **API Key Validation** - Server validates before processing
2. **Job Permissions** - Only allowed jobs can access
3. **Input Validation** - Required fields enforced
4. **HTTPS Required** - FiveM requirement for external requests
5. **Data Sanitization** - Input cleaned before storage

## Performance

- **Timer Update Rate**: 1 second
- **Max Operation Time**: 60 minutes
- **Protocol Storage**: Server memory (temporary)
- **API Transmission**: Async HTTP request
- **UI Rendering**: CSS animations (GPU accelerated)

## Extensibility

### Adding New Features

1. **New Trupp Types**: Modify HTML template
2. **New Fields**: Add to form and data collection
3. **Custom Validations**: Extend validateProtocol()
4. **Additional Storage**: Modify server/asu_server.lua
5. **Custom API Endpoints**: Update Config.ASUSync

### Export Usage

Other resources can use ASU exports:

```lua
-- Open ASU from another resource
exports['intraTab']:openASU()

-- Send data from another resource
exports['intraTab']:sendASUData(protocolData)

-- Get stored protocols
local protocols = exports['intraTab']:getASUProtocols()
```

## Troubleshooting Guide

### Common Issues

1. **ASU won't open**
   - Check job permissions
   - Verify resource is started
   - Check F8 console for errors

2. **Timer not working**
   - Ensure JavaScript is loading
   - Check browser console (F12)
   - Verify start button was clicked

3. **Data not sending**
   - Enable Config.ASUSync
   - Verify API endpoint URL
   - Check API key matches
   - Ensure HTTPS is used
   - Review server logs

## Testing Checklist

- [ ] Command `/asueberwachung` opens interface
- [ ] Job permissions work correctly
- [ ] All 3 trupp sections functional
- [ ] Timers start/stop correctly
- [ ] Timer reaches 60 minutes and stops
- [ ] Warning colors appear at 40/50 minutes
- [ ] Form validation works
- [ ] Clear button resets all data
- [ ] Data sends to API successfully
- [ ] ESC key closes interface
- [ ] Tablet system still works independently

## Maintenance

### Regular Tasks
- Monitor log files for errors
- Check API endpoint response times
- Review stored protocols
- Update database schema if needed
- Backup protocol data

### Updates
- Test on FiveM updates
- Verify framework compatibility
- Update documentation
- Check for security patches

## Support Resources

- ASU_README.md - Full documentation
- INSTALLATION.md - Quick start guide
- api_example/README.md - API integration
- GitHub Issues - Bug reports and features
