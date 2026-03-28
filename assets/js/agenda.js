document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("agendaList");

  try {
    const response = await fetch("../assets/data/agenda.json");
    const items = await response.json();

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = '<p class="muted">Aucun événement prévu.</p>';
      return;
    }

    container.innerHTML = items.map((item) => `
      <article class="list-item">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.date)} ${escapeHtml(item.time || "")}</p>
        <p>${escapeHtml(item.description || "")}</p>
      </article>
    `).join("");
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="muted">Impossible de charger l’agenda.</p>';
  }
});
