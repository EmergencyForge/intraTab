# Testing Guide for In-Game Configuration System

This document provides a testing guide for the newly implemented in-game configuration system.

## Prerequisites

1. FiveM server with the intraTab resource installed
2. Admin permissions configured in server.cfg:
   ```
   add_ace group.admin intrarp.config allow
   ```
3. QBCore or ESX framework (optional, but recommended)

## Test Cases

### 1. Opening Configuration Menu

**Steps:**
1. Join the server as an admin
2. Execute command `/intrarp-config` or `/intratab-config`
3. Verify that the configuration menu opens

**Expected Result:**
- Configuration menu should appear with a blue gradient background
- All sections should be visible: General Settings, Item Requirements, Allowed Jobs, Animation & Prop, EMD Synchronization

### 2. General Settings Modifications

**Steps:**
1. Open configuration menu
2. Change the "Framework-Erkennung" dropdown
3. Modify the "IntraRP URL" field
4. Toggle "Debug Modus"
5. Change "Öffnungstaste" to a different key

**Expected Result:**
- Changes should be saved immediately
- Success notification should appear for each change
- Settings should persist after closing and reopening the menu

### 3. Job Management

**Steps:**
1. Open configuration menu
2. Navigate to "Erlaubte Jobs" section
3. Add a new job (e.g., "mechanic"):
   - Type "mechanic" in the input field
   - Click "Hinzufügen" button
4. Remove an existing job:
   - Click the "×" button on a job tag

**Expected Result:**
- New job should appear as a tag in the list
- Removed job should disappear from the list
- Changes should be saved to runtime_config.json

### 4. EMD Sync Configuration

**Steps:**
1. Open configuration menu
2. Navigate to "EMD Synchronisierung" section
3. Toggle "EMD Sync aktiviert"
4. Enter a PHP endpoint URL
5. Enter an API key
6. Change the sync interval

**Expected Result:**
- All changes should be saved
- If EMD Sync is enabled, the sync should start using the new settings

### 5. Configuration Persistence

**Steps:**
1. Make several configuration changes
2. Close the configuration menu
3. Restart the resource: `/restart intraTab`
4. Open the configuration menu again

**Expected Result:**
- All previous changes should still be present
- runtime_config.json file should exist in the resource folder

### 6. Live Updates (Multi-Client)

**Steps:**
1. Have two admin players connected to the server
2. Player A opens configuration menu and makes changes
3. Player B checks their settings (can reopen tablet or check debug output)

**Expected Result:**
- Player B should receive the updated configuration automatically
- No restart or reconnection required

### 7. Permission Testing

**Steps:**
1. Connect as a non-admin player (without intrarp.config permission)
2. Try to execute `/intrarp-config`

**Expected Result:**
- Should receive an error notification: "You do not have permission to access configuration"
- Configuration menu should not open

### 8. Reset to Defaults

**Steps:**
1. Make several configuration changes
2. Open configuration menu
3. Click "Auf Standardwerte zurücksetzen" button
4. Confirm the action

**Expected Result:**
- All settings should revert to default values from config.lua
- Success notification should appear
- runtime_config.json should be updated with default values

### 9. Reload Configuration

**Steps:**
1. Manually edit runtime_config.json file
2. Execute command `/intrarp-reloadconfig`

**Expected Result:**
- Configuration should be reloaded from the file
- Success notification should appear
- All clients should receive the updated configuration

### 10. Input Validation

**Steps:**
1. Open configuration menu
2. Try to enter invalid values:
   - Empty IntraRP URL
   - Negative sync interval
   - Invalid characters in job names

**Expected Result:**
- Should receive error notification for invalid values
- Invalid values should not be saved
- Previous valid values should remain

## Files to Check

After testing, verify these files:

1. **runtime_config.json** - Should exist in the intraTab resource folder
2. **Server console** - Should show configuration manager initialization messages
3. **Client console (F8)** - Should show debug messages if Debug mode is enabled

## Common Issues

### Issue: Configuration menu doesn't open
- **Solution**: Check if you have the intrarp.config permission
- **Solution**: Check server console for errors
- **Solution**: Verify fxmanifest.lua includes all new files

### Issue: Changes don't persist
- **Solution**: Check if runtime_config.json has write permissions
- **Solution**: Check server console for file operation errors

### Issue: Live updates not working
- **Solution**: Check if all clients are receiving the 'intrarp-tablet:configUpdated' event
- **Solution**: Verify network events are not being blocked

## Success Criteria

The configuration system is working correctly if:
- ✅ Configuration menu opens for authorized users
- ✅ All settings can be modified through the UI
- ✅ Changes persist after resource restart
- ✅ Changes are broadcast to all clients in real-time
- ✅ Unauthorized users cannot access the menu
- ✅ Invalid input is rejected with appropriate error messages
- ✅ Reset to defaults functionality works correctly
