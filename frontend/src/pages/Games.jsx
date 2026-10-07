import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Aurora from "../components/style/Aurora";
import GameCard from "../components/GameCard";
import { API_URL } from "../lib/api";

const GENRES = [
  { label: "All", slug: null },
  { label: "Action", slug: "action" },
  { label: "Adventure", slug: "adventure" },
  { label: "RPG", slug: "role-playing-games-rpg" },
  { label: "Strategy", slug: "strategy" },
  { label: "Shooter", slug: "shooter" },
  { label: "Puzzle", slug: "puzzle" },
  { label: "Indie", slug: "indie" },
  { label: "Simulation", slug: "simulation" },
  { label: "Sports", slug: "sports" },
];

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [activeGenre, setActiveGenre] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const url = activeGenre
          ? `${API_URL}/games/genre/${activeGenre}?page=${page}`
          : `${API_URL}/games?page=${page}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch games");
        const data = await res.json();
        setGames(data.results || data);
        setHasNext(!!data.next);
      } catch (err) {
        console.error(err);
        setError("Failed to load games");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [page, activeGenre]);

  const handleGenre = (slug) => {
    setActiveGenre(slug);
    setPage(1);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#ff0080", "#8000ff", "#00ffff"]} blend={0.7} amplitude={1.2} speed={1.5} />
      </div>

      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="relative z-10 pt-32 px-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">All Games</h1>

        {/* Genre Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {GENRES.map((g) => (
            <button
              key={g.label}
              onClick={() => handleGenre(g.slug)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                activeGenre === g.slug
                  ? "bg-purple-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-white">Loading games...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {!loading && games.length === 0 && (
          <p className="text-gray-400 mt-10 text-center">No games found.</p>
        )}

        {!loading && games.length > 0 && (
          <div className="flex justify-center items-center gap-6 mt-10 mb-16">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-white/60">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
