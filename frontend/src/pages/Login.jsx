// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import GridMotion from '../components/style/GridMotion';
import Navbar from '../components/Navbar';
import { UserContext } from '../context/UserContext';
import { API_URL } from "../lib/api";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login, loginAsGuest } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);              // update context
        navigate('/');                 // redirect to home
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setMessage('Error connecting to server');
      console.error(err);
    }
  };

  const handleGuest = async () => {
    setMessage('');
    try {
      await loginAsGuest();
      navigate('/');
    } catch (err) {
      setMessage('Could not continue as guest');
      console.error(err);
    }
  };

  // Steam images
  const images = [
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2531310/header.jpg?t=1750959180",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg?t=1754692865",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/952060/header.jpg?t=1768956538",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2651280/header.jpg?t=1763569811",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1222670/header.jpg?t=1773766845",
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

      {/* Login Form */}
      <div className="absolute inset-0 flex items-center justify-center z-40 px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 flex flex-col gap-4 text-white"
        >
          <h2 className="text-3xl font-bold text-center drop-shadow-md">
            Login
          </h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <button
            type="submit"
            className="py-3 bg-purple-600 hover:bg-purple-500 rounded-2xl font-semibold transition shadow-md"
          >
            Login
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

          {message && (
            <p className="text-center mt-2 text-white">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;