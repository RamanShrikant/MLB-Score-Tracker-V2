import { useEffect, useState } from "react";
import { getGames } from "../lib/api";

export default function useGames(dateStr) {
  const [games, setGames] = useState([]);

  useEffect(() => {
    let id;
    (async () => {
      setGames(await getGames(dateStr));
      id = setInterval(async () => setGames(await getGames(dateStr)), 60000);
    })();
    return () => clearInterval(id);
  }, [dateStr]);

  return games;
}
