// ==========================================
// MASTER.JS - NUI Orchestrierung für mehrere Tablets
// ==========================================

let currentTablet = null;
let isTabletOpen = false;
let characterData = null;

console.log("[Master] Loading master.js...");

// ==========================================
// TABLET CONTROL FUNCTIONS
// ==========================================

/**
 * Zeigt ein Tablet an und versteckt andere
 * eNOTF → #tabletContainer
 * FireTab → #firetabContainer
 */
function showTablet(tabletType) {
  const enotf = document.getElementById("tabletContainer");
  const firetab = document.getElementById("firetabContainer");

  // Verstecke alle erst
  if (enotf) enotf.classList.remove("active");
  if (firetab) firetab.classList.remove("active");

  // Zeige das richtige
  const normalized = (tabletType + "").toLowerCase();

  if (normalized === "enotf") {
    if (enotf) enotf.classList.add("active");
    currentTablet = "enotf";
  } else if (normalized === "firetab") {
    if (firetab) firetab.classList.add("active");
    currentTablet = "firetab";
  }

  isTabletOpen = true;
  console.log(`[Master] Showing ${currentTablet} tablet`);
}

function hideAllTablets() {
  const enotf = document.getElementById("tabletContainer");
  const firetab = document.getElementById("firetabContainer");

  if (enotf) enotf.classList.remove("active");
  if (firetab) firetab.classList.remove("active");

  currentTablet = null;
  isTabletOpen = false;
  console.log("[Master] All tablets hidden");
}

function closeTablet() {
  console.log("[Master] closeTablet() called");
  hideAllTablets();

  // Reset cursor explicitly
  document.body.style.cursor = "none";

  // Notify server
  // Use dynamic resource name to ensure correct NUI callback routing
  fetch(`https://${GetParentResourceName()}/closeTablet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tabletType: currentTablet }),
  }).catch((err) => console.log("[Master] Fetch error:", err));
}

function goHome() {
  console.log("[Master] goHome() called for:", currentTablet);
}

// ==========================================
// NUI MESSAGE LISTENER
// ==========================================

window.addEventListener("message", function (event) {
  const data = event.data;

  if (!data) return;

  console.log("[Master] NUI message received:", data);

  // Handle openTablet message from server
  if (data.type === "openTablet") {
    const tabletType = data.tabletType; // "eNOTF" or "FireTab"
    const charData = data.characterData;
    const url = data.url;

    const normalized = (tabletType + "").toLowerCase();

    if (normalized === "firetab") {
      // FireTab - use firetab.js function
      showTablet("firetab");
      if (
        window.openFireTablet &&
        typeof window.openFireTablet === "function"
      ) {
        console.log("[Master] Calling openFireTablet");
        window.openFireTablet(charData, url);
      } else {
        console.error("[Master] openFireTablet function not found!");
      }
    } else if (normalized === "enotf") {
      // eNOTF - use script.js function
      showTablet("enotf");
      if (window.openTablet && typeof window.openTablet === "function") {
        console.log("[Master] Calling openTablet for enotf");
        window.openTablet(charData, url);
      }
    }
  }

  // Handle close messages
  else if (data.type === "closeTablet") {
    const reqType = (data.tabletType || "").toLowerCase();
    const curType = (currentTablet || "").toLowerCase();

    // Only close if type matches current tablet or no type provided
    if (!reqType || !curType || reqType === curType) {
      console.log(
        `[Master] closeTablet message for ${reqType || "any"}, closing.`
      );
      closeTablet();
    } else {
      console.log(
        `[Master] closeTablet message for ${reqType}, ignored; current=${curType}`
      );
    }
  }
});

// Note: ESC handling is managed in client Lua to prevent unintended
// auto-close events from the DOM. NUI will only close via explicit
// messages or UI controls.

console.log("[Master] Initialization complete");
