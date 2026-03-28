document.addEventListener("DOMContentLoaded", async () => {
  const data = await loadRoadmap();
  const input = document.getElementById("routeSearchInput");

  renderRoadmap(data);

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    const filtered = data.filter((item) => {
      return [item.date, item.route, item.night, item.activities, item.attention]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
    renderRoadmap(filtered);
  });
});

async function loadRoadmap() {
  try {
    const response = await fetch("../assets/data/feuille-de-route.json");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function renderRoadmap(items) {
  const container = document.getElementById("roadmapList");
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = '<p class="muted">Aucune journée trouvée.</p>';
    return;
  }

  container.innerHTML = items.map((item, index) => {
    const notesKey = `${KEYS.routeNotes}_${index}`;
    const notes = Storage.get(notesKey, "");

    return `
      <article class="roadmap-card">
        <h3>${escapeHtml(item.date)}</h3>
        <p><strong>Trajet :</strong> ${escapeHtml(item.route)}</p>
        <p><strong>Nuit :</strong> ${escapeHtml(item.night)}</p>
        <p><strong>Activités :</strong> ${escapeHtml(item.activities)}</p>
        <p><strong>Point d’attention :</strong> ${escapeHtml(item.attention)}</p>
        <label class="field-label" for="notes-${index}">Notes personnelles</label>
        <textarea id="notes-${index}" class="textarea" rows="3" data-notes-key="${notesKey}">${escapeHtml(notes)}</textarea>
      </article>
    `;
  }).join("");

  container.querySelectorAll("textarea[data-notes-key]").forEach((textarea) => {
    textarea.addEventListener("change", () => {
      Storage.set(textarea.dataset.notesKey, textarea.value);
    });
  });
}
