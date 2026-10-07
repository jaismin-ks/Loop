// src/components/CarouselCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import AddToLibrary from "./AddToLibrary";

const CarouselCard = ({ game, onStatusChange, onRemove }) => {
  return (
    <div className="relative bg-white/10 rounded-xl overflow-visible hover:scale-105 transition-transform transform flex flex-col h-[400px]">
      {/* Game image */}
      <Link to={`/games/${game.id}`}>
        <img
          src={game.background_image || "https://via.placeholder.com/400x200"}
          alt={game.name}
          className="w-full h-48 object-cover rounded-t-xl"
        />
      </Link>

      {/* Info + AddToLibrary */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{game.name}</h2>
        </div>

        {/* AddToLibrary button + heart */}
        <AddToLibrary
          gameId={game.id}
          onStatusChange={onStatusChange}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
};

export default CarouselCard;