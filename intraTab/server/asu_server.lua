-- Atemschutzüberwachung (ASU) Server-side functionality
-- This is a separate system that extends intraTab without modifying existing functionality

local Framework = nil
local FrameworkName = nil

-- Auto-detect framework
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

-- Store ASU data temporarily (in production, this should be saved to database)
local asuProtocols = {}

-- Function to ensure HTTPS URL
local function EnsureHttps(url)
    if not url or url == "" then
        return url
    end
    
    url = url:match("^%s*(.-)%s*$")
    
    if url:lower():sub(1, 7) == "http://" then
        url = "https://" .. url:sub(8)
    elseif url:lower():sub(1, 8) ~= "https://" and url:sub(1, 2) ~= "//" then
        url = "https://" .. url
    end
    
    return url
end

-- Send ASU data to API endpoint
local function SendASUDataToAPI(data)
    if not Config.ASUSync or not Config.ASUSync.Enabled then
        if Config.Debug then
            print("^3[ASU-Sync]^7 ASU-Sync ist deaktiviert")
        end
        return false
    end
    
    local endpoint = EnsureHttps(Config.ASUSync.APIEndpoint)
    
    if not endpoint or endpoint == "" then
        print("^1[ASU-Sync]^7 Kein API-Endpunkt konfiguriert!")
        return false
    end
    
    if Config.Debug then
        print("^2[ASU-Sync]^7 Sende Daten an API-Endpunkt: " .. endpoint)
    end
    
    local payload = {
        intraRP_API_Key = Config.EMDSync.APIKey,
        timestamp = os.time(),
        type = 'asu_protocol',
        data = data
    }
    
    PerformHttpRequest(endpoint, function(statusCode, response, headers)
        if statusCode == 200 then
            if Config.Debug then
                print("^2[ASU-Sync]^7 Daten erfolgreich gesendet! Antwort: " .. response)
            end
        else
            print("^1[ASU-Sync]^7 Fehler beim Senden der Daten. Statuscode: " .. statusCode)
            if statusCode == 401 then
                print("^1[ASU-Sync]^7 API-Key ist ungültig!")
            end
            if Config.Debug and response then
                print("^1[ASU-Sync]^7 Antwort: " .. response)
            end
        end
    end, 'POST', json.encode(payload), {
        ['Content-Type'] = 'application/json',
        ['User-Agent'] = 'FiveM-ASUSync/1.0'
    })
    
    return true
end

-- Event: Receive ASU data from client
RegisterNetEvent('asu:sendData')
AddEventHandler('asu:sendData', function(data)
    local src = source
    
    -- Check if ASU system is enabled
    if not Config.ASUEnabled then
        if Config.Debug then
            print("^3[ASU]^7 ASU system is disabled, rejecting data from player " .. src)
        end
        TriggerClientEvent('asu:sendDataResponse', src, {
            success = false,
            message = "Das Atemschutzüberwachungssystem ist deaktiviert"
        })
        return
    end
    
    if Config.Debug then
        print("^2[ASU]^7 Daten von Spieler " .. src .. " empfangen")
        print("^2[ASU]^7 Einsatznummer: " .. (data.missionNumber or "N/A"))
    end
    
    -- Store protocol
    local protocolId = data.missionNumber .. "_" .. os.time()
    asuProtocols[protocolId] = {
        data = data,
        source = src,
        timestamp = os.time()
    }
    
    -- Send to API if enabled
    local success = false
    if Config.ASUSync and Config.ASUSync.Enabled then
        success = SendASUDataToAPI(data)
    else
        -- Even if API sync is disabled, we consider it a success for local storage
        success = true
    end
    
    -- Send response back to client
    TriggerClientEvent('asu:sendDataResponse', src, {
        success = success,
        protocolId = protocolId,
        message = success and "Daten erfolgreich gespeichert" or "Fehler beim Speichern"
    })
end)

-- Command to view stored protocols (admin only)
RegisterCommand('asuprotokolle', function(source, args)
    if not Config.ASUEnabled then
        print("^3[ASU]^7 ASU system is disabled")
        return
    end
    
    if source == 0 or IsPlayerAceAllowed(source, 'command.asuprotokolle') then
        print("^2[ASU]^7 Gespeicherte Protokolle:")
        local count = 0
        for id, protocol in pairs(asuProtocols) do
            count = count + 1
            print("^3" .. count .. ".^7 ID: " .. id)
            print("   Einsatznummer: " .. (protocol.data.missionNumber or "N/A"))
            print("   Überwacher: " .. (protocol.data.supervisor or "N/A"))
            print("   Zeitstempel: " .. os.date("%Y-%m-%d %H:%M:%S", protocol.timestamp))
        end
        if count == 0 then
            print("^3[ASU]^7 Keine Protokolle gespeichert")
        end
    end
end, true)

-- Export for other scripts
exports('sendASUData', SendASUDataToAPI)
exports('getASUProtocols', function()
    return asuProtocols
end)

if Config.Debug then
    if Config.ASUEnabled then
        print("^2[ASU]^7 Atemschutzüberwachung Server-System geladen")
        print("^2[ASU]^7 Framework: " .. (FrameworkName or "None"))
    else
        print("^3[ASU]^7 Atemschutzüberwachung Server-System ist deaktiviert")
    end
end
