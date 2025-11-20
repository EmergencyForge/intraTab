-- Configuration Manager
-- Handles runtime configuration updates and persistence

local RuntimeConfig = {}
local configFilePath = GetResourcePath(GetCurrentResourceName()) .. '/runtime_config.json'

-- Initialize runtime config with values from Config
local function InitializeRuntimeConfig()
    RuntimeConfig = {
        Framework = Config.Framework,
        IntraURL = Config.IntraURL,
        Debug = Config.Debug,
        AllowedJobs = Config.AllowedJobs,
        RequireItem = Config.RequireItem,
        RequiredItem = Config.RequiredItem,
        OpenKey = Config.OpenKey,
        EMDSync = {
            Enabled = Config.EMDSync.Enabled,
            PHPEndpoint = Config.EMDSync.PHPEndpoint,
            APIKey = Config.EMDSync.APIKey,
            SyncInterval = Config.EMDSync.SyncInterval
        },
        Animation = {
            dict = Config.Animation.dict,
            anim = Config.Animation.anim,
            flag = Config.Animation.flag
        },
        UseProp = Config.UseProp,
        Prop = {
            model = Config.Prop.model,
            bone = Config.Prop.bone,
            offset = Config.Prop.offset
        }
    }
end

-- Load configuration from file
local function LoadConfigFromFile()
    local file = io.open(configFilePath, 'r')
    if file then
        local content = file:read('*all')
        file:close()
        
        local success, decoded = pcall(json.decode, content)
        if success and decoded then
            RuntimeConfig = decoded
            print('^2[intraTab Config]^7 Loaded runtime configuration from file')
            return true
        else
            print('^3[intraTab Config]^7 Failed to decode config file, using defaults')
        end
    end
    return false
end

-- Save configuration to file
local function SaveConfigToFile()
    local success, encoded = pcall(json.encode, RuntimeConfig)
    if not success then
        print('^1[intraTab Config]^7 Failed to encode configuration')
        return false
    end
    
    local file = io.open(configFilePath, 'w')
    if file then
        file:write(encoded)
        file:close()
        print('^2[intraTab Config]^7 Saved runtime configuration to file')
        return true
    else
        print('^1[intraTab Config]^7 Failed to open config file for writing')
        return false
    end
end

-- Get current runtime configuration
function GetRuntimeConfig()
    return RuntimeConfig
end

-- Update specific configuration value
function UpdateConfigValue(key, value, subkey)
    if subkey then
        -- Handle nested config (e.g., EMDSync.Enabled)
        if RuntimeConfig[key] then
            RuntimeConfig[key][subkey] = value
        end
    else
        RuntimeConfig[key] = value
    end
    
    -- Save to file
    SaveConfigToFile()
    
    -- Broadcast to all clients
    TriggerClientEvent('intrarp-tablet:configUpdated', -1, RuntimeConfig)
    
    print('^2[intraTab Config]^7 Updated config: ' .. key .. (subkey and ('.' .. subkey) or '') .. ' = ' .. tostring(value))
end

-- Check if player has permission to modify config
function HasConfigPermission(source)
    return IsPlayerAceAllowed(source, 'intrarp.config') or IsPlayerAceAllowed(source, 'command')
end

-- Server event to get current config
RegisterServerEvent('intrarp-tablet:getConfig')
AddEventHandler('intrarp-tablet:getConfig', function()
    local src = source
    
    if HasConfigPermission(src) then
        TriggerClientEvent('intrarp-tablet:receiveConfig', src, RuntimeConfig)
    else
        TriggerClientEvent('intrarp-tablet:notify', src, 'You do not have permission to access configuration', 'error')
    end
end)

-- Server event to update config
RegisterServerEvent('intrarp-tablet:updateConfig')
AddEventHandler('intrarp-tablet:updateConfig', function(configData)
    local src = source
    
    if not HasConfigPermission(src) then
        TriggerClientEvent('intrarp-tablet:notify', src, 'You do not have permission to modify configuration', 'error')
        return
    end
    
    -- Validate and update configuration
    if configData.key and configData.value ~= nil then
        UpdateConfigValue(configData.key, configData.value, configData.subkey)
        TriggerClientEvent('intrarp-tablet:notify', src, 'Configuration updated successfully', 'success')
    end
end)

-- Server event to reset config to defaults
RegisterServerEvent('intrarp-tablet:resetConfig')
AddEventHandler('intrarp-tablet:resetConfig', function()
    local src = source
    
    if not HasConfigPermission(src) then
        TriggerClientEvent('intrarp-tablet:notify', src, 'You do not have permission to reset configuration', 'error')
        return
    end
    
    InitializeRuntimeConfig()
    SaveConfigToFile()
    TriggerClientEvent('intrarp-tablet:configUpdated', -1, RuntimeConfig)
    TriggerClientEvent('intrarp-tablet:notify', src, 'Configuration reset to defaults', 'success')
    
    print('^2[intraTab Config]^7 Configuration reset to defaults by player ' .. src)
end)

-- Command to reload config
RegisterCommand('intrarp-reloadconfig', function(source, args)
    if source == 0 or HasConfigPermission(source) then
        if LoadConfigFromFile() then
            TriggerClientEvent('intrarp-tablet:configUpdated', -1, RuntimeConfig)
            if source > 0 then
                TriggerClientEvent('intrarp-tablet:notify', source, 'Configuration reloaded from file', 'success')
            else
                print('^2[intraTab Config]^7 Configuration reloaded from file')
            end
        else
            if source > 0 then
                TriggerClientEvent('intrarp-tablet:notify', source, 'Failed to reload configuration', 'error')
            end
        end
    end
end, false)

-- Initialize on resource start
CreateThread(function()
    Wait(1000) -- Wait for Config to be loaded
    
    -- Try to load from file, otherwise initialize from Config
    if not LoadConfigFromFile() then
        InitializeRuntimeConfig()
        SaveConfigToFile()
    end
    
    print('^2[intraTab Config]^7 Configuration manager initialized')
    print('^2[intraTab Config]^7 IntraURL: ' .. RuntimeConfig.IntraURL)
    print('^2[intraTab Config]^7 Framework: ' .. RuntimeConfig.Framework)
end)

-- Export functions
exports('GetRuntimeConfig', GetRuntimeConfig)
exports('UpdateConfigValue', UpdateConfigValue)
exports('HasConfigPermission', HasConfigPermission)
