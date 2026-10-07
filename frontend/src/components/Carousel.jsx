// src/components/Carousel.jsx
import React, { useEffect, useState } from "react";
import CarouselCard from "./CarouselCard";
import { API_URL } from "../lib/api";

const Carousel = ({ category }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    const fetchGames = async () => {
      setLoading(true);
      try {
        const url = category.toLowerCase() === "trending"
          ? `${API_URL}/games`
          : `${API_URL}/games/genre/${category.toLowerCase()}`;
        const res = await fetch(url);
        const data = await res.json();
        setGames(data.results || data);
      } catch (err) {
        console.error("Failed to fetch games for carousel:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [category]);

  return (
    <div className="my-8 px-6 bg-transparent"> {/* Transparent background */}
      {/* Heading */}
      <h2 className="text-2xl font-bold text-white mb-4 capitalize">
        {category.toLowerCase() === "trending" ? "Trending" : category}
      </h2>

      {loading ? (
        <p className="text-white">Loading games...</p>
      ) : (
        <div
          className="flex p-4 space-x-6 overflow-x-auto overflow-y-visible scrollbar-hide"
          style={{ flexWrap: "nowrap" }} // prevents wrapping
        >
          {games.map((game) => (
            <div
              key={game.id}
              className="flex-shrink-0 w-72 h-[400px] relative"
              style={{ overflow: "visible" }} // allows hover scale outside card
            >
              <CarouselCard game={game} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;