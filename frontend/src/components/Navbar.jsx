import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { API_URL } from "../lib/api";

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/notifications/${user.id}`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    await fetch(`${API_URL}/notifications/${id}/read`, { method: "PUT" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: 1 } : n));
  };

  const handleMarkAllRead = async () => {
    await fetch(`${API_URL}/notifications/read-all/${user.id}`, { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
  };

  const showSearch = ["/games", "/store"].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const mode = location.pathname === "/store" ? "&mode=store" : "";
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}${mode}`);
    setSearchQuery("");
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-6xl
                    backdrop-blur-md bg-white/10 border border-white/30 rounded-[30px]
                    shadow-lg z-50 px-6 py-3 flex items-center justify-between">

      {/* Logo */}
      <div className="text-xl font-bold text-white drop-shadow-md">
        loop
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6 items-center">
        <Link className="text-white hover:text-purple-300 transition" to="/">Home</Link>
        <Link className="text-white hover:text-purple-300 transition" to="/games">Games</Link>
        <Link className="text-white hover:text-purple-300 transition" to="/store">Store</Link>

        {user && <Link className="text-white hover:text-purple-300 transition" to="/profile">Profile</Link>}
        {user && <Link className="text-white hover:text-purple-300 transition" to="/library">Library</Link>}
        {user && <Link className="text-white hover:text-purple-300 transition" to="/wishlist">Wishlist</Link>}
        {user && <Link className="text-white hover:text-purple-300 transition" to="/cart">Cart</Link>}
      </div>

      {/* Right side: search + auth */}
      <div className="flex items-center gap-3">
        {showSearch && (
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="px-3 py-1 rounded-[20px] bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm w-40"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-[20px] border border-white/50 text-white hover:bg-white/20 transition text-sm"
            >
              Search
            </button>
          </form>
        )}

        {!user ? (
          <>
            <Link className="px-4 py-1 rounded-[20px] border border-white/50 text-white hover:bg-white/20 transition" to="/login">Login</Link>
            <Link className="px-4 py-1 rounded-[20px] border border-white/50 text-white hover:bg-white/20 transition" to="/register">Register</Link>
          </>
        ) : (
          <>
            {/* Notification bell */}
            <div ref={bellRef} className="relative">
              <button
                onClick={() => setBellOpen((o) => !o)}
                className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-white/20 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-purple-400 hover:text-purple-300 transition">
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-6">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition ${!n.is_read ? "bg-white/10" : ""}`}
                        >
                          <p className={`text-sm ${!n.is_read ? "font-semibold text-white" : "text-gray-400"}`}>
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="px-4 py-1 rounded-[20px] border border-white/50 text-white hover:bg-white/20 transition">
              Log Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
