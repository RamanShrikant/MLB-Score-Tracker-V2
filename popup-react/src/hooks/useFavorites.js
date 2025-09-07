import { useEffect, useState, useCallback } from "react";
import { getFavorites, addFavorite, removeFavorite } from "../lib/api";

export default function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  const refresh = useCallback(async () => {
    setFavorites(await getFavorites());
  }, []);

  const add = useCallback(async (teamId, teamName) => {
    await addFavorite(teamId, teamName);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (teamId) => {
    await removeFavorite(teamId);
    await refresh();
  }, [refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  return { favorites, add, remove, refresh };
}
