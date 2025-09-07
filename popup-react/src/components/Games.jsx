import GameCard from "./GameCard";

const TZ = "America/New_York";
const ISO_FIELDS = ["gameDate", "startTimeUTC", "startTime", "datetime"];

function getIso(g) {
  for (const k of ISO_FIELDS) if (g?.[k]) return g[k];
  return null;
}
function toET(iso) {
  return new Date(new Date(iso).toLocaleString("en-US", { timeZone: TZ }));
}
function etDateFromIso(iso) {
  return toET(iso).toISOString().slice(0, 10);
}
function todayET() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  const y = parts.find(p=>p.type==="year").value;
  const m = parts.find(p=>p.type==="month").value;
  const d = parts.find(p=>p.type==="day").value;
  return `${y}-${m}-${d}`;
}
function gameKey(g, i) {
  // Use whatever is available; never allow undefined
  const iso = getIso(g) || `idx-${i}`;
  const date = g.officialDate || etDateFromIso(iso);
  const a = g.awayId || g.awayName || "UNK_A";
  const h = g.homeId || g.homeName || "UNK_H";
  return String(g.gamePk ?? g.id ?? `${a}-${h}-${date}`);
}

export default function Games({ games, favorites = [] }) {
  if (!Array.isArray(games) || games.length === 0) {
    return <p className="mx-auto max-w-md px-2">No games today.</p>;
  }

  const today = todayET();

  // Keep today's games; prefer officialDate, else ET from first known time field
  const filtered = games.filter(g => {
    const iso = getIso(g);
    const d = g.officialDate || (iso ? etDateFromIso(iso) : null);
    return d === today;
  });

  const base = filtered.length ? filtered : games; // fallback so you're never stuck with 1
  const deduped = Array.from(new Map(base.map((g, i) => [gameKey(g, i), g])).values());

  const favSet = new Set((favorites || []).map(f => Number(f.teamId)));

  const sorted = deduped.sort((a, b) => {
    const aFav = favSet.has(a.awayId) || favSet.has(a.homeId);
    const bFav = favSet.has(b.awayId) || favSet.has(b.homeId);
    if (aFav !== bFav) return aFav ? -1 : 1;
    const aIso = getIso(a), bIso = getIso(b);
    if (!aIso || !bIso) return 0;
    return toET(aIso) - toET(bIso);
  });

  return (
    <div id="games-root" className="mx-auto max-w-md px-2">
      {sorted.map((g, i) => (
        <GameCard
          key={gameKey(g, i)}
          g={g}
          isFav={favSet.has(g.awayId) || favSet.has(g.homeId)}
        />
      ))}
    </div>
  );
}
