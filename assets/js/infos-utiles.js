let usefulInfos = [];

document.addEventListener("DOMContentLoaded", async () => {
  const input = document.getElementById("infoSearchInput");
  usefulInfos = await loadUsefulInfos();
  renderUsefulInfos(usefulInfos);

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    const filtered = usefulInfos.filter((item) => {
      return [item.title, item.value, item.category]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
    renderUsefulInfos(filtered);
  });
});

async function loadUsefulInfos() {
  try {
    const response = await fetch("../assets/data/infos-utiles.json");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function renderUsefulInfos(items) {
  const container = document.getElementById("infosList");
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = '<p class="muted">Aucune information trouvée.</p>';
    return;
  }

  container.innerHTML = items.map((item) => `
    <article class="list-item">
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.value)}</p>
      <span class="badge">${escapeHtml(item.category || "Info")}</span>
    </article>
  `).join("");
}
