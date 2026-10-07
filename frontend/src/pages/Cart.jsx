// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Aurora from "../components/style/Aurora";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(savedCart);
  }, []);

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#ff0080", "#8000ff", "#00ffff"]} blend={0.7} amplitude={1.2} speed={1.5} />
      </div>

      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="relative z-10 pt-32 px-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">Your cart is empty.</p>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="text-green-400 text-sm">${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm text-red-400 hover:text-red-300 transition"
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2 text-xl font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3 mt-2 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold text-lg transition"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
