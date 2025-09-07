import { useEffect, useState } from "react";
import { getTeams } from "../lib/api";

export default function Favorites({ favorites, onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    (async () => setTeams(await getTeams()))();
  }, []);

  return (
    <div className="mx-auto max-w-md px-2 mb-3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="block mx-auto rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
      >
        Choose favourite teams
      </button>

      {open && (
        <div className="mt-4 rounded-xl border border-gray-200 p-3 bg-white">
          <div className="flex gap-2 items-center">
            <select
              id="team-select"
              className="flex-1 rounded-lg border border-gray-300 px-2 py-2 text-sm"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.abbreviation})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-lg border border-black px-3 py-2 text-sm font-semibold hover:bg-black hover:text-white"
              onClick={() => {
                const sel = document.getElementById("team-select");
                if (!sel?.value) return;
                const id = Number(sel.value);
                const name = sel.options[sel.selectedIndex].textContent.replace(
                  /\s\([A-Z]+\)$/,
                  ""
                );
                onAdd(id, name);
              }}
            >
              Add
            </button>
          </div>

          {/* Favourites list */}
          <div className="mt-3 space-y-1">
            {favorites.map(f => (
              <div key={f.teamId} className="flex items-center space-x-2">
                <span className="text-gray-800">{f.teamName}</span>
                <button
                  onClick={() => onRemove(f.teamId)}
                  className="px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
