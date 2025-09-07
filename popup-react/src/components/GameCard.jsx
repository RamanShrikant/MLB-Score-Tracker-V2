export default function GameCard({ g, isFav = false }) {
  const TZ = "America/New_York";
  const dtET = new Date(new Date(g.gameDate).toLocaleString("en-US", { timeZone: TZ }));
  const startTime = dtET.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });

  const awayScore = g.awayRuns ?? 0;
  const homeScore = g.homeRuns ?? 0;

  const primary = g.status === "Preview" ? startTime : `${awayScore} – ${homeScore}`;
  const secondary = g.status === "Preview" ? "" : g.status === "Final" ? "Final" : g.status;

  const boxScoreUrl =
    "https://www.google.com/search?q=" +
    encodeURIComponent(`${g.awayName} vs ${g.homeName} box score ${dtET.toLocaleDateString("en-US")}`);

  return (
    <div className={"game-card rounded-2xl px-6 py-5 border-4 my-4 transition hover:-translate-y-1 hover:shadow-md" + (isFav ? " fav" : "")}>
      <div className="team-col flex flex-col items-center w-[90px]">
        <img src={`https://www.mlbstatic.com/team-logos/${g.awayId}.svg`} alt={g.awayName} className="w-12 h-12 object-contain" />
        <p className="text-[13px] font-bold mt-3 text-center leading-tight">{g.awayName}</p>
      </div>

      <div className="flex-1 text-center px-2">
        <p className="text-3xl font-bold mt-2">{primary}</p>
        <p className="text-base text-gray-600 mt-1">{secondary}</p>
        <a href={boxScoreUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline block mt-1">
          View Box Score
        </a>
      </div>

      <div className="team-col flex flex-col items-center w-[90px]">
        <img src={`https://www.mlbstatic.com/team-logos/${g.homeId}.svg`} alt={g.homeName} className="w-12 h-12 object-contain" />
        <p className="text-[13px] font-bold mt-3 text-center leading-tight">{g.homeName}</p>
      </div>
    </div>
  );
}
