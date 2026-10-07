import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Aurora from "../components/style/Aurora";
import { UserContext } from "../context/UserContext";
import { API_URL } from "../lib/api";

const generateKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
};

const Checkout = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [keys, setKeys] = useState([]);
  const [error, setError] = useState("");

  const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cartItems.reduce((acc, item) => acc + item.price, 0);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (cartItems.length === 0 && !confirmed) {
    return (
      <div className="relative min-h-screen w-full bg-black text-white flex items-center justify-center">
        <Navbar />
        <p className="text-gray-400 text-xl">Your cart is empty.</p>
      </div>
    );
  }

  const handleConfirm = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          items: cartItems.map((item) => ({ game_id: item.id, price: item.price })),
        }),
      });

      if (!res.ok) throw new Error("Order failed");

      // Generate a key for each game
      const generatedKeys = cartItems.map((item) => ({
        gameId: item.id,
        title: item.title,
        key: generateKey(),
        purchasedAt: new Date().toLocaleDateString(),
      }));

      // Save keys to localStorage under this user
      const existing = JSON.parse(localStorage.getItem(`gameKeys_${user.id}`) || "[]");
      localStorage.setItem(`gameKeys_${user.id}`, JSON.stringify([...existing, ...generatedKeys]));

      // Clear cart
      localStorage.removeItem("cart");

      setKeys(generatedKeys);
      setConfirmed(true);
    } catch (err) {
      setError("Purchase failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#ff0080", "#8000ff", "#00ffff"]} blend={0.7} amplitude={1.2} speed={1.5} />
      </div>

      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="relative z-10 pt-32 px-8 max-w-3xl mx-auto">
        {!confirmed ? (
          <>
            <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>

            <div className="bg-white/10 rounded-2xl p-6 space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-green-400">${item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 text-xl font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <button
              onClick={handleConfirm}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold text-lg transition"
            >
              Confirm Purchase
            </button>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-4 text-center">Purchase Complete!</h1>
            <p className="text-gray-400 text-center mb-8">Your game keys are saved in your profile.</p>

            <div className="bg-white/10 rounded-2xl p-6 space-y-4 mb-8">
              {keys.map((item) => (
                <div key={item.gameId} className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="font-semibold">{item.title}</span>
                  <span className="font-mono text-purple-300 tracking-widest">{item.key}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/profile")}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold text-lg transition"
              >
                View in Profile
              </button>
              <button
                onClick={() => navigate("/store")}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-full font-semibold text-lg transition"
              >
                Back to Store
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
