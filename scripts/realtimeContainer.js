window.DHLApp = window.DHLApp || {};
(function (app) {

  function getConfig() {
    const cfg = window.dhlRoutingConfig || {};
    return {
      serverUrl: (cfg.serverUrl || "").trim(),
      containerName: (cfg.containerName || "").trim(),
      appId: (cfg.appId || "IBU").trim(),
      channel: "Web"
    };
  }

  function getEndpoint(cfg) {
    return cfg.serverUrl + "/api/PegaMKTContainer/V3/Container";
  }

  function buildPayload(subjectId, cfg) {
    return {
      SubjectID: subjectId.trim(),
      ContainerName: cfg.containerName || "Routing",
      Channel: cfg.channel,
      Direction: "Inbound",
      AppID: cfg.appId
    };
  }

  async function callContainer(subjectId) {
    const cfg = getConfig();
    const endpoint = getEndpoint(cfg);
    const payload = buildPayload(subjectId, cfg);

    const headers = {
      "Content-Type": "application/json",
      ...(app.auth?.getAuthHeaders?.() || {})
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    return await response.json();
  }

  function renderResult(response, target) {
    const results = response?.ContainerList?.[0]?.RankedResults || [];
    if (!results.length) {
      target.textContent = "Keine Ergebnisse.";
      return;
    }

    target.innerHTML = results
      .map((item, i) => `
          <div class="offer-card">
            <h3>#${i + 1} – ${item.ShortDescription || item.Label}</h3>
            <div class="offer-benefits">${item.Benefits || ""}</div>
          </div>
        `)
      .join("");
  }

  app.realtime = { callContainer, renderResult };

})(window.DHLApp);