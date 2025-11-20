# In-Game Configuration Menu Guide

## Overview

The in-game configuration menu allows authorized administrators to modify intraTab settings without editing files. This guide explains each section and setting.

## Accessing the Menu

### Prerequisites
You need the `intrarp.config` ACE permission. Add this to your server.cfg:
```
add_ace group.admin intrarp.config allow
```

### Opening the Menu
Use one of these commands in-game:
- `/intrarp-config`
- `/intratab-config`

Press `ESC` to close the menu at any time.

## Menu Sections

### 1. General Settings (Allgemeine Einstellungen)

#### Framework-Erkennung (Framework Detection)
- **Options**: Automatisch, QBCore, ESX
- **Default**: Automatisch
- **Description**: Determines which framework to use for player data. "Automatisch" will detect QBCore or ESX automatically.

#### IntraRP URL
- **Type**: Text input
- **Example**: `https://deine-url.de/enotf/`
- **Description**: The URL to your IntraRP installation. This is the most important setting - without it, the tablet won't load properly.

#### Debug Modus (Debug Mode)
- **Type**: Toggle switch
- **Default**: Off
- **Description**: Enables debug logging in console (F8). Useful for troubleshooting.

#### Öffnungstaste (Open Key)
- **Options**: F1 through F10
- **Default**: F9
- **Description**: The key players press to open the tablet.

### 2. Item Requirements (Item Anforderungen)

#### Item erforderlich (Require Item)
- **Type**: Toggle switch
- **Default**: On
- **Description**: Whether players need a specific item in their inventory to use the tablet.

#### Erforderliches Item (Required Item)
- **Type**: Text input
- **Default**: `tablet`
- **Description**: The name of the item required (must match your framework's item name).

### 3. Allowed Jobs (Erlaubte Jobs)

This section shows which jobs can access the tablet.

#### Current Jobs
Displayed as removable tags with an `×` button:
- Click the `×` to remove a job from the list
- Example jobs: police, ambulance, firedepartment, admin

#### Add New Job
- **Type**: Text input + Button
- **Usage**: Type the job name and click "Hinzufügen" (Add)
- **Example**: Type "mechanic" and click add to allow mechanics to use the tablet

### 4. Animation & Prop

#### Prop verwenden (Use Prop)
- **Type**: Toggle switch
- **Default**: On
- **Description**: Whether to show the physical tablet prop in the player's hands.

#### Prop Model
- **Type**: Text input
- **Default**: `prop_cs_tablet`
- **Description**: The model name for the tablet prop. Change to `nidapad` for the NIDA tablet model (requires separate download).

**NIDA Tablet Setup:**
```lua
-- For NIDA Tablet (requires download from intraRP store):
Prop Model: nidapad
```

### 5. EMD Synchronization (EMD Synchronisierung)

Settings for Emergency Dispatch synchronization with your IntraRP installation.

#### EMD Sync aktiviert (EMD Sync Enabled)
- **Type**: Toggle switch
- **Default**: Off
- **Description**: Enables automatic synchronization of emergency dispatch data.

#### PHP Endpoint
- **Type**: Text input
- **Example**: `https://deine-url.de/api/emd-sync.php`
- **Description**: The API endpoint for EMD synchronization on your IntraRP server.

#### API Key
- **Type**: Password input
- **Default**: `CHANGE_ME`
- **Description**: Your IntraRP API key (found in `/assets/config/config.php` of your IntraRP installation).

#### Sync Interval (ms)
- **Type**: Number input
- **Default**: `30000` (30 seconds)
- **Description**: How often (in milliseconds) to sync dispatch data. Increase for less frequent updates, decrease for more frequent.

### 6. Actions (Bottom of Menu)

#### Auf Standardwerte zurücksetzen (Reset to Defaults)
- **Type**: Button (Red)
- **Action**: Resets ALL settings to the defaults from config.lua
- **Confirmation**: Shows a confirmation dialog before resetting
- **Effect**: Immediate - all connected clients receive the reset configuration

## Tips and Best Practices

### Setting Changes
- ✅ Changes save automatically when you modify a field
- ✅ All connected players receive updates instantly
- ✅ No server restart needed
- ⚠️ Make one change at a time to avoid confusion

### Job Management
- Add all relevant emergency service jobs: police, ambulance, ems, sheriff, etc.
- Consider adding admin or moderator jobs for testing
- Job names must match EXACTLY what your framework uses

### IntraRP URL
- Must include the full URL with protocol (https://)
- Should end with the eNOTF directory (usually `/enotf/`)
- Test the URL in a browser first to ensure it works

### Debug Mode
- Enable when troubleshooting issues
- Check console (F8) for detailed logs
- Disable in production to reduce log spam

### EMD Sync
- Only enable if you use the emergencydispatch script
- Ensure your IntraRP installation has the sync endpoint configured
- Keep API key secure - don't share it publicly

## Troubleshooting

### Menu Won't Open
1. Check you have the `intrarp.config` permission
2. Verify in console: `/ace` command
3. Check server console for errors

### Changes Don't Save
1. Check server console for file permission errors
2. Ensure the resource folder is writable
3. Check that `runtime_config.json` is being created

### Changes Don't Apply to Other Players
1. Check server console for event errors
2. Verify players are connected to the same server
3. Try the `/intrarp-reloadconfig` command

### Can't Add Jobs
1. Make sure you're typing the exact job name
2. Check for typos or extra spaces
3. Verify the job exists in your framework

## Advanced Usage

### Manual Configuration File Edit
If needed, you can manually edit `runtime_config.json`:

1. Stop the server (or use `/stop intraTab`)
2. Edit `resources/intraTab/runtime_config.json`
3. Start the server (or use `/start intraTab`)
4. Or use `/intrarp-reloadconfig` to reload without restart

### Permission Management
Grant specific players access:
```
# By FiveM ID
add_ace identifier.fivem:12345 intrarp.config allow

# By Steam ID
add_ace identifier.steam:110000123456789 intrarp.config allow

# Entire group
add_ace group.moderator intrarp.config allow
```

### Backup Configuration
To backup your configuration:
1. Copy `runtime_config.json` to a safe location
2. To restore, copy it back and use `/intrarp-reloadconfig`

## Support

For issues or questions:
1. Check the TESTING.md file for test cases
2. Enable Debug Mode and check console logs
3. Review server console for error messages
4. Contact intraRP support at kontakt@intrarp.de
