let isTabletOpen = false;
let characterData = null;
let IntraURL = null;
let navigationHistory = [];
let historyIndex = -1;
let currentUrl = "";

window.addEventListener("message", function (event) {
  const data = event.data;

  switch (data.type) {
    case "openTablet":
      openTablet(data.characterData, data.IntraURL);
      break;

    case "setCharacterData":
      setCharacterData(data.characterData);
      break;

    case "closeTablet":
      closeTablet();
      break;
  }
});

function openTablet(charData, url) {
  console.log("Opening tablet with data:", charData, "URL:", url);
  
  characterData = charData;
  isTabletOpen = true;

  if (url) {
    IntraURL = url;
  }

  const tabletContainer = document.getElementById("tabletContainer");
  const loadingScreen = document.getElementById("loadingScreen");
  const tabletScreen = document.getElementById("tabletScreen");

  if (!tabletContainer) {
    console.error("Tablet container element not found!");
    return;
  }

  // Always show the tablet container
  tabletContainer.style.display = "flex";
  document.body.style.cursor = "default";
  tabletContainer.style.cursor = "default";
  console.log("Tablet container displayed");

  // Check if we can restore existing content (src must be a valid URL, not empty or about:blank)
  const existingSrc = tabletScreen ? tabletScreen.src : "";
  const nuiPageUrl = window.location.href;
  const hasValidContent = existingSrc && 
                          existingSrc !== "" && 
                          existingSrc !== "about:blank" && 
                          existingSrc !== nuiPageUrl;
  
  if (tabletScreen && hasValidContent) {
    console.log("Restoring tablet with existing content:", existingSrc);
    if (loadingScreen) loadingScreen.style.display = "none";
    tabletScreen.style.display = "block";
    updateNavigationButtons();
    return;
  }

  if (loadingScreen) loadingScreen.style.display = "flex";
  if (tabletScreen) tabletScreen.style.display = "none";

  navigationHistory = [];
  historyIndex = -1;
  currentUrl = "";
  updateNavigationButtons();

  if (charData && charData.firstName && charData.lastName) {
    loadIntraSystem(charData);
  } else {
    const loadingText = document.getElementById("loadingText");
    if (loadingText) loadingText.textContent = "Waiting for character data...";

    fetch(`https://${GetParentResourceName()}/getCharacterData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.firstName && data.lastName) {
          loadIntraSystem(data);
        } else {
          if (loadingText)
            loadingText.textContent =
              "Error: " + (data.error || "No character data");
        }
      })
      .catch((error) => {
        console.error("Error getting character data:", error);
        if (loadingText) loadingText.textContent = "Error connecting to server";
      });
  }
}

function setCharacterData(charData) {
  console.log("Setting character data:", charData);
  characterData = charData;

  if (isTabletOpen && charData && charData.firstName && charData.lastName) {
    loadIntraSystem(charData);
  }
}

function loadIntraSystem(charData) {
  const loadingText = document.getElementById("loadingText");
  
  // Check if IntraURL is configured
  if (!IntraURL || IntraURL.trim() === "") {
    console.error("IntraURL is not configured!");
    if (loadingText) {
      loadingText.textContent = "Error: Tablet URL not configured. Please check Config.IntraURL.";
    }
    return;
  }
  
  if (loadingText) {
    loadingText.textContent =
      "Loading system for " +
      charData.firstName +
      " " +
      charData.lastName +
      "...";
  }

  const characterName = charData.firstName + " " + charData.lastName;
  const url = IntraURL + "?charactername=" + encodeURIComponent(characterName);
  
  console.log("Loading IntraSystem with URL:", url);

  addToHistory(url);
  currentUrl = url;
  updatePageTitle("IntraRP Verwaltungsportal");

  const iframe = document.getElementById("tabletScreen");
  const loadingScreen = document.getElementById("loadingScreen");

  if (iframe) {
    iframe.src = url;

    setTimeout(() => {
      if (loadingScreen) loadingScreen.style.display = "none";
      iframe.style.display = "block";
      updateNavigationButtons();
    }, 2000);
  }
}

function closeTablet() {
  console.log("Closing tablet");

  isTabletOpen = false;
  const tabletContainer = document.getElementById("tabletContainer");

  if (tabletContainer) {
    tabletContainer.style.display = "none";
    document.body.style.cursor = "default";
  }

  fetch(`https://${GetParentResourceName()}/closeTablet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  }).catch((error) => {
    console.error("Error closing tablet:", error);
  });
}

