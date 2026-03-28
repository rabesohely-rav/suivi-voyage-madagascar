document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("reservationsList");

  try {
    const response = await fetch("../assets/data/reservations.json");
    const items = await response.json();

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = '<p class="muted">Aucune réservation disponible.</p>';
      return;
    }

    container.innerHTML = items.map((item) => `
      <article class="list-item">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.date)}</p>
        <p>${escapeHtml(item.location || "")}</p>
        <p>${escapeHtml(item.details || "")}</p>
        <span class="badge">${escapeHtml(item.category || "Réservation")}</span>
      </article>
    `).join("");
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="muted">Impossible de charger les réservations.</p>';
  }
});
