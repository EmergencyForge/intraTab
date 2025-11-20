-- Client-side configuration UI handler

local isConfigMenuOpen = false
local currentRuntimeConfig = nil

-- Local framework detection for this module
local Framework = nil
local FrameworkName = nil

-- Detect framework
Citizen.CreateThread(function()
    if Config.Framework == 'auto' then
        if GetResourceState('qb-core') == 'started' then
            Framework = exports['qb-core']:GetCoreObject()
            FrameworkName = 'qbcore'
        elseif GetResourceState('es_extended') == 'started' then
            Framework = exports['es_extended']:getSharedObject()
            FrameworkName = 'esx'
        end
    elseif Config.Framework == 'qbcore' then
        Framework = exports['qb-core']:GetCoreObject()
        FrameworkName = 'qbcore'
    elseif Config.Framework == 'esx' then
        Framework = exports['es_extended']:getSharedObject()
        FrameworkName = 'esx'
    end
end)

-- Request current config from server
function RequestRuntimeConfig()
    TriggerServerEvent('intrarp-tablet:getConfig')
end

-- Framework-specific notification function
local function ShowNotification(message, type)
    if FrameworkName == 'qbcore' and Framework then
        Framework.Functions.Notify(message, type or "primary")
    elseif FrameworkName == 'esx' and Framework then
        Framework.ShowNotification(message)
    else
        -- Fallback notification
        SetNotificationTextEntry("STRING")
        AddTextComponentString(message)
        DrawNotification(false, false)
    end
end

-- Receive config from server
RegisterNetEvent('intrarp-tablet:receiveConfig')
AddEventHandler('intrarp-tablet:receiveConfig', function(config)
    currentRuntimeConfig = config
    OpenConfigMenu()
end)

-- Update runtime config when server broadcasts changes
RegisterNetEvent('intrarp-tablet:configUpdated')
AddEventHandler('intrarp-tablet:configUpdated', function(config)
    currentRuntimeConfig = config
    
    -- Update local Config values that can be changed at runtime
    if config.Debug ~= nil then
        Config.Debug = config.Debug
    end
    if config.IntraURL then
        Config.IntraURL = config.IntraURL
    end
    if config.AllowedJobs then
        Config.AllowedJobs = config.AllowedJobs
    end
    if config.RequireItem ~= nil then
        Config.RequireItem = config.RequireItem
    end
    if config.RequiredItem then
        Config.RequiredItem = config.RequiredItem
    end
    if config.OpenKey then
        Config.OpenKey = config.OpenKey
    end
    if config.UseProp ~= nil then
        Config.UseProp = config.UseProp
    end
    
    if Config.Debug then
        print('^2[intraTab]^7 Runtime configuration updated')
    end
end)

-- Open configuration menu
function OpenConfigMenu()
    if not currentRuntimeConfig then
        if Config.Debug then
            print('No config data available')
        end
        return
    end
    
    isConfigMenuOpen = true
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openConfigMenu',
        config = currentRuntimeConfig
    })
end

-- Close configuration menu
function CloseConfigMenu()
    isConfigMenuOpen = false
    SetNuiFocus(false, false)
    
    SendNUIMessage({
        type = 'closeConfigMenu'
    })
end

-- NUI Callbacks for config menu
RegisterNUICallback('closeConfigMenu', function(data, cb)
    CloseConfigMenu()
    cb('ok')
end)

RegisterNUICallback('updateConfig', function(data, cb)
    TriggerServerEvent('intrarp-tablet:updateConfig', data)
    cb('ok')
end)

RegisterNUICallback('resetConfig', function(data, cb)
    TriggerServerEvent('intrarp-tablet:resetConfig')
    cb('ok')
end)

RegisterNUICallback('addAllowedJob', function(data, cb)
    if data.job and data.job ~= '' then
        if not currentRuntimeConfig.AllowedJobs then
            currentRuntimeConfig.AllowedJobs = {}
        end
        
        local jobExists = false
        for _, job in ipairs(currentRuntimeConfig.AllowedJobs) do
            if job == data.job then
                jobExists = true
                break
            end
        end
        
        if not jobExists then
            table.insert(currentRuntimeConfig.AllowedJobs, data.job)
            TriggerServerEvent('intrarp-tablet:updateConfig', {
                key = 'AllowedJobs',
                value = currentRuntimeConfig.AllowedJobs
            })
        end
    end
    cb('ok')
end)

RegisterNUICallback('removeAllowedJob', function(data, cb)
    if data.job and currentRuntimeConfig.AllowedJobs then
        for i, job in ipairs(currentRuntimeConfig.AllowedJobs) do
            if job == data.job then
                table.remove(currentRuntimeConfig.AllowedJobs, i)
                TriggerServerEvent('intrarp-tablet:updateConfig', {
                    key = 'AllowedJobs',
                    value = currentRuntimeConfig.AllowedJobs
                })
                break
            end
        end
    end
    cb('ok')
end)

-- Command to open config menu
RegisterCommand('intrarp-config', function()
    if Config.Debug then
        print('Opening config menu...')
    end
    RequestRuntimeConfig()
end, false)

-- Alternative command
RegisterCommand('intratab-config', function()
    RequestRuntimeConfig()
end, false)

-- ESC key handling for config menu
CreateThread(function()
    while true do
        Wait(0)
        if isConfigMenuOpen then
            DisableControlAction(0, 322, true) -- ESC key
            if IsDisabledControlJustPressed(0, 322) then
                CloseConfigMenu()
            end
        else
            Wait(500)
        end
    end
end)

-- Key mapping
RegisterKeyMapping('intrarp-config', 'Open IntraTab Configuration', 'keyboard', '')
