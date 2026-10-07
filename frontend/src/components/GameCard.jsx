// src/components/GameCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import AddToLibrary from "./AddToLibrary";

const GameCard = ({ game, onStatusChange, onRemove }) => {
  return (
    <div className="relative bg-white/10 rounded-xl overflow-hidden hover:scale-105 transition transform flex flex-col h-[400px]">
      <Link to={`/games/${game.id}`}>
        <img
          src={game.background_image || "https://via.placeholder.com/400x200"}
          alt={game.name}
          className="w-full h-48 object-cover"
        />
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold">{game.name}</h2>
          <p className="text-gray-300 mt-1">
            Genres:{" "}
            {game.genres && game.genres.length > 0
              ? game.genres.map((g) => g.name).join(", ")
              : "N/A"}
          </p>
        </div>

        <p className="text-gray-300 mt-2">Rating: {game.rating}</p>

        {/* AddToLibrary with Wishlist heart inside */}
        <AddToLibrary
          gameId={game.id}
          onStatusChange={onStatusChange}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
};

export default GameCard;