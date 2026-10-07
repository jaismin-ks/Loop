import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Aurora from "../components/style/Aurora";
import { UserContext } from "../context/UserContext";
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

const getPrice = (game) => {
  if (game.rating >= 4.5) return 59.99;
  if (game.rating >= 4.0) return 49.99;
  if (game.rating >= 3.5) return 39.99;
  if (game.rating >= 3.0) return 29.99;
  return 19.99;
};

const HeartButton = ({ game, wishlist, setWishlist, user, navigate }) => {
  const entry = wishlist[game.id];
  const wishlisted = !!entry;

  const toggle = async () => {
    if (!user) { navigate("/login"); return; }

    if (wishlisted) {
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
    <button
      onClick={toggle}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
        wishlisted ? "bg-pink-600" : "bg-white/10 hover:bg-white/20"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? "red" : "none"} stroke="red" strokeWidth="2">
        <path d="M12 21s-6-4.35-9-8.28C-1 7.5 3 3 7.5 3c2.04 0 3.57 1.2 4.5 2.34C12.93 4.2 14.46 3 16.5 3 21 3 25 7.5 21 12.72 18 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
};

const Store = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [added, setAdded] = useState({});
  const [activeGenre, setActiveGenre] = useState(null);
  const [wishlist, setWishlist] = useState({}); // { game_id: wishlist_entry }

  // Load user's wishlist on mount
  useEffect(() => {
    if (!user) return;
    const fetchWishlist = async () => {
      const res = await fetch(`${API_URL}/wishlist/${user.id}`);
      const data = await res.json();
      const map = {};
      data.forEach((e) => { map[e.game_id] = e; });
      setWishlist(map);
    };
    fetchWishlist();
  }, [user]);

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

  const handleGenre = (slug) => { setActiveGenre(slug); setPage(1); };

  const handleAddToCart = (game) => {
    if (!user) { navigate("/login"); return; }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.find((item) => item.id === game.id)) return;
    cart.push({ id: game.id, title: game.name, price: getPrice(game), image: game.background_image });
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded((prev) => ({ ...prev, [game.id]: true }));
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
        <h1 className="text-4xl font-bold mb-6 text-center">Store</h1>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {GENRES.map((g) => (
            <button
              key={g.label}
              onClick={() => handleGenre(g.slug)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                activeGenre === g.slug ? "bg-purple-600" : "bg-white/10 hover:bg-white/20"
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
                    <HeartButton game={game} wishlist={wishlist} setWishlist={setWishlist} user={user} navigate={navigate} />
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
          ))}
        </div>

        {!loading && games.length === 0 && (
          <p className="text-gray-400 mt-10 text-center">No games found.</p>
        )}

        {!loading && games.length > 0 && (
          <div className="flex justify-center items-center gap-6 mt-10 mb-16">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition">
              Previous
            </button>
            <span className="text-white/60">Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={!hasNext}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;
