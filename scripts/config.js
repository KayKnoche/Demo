(function () {
  const CONFIG_KEY = "dhlRoutingConfig";

  function loadConfig() {
    try {
      const raw = window.localStorage.getItem(CONFIG_KEY);
      if (!raw) return {};
      const cfg = JSON.parse(raw);
      if (typeof cfg !== "object" || cfg === null) return {};
      return cfg;
    } catch (e) {
      console.error("Fehler beim Laden der Konfiguration:", e);
      return {};
    }
  }

  function saveConfig(cfg) {
    try {
      window.localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
      // Globale Variable bereitstellen, damit andere Skripte darauf zugreifen können
      window.dhlRoutingConfig = cfg;
      return true;
    } catch (e) {
      console.error("Fehler beim Speichern der Konfiguration:", e);
      return false;
    }
  }

  function applyConfigToIndex() {
    const cfg = loadConfig();
    window.dhlRoutingConfig = cfg;

    const serverInput = document.getElementById("server-url-input");
    const containerInput = document.getElementById("container-name-input");

    if (serverInput && cfg.serverUrl) {
      serverInput.value = cfg.serverUrl;
    }
    if (containerInput && cfg.containerName) {
      containerInput.value = cfg.containerName;
    }
  }

  function initConfigPage() {
    const serverInput = document.getElementById("config-server-url");
    const containerInput = document.getElementById("config-container-name");
    const appIdInput = document.getElementById("config-app-id");
    const saveBtn = document.getElementById("config-save-btn");
    const statusDiv = document.getElementById("config-status");

    if (!serverInput || !containerInput || !appIdInput || !saveBtn) {
      return;
    }

    // Initiales Befüllen
    const cfg = loadConfig();
    if (cfg.serverUrl) serverInput.value = cfg.serverUrl;
    if (cfg.containerName) containerInput.value = cfg.containerName;
    if (cfg.appId) appIdInput.value = cfg.appId;

    saveBtn.addEventListener("click", function () {
      const newCfg = {
        serverUrl: serverInput.value.trim(),
        containerName: containerInput.value.trim(),
        appId: appIdInput.value.trim()
      };

      const ok = saveConfig(newCfg);
      if (statusDiv) {
        if (ok) {
          statusDiv.textContent = "Konfiguration gespeichert.";
          statusDiv.style.color = "green";
        } else {
          statusDiv.textContent = "Fehler beim Speichern der Konfiguration.";
          statusDiv.style.color = "red";
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Wenn wir auf der Config-Seite sind:
    if (document.getElementById("config-save-btn")) {
      initConfigPage();
    }
    // Wenn wir auf der Index-Seite sind:
    if (document.getElementById("server-url-input") || document.getElementById("container-name-input")) {
      applyConfigToIndex();
    }
  });
})();
