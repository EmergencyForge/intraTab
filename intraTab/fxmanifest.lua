fx_version 'cerulean'
lua54 'on'
game 'gta5'

name 'intraTab'
description 'intraTab + NOTFpad'
author 'EmergencyForge.de'
version '1.2.0'

shared_scripts {
    'config.lua'
}

client_scripts {
    'client/main.lua',
    'client/asu_client.lua'
}

server_scripts {
    'server/main.lua',
    'server/emd_sync.lua',
    'server/asu_server.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/css/style.css',
    'html/js/script.js',
    'html/asueberwachung.html',
    'html/css/asueberwachung.css',
    'html/js/asueberwachung.js'
}

data_file 'DLC_ITYP_REQUEST' 'stream/notfpad.ytyp'