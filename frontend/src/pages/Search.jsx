// src/pages/Search.jsx
import { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Aurora from "../components/style/Aurora";
import GameCard from "../components/GameCard";
import { UserContext } from "../context/UserContext";
import { API_URL } from "../lib/api";

const getPrice = (game) => {
  if (game.rating >= 4.5) return 59.99;
  if (game.rating >= 4.0) return 49.99;
  if (game.rating >= 3.5) return 39.99;
  if (game.rating >= 3.0) return 29.99;
  return 19.99;
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState({});
  const [wishlist, setWishlist] = useState({});

  const query = searchParams.get("q") || "";
  const mode = searchParams.get("mode");
  const isStore = mode === "store";

  useEffect(() => {
    if (!query.trim()) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/games/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setGames(data);
      } catch (err) {
        console.error("Search error:", err);
      }
      setLoading(false);
    };
    fetchResults();
  }, [query]);

  useEffect(() => {
    if (!user || !isStore) return;
    const fetchWishlist = async () => {
      const res = await fetch(`${API_URL}/wishlist/${user.id}`);
      const data = await res.json();
      const map = {};
      data.forEach((e) => { map[e.game_id] = e; });
      setWishlist(map);
    };
    fetchWishlist();
  }, [user, isStore]);

  const handleAddToCart = (game) => {
    if (!user) { navigate("/login"); return; }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.find((item) => item.id === game.id)) return;
    cart.push({ id: game.id, title: game.name, price: getPrice(game), image: game.background_image });
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded((prev) => ({ ...prev, [game.id]: true }));
  };

  const toggleWishlist = async (game) => {
    if (!user) { navigate("/login"); return; }
    const entry = wishlist[game.id];
    if (entry) {
      const res = await fetch(`${API_URL}/wishlist/${entry.id}`, { method: "DELETE" });
      if (res.ok) setWishlist((prev) => { const next = { ...prev }; delete next[game.id]; return next; });
    } else {
      const res = await fetch(`${API_URL}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, game_id: game.id }),
      });
      if (res.ok) {
        const list = await fetch(`${API_URL}/wishlist/${user.id}`);
        const data = await list.json();
        const added = data.find((e) => e.game_id === game.id);
        if (added) setWishlist((prev) => ({ ...prev, [game.id]: added }));
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Navbar />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora colorStops={["#ff0080", "#8000ff", "#00ffff"]} blend={0.7} amplitude={1.2} speed={1.5} />
      </div>

      <div className="relative z-40 pt-32 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Search Results</h1>
        {query && <p className="text-gray-400 mb-8">Showing results for "{query}"</p>}

        {loading && <p>Searching...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) =>
            isStore ? (
              <div key={game.id} className="bg-white/10 rounded-xl overflow-hidden flex flex-col">
                <img
                  src={game.background_image || "https://via.placeholder.com/400x200"}
                  alt={game.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{game.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {game.genres?.map((g) => g.name).join(", ") || "N/A"}
                    </p>
                    <p className="text-gray-400 text-sm">Rating: {game.rating}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 gap-2">
                    <span className="text-xl font-bold text-green-400">
                      ${getPrice(game).toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleWishlist(game)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                          wishlist[game.id] ? "bg-pink-600" : "bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlist[game.id] ? "red" : "none"} stroke="red" strokeWidth="2">
                          <path d="M12 21s-6-4.35-9-8.28C-1 7.5 3 3 7.5 3c2.04 0 3.57 1.2 4.5 2.34C12.93 4.2 14.46 3 16.5 3 21 3 25 7.5 21 12.72 18 16.65 12 21 12 21z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleAddToCart(game)}
                        disabled={!!added[game.id]}
                        className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
                          added[game.id] ? "bg-green-700 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-500"
                        }`}
                      >
                        {added[game.id] ? "Added" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <GameCard key={game.id} game={game} />
            )
          )}
        </div>

        {games.length === 0 && !loading && query && (
          <p className="text-gray-400 mt-10">No results for "{query}".</p>
        )}
      </div>
    </div>
  );
};

export default Search;
