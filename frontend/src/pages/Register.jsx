// src/pages/Register.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import GridMotion from '../components/style/GridMotion';
import Navbar from '../components/Navbar';
import { UserContext } from '../context/UserContext';
import { API_URL } from "../lib/api";

const Register = () => {
  const { login, loginAsGuest } = useContext(UserContext); // update context on register
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);       // log the user in
        navigate('/');          // redirect to home
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
      console.error(err);
    }
  };

  const handleGuest = async () => {
    setError('');
    try {
      await loginAsGuest();
      navigate('/');
    } catch (err) {
      setError('Could not continue as guest.');
      console.error(err);
    }
  };

  // Steam images for background
  const images = [
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2531310/header.jpg?t=1750959180",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg?t=1754692865",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/952060/header.jpg?t=1768956538",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2651280/header.jpg?t=1763569811",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1222670/header.jpg?t=1773766845",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2707930/b083c84354a491693c46203f64e25eaaf7b78356/header.jpg?t=1747075758",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/972660/header.jpg?t=1752503178",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1426210/header.jpg?t=1763484491",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1222700/header.jpg?t=1730912036",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2001120/header.jpg?t=1763484567",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2840770/27aa6d8f9c3f11dc93a557164d30a9ba08a7c46a/header.jpg?t=1769463197",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/377160/header.jpg?t=1764687456",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/e9047d8ec47ae3d94bb8b464fb0fc9e9972b4ac7/header.jpg?t=1769690377",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ad9240e088f953a84aee814034c50a6a92bf4516/header.jpg?t=1768303991",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg?t=1767883716"
  ];

  const items = Array.from({ length: 40 }, (_, i) => images[i % images.length]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-10 opacity-70 pointer-events-none">
        <GridMotion items={items} gradientColor="black" />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-20"></div>

      {/* Navbar */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* Register Form */}
      <div className="absolute inset-0 flex items-center justify-center z-40 px-4">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 flex flex-col gap-4 text-white"
        >
          <h2 className="text-3xl font-bold text-center drop-shadow-md">
            Register
          </h2>

          {message && <p className="text-green-400 text-center">{message}</p>}
          {error && <p className="text-red-400 text-center">{error}</p>}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="p-3 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <button
            type="submit"
            className="py-3 bg-purple-600 hover:bg-purple-500 rounded-2xl font-semibold transition shadow-md"
          >
            Create Account
          </button>

          <div className="flex items-center gap-3 text-white/60 text-sm">
            <div className="flex-1 h-px bg-white/20" />
            or
            <div className="flex-1 h-px bg-white/20" />
          </div>

          <button
            type="button"
            onClick={handleGuest}
            className="py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-2xl font-semibold transition"
          >
            Continue as Guest
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;