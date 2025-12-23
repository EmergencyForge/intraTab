-- Atemschutzüberwachung (ASU) Client-side functionality
-- This is a separate system that extends intraTab without modifying existing functionality

local isASUOpen = false
local characterData = nil

-- Framework detection
local Framework = nil
local FrameworkName = nil

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
    
    if Config.Debug then
        print("^2[ASU]^7 Client framework detected: " .. (FrameworkName or "None"))
    end
end)

-- Framework-specific notification function
local function ShowNotification(message, type)
    if FrameworkName == 'qbcore' then
        Framework.Functions.Notify(message, type or "primary")
    elseif FrameworkName == 'esx' then
        Framework.ShowNotification(message)
    else
        -- Fallback notification
        SetNotificationTextEntry("STRING")
        AddTextComponentString(message)
        DrawNotification(false, false)
    end
end

-- Framework-specific player data getter
local function GetPlayerCharacterData()
    if FrameworkName == 'qbcore' then
        local PlayerData = Framework.Functions.GetPlayerData()
        
        if PlayerData and PlayerData.charinfo then
            return {
                firstName = PlayerData.charinfo.firstname,
                lastName = PlayerData.charinfo.lastname,
                cid = PlayerData.citizenid,
                job = PlayerData.job.name
            }
        end
    elseif FrameworkName == 'esx' then
        local PlayerData = Framework.GetPlayerData()
        
        if PlayerData then
            return {
                firstName = PlayerData.firstName,
                lastName = PlayerData.lastName,
                cid = PlayerData.identifier,
                job = PlayerData.job.name
            }
        end
    end
    
    return nil
end

-- Check if player has required job
local function HasAllowedJob()
    if not Config.ASUJobs or #Config.ASUJobs == 0 then
        return true -- If no job restriction, allow all
    end
    
    local charData = GetPlayerCharacterData()
    if not charData then
        return false
    end
    
    for _, job in ipairs(Config.ASUJobs) do
        if job == charData.job then
            return true
        end
    end
    
    return false
end

-- Open ASU interface
function OpenASU()
    if isASUOpen then
        if Config.Debug then
            print("^3[ASU]^7 ASU already open")
        end
        return
    end
    
    -- Check job permission
    if not HasAllowedJob() then
        ShowNotification("Du hast keine Berechtigung für die Atemschutzüberwachung!", "error")
        if Config.Debug then
            print("^3[ASU]^7 Player job not allowed")
        end
        return
    end
    
    -- Get character data
    local charData = GetPlayerCharacterData()
    
    if not charData then
        ShowNotification("Charakterdaten konnten nicht geladen werden", "error")
        return
    end
    
    if Config.Debug then
        print("^2[ASU]^7 Opening ASU for " .. charData.firstName .. " " .. charData.lastName)
    end
    
    isASUOpen = true
    characterData = charData
    
    -- Enable NUI
    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(false)
    
    -- Send open message to NUI
    SendNUIMessage({
        type = "openASU",
        characterData = charData
    })
end

-- Close ASU interface
function CloseASU()
    if not isASUOpen then
        return
    end
    
    if Config.Debug then
        print("^2[ASU]^7 Closing ASU")
    end
    
    isASUOpen = false
    
    -- Disable NUI
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
    
    -- Send close message to NUI
    SendNUIMessage({
        type = "closeASU"
    })
end

-- NUI Callbacks
RegisterNUICallback('closeASU', function(data, cb)
    if Config.Debug then
        print("^2[ASU]^7 NUI requested to close ASU")
    end
    CloseASU()
    cb('ok')
end)

RegisterNUICallback('sendASUData', function(data, cb)
    if Config.Debug then
        print("^2[ASU]^7 NUI sending ASU data")
    end
    
    -- Send to server
    TriggerServerEvent('asu:sendData', data)
    
    -- Wait for response (we'll handle it via event)
    cb({ success = true })
end)

-- Receive response from server
RegisterNetEvent('asu:sendDataResponse')
AddEventHandler('asu:sendDataResponse', function(response)
    if response.success then
        ShowNotification(response.message or "Daten erfolgreich gesendet!", "success")
    else
        ShowNotification(response.message or "Fehler beim Senden der Daten!", "error")
    end
end)

-- Key detection thread for ESC key
CreateThread(function()
    while true do
        if isASUOpen then
            -- Handle ESC key
            DisableControlAction(0, 322, true) -- ESC key
            if IsDisabledControlJustPressed(0, 322) then
                if Config.Debug then
                    print("^2[ASU]^7 ESC pressed, closing ASU")
                end
                CloseASU()
            end
        end
        Wait(0)
    end
end)

-- Command to open ASU
RegisterCommand('asueberwachung', function()
    if Config.Debug then
        print("^2[ASU]^7 /asueberwachung command executed")
    end
    OpenASU()
end, false)

-- Alternative shorter command
RegisterCommand('asu', function()
    if Config.Debug then
        print("^2[ASU]^7 /asu command executed")
    end
    OpenASU()
end, false)

-- Export for other scripts
exports('openASU', OpenASU)
exports('closeASU', CloseASU)

-- Framework-specific events
if FrameworkName == 'qbcore' then
    RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
        characterData = nil
        if Config.Debug then
            print("^2[ASU]^7 QBCore player loaded, character data reset")
        end
    end)
elseif FrameworkName == 'esx' then
    RegisterNetEvent('esx:playerLoaded', function(xPlayer)
        characterData = nil
        if Config.Debug then
            print("^2[ASU]^7 ESX player loaded, character data reset")
        end
    end)
end

-- Resource stop - cleanup
AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        if isASUOpen then
            SetNuiFocus(false, false)
            SetNuiFocusKeepInput(false)
        end
    end
end)

if Config.Debug then
    print("^2[ASU]^7 Atemschutzüberwachung Client-System geladen")
end
