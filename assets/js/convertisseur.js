const FALLBACK_RATE = 5000;
const RATE_URL = "https://open.er-api.com/v6/latest/EUR";

let rateState = Storage.get(KEYS.exchangeRate, {
  eurToMgaRate: FALLBACK_RATE,
  lastUpdated: null,
  source: "fallback"
});

document.addEventListener("DOMContentLoaded", () => {
  const eurInput = document.getElementById("eurInput");
  const mgaInput = document.getElementById("mgaInput");
  const refreshRateButton = document.getElementById("refreshRateButton");

  updateRateStatus();
  renderConversions();

  eurInput.addEventListener("input", renderConversions);
  mgaInput.addEventListener("input", renderConversions);
  refreshRateButton.addEventListener("click", refreshRate);
});

function updateRateStatus() {
  const el = document.getElementById("rateStatus");
  if (!el) return;

  const dateLabel = rateState.lastUpdated ? ` • mise à jour : ${rateState.lastUpdated}` : "";
  el.textContent = `1 € = ${Math.round(rateState.eurToMgaRate).toLocaleString("fr-FR")} Ar • source : ${rateState.source}${dateLabel}`;
}

function renderConversions() {
  const eurInput = document.getElementById("eurInput");
  const mgaInput = document.getElementById("mgaInput");
  const eurToMgaResult = document.getElementById("eurToMgaResult");
  const mgaToEurResult = document.getElementById("mgaToEurResult");

  const eurValue = Number(eurInput.value || 0);
  const mgaValue = Number(mgaInput.value || 0);

  eurToMgaResult.textContent = eurValue > 0
    ? `${eurValue.toFixed(2)} € = ${Math.round(eurValue * rateState.eurToMgaRate).toLocaleString("fr-FR")} Ar`
    : "—";

  mgaToEurResult.textContent = mgaValue > 0
    ? `${mgaValue.toLocaleString("fr-FR")} Ar = ${(mgaValue / rateState.eurToMgaRate).toFixed(2)} €`
    : "—";
}

async function refreshRate() {
  const button = document.getElementById("refreshRateButton");
  button.disabled = true;
  button.textContent = "Mise à jour…";

  try {
    const response = await fetch(RATE_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Réponse réseau invalide");

    const result = await response.json();
    if (!result?.rates?.MGA) throw new Error("Taux MGA introuvable");

    rateState = {
      eurToMgaRate: result.rates.MGA,
      lastUpdated: new Date().toLocaleString("fr-FR"),
      source: "network"
    };

    Storage.set(KEYS.exchangeRate, rateState);
    updateRateStatus();
    renderConversions();
  } catch (error) {
    console.error(error);
    alert("Mise à jour impossible. Le dernier taux sauvegardé reste utilisé.");
  } finally {
    button.disabled = false;
    button.textContent = "Mettre à jour le taux";
  }
}
