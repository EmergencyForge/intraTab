// Global state
let isASUOpen = false;
let truppTimers = {
    1: { running: false, startTime: null, elapsedSeconds: 0, interval: null },
    2: { running: false, startTime: null, elapsedSeconds: 0, interval: null },
    3: { running: false, startTime: null, elapsedSeconds: 0, interval: null }
};

// Constants
const MAX_TIME_SECONDS = 60 * 60; // 60 minutes

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Set today's date as default in DD.MM.YYYY format
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    document.getElementById('missionDate').value = `${day}.${month}.${year}`;
});

// Listen for messages from FiveM
window.addEventListener('message', function(event) {
    const data = event.data;
    
    switch(data.type) {
        case 'openASU':
            openASU(data.characterData);
            break;
        case 'closeASU':
            closeASU();
            break;
    }
});

// Update current time display
function updateCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}`;
    }
}

// Format seconds to MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Update trupp timer display
function updateTruppDisplay(truppNum) {
    const timer = truppTimers[truppNum];
    const timeElement = document.getElementById(`trupp${truppNum}Time`);
    const progressBar = document.getElementById(`trupp${truppNum}Progress`);
    const clockHand = document.getElementById(`trupp${truppNum}Hand`);
    
    if (timeElement) {
        timeElement.textContent = formatTime(timer.elapsedSeconds);
        
        // Update warning states
        timeElement.classList.remove('warning', 'danger');
        if (timer.elapsedSeconds >= 3000) { // 50 minutes
            timeElement.classList.add('danger');
        } else if (timer.elapsedSeconds >= 2400) { // 40 minutes
            timeElement.classList.add('warning');
        }
    }
    
    if (progressBar) {
        const percentage = (timer.elapsedSeconds / MAX_TIME_SECONDS) * 100;
        progressBar.style.width = Math.min(percentage, 100) + '%';
    }
    
    // Update analog clock hand rotation (360 degrees for 60 minutes)
    if (clockHand) {
        const degrees = (timer.elapsedSeconds / MAX_TIME_SECONDS) * 360;
        clockHand.style.transform = `translate(-50%, -100%) rotate(${degrees}deg)`;
    }
}

// Start trupp timer
function startTrupp(truppNum) {
    const timer = truppTimers[truppNum];
    
    if (timer.running) {
        console.log(`Trupp ${truppNum} is already running`);
        return;
    }
    
    // Set start time if not already set
    const startTimeInput = document.getElementById(`trupp${truppNum}StartTime`);
    if (startTimeInput && !startTimeInput.value) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        startTimeInput.value = `${hours}:${minutes}`;
    }
    
    timer.running = true;
    timer.startTime = Date.now() - (timer.elapsedSeconds * 1000);
    
    timer.interval = setInterval(() => {
        if (timer.running) {
            const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
            timer.elapsedSeconds = Math.min(elapsed, MAX_TIME_SECONDS);
            updateTruppDisplay(truppNum);
            
            // Auto-stop at max time
            if (timer.elapsedSeconds >= MAX_TIME_SECONDS) {
                stopTrupp(truppNum);
            }
        }
    }, 1000);
    
    console.log(`Trupp ${truppNum} started`);
}

// Stop trupp timer
function stopTrupp(truppNum) {
    const timer = truppTimers[truppNum];
    
    if (!timer.running) {
        console.log(`Trupp ${truppNum} is not running`);
        return;
    }
    
    timer.running = false;
    
    if (timer.interval) {
        clearInterval(timer.interval);
        timer.interval = null;
    }
    
    // Set end time if not already set
    const endTimeInput = document.getElementById(`trupp${truppNum}End`);
    if (endTimeInput && !endTimeInput.value) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        endTimeInput.value = `${hours}:${minutes}`;
    }
    
    console.log(`Trupp ${truppNum} stopped at ${formatTime(timer.elapsedSeconds)}`);
}

// Reset trupp timer
function resetTrupp(truppNum) {
    stopTrupp(truppNum);
    
    const timer = truppTimers[truppNum];
    timer.elapsedSeconds = 0;
    timer.startTime = null;
    
    updateTruppDisplay(truppNum);
}

// Get trupp data
function getTruppData(truppNum) {
    return {
        truppNumber: truppNum,
        elapsedTime: truppTimers[truppNum].elapsedSeconds,
        tf: document.getElementById(`trupp${truppNum}TF`)?.value || '',
        tm1: document.getElementById(`trupp${truppNum}TM1`)?.value || '',
        tm2: document.getElementById(`trupp${truppNum}TM2`)?.value || '',
        startPressure: document.getElementById(`trupp${truppNum}StartPressure`)?.value || '',
        startTime: document.getElementById(`trupp${truppNum}StartTime`)?.value || '',
        mission: document.getElementById(`trupp${truppNum}Mission`)?.value || '',
        check1: document.getElementById(`trupp${truppNum}Check1`)?.value || '',
        check2: document.getElementById(`trupp${truppNum}Check2`)?.value || '',
        objective: document.getElementById(`trupp${truppNum}Objective`)?.value || '',
        retreat: document.getElementById(`trupp${truppNum}Retreat`)?.value || '',
        end: document.getElementById(`trupp${truppNum}End`)?.value || '',
        remarks: document.getElementById(`trupp${truppNum}Remarks`)?.value || ''
    };
}

// Get all data
function getAllData() {
    return {
        missionNumber: document.getElementById('missionNumber')?.value || '',
        missionLocation: document.getElementById('missionLocation')?.value || '',
        missionDate: document.getElementById('missionDate')?.value || '',
        supervisor: document.getElementById('supervisor')?.value || '',
        trupp1: getTruppData(1),
        trupp2: getTruppData(2),
        trupp3: getTruppData(3),
        timestamp: new Date().toISOString()
    };
}

// Clear all data
function clearAll() {
    // Skip confirmation dialog to avoid NUI freeze in FiveM
    // User can undo by not saving/sending data
    
    // Stop all timers
    for (let i = 1; i <= 3; i++) {
        resetTrupp(i);
    }
    
    // Clear all inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
    inputs.forEach(input => {
        if (input.id !== 'missionDate') {
            input.value = '';
        }
    });
    
    console.log('All data cleared');
}

// Send data to server
function sendData() {
    const data = getAllData();
    
    // Validate required fields
    if (!data.missionNumber || !data.missionLocation || !data.missionDate || !data.supervisor) {
        alert('Bitte füllen Sie alle Pflichtfelder aus:\n- Einsatznummer\n- Einsatzort\n- Einsatzdatum\n- Überwacher');
        return;
    }
    
    // Check if at least one trupp has data
    let hasTruppData = false;
    for (let i = 1; i <= 3; i++) {
        const truppData = data[`trupp${i}`];
        if (truppData.tf && truppData.tm1) {
            hasTruppData = true;
            break;
        }
    }
    
    if (!hasTruppData) {
        alert('Bitte geben Sie mindestens für einen Trupp die Pflichtfelder (TF und TM1) an!');
        return;
    }
    
    console.log('Sending ASU data:', data);
    
    // Send to FiveM backend
    fetch(`https://${GetParentResourceName()}/sendASUData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Daten erfolgreich gesendet!');
        } else {
            alert('Fehler beim Senden der Daten: ' + (result.error || 'Unbekannter Fehler'));
        }
    })
    .catch(error => {
        console.error('Error sending ASU data:', error);
        alert('Fehler beim Senden der Daten!');
    });
}

