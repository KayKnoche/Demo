// Pega CDH Endpoints
const PEGA_ENDPOINTS = {
    stage: "https://depst-mara-stg1-decisionhub.pegacloud.net/prweb/api/PegaMKTContainer/V3/Container",
    prod: "https://depst-mara-prod1-decisionhub.pegacloud.net/prweb/api/PegaMKTContainer/V3/Container"
};

let currentEnvironment = "stage"; // stage oder prod

// SubjectID History (getrennt nach Umgebung)
function loadHistoryForEnv(env) {
    const key = `subjectIdHistory_${env}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}

function saveHistoryForEnv(env, history) {
    const key = `subjectIdHistory_${env}`;
    // Nur max. 10 speichern
    const limited = history.slice(0, 10);
    localStorage.setItem(key, JSON.stringify(limited));
}

function addSubjectIdToHistory(env, subjectId) {
    if (!subjectId) return;
    let history = loadHistoryForEnv(env);
    // Entferne evtl. vorhandenen Eintrag (damit er nach vorne rutscht)
    history = history.filter(id => id !== subjectId);
    // Füge neuen an den Anfang
    history.unshift(subjectId);
    saveHistoryForEnv(env, history);
    updateDatalistForCurrentEnv();
}

function updateDatalistForCurrentEnv() {
    const history = loadHistoryForEnv(currentEnvironment);
    const datalist = document.getElementById('subjectIdHistory');
    if (datalist) {
        datalist.innerHTML = '';
        history.forEach(id => {
            const option = document.createElement('option');
            option.value = id;
            datalist.appendChild(option);
        });
    }
}

// Umgebung wechseln
function setEnvironment(env) {
    currentEnvironment = env;
    
    // Radio-Buttons aktualisieren
    const stageRadio = document.getElementById('stageEnv');
    const prodRadio = document.getElementById('prodEnv');
    if (stageRadio && prodRadio) {
        if (env === 'stage') stageRadio.checked = true;
        else prodRadio.checked = true;
    }
    
    // Badge aktualisieren
    const indicator = document.getElementById('envIndicator');
    if (indicator) {
        if (env === 'stage') {
            indicator.textContent = '⚙️ Stage';
            indicator.className = 'env-badge stage-badge';
        } else {
            indicator.textContent = '🚀 Prod';
            indicator.className = 'env-badge prod-badge';
        }
    }
    
    // Datalist für neue Umgebung laden
    updateDatalistForCurrentEnv();
    
    // Input-Feld leeren oder aktuelle SubjectID aus History vorbelegen?
    const input = document.getElementById('subjectIdInput');
    if (input) {
        const history = loadHistoryForEnv(env);
        input.value = history[0] || '';
    }
    
    // Optional: automatisch neu laden? (lasse ich erstmal aus)
}

// Lade Stage- und Teaser-HTML-Fragmente
async function loadHtmlFragments() {
    try {
        const [stageHtml, teaserHtml] = await Promise.all([
            fetch('stage.html').then(r => r.text()),
            fetch('teaser.html').then(r => r.text())
        ]);
        
        document.getElementById('stageContent').innerHTML = stageHtml;
        document.getElementById('teaserContent').innerHTML = teaserHtml;
        
        return true;
    } catch (error) {
        console.error('Fehler beim Laden der HTML-Fragmente:', error);
        document.getElementById('stageContent').innerHTML = '<div class="loader">Fehler beim Laden des Stage-Templates</div>';
        document.getElementById('teaserContent').innerHTML = '<div class="loader">Fehler beim Laden des Teaser-Templates</div>';
        return false;
    }
}

// Pega Request (verwendet currentEnvironment)
async function fetchPegaContainer(subjectId, containerName) {
    const endpoint = PEGA_ENDPOINTS[currentEnvironment];
    const payload = {
        "SubjectID": subjectId,
        "ContextName": "Customer",
        "ContainerName": containerName,
        "Channel": "Web",
        "Direction": "Inbound",
        "CurrentPage": "Download",
        "AppID": "MEKK"
    };
    
    console.log(`Request an Pega (${currentEnvironment}):`, payload);
    
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Accept": "application/json" 
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log(`Response von Pega (${currentEnvironment}):`, data);
    return data;
}

function hasNoOffers(response, containerName) {
    const container = response.ContainerList?.find(c => c.ContainerName === containerName);
    return !container || container.Status === "No Offers available" || !container.RankedResults?.length;
}

function extractFirstResult(response, containerName) {
    const container = response.ContainerList?.find(c => c.ContainerName === containerName);
    if (!container || !container.RankedResults?.length) throw new Error("No Offers available");
    return container.RankedResults[0];
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Stage befüllen
function renderStage(result) {
    const title = result.ShortDescription || result.Label || "Ihr persönliches Angebot";
    const benefits = result.Benefits || "";
    const imageUrl = result.ImageURL || "";
    const clickThroughUrl = result.ClickThroughURL || "#";
    
    console.log("Stage URL:", clickThroughUrl);
    
    const stageDiv = document.querySelector('#stageContent .stage-content');
    if (stageDiv) {
        if (imageUrl) {
            stageDiv.style.backgroundImage = `url('${escapeHtml(imageUrl)}')`;
            stageDiv.style.backgroundSize = "cover";
            stageDiv.style.backgroundPosition = "center";
        } else {
            stageDiv.style.backgroundColor = "#333";
        }
    }
    
    const titleEl = document.getElementById('stageTitle');
    const benefitsEl = document.getElementById('stageBenefits');
    const linkEl = document.getElementById('stageLink');
    
    if (titleEl) titleEl.textContent = escapeHtml(title);
    if (benefitsEl) benefitsEl.textContent = escapeHtml(benefits);
    if (linkEl) linkEl.href = clickThroughUrl;
}

function showStageNoOffers() {
    const stageDiv = document.querySelector('#stageContent .stage-content');
    if (stageDiv) {
        stageDiv.style.backgroundColor = "#f5f5f5";
        stageDiv.style.backgroundImage = "none";
    }
    
    const titleEl = document.getElementById('stageTitle');
    const benefitsEl = document.getElementById('stageBenefits');
    const linkEl = document.getElementById('stageLink');
    
    if (titleEl) titleEl.textContent = "📭 No Offers available";
    if (benefitsEl) benefitsEl.textContent = "Für diese SubjectID liegt aktuell kein Stage-Angebot vor.";
    if (linkEl) linkEl.href = "#";
}

// Teaser befüllen
function renderTeaser(result) {
    const title = result.ShortDescription || result.Label || "Service-Tipp";
    const benefits = result.Benefits || "";
    const imageUrl = result.ImageURL || "";
    const clickThroughUrl = result.ClickThroughURL || "#";
    
    console.log("Teaser URL:", clickThroughUrl);
    
    const imageDiv = document.getElementById('teaserImage');
    if (imageDiv) {
        if (imageUrl) {
            imageDiv.style.backgroundImage = `url('${escapeHtml(imageUrl)}')`;
            imageDiv.style.backgroundSize = "cover";
            imageDiv.style.backgroundPosition = "center";
        } else {
            imageDiv.style.backgroundColor = "#f0f0f0";
        }
    }
    
    const titleEl = document.getElementById('teaserTitle');
    const benefitsEl = document.getElementById('teaserBenefits');
    const linkEl = document.getElementById('teaserLink');
    
    if (titleEl) titleEl.textContent = escapeHtml(title);
    if (benefitsEl) benefitsEl.textContent = escapeHtml(benefits);
    if (linkEl) linkEl.href = clickThroughUrl;
}

function showTeaserNoOffers() {
    const imageDiv = document.getElementById('teaserImage');
    if (imageDiv) {
        imageDiv.style.backgroundImage = "none";
        imageDiv.style.backgroundColor = "#f0f0f0";
    }
    
    const titleEl = document.getElementById('teaserTitle');
    const benefitsEl = document.getElementById('teaserBenefits');
    const linkEl = document.getElementById('teaserLink');
    
    if (titleEl) titleEl.textContent = "📭 No Offers available";
    if (benefitsEl) benefitsEl.textContent = "Für diese SubjectID liegt aktuell kein Teaser-Angebot vor.";
    if (linkEl) linkEl.href = "#";
}

// Hauptfunktion: Lädt alles
async function loadAllContent() {
    const subjectId = document.getElementById("subjectIdInput").value.trim();
    if (!subjectId) { 
        alert("Bitte eine SubjectID eingeben"); 
        return; 
    }
    
    // SubjectID in History der aktuellen Umgebung speichern
    addSubjectIdToHistory(currentEnvironment, subjectId);
    
    // Lade HTML-Fragmente, falls noch nicht geladen
    if (!window.fragmentsLoaded) {
        const loaded = await loadHtmlFragments();
        if (!loaded) return;
        window.fragmentsLoaded = true;
    }
    
    // Lade-Modus anzeigen
    const stageTitle = document.getElementById('stageTitle');
    const stageBenefits = document.getElementById('stageBenefits');
    const teaserTitle = document.getElementById('teaserTitle');
    const teaserBenefits = document.getElementById('teaserBenefits');
    
    if (stageTitle) stageTitle.textContent = "Lade Stage...";
    if (stageBenefits) stageBenefits.textContent = "";
    if (teaserTitle) teaserTitle.textContent = "Lade Teaser...";
    if (teaserBenefits) teaserBenefits.textContent = "";
    
    // Stage laden
    try {
        const stageRes = await fetchPegaContainer(subjectId, "GetStage");
        if (hasNoOffers(stageRes, "GetStage")) {
            showStageNoOffers();
        } else {
            renderStage(extractFirstResult(stageRes, "GetStage"));
        }
    } catch (e) {
        console.error("Stage Fehler:", e);
        showStageNoOffers();
    }
    
    // Teaser laden
    try {
        const teaserRes = await fetchPegaContainer(subjectId, "GetTeaser");
        if (hasNoOffers(teaserRes, "GetTeaser")) {
            showTeaserNoOffers();
        } else {
            renderTeaser(extractFirstResult(teaserRes, "GetTeaser"));
        }
    } catch (e) {
        console.error("Teaser Fehler:", e);
        showTeaserNoOffers();
    }
}

// Statische Buttons binden
function bindStaticButtons() {
    document.querySelector('.static-left')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '#';
    });
    document.querySelector('.static-right')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '#';
    });
}

// Event Listener
document.getElementById("loadContentBtn").addEventListener("click", loadAllContent);

// Toggle-Eventlistener
document.getElementById("stageEnv")?.addEventListener("change", () => setEnvironment("stage"));
document.getElementById("prodEnv")?.addEventListener("change", () => setEnvironment("prod"));

// Initialisierung
document.addEventListener("DOMContentLoaded", async () => {
    // Standard: Stage
    setEnvironment("stage");
    
    await loadHtmlFragments();
    await loadAllContent();
    bindStaticButtons();
});
