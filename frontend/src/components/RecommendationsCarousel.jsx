// src/components/RecommendationsCarousel.jsx
import React, { useEffect, useState, useContext } from "react";
import CarouselCard from "./CarouselCard";
import { UserContext } from "../context/UserContext";
import { API_URL } from "../lib/api";

const RecommendationsCarousel = () => {
  const { user } = useContext(UserContext);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/recommendations/${user.id}`);
        const data = await res.json();
        setGames(data.results || []);
        setFetched(true);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [user]);

  if (!user) return null;

  return (
    <div className="my-8 px-6">
      <h2 className="text-2xl font-bold text-white mb-4">Recommended for You</h2>

      {loading && <p className="text-white">Finding recommendations...</p>}

      {!loading && fetched && games.length === 0 && (
        <p className="text-gray-400 text-sm">
          Add games to your library or wishlist to get personalised recommendations.
        </p>
      )}

      {!loading && games.length > 0 && (
        <div
          className="flex p-4 space-x-6 overflow-x-auto scrollbar-hide"
          style={{ flexWrap: "nowrap" }}
        >
          {games.map((game) => (
            <div
              key={game.id}
              className="flex-shrink-0 w-72 h-[400px] relative"
              style={{ overflow: "visible" }}
            >
              <CarouselCard game={game} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsCarousel;
