window.DHLApp = window.DHLApp || {};
(function (app) {
  const APP_ID = "IBU";
  const CHANNEL = "Web";

  function getServerUrl() {
    return (document.getElementById("server-url-input")?.value || "").trim();
  }
  function getContainerName() {
    return (document.getElementById("container-name-input")?.value || "").trim() || "Routing";
  }
  function getEndpoint() {
    return getServerUrl() + "/api/PegaMKTContainer/V3/Container";
  }
  function buildPayload(subjectId) {
    return {
      SubjectID: subjectId.trim(),
      ContainerName: getContainerName(),
      Channel: CHANNEL,
      Direction: "Inbound",
      AppID: APP_ID
    };
  }
  async function callContainer(subjectId) {
    const endpoint = getEndpoint();
    const payload = buildPayload(subjectId);
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      app.auth?.getAuthHeaders?.() || {}
    );
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("HTTP error " + response.status);
    return await response.json();
  }
  function renderResult(response, target) {
    const results = response?.ContainerList?.[0]?.RankedResults || [];
    if (!results.length){ target.textContent="Keine Ergebnisse."; return;}
    target.innerHTML = results.map((item,i)=>`
      <div class="offer-card">
        <h3>#${i+1} – ${item.ShortDescription || item.Label}</h3>
        <div class="offer-benefits">${item.Benefits || ""}</div>
      </div>`).join("");
  }
  app.realtime = { callContainer, renderResult };
})(window.DHLApp);