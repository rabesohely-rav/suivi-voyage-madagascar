document.addEventListener("DOMContentLoaded", () => {
  initTodayLabel();
  initBudgetPreview();
  initNextReservation();
  initNextEvent();
});

function initTodayLabel() {
  const el = document.getElementById("todayLabel");
  if (!el) return;
  el.textContent = formatDateFr(new Date());
}

function initBudgetPreview() {
  const el = document.getElementById("budgetPreview");
  if (!el) return;

  const expensesState = Storage.get(KEYS.expenses, { displayCurrency: "EUR", data: [] });
  const total = (expensesState.data || []).reduce((sum, item) => sum + (Number(item.amountEur) || 0), 0);
  const paid = (expensesState.data || []).reduce((sum, item) => item.paid ? sum + (Number(item.amountEur) || 0) : sum, 0);

  el.innerHTML = `
    <p>Total enregistré : <strong>${total.toFixed(2)} €</strong></p>
    <p>Déjà payé : <strong>${paid.toFixed(2)} €</strong></p>
    <p class="muted small-note">Aperçu basé sur les dépenses sauvegardées localement.</p>
  `;
}

async function initNextReservation() {
  const el = document.getElementById("nextReservation");
  if (!el) return;

  try {
    const response = await fetch("assets/data/reservations.json");
    const items = await response.json();
    if (!Array.isArray(items) || items.length === 0) {
      el.innerHTML = '<p class="muted">Aucune réservation disponible.</p>';
      return;
    }

    const item = items[0];
    el.innerHTML = `
      <div class="list-item">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.date)}</p>
        <p>${escapeHtml(item.location || "")}</p>
        <span class="badge">${escapeHtml(item.category || "Réservation")}</span>
      </div>
    `;
  } catch (error) {
    console.error(error);
    el.innerHTML = '<p class="muted">Réservations indisponibles.</p>';
  }
}

async function initNextEvent() {
  const el = document.getElementById("nextEvent");
  if (!el) return;

  try {
    const response = await fetch("assets/data/agenda.json");
    const items = await response.json();
    if (!Array.isArray(items) || items.length === 0) {
      el.innerHTML = '<p class="muted">Aucun événement prévu.</p>';
      return;
    }

    const item = items[0];
    el.innerHTML = `
      <div class="list-item">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.date)}</p>
        <p>${escapeHtml(item.time || "")}</p>
      </div>
    `;
  } catch (error) {
    console.error(error);
    el.innerHTML = '<p class="muted">Agenda indisponible.</p>';
  }
}
