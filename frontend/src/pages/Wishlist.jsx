// src/pages/Wishlist.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Aurora from "../components/style/Aurora";
import { UserContext } from "../context/UserContext";
import { API_URL } from "../lib/api";

const getPrice = (game) => {
  if (game.rating >= 4.5) return 59.99;
  if (game.rating >= 4.0) return 49.99;
  if (game.rating >= 3.5) return 39.99;
  if (game.rating >= 3.0) return 29.99;
  return 19.99;
};

const Wishlist = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [priceHistory, setPriceHistory] = useState({}); // { game_id: [{price, recorded_at}] }
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchPriceHistory = async (gameIds) => {
    const entries = await Promise.all(
      gameIds.map(async (id) => {
        const res = await fetch(`${API_URL}/prices/${id}`);
        const data = await res.json();
        return [id, data];
      })
    );
    setPriceHistory(Object.fromEntries(entries));
  };

  useEffect(() => {
    if (!user) return;
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/wishlist/${user.id}`);
        const data = await res.json();

        const gameDetails = await Promise.all(
          data.map(async (entry) => {
            const gRes = await fetch(`${API_URL}/games/${entry.game_id}`);
            const gData = await gRes.json();
            return { ...gData, wishlistEntryId: entry.id };
          })
        );
        const valid = gameDetails.filter((g) => !g.error);
        setItems(valid);
        await fetchPriceHistory(valid.map((g) => g.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  const handleCheckForSales = async () => {
    setChecking(true);
    try {
      await fetch(`${API_URL}/prices/update`, { method: "POST" });
      await fetchPriceHistory(items.map((g) => g.id));
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleRemove = async (wishlistEntryId, gameId) => {
    const res = await fetch(`${API_URL}/wishlist/${wishlistEntryId}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((g) => g.id !== gameId));
      setPriceHistory((prev) => { const next = { ...prev }; delete next[gameId]; return next; });
    }
  };

  const handleAddToCart = (game) => {
    const history = priceHistory[game.id];
    const price = history?.length ? history[0].price : getPrice(game);
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.find((item) => item.id === game.id)) return;
    cart.push({ id: game.id, title: game.name, price, image: game.background_image });
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  };

  if (!user) return <p className="text-white text-center mt-32">Please log in to view your wishlist.</p>;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#ff0080", "#8000ff", "#00ffff"]} blend={0.7} amplitude={1.2} speed={1.5} />
      </div>

      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="relative z-10 pt-32 px-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold">My Wishlist</h1>
          {items.length > 0 && (
            <button
              onClick={handleCheckForSales}
              disabled={checking}
              className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition"
            >
              {checking ? "Checking..." : "Check for Sales"}
            </button>
          )}
        </div>

        {loading && <p className="text-center">Loading wishlist...</p>}

        {!loading && items.length === 0 && (
          <p className="text-gray-400 text-center">Your wishlist is empty. Add games from the store.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((game) => {
            const history = priceHistory[game.id] || [];
            // history is newest-first; current = history[0], original = history[history.length-1]
            const currentPrice = history.length ? history[0].price : getPrice(game);
            const originalPrice = history.length ? history[history.length - 1].price : getPrice(game);
            const onSale = currentPrice < originalPrice;
            const discountPct = onSale
              ? Math.round((1 - currentPrice / originalPrice) * 100)
              : 0;

            return (
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

                  {/* Price + sale badge */}
                  <div className="mt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xl font-bold ${onSale ? "text-green-400" : "text-green-400"}`}>
                        ${currentPrice.toFixed(2)}
                      </span>
                      {onSale && (
                        <>
                          <span className="text-gray-500 line-through text-sm">
                            ${originalPrice.toFixed(2)}
                          </span>
                          <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            -{discountPct}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Price history (last 4 entries) */}
                    {history.length > 1 && (
                      <div className="mt-2 space-y-0.5">
                        {history.slice(0, 4).map((entry, i) => (
                          <p key={i} className="text-xs text-gray-500">
                            ${entry.price.toFixed(2)}{" "}
                            <span className="text-gray-600">
                              — {new Date(entry.recorded_at).toLocaleDateString()}
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 gap-2">
                    <button
                      onClick={() => handleRemove(game.wishlistEntryId, game.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-pink-600 hover:bg-pink-500 transition"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="red" stroke="red" strokeWidth="2">
                        <path d="M12 21s-6-4.35-9-8.28C-1 7.5 3 3 7.5 3c2.04 0 3.57 1.2 4.5 2.34C12.93 4.2 14.46 3 16.5 3 21 3 25 7.5 21 12.72 18 16.65 12 21 12 21z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleAddToCart(game)}
                      className="px-4 py-2 rounded-full font-semibold text-sm bg-purple-600 hover:bg-purple-500 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
