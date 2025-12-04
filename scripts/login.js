window.DHLApp = window.DHLApp || {};
(function (app) {
  const auth = {
    token: null,
    setToken(t) {
      this.token = t;
    },
    clearToken() {
      this.token = null;
    },
    getAuthHeaders() {
      if (!this.token) return {};
      return { Authorization: "Bearer " + this.token };
    },
  };
  app.auth = auth;
})(window.DHLApp);

// Fake-Login-Overlay Logik für die Demo-Seite
(function () {
  const USERNAME = "demo";
  const PASSWORD = "Routing2025!";

  function setupLogin() {
    const overlay = document.getElementById("login-overlay");
    const box = document.getElementById("login-box");
    const userInput = document.getElementById("login-username");
    const passInput = document.getElementById("login-password");
    const submitBtn = document.getElementById("login-submit");
    const errorEl = document.getElementById("login-error");
    const protectedContent = document.getElementById("protected-content");

    // Wenn die Elemente nicht da sind (z.B. andere Seite), nichts tun
    if (!overlay || !box || !userInput || !passInput || !submitBtn || !protectedContent) {
      return;
    }

    function unlock() {
      const u = (userInput.value || "").trim();
      const p = (passInput.value || "").trim();

      if (u === USERNAME && p === PASSWORD) {
        overlay.style.display = "none";
        protectedContent.style.display = "block";

        // Optional: "eingeloggt" markieren
        if (window.DHLApp && window.DHLApp.auth && typeof window.DHLApp.auth.setToken === "function") {
          window.DHLApp.auth.setToken("demo-session");
        }
      } else {
        if (errorEl) {
          errorEl.textContent = "Falscher Benutzername oder Passwort.";
        }
      }
    }

    submitBtn.addEventListener("click", function (ev) {
      ev.preventDefault();
      unlock();
    });

    passInput.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        unlock();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupLogin);
  } else {
    setupLogin();
  }
})();
