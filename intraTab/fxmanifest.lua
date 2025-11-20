fx_version 'cerulean'
lua54 'on'
game 'gta5'

name 'intraTab'
description 'IntraRP FiveM Tablet Integration'
author 'intraRP & NoName.cs <kontakt@intrarp.de>'
version '1.3.0'

shared_scripts {
    'config.lua'
}

client_scripts {
    'client/main.lua',
    'client/config_ui.lua'
}

server_scripts {
    'server/main.lua',
    'server/emd_sync.lua',
    'server/config_manager.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/config.html',
    'html/css/style.css',
    'html/css/config.css',
    'html/js/script.js',
    'html/js/config.js'
}
