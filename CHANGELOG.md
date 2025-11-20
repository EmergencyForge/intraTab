# Changelog

## [1.3.0] - In-Game Configuration System

### Added
- **In-Game Configuration Menu**: New configuration interface accessible via `/intrarp-config` or `/intratab-config` commands
- **Live Configuration Updates**: Changes are broadcast to all connected clients in real-time without requiring restarts
- **Configuration Persistence**: Runtime configuration saved to `runtime_config.json` file
- **Permission System**: ACE permission-based access control (`intrarp.config`)
- **Configuration Sections**:
  - General Settings (Framework, IntraRP URL, Debug Mode, Open Key)
  - Item Requirements (Require Item toggle, Item Name)
  - Allowed Jobs (Add/Remove jobs dynamically)
  - Animation & Prop Settings
  - EMD Synchronization Configuration
- **Input Validation**: Server-side validation for all configuration values
- **Reset Functionality**: Ability to reset configuration to default values from config.lua
- **Reload Command**: `/intrarp-reloadconfig` to reload configuration from file
- **Documentation**: 
  - Updated README with in-game configuration instructions
  - Added TESTING.md with comprehensive testing guide
  - Added permissions.cfg.example with permission setup examples

### Changed
- **Version**: Updated from 1.2.0 to 1.3.0
- **fxmanifest.lua**: Added new client and server scripts, NUI files
- **index.html**: Integrated configuration menu into main NUI

### Technical Details
- **Server-Side**:
  - `server/config_manager.lua`: Manages configuration persistence and validation
  - Event handlers for config updates, reset, and reload
  - ACE permission checks
  
- **Client-Side**:
  - `client/config_ui.lua`: Handles configuration UI and events
  - Framework detection for proper notification integration
  - ESC key handling for menu closure
  
- **NUI**:
  - `html/config.html`: Configuration menu structure
  - `html/css/config.css`: Modern blue gradient design with responsive layout
  - `html/js/config.js`: Configuration menu logic and event handling

### Security
- ✅ CodeQL security scan passed with no alerts
- Input validation prevents injection attacks
- Permission system prevents unauthorized access
- Runtime configuration stored separately from code

### Backward Compatibility
- config.lua remains as the default configuration source
- Existing configurations continue to work without modification
- Runtime configuration inherits from config.lua on first start

### Files Added
```
.gitignore
CHANGELOG.md
TESTING.md
intraTab/client/config_ui.lua
intraTab/html/config.html
intraTab/html/css/config.css
intraTab/html/js/config.js
intraTab/permissions.cfg.example
intraTab/server/config_manager.lua
```

### Files Modified
```
README.md
intraTab/fxmanifest.lua
intraTab/html/index.html
intraTab/html/js/script.js
```

### Usage Example

```lua
-- In server.cfg, add permission for admins
add_ace group.admin intrarp.config allow

-- Players can then use in-game:
/intrarp-config        -- Opens configuration menu
/intratab-config       -- Alternative command
/intrarp-reloadconfig  -- Reloads config from file
```

### Notes
- The `runtime_config.json` file is automatically created and managed
- Configuration changes take effect immediately for all players
- No server restart required for configuration updates
- Perfect for live server management and testing
