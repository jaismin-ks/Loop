// src/pages/GameDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Aurora from "../components/style/Aurora";
import { API_URL } from "../lib/api";

const GameDetails = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`${API_URL}/games/${id}`);
        if (!res.ok) throw new Error("Failed to fetch game");
        const data = await res.json();

        const mappedGame = {
          title: data.name || "Unknown Title",
          genres:
            data.genres && data.genres.length > 0
              ? data.genres.map((g) => g.name).join(", ")
              : "Unknown Genre",
          price: data.price || "N/A",
          rating: data.rating || "N/A",
          description: data.description_raw || "No description available.",
          image: data.background_image || null,
        };

        setGame(mappedGame);
      } catch (err) {
        console.error(err);
        setError("Failed to load game information.");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Aurora Background */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#ff0080", "#8000ff", "#00ffff"]}
          blend={0.7}
          amplitude={1.2}
          speed={1.5}
        />
      </div>

      {/* Navbar */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* Page Content */}
      <div className="relative z-10 pt-32 px-6 max-w-6xl mx-auto">
        <Link
          to="/games"
          className="mb-6 text-purple-300 hover:text-purple-200 transition inline-block"
        >
          ← Back to Games
        </Link>

        {loading && <p>Loading game...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {game && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Image */}
            {game.image && (
              <img
                src={game.image}
                alt={game.title}
                className="w-full lg:w-1/2 h-auto rounded-lg object-cover self-start"
              />
            )}

            {/* Right: Text Content */}
            <div className="flex-1 flex flex-col justify-start">
              <h1 className="text-4xl font-bold mb-4">{game.title}</h1>

              <p className="text-gray-300 mb-2">
                <strong>Rating:</strong> {game.rating}
              </p>

              <p className="text-gray-300 mb-2">
                <strong>Genre:</strong> {game.genres}
              </p>

              <p className="text-gray-300 mb-4">
                <strong>Price:</strong>{" "}
                {game.price !== "N/A" ? `$${game.price}` : "N/A"}
              </p>

              <p className="text-gray-300 leading-relaxed">{game.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetails;