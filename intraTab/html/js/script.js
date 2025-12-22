let isTabletOpen = false;
let characterData = null;
let IntraURL = null;
let navigationHistory = [];
let historyIndex = -1;
let currentUrl = "";

// Funktion zum Sicherstellen, dass die URL HTTPS verwendet (FiveM-Anforderung)
function ensureHttps(url) {
  if (!url) {
    console.warn("[intraTab] ensureHttps: URL is null or undefined");
    return url;
  }

  const originalUrl = url;

  // Entferne führende/trailing Leerzeichen
  url = url.trim();

  // Wenn die URL mit http:// beginnt, ersetze es durch https://
  if (url.toLowerCase().startsWith("http://")) {
    url = url.replace(/^http:\/\//i, "https://");
    console.warn(
      "[intraTab] ⚠️  URL converted from HTTP to HTTPS:",
      originalUrl,
      "→",
      url
    );
  }
  // Wenn die URL nicht mit einem Protokoll beginnt, füge https:// hinzu
  else if (
    !url.toLowerCase().startsWith("https://") &&
    !url.toLowerCase().startsWith("//")
  ) {
    url = "https://" + url;
    console.log("[intraTab] Added HTTPS prefix:", originalUrl, "→", url);
  } else {
    console.log("[intraTab] ✓ URL already secure:", url);
  }

  // Füge trailing slash hinzu, falls URL auf einen Pfad endet (verhindert HTTP-Redirects)
  if (
    url.indexOf("?") === -1 &&
    url.indexOf("#") === -1 &&
    !url.endsWith("/")
  ) {
    // Prüfe ob es wie ein Verzeichnis aussieht (kein Dateityp am Ende)
    const lastSegment = url.split("/").pop();
    if (lastSegment && !lastSegment.includes(".")) {
      url = url + "/";
      console.log("[intraTab] Added trailing slash:", url);
    }
  }

  return url;
}

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
  characterData = charData;
  isTabletOpen = true;

  console.log("[intraTab] openTablet called with URL:", url);

  if (url) {
    IntraURL = ensureHttps(url);
    console.log("[intraTab] IntraURL set to:", IntraURL);
  }

  const tabletContainer = document.getElementById("tabletContainer");
  const loadingScreen = document.getElementById("loadingScreen");
  const tabletScreen = document.getElementById("tabletScreen");

  if (tabletContainer) {
    tabletContainer.style.display = "flex";
    document.body.style.cursor = "default";
    tabletContainer.style.cursor = "default";
  }

  if (tabletScreen && tabletScreen.src && tabletScreen.src !== "") {
    console.log(
      "[intraTab] Restoring tablet with existing content, checking URL:",
      tabletScreen.src
    );

    // Validate existing iframe src is HTTPS
    if (tabletScreen.src.toLowerCase().startsWith("http://")) {
      const secureUrl = tabletScreen.src.replace(/^http:\/\//i, "https://");
      console.warn(
        "[intraTab] ⚠️  Iframe had insecure URL, fixing:",
        tabletScreen.src,
        "→",
        secureUrl
      );
      tabletScreen.src = secureUrl;
    }

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
  if (loadingText) {
    loadingText.textContent =
      "Loading system for " +
      charData.firstName +
      " " +
      charData.lastName +
      "...";
  }

  const url = ensureHttps(IntraURL);
  console.log("[intraTab] loadIntraSystem: Final URL to load:", url);

  addToHistory(url);
  currentUrl = url;
  updatePageTitle("IntraRP Verwaltungsportal");

  const iframe = document.getElementById("tabletScreen");
  const loadingScreen = document.getElementById("loadingScreen");

  if (iframe) {
    console.log("[intraTab] Setting iframe.src to:", url);
    iframe.src = url;

    // Überwache iframe src Änderungen (falls Website auf HTTP redirected)
    const checkIframeSrc = () => {
      try {
        const currentSrc = iframe.src;
        if (currentSrc && currentSrc.toLowerCase().startsWith("http://")) {
          console.error(
            "[intraTab] 🚨 CRITICAL: Iframe redirected to HTTP, forcing HTTPS:",
            currentSrc
          );
          const secureSrc = currentSrc.replace(/^http:\/\//i, "https://");
          iframe.src = secureSrc;
        }
      } catch (e) {
        // Cross-origin Fehler ignorieren
      }
    };

    // Prüfe nach kurzer Verzögerung
    setTimeout(checkIframeSrc, 500);
    setTimeout(checkIframeSrc, 1500);

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
