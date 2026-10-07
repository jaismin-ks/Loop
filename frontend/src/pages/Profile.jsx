// src/pages/Profile.jsx
import { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import Aurora from '../components/style/Aurora';
import { UserContext } from '../context/UserContext';
import { API_URL } from "../lib/api";

const Profile = () => {
  const { user, login } = useContext(UserContext);
  const [tab, setTab] = useState("profile");
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [gameKeys, setGameKeys] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/profile/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setEmail(data.user.email || '');
          setBio(data.user.bio || '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
    const keys = JSON.parse(localStorage.getItem(`gameKeys_${user.id}`) || "[]");
    setGameKeys(keys);
  }, [user]);

  useEffect(() => {
    if (!user || tab !== "orders") return;
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${user.id}`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, [user, tab]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const payload = {};
    if (email) payload.email = email;
    if (bio) payload.bio = bio;
    if (password) payload.password = password;
    try {
      const res = await fetch(`${API_URL}/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully!');
        login(data.user);
        setPassword('');
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
      console.error(err);
    }
  };

  if (!user) return <p className="text-white text-center mt-32">Please log in to view your profile.</p>;

  const TABS = ["profile", "orders", "keys"];
  const TAB_LABELS = { profile: "Edit Profile", orders: "Orders", keys: "Game Keys" };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#ff0080", "#8000ff", "#00ffff"]} blend={0.7} amplitude={1.2} speed={1.5} />
      </div>

      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="relative z-10 pt-32 px-10 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-6">{user.username}</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                tab === t ? "bg-purple-600" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Edit Profile Tab */}
        {tab === "profile" && (
          <form
            onSubmit={handleUpdate}
            className="w-full max-w-md p-6 flex flex-col gap-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl"
          >
            {message && <p className="text-green-400 text-center text-sm">{message}</p>}
            {error && <p className="text-red-500 text-center text-sm">{error}</p>}

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-300">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-300">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                className="px-3 py-2 rounded-lg bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-300">New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            <button type="submit"
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold text-sm transition mt-1">
              Update Profile
            </button>
          </form>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6">Order History</h3>
            {orders.length === 0 ? (
              <p className="text-gray-400">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-400">Order #{order.id} · {new Date(order.created_at).toLocaleDateString()}</span>
                      <span className="font-bold text-green-400">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm text-gray-300">
                          <span>Game #{item.game_id}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Game Keys Tab */}
        {tab === "keys" && (
          <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6">Your Game Keys</h3>
            {gameKeys.length === 0 ? (
              <p className="text-gray-400">No keys yet. Purchase games from the store.</p>
            ) : (
              <div className="space-y-4">
                {gameKeys.map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-gray-400 text-sm">Purchased {item.purchasedAt}</p>
                    </div>
                    <span className="font-mono text-purple-300 tracking-widest text-sm">{item.key}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