// Open ASU interface
function openASU(characterData) {
    if (isASUOpen) {
        console.log('ASU already open');
        return;
    }
    
    isASUOpen = true;
    
    const container = document.getElementById('asuContainer');
    if (container) {
        container.style.display = 'flex';
        document.body.style.cursor = 'default';
    }
    
    // Restore timer displays when reopening
    for (let i = 1; i <= 3; i++) {
        updateTruppDisplay(i);
    }
    
    console.log('ASU opened', characterData);
}

// Close ASU interface
function closeASU() {
    if (!isASUOpen) {
        return;
    }
    
    isASUOpen = false;
    
    const container = document.getElementById('asuContainer');
    if (container) {
        container.style.display = 'none';
        document.body.style.cursor = 'default';
    }
    
    // Notify FiveM
    fetch(`https://${GetParentResourceName()}/closeASU`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }).catch(error => {
        console.error('Error closing ASU:', error);
    });
    
    console.log('ASU closed');
}

// Handle ESC key
function handleEscapeKey(event) {
    if (event.key === 'Escape' && isASUOpen) {
        event.preventDefault();
        event.stopPropagation();
        closeASU();
        return false;
    }
}

// Add event listeners
document.addEventListener('keydown', handleEscapeKey, true);
document.addEventListener('keyup', function(e) {
    if (e.key === 'Escape' && isASUOpen) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}, true);

// Prevent context menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Helper function for FiveM resource name
function GetParentResourceName() {
    let resourceName = 'intraTab';
    if (window.location.href.includes('://nui_')) {
        const match = window.location.href.match(/nui_([^\/]+)/);
        if (match) resourceName = match[1];
    }
    return resourceName;
}
