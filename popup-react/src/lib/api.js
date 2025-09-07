const API_BASE = "https://mlb-score-tracker-v2.onrender.com";

export async function getTeams() {
  const r = await fetch("https://statsapi.mlb.com/api/v1/teams?sportId=1");
  const j = await r.json();
  return (j.teams || []).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFavorites() {
  const r = await fetch(`${API_BASE}/favorites`);
  if (!r.ok) return [];
  const j = await r.json();
  return j.favorites || [];
}

export async function addFavorite(teamId, teamName) {
  const r = await fetch(`${API_BASE}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId, teamName }),
  });
  if (!r.ok) throw new Error("Add fav failed");
}

export async function removeFavorite(teamId) {
  await fetch(`${API_BASE}/favorites/${teamId}`, { method: "DELETE" });
}

export async function getGames(dateStr) {
  const r = await fetch(`${API_BASE}/games?date=${dateStr}`);
  const j = await r.json();
  return j.games || [];
}
