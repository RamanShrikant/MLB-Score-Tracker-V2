const API_BASE = "http://localhost:5174";
let favorites = []; // [{id, teamId, teamName}]

//utils
function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

//favourites UI
async function loadTeamsIntoSelect() {
  try {
    const r = await fetch("https://statsapi.mlb.com/api/v1/teams?sportId=1");
    const j = await r.json();
    const teams = (j.teams || []).sort((a, b) => a.name.localeCompare(b.name));
    const sel = document.getElementById("team-select");
    sel.innerHTML = "";
    for (const t of teams) {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.name} (${t.abbreviation})`;
      sel.appendChild(opt);
    }
  } catch { /* ignore */ }
}

async function refreshFavorites() {
  try {
    const r = await fetch(`${API_BASE}/favorites`);
    if (!r.ok) throw new Error("no /favorites");
    const data = await r.json();
    favorites = data.favorites || [];
  } catch (e) {
    console.warn("favorites disabled:", e);
    favorites = []; // fail-open so games still show
  }
  renderFavoritesList();
}

function renderFavoritesList() {
  const wrap = document.getElementById("fav-list");
  if (!wrap) return;
  wrap.innerHTML = "";
  for (const f of favorites) {
    const chip = document.createElement("div");
    chip.className = "flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-xs";
    chip.innerHTML = `
      <span>${f.teamName}</span>
      <button data-team="${f.teamId}" class="remove-fav text-red-600">✕</button>
    `;
    wrap.appendChild(chip);
  }
  wrap.querySelectorAll(".remove-fav").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const teamId = e.currentTarget.getAttribute("data-team");
      try { await fetch(`${API_BASE}/favorites/${teamId}`, { method: "DELETE" }); } catch {}
      await refreshFavorites();
      await fetchAndRender();
    });
  });
}

// ---------- games ----------
async function fetchAndRender() {
  const today = todayStr();
  try {
    const r = await fetch(`${API_BASE}/games?date=${today}`);
    const { games } = await r.json();
    renderFromDb(games || []);
  } catch (err) {
    console.error("Backend error:", err);
    document.getElementById("games-list").textContent = "Backend not reachable.";
  }
}

function renderFromDb(rows) {
  const container = document.getElementById("games-list");
  container.innerHTML = "";
  if (!rows?.length) {
    container.textContent = "No games today.";
    return;
  }

  // 1) Build a quick lookup of favourite team IDs
  const favSet = new Set(favorites.map((f) => Number(f.teamId)));

  // 2) Sort: favourites first, then everything else (stable by start time)
  const sorted = [...rows].sort((a, b) => {
    const aFav = favSet.has(a.awayId) || favSet.has(a.homeId);
    const bFav = favSet.has(b.awayId) || favSet.has(b.homeId);
    if (aFav !== bFav) return aFav ? -1 : 1;              // favs on top
    return new Date(a.gameDate) - new Date(b.gameDate);   // earlier games first
  });

  // 3) Render 
  sorted.forEach((g) => {
    const awayScore = g.awayRuns ?? 0;
    const homeScore = g.homeRuns ?? 0;

    const dt = new Date(g.gameDate);
    const hrs = (dt.getHours() % 12) || 12;
    const mins = String(dt.getMinutes()).padStart(2, "0");
    const ampm = dt.getHours() >= 12 ? "PM" : "AM";
    const startTime = `${hrs}:${mins} ${ampm}`;

    const state = g.status; // Preview | In Progress | Final | ...
    const primaryText = state === "Preview" ? startTime : `${awayScore} – ${homeScore}`;
    const secondaryText = state === "Preview" ? "" : (state === "Final" ? "Final" : state);

    const humanDate = new Date(g.gameDate).toLocaleDateString("en-US", {
      timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric",
    });
    const boxScoreUrl =
      "https://www.google.com/search?q=" +
      encodeURIComponent(`${g.awayName} vs ${g.homeName} box score ${humanDate}`);

    const logoAway = `https://www.mlbstatic.com/team-logos/${g.awayId}.svg`;
    const logoHome = `https://www.mlbstatic.com/team-logos/${g.homeId}.svg`;

    const isFav = favSet.has(g.awayId) || favSet.has(g.homeId);
    const highlight = isFav ? "ring-2 ring-yellow-400 bg-yellow-50" : "";

    const box = document.createElement("div");
    box.className =
      `game-card rounded-2xl bg-white px-6 py-5 border-4 border-black my-4 ` +
      `transition hover:-translate-y-1 hover:shadow-md ${highlight}`;

    box.innerHTML = `
      <div class="team-col">
        <img src="${logoAway}" alt="${g.awayName}" class="w-16 h-16 object-contain">
        <p class="text-[11px] font-semibold mt-3 text-center leading-tight">${g.awayName}</p>
      </div>
      <div class="flex-1 text-center px-2">
        <p class="text-3xl font-bold mt-2">${primaryText}</p>
        <p class="text-base text-gray-600 mt-1">${secondaryText}</p>
        <a href="${boxScoreUrl}" target="_blank" class="text-xs text-blue-600 underline block mt-1">
          View Box Score
        </a>
      </div>
      <div class="team-col">
        <img src="${logoHome}" alt="${g.homeName}" class="w-16 h-16 object-contain">
        <p class="text-[11px] font-semibold mt-3 text-center leading-tight">${g.homeName}</p>
      </div>
    `;
    container.appendChild(box);
  });
}

//boot
document.addEventListener("DOMContentLoaded", async () => {
  const panel = document.getElementById("fav-panel");
  document.getElementById("fav-toggle").addEventListener("click", () => {
    panel.classList.toggle("hidden");
  });

  try { await loadTeamsIntoSelect(); } catch {}
  await refreshFavorites();
  await fetchAndRender();

  const addBtn = document.getElementById("fav-add");
  const select = document.getElementById("team-select");
  addBtn.addEventListener("click", async () => {
    if (!select?.value) return;
    const teamId = Number(select.value);
    const teamName = select.options[select.selectedIndex].textContent.replace(/\s\([A-Z]+\)$/, "");

    addBtn.disabled = true;
    const old = addBtn.textContent;
    addBtn.textContent = "Adding...";

    try {
      const r = await fetch(`${API_BASE}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, teamName }),
      });
      if (!r.ok) throw new Error(`POST /favorites ${r.status}`);
      await refreshFavorites();
      await fetchAndRender();
      addBtn.textContent = "Added ✓";
      setTimeout(() => (addBtn.textContent = old, addBtn.disabled = false), 800);
    } catch (e) {
      console.warn("add fav failed:", e);
      addBtn.textContent = "Failed";
      setTimeout(() => (addBtn.textContent = old, addBtn.disabled = false), 900);
    }
  });

  const intervalId = setInterval(fetchAndRender, 60000);
  window.addEventListener("unload", () => clearInterval(intervalId));
});
