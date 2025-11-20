let currentConfig = null;

// FiveM NUI helper function
function GetParentResourceName() {
  if (window.GetParentResourceName) {
    return window.GetParentResourceName();
  }
  // Fallback for testing
  const url = new URL(window.location.href);
  const match = url.pathname.match(/\/([^/]+)\/html\//);
  return match ? match[1] : 'intraTab';
}

window.addEventListener('message', function(event) {
    const data = event.data;
    
    switch(data.type) {
        case 'openConfigMenu':
            openConfigMenu(data.config);
            break;
        case 'closeConfigMenu':
            closeConfigMenu();
            break;
    }
});

function openConfigMenu(config) {
    currentConfig = config;
    
    const container = document.getElementById('configContainer');
    if (container) {
        container.style.display = 'flex';
    }
    
    // Populate form with current config values
    populateConfigForm(config);
}

function closeConfigMenu() {
    const container = document.getElementById('configContainer');
    if (container) {
        container.style.display = 'none';
    }
    
    fetch(`https://${GetParentResourceName()}/closeConfigMenu`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
}

function closeConfig() {
    closeConfigMenu();
}

function populateConfigForm(config) {
    // General settings
    document.getElementById('framework').value = config.Framework || 'auto';
    document.getElementById('intraURL').value = config.IntraURL || '';
    document.getElementById('debug').checked = config.Debug || false;
    document.getElementById('openKey').value = config.OpenKey || 'F9';
    
    // Item requirements
    document.getElementById('requireItem').checked = config.RequireItem || false;
    document.getElementById('requiredItem').value = config.RequiredItem || 'tablet';
    
    // Allowed jobs
    populateJobsList(config.AllowedJobs || []);
    
    // Animation & Prop
    document.getElementById('useProp').checked = config.UseProp || false;
    document.getElementById('propModel').value = config.Prop?.model || 'prop_cs_tablet';
    
    // EMD Sync
    document.getElementById('emdEnabled').checked = config.EMDSync?.Enabled || false;
    document.getElementById('emdEndpoint').value = config.EMDSync?.PHPEndpoint || '';
    document.getElementById('emdApiKey').value = config.EMDSync?.APIKey || '';
    document.getElementById('emdInterval').value = config.EMDSync?.SyncInterval || 30000;
}

function populateJobsList(jobs) {
    const jobsList = document.getElementById('jobsList');
    jobsList.innerHTML = '';
    
    jobs.forEach(job => {
        const tag = document.createElement('div');
        tag.className = 'job-tag';
        tag.innerHTML = `
            <span>${job}</span>
            <button class="remove-btn" onclick="removeJob('${job}')">×</button>
        `;
        jobsList.appendChild(tag);
    });
}

function updateConfig(key, value) {
    fetch(`https://${GetParentResourceName()}/updateConfig`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key: key,
            value: value
        })
    });
    
    // Update local config
    if (currentConfig) {
        currentConfig[key] = value;
    }
}

function updateNestedConfig(key, subkey, value) {
    fetch(`https://${GetParentResourceName()}/updateConfig`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key: key,
            subkey: subkey,
            value: value
        })
    });
    
    // Update local config
    if (currentConfig) {
        if (!currentConfig[key]) {
            currentConfig[key] = {};
        }
        currentConfig[key][subkey] = value;
    }
}

function addJob() {
    const input = document.getElementById('newJob');
    const job = input.value.trim();
    
    if (job) {
        fetch(`https://${GetParentResourceName()}/addAllowedJob`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                job: job
            })
        }).then(() => {
            // Update local list
            if (!currentConfig.AllowedJobs) {
                currentConfig.AllowedJobs = [];
            }
            if (!currentConfig.AllowedJobs.includes(job)) {
                currentConfig.AllowedJobs.push(job);
                populateJobsList(currentConfig.AllowedJobs);
            }
            input.value = '';
        });
    }
}

function removeJob(job) {
    fetch(`https://${GetParentResourceName()}/removeAllowedJob`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            job: job
        })
    }).then(() => {
        // Update local list
        if (currentConfig.AllowedJobs) {
            const index = currentConfig.AllowedJobs.indexOf(job);
            if (index > -1) {
                currentConfig.AllowedJobs.splice(index, 1);
                populateJobsList(currentConfig.AllowedJobs);
            }
        }
    });
}

function resetConfig() {
    if (confirm('Sind Sie sicher, dass Sie die Konfiguration auf die Standardwerte zurücksetzen möchten?')) {
        fetch(`https://${GetParentResourceName()}/resetConfig`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        }).then(() => {
            setTimeout(() => {
                closeConfigMenu();
            }, 1000);
        });
    }
}

// ESC key handler
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const container = document.getElementById('configContainer');
        if (container && container.style.display === 'flex') {
            closeConfig();
        }
    }
});

// Enter key handler for job input
document.addEventListener('DOMContentLoaded', function() {
    const newJobInput = document.getElementById('newJob');
    if (newJobInput) {
        newJobInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                addJob();
            }
        });
    }
});