function addToHistory(url) {
  if (historyIndex < navigationHistory.length - 1) {
    navigationHistory = navigationHistory.slice(0, historyIndex + 1);
  }

  navigationHistory.push(url);
  historyIndex = navigationHistory.length - 1;

  if (navigationHistory.length > 50) {
    navigationHistory = navigationHistory.slice(-50);
    historyIndex = navigationHistory.length - 1;
  }
}

function updateNavigationButtons() {
  const backBtn = document.getElementById("backBtn");

  if (backBtn) {
    if (historyIndex > 0) {
      backBtn.disabled = false;
      backBtn.style.opacity = "1";
    } else {
      backBtn.disabled = true;
      backBtn.style.opacity = "0.4";
    }
  }
}

function updatePageTitle(title) {
  const pageTitle = document.getElementById("pageTitle");
  if (pageTitle) {
    pageTitle.textContent = title;
  }
}

function goBack() {
  if (!isTabletOpen || historyIndex <= 0) {
    console.log("Cannot go back");
    return;
  }

  historyIndex--;
  const previousUrl = navigationHistory[historyIndex];

  if (previousUrl) {
    currentUrl = previousUrl;
    const iframe = document.getElementById("tabletScreen");
    const loadingScreen = document.getElementById("loadingScreen");

    if (iframe && loadingScreen) {
      loadingScreen.style.display = "flex";
      iframe.style.display = "none";
      iframe.src = previousUrl;

      setTimeout(() => {
        loadingScreen.style.display = "none";
        iframe.style.display = "block";
      }, 1000);
    }

    updateNavigationButtons();
    console.log("Navigated back to:", previousUrl);
  }
}

function goHome() {
  if (!isTabletOpen || !characterData) {
    console.log("Cannot go home");
    return;
  }

  const characterName = characterData.firstName + " " + characterData.lastName;
  const homeUrl =
    IntraURL + "?charactername=" + encodeURIComponent(characterName);

  addToHistory(homeUrl);
  currentUrl = homeUrl;

  const iframe = document.getElementById("tabletScreen");
  const loadingScreen = document.getElementById("loadingScreen");

  if (iframe && loadingScreen) {
    loadingScreen.style.display = "flex";
    iframe.style.display = "none";
    iframe.src = homeUrl;

    setTimeout(() => {
      loadingScreen.style.display = "none";
      iframe.style.display = "block";
    }, 1000);
  }

  updateNavigationButtons();
  updatePageTitle("IntraRP Verwaltungsportal");
  console.log("Navigated to home:", homeUrl);
}

function refreshPage() {
  if (!isTabletOpen || !currentUrl) {
    console.log("Cannot refresh");
    return;
  }

  const iframe = document.getElementById("tabletScreen");
  const loadingScreen = document.getElementById("loadingScreen");

  if (iframe && loadingScreen) {
    loadingScreen.style.display = "flex";
    iframe.style.display = "none";
    iframe.src = "about:blank";

    setTimeout(() => {
      iframe.src = currentUrl;
      setTimeout(() => {
        loadingScreen.style.display = "none";
        iframe.style.display = "block";
      }, 1000);
    }, 100);
  }

  console.log("Refreshed page:", currentUrl);
}

function handleEscapeKey(event) {
  if (event.key === "Escape" && isTabletOpen) {
    event.preventDefault();
    event.stopPropagation();
    closeTablet();
    return false;
  }
}

function addEventListeners() {
  document.addEventListener("keydown", handleEscapeKey, true);
  document.addEventListener(
    "keyup",
    function (e) {
      if (e.key === "Escape" && isTabletOpen) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    true
  );

  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    return false;
  });

  document.addEventListener("mousemove", function () {
    if (isTabletOpen) {
      document.body.style.cursor = "default";
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addEventListeners);
} else {
  addEventListeners();
}
