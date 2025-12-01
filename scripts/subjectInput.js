window.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btn-call");
  const subjectInput = document.getElementById("subject-id-input");
  const log = document.getElementById("log");
  const offerOutput = document.getElementById("offer-output");
  const rawResponse = document.getElementById("raw-response");

  if (!btn || !subjectInput) return;

  btn.addEventListener("click", async function () {
    const subjectId = (subjectInput.value || "").trim();
    if (!subjectId) {
      if (log) log.textContent = "Bitte eine SubjectID eingeben.";
      return;
    }

    if (log) log.textContent = "Lade...";
    if (offerOutput) offerOutput.textContent = "Lade...";
    if (rawResponse) rawResponse.textContent = "";

    try {
      const response = await window.DHLApp.realtime.callContainer(subjectId);
      if (log) log.textContent = "Container erfolgreich aufgerufen.";
      if (offerOutput) window.DHLApp.realtime.renderResult(response, offerOutput);
      if (rawResponse) rawResponse.textContent = JSON.stringify(response, null, 2);
    } catch (e) {
      console.error(e);
      if (log) log.textContent = e.message || "Fehler beim Container-Aufruf.";
      if (rawResponse) rawResponse.textContent = "Error: " + (e.message || String(e));
    }
  });
});
