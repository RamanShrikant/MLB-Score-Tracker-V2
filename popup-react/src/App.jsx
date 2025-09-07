import { useEffect } from "react";
import Header from "./components/Header";
import Favorites from "./components/Favorites";
import Games from "./components/Games";
import useFavorites from "./hooks/useFavorites";
import useGames from "./hooks/useGames";
import { todayStr } from "./lib/date";

export default function App() {
  const { favorites, add, remove, refresh } = useFavorites();
  
  const games = useGames(todayStr());

  // refresh games when favorites change (optional but nice)
  useEffect(() => { /* no-op for now */ }, [favorites]);

  return (
    <div className="font-[Montserrat] text-[1.1rem] min-w-[360px] p-2 overflow-x-hidden">
      <Header />
      <Favorites favorites={favorites} onAdd={add} onRemove={remove} />
      <div className="h-4" />
      <Games games={games} favorites={favorites} />

    </div>
  );
}
