(function () {
  const USERNAME = "demo";
  const PASSWORD = "Routing2025!";
  const STORAGE_KEY = "dhlDemoLoggedIn";

  function isLoggedIn() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }

  function setLoggedIn(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
    } catch {
      // Ignorieren, falls localStorage nicht verfügbar ist
    }
  }

  function updateLogoutVisibility(loggedIn) {
    const btn = document.getElementById("logout-btn");
    if (!btn) return;
    if (loggedIn) {
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
    }
  }

  function showApp() {
    const loginScreen = document.getElementById("login-screen");
    const appContainer = document.getElementById("app-container");

    // Login-Screen komplett entfernen
    if (loginScreen) loginScreen.remove();
    if (appContainer) appContainer.classList.remove("hidden");

    updateLogoutVisibility(true);
  }

  function showLogin() {
    const loginScreen = document.getElementById("login-screen");
    const appContainer = document.getElementById("app-container");

    if (loginScreen) loginScreen.classList.remove("hidden");
    if (appContainer) appContainer.classList.add("hidden");

    updateLogoutVisibility(false);
  }

  function initLogout() {
    const btn = document.getElementById("logout-btn");
    if (!btn) return;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      setLoggedIn(false);
      // Seite neu laden, damit wieder der Login-Screen erscheint
      window.location.reload();
    });

    // Sichtbarkeit initial je nach Zustand setzen
    updateLogoutVisibility(isLoggedIn());
  }

  function initLogin() {
    const loginScreen = document.getElementById("login-screen");
    const appContainer = document.getElementById("app-container");
    const userInput = document.getElementById("login-username");
    const passInput = document.getElementById("login-password");
    const loginBtn = document.getElementById("login-btn");
    const errorDiv = document.getElementById("login-error");

    if (!loginScreen || !appContainer || !userInput || !passInput || !loginBtn) {
      return;
    }

    // Bereits eingeloggt?
    if (isLoggedIn()) {
      showApp();
      return;
    } else {
      showLogin();
    }

    function handleLogin() {
      const u = (userInput.value || "").trim();
      const p = passInput.value || "";

      if (u === USERNAME && p === PASSWORD) {
        setLoggedIn(true);
        if (errorDiv) errorDiv.textContent = "";
        showApp();
      } else {
        setLoggedIn(false);
        if (errorDiv) {
          errorDiv.textContent = "Benutzername oder Passwort ist falsch.";
        }
      }
    }

    loginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      handleLogin();
    });

    [userInput, passInput].forEach((el) => {
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleLogin();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLogout();
    initLogin();
  });
})();
