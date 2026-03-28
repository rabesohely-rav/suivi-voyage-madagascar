const DEFAULT_EXPENSE_STATE = {
  displayCurrency: "EUR",
  eurToMgaRate: Storage.get(KEYS.exchangeRate, { eurToMgaRate: 5000 }).eurToMgaRate || 5000,
  data: [
    { date: "2026-07-09", label: "AVIS Super cover", amountEur: 213, withdrawalEur: null, paid: false },
    { date: "2026-07-10", label: "1ère partie chauffeur", amountEur: null, withdrawalEur: 1000, paid: false },
    { date: "2026-07-11", label: "Plein avant départ", amountEur: 85, withdrawalEur: null, paid: false }
  ]
};

let expenseState = Storage.get(KEYS.expenses, DEFAULT_EXPENSE_STATE);
if (!Array.isArray(expenseState.data)) expenseState = DEFAULT_EXPENSE_STATE;

document.addEventListener("DOMContentLoaded", () => {
  const quickDate = document.getElementById("quickDate");
  const today = new Date().toISOString().split("T")[0];
  quickDate.value = today;

  document.getElementById("addExpenseButton").addEventListener("click", addQuickExpense);
  document.getElementById("toggleCurrencyButton").addEventListener("click", toggleCurrency);
  document.getElementById("exportButton").addEventListener("click", exportData);
  document.getElementById("resetButton").addEventListener("click", resetData);

  renderTable();
  updateRateInfo();
});

function saveExpenses(message = "Données sauvegardées localement.") {
  Storage.set(KEYS.expenses, expenseState);
  const saveStatus = document.getElementById("saveStatus");
  if (saveStatus) saveStatus.textContent = message;
}

function toggleCurrency() {
  expenseState.displayCurrency = expenseState.displayCurrency === "EUR" ? "MGA" : "EUR";
  saveExpenses("Devise d’affichage modifiée.");
  renderTable();
  updateRateInfo();
}

function updateRateInfo() {
  const rateInfo = document.getElementById("rateInfo");
  if (!rateInfo) return;
  const label = expenseState.displayCurrency === "EUR" ? "EUR" : "Ariary";
  rateInfo.textContent = `Devise affichée : ${label} • 1 € = ${Math.round(expenseState.eurToMgaRate).toLocaleString("fr-FR")} Ar`;
}

function addQuickExpense() {
  const date = document.getElementById("quickDate").value;
  const label = document.getElementById("quickLabel").value.trim();
  const amount = Number(document.getElementById("quickAmount").value);

  if (!date || !label || !amount) {
    alert("Remplis date, dépense et montant.");
    return;
  }

  expenseState.data.unshift({
    date,
    label,
    amountEur: amount,
    withdrawalEur: null,
    paid: false
  });

  document.getElementById("quickLabel").value = "";
  document.getElementById("quickAmount").value = "";

  saveExpenses("Dépense ajoutée.");
  renderTable();
}

function renderTable() {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  expenseState.data.forEach((row, index) => {
    const tr = document.createElement("tr");
    const amount = displayAmount(row.amountEur);
    const withdrawal = displayAmount(row.withdrawalEur);

    tr.innerHTML = `
      <td>${escapeHtml(row.date || "")}</td>
      <td>${escapeHtml(row.label || "")}</td>
      <td>${amount}</td>
      <td>
        <button type="button" class="button ${row.paid ? "" : "primary"}" data-action="toggle-paid" data-index="${index}">
          ${row.paid ? "Annuler" : "Payé"}
        </button>
        <div class="${row.paid ? "status-paid" : "status-unpaid"}">${row.paid ? "Payé" : "Non payé"}</div>
      </td>
      <td>${withdrawal}</td>
    `;

    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll('[data-action="toggle-paid"]').forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      expenseState.data[index].paid = !expenseState.data[index].paid;
      saveExpenses("Statut modifié.");
      renderTable();
    });
  });

  document.getElementById("amountHeader").textContent = expenseState.displayCurrency === "EUR" ? "Montant €" : "Montant Ariary";
  document.getElementById("withdrawalHeader").textContent = expenseState.displayCurrency === "EUR" ? "Retraits €" : "Retraits Ariary";
  updateTotals();
}

function displayAmount(eurValue) {
  if (eurValue === null || eurValue === undefined) return "—";
  if (expenseState.displayCurrency === "EUR") return `${Number(eurValue).toFixed(2)} €`;
  return `${Math.round(Number(eurValue) * expenseState.eurToMgaRate).toLocaleString("fr-FR")} Ar`;
}

function updateTotals() {
  const totalAmount = expenseState.data.reduce((sum, item) => sum + (Number(item.amountEur) || 0), 0);
  const totalWithdrawal = expenseState.data.reduce((sum, item) => sum + (Number(item.withdrawalEur) || 0), 0);
  const totalPaid = expenseState.data.reduce((sum, item) => item.paid ? sum + (Number(item.amountEur) || 0) : sum, 0);

  document.getElementById("totalAmount").textContent = displayAmount(totalAmount);
  document.getElementById("totalWithdrawal").textContent = displayAmount(totalWithdrawal);
  document.getElementById("totalPaid").textContent = `Payé : ${displayAmount(totalPaid)}`;
}

function exportData() {
  try {
    const json = JSON.stringify(expenseState, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];

    link.href = url;
    link.download = `suivi-depenses-${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    saveExpenses("Export effectué avec succès.");
  } catch (error) {
    console.error(error);
    alert("Export impossible.");
  }
}

function resetData() {
  if (!window.confirm("Effacer toutes les dépenses locales ?")) return;
  expenseState = JSON.parse(JSON.stringify(DEFAULT_EXPENSE_STATE));
  saveExpenses("Données réinitialisées.");
  renderTable();
  updateRateInfo();
}
