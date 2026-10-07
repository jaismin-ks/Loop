// src/pages/Library.jsx
import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Aurora from "../components/style/Aurora";
import { UserContext } from "../context/UserContext";
import GameCard from "../components/GameCard";
import { API_URL } from "../lib/api";

const Library = () => {
  const { user } = useContext(UserContext);
  const [tab, setTab] = useState("games");

  // --- My Games ---
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // --- Playlists ---
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [activePlaylist, setActivePlaylist] = useState(null); // { id, name, games: [] }
  const [playlistLoading, setPlaylistLoading] = useState(false);

  // --- Add to Playlist dropdown ---
  const [openDropdown, setOpenDropdown] = useState(null); // game_id

  useEffect(() => {
    if (!user) return;
    const fetchLibrary = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/library/${user.id}`);
        const data = await res.json();
        const seen = new Set();
        const unique = data.filter((e) => { if (seen.has(e.game_id)) return false; seen.add(e.game_id); return true; });
        const gameDetails = await Promise.all(
          unique.map(async (entry) => {
            try {
              const r = await fetch(`${API_URL}/games/${entry.game_id}`);
              const g = await r.json();
              return { ...g, libraryEntryId: entry.id, status: entry.status };
            } catch { return null; }
          })
        );
        setGames(gameDetails.filter(Boolean));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchLibrary();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    fetchPlaylists();
  }, [user?.id]);

  const fetchPlaylists = async () => {
    const res = await fetch(`${API_URL}/users/${user.id}/playlists`);
    const data = await res.json();
    setPlaylists(data);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    const res = await fetch(`${API_URL}/playlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, name: newPlaylistName.trim() }),
    });
    if (res.ok) {
      setNewPlaylistName("");
      fetchPlaylists();
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    const res = await fetch(`${API_URL}/playlists/${playlistId}`, { method: "DELETE" });
    if (res.ok) {
      if (activePlaylist?.id === playlistId) setActivePlaylist(null);
      fetchPlaylists();
    }
  };

  const handleOpenPlaylist = async (playlist) => {
    if (activePlaylist?.id === playlist.id) { setActivePlaylist(null); return; }
    setPlaylistLoading(true);
    const res = await fetch(`${API_URL}/playlists/${playlist.id}/games`);
    const data = await res.json();
    // Fetch game details for each entry
    const gameDetails = await Promise.all(
      data.map(async (entry) => {
        try {
          const r = await fetch(`${API_URL}/games/${entry.game_id}`);
          const g = await r.json();
          return { ...g, game_id: entry.game_id };
        } catch { return null; }
      })
    );
    setActivePlaylist({ ...playlist, games: gameDetails.filter(Boolean) });
    setPlaylistLoading(false);
  };

  const handleAddToPlaylist = async (playlistId, gameId) => {
    await fetch(`${API_URL}/playlists/${playlistId}/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: gameId }),
    });
    setOpenDropdown(null);
  };

  const handleRemoveFromPlaylist = async (gameId) => {
    await fetch(`${API_URL}/playlists/${activePlaylist.id}/games/${gameId}`, { method: "DELETE" });
    setActivePlaylist((prev) => ({ ...prev, games: prev.games.filter((g) => g.game_id !== gameId) }));
  };

  const filteredGames = filter === "All" ? games : games.filter((g) => g.status?.toLowerCase() === filter.toLowerCase());

  if (!user) return <p className="text-white text-center mt-32">Please log in to view your library.</p>;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#ff0080", "#8000ff", "#00ffff"]} blend={0.7} amplitude={1.2} speed={1.5} />
      </div>

      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="relative z-10 pt-32 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">My Library</h1>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {["games", "playlists"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-full font-semibold transition capitalize ${
                tab === t ? "bg-purple-600" : "bg-white/10 hover:bg-white/20"
              }`}>
              {t === "games" ? "My Games" : "Playlists"}
            </button>
          ))}
        </div>

        {/* MY GAMES TAB */}
        {tab === "games" && (
          <>
            <div className="flex justify-center gap-3 mb-8 flex-wrap">
              {["All", "Playing", "Completed"].map((s) => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    filter === s ? "bg-purple-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                  }`}>
                  {s}
                </button>
              ))}
            </div>

            {loading && <p className="text-center text-white">Loading library...</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <div key={game.id} className="relative">
                  <GameCard
                    game={game}
                    onStatusChange={(newStatus) => setGames((prev) => prev.map((g) => g.id === game.id ? { ...g, status: newStatus } : g))}
                    onRemove={() => setGames((prev) => prev.filter((g) => g.id !== game.id))}
                  />
                  {/* Add to Playlist button */}
                  <div className="relative mt-2">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === game.id ? null : game.id)}
                      className="w-full py-1.5 text-sm rounded-xl bg-white/10 hover:bg-white/20 transition"
                    >
                      + Add to Playlist
                    </button>
                    {openDropdown === game.id && (
                      <div className="absolute bottom-full mb-1 left-0 w-full bg-gray-800 border border-white/20 rounded-xl overflow-hidden z-20">
                        {playlists.length === 0 ? (
                          <p className="text-gray-400 text-sm px-3 py-2">No playlists yet</p>
                        ) : (
                          playlists.map((pl) => (
                            <button key={pl.id} onClick={() => handleAddToPlaylist(pl.id, game.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition">
                              {pl.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!loading && filteredGames.length === 0 && (
              <p className="text-gray-400 mt-10 text-center">No games in this category.</p>
            )}
          </>
        )}

        {/* PLAYLISTS TAB */}
        {tab === "playlists" && (
          <div className="max-w-2xl mx-auto">
            {/* Create playlist */}
            <div className="flex gap-2 mb-8">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                placeholder="New playlist name..."
                className="flex-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button onClick={handleCreatePlaylist}
                className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 font-semibold text-sm transition">
                Create
              </button>
            </div>

            {playlists.length === 0 ? (
              <p className="text-gray-400 text-center">No playlists yet. Create one above.</p>
            ) : (
              <div className="space-y-3">
                {playlists.map((pl) => (
                  <div key={pl.id} className="bg-white/10 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="flex justify-between items-center px-5 py-4">
                      <button onClick={() => handleOpenPlaylist(pl)} className="font-semibold text-left hover:text-purple-300 transition">
                        {pl.name}
                      </button>
                      <button onClick={() => handleDeletePlaylist(pl.id)}
                        className="text-sm text-red-400 hover:text-red-300 transition">
                        Delete
                      </button>
                    </div>

                    {/* Expanded playlist games */}
                    {activePlaylist?.id === pl.id && (
                      <div className="border-t border-white/10 px-5 py-4">
                        {playlistLoading ? (
                          <p className="text-gray-400 text-sm">Loading...</p>
                        ) : activePlaylist.games.length === 0 ? (
                          <p className="text-gray-400 text-sm">No games in this playlist yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {activePlaylist.games.map((g) => (
                              <div key={g.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  {g.background_image && (
                                    <img src={g.background_image} alt={g.name} className="w-10 h-10 rounded object-cover" />
                                  )}
                                  <div>
                                    <p className="text-sm font-semibold">{g.name}</p>
                                    {(() => {
                                      const status = games.find((lib) => lib.id === g.id)?.status;
                                      return status ? (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                          status === "Completed" ? "bg-green-600" : "bg-yellow-600"
                                        }`}>
                                          {status}
                                        </span>
                                      ) : null;
                                    })()}
                                  </div>
                                </div>
                                <button onClick={() => handleRemoveFromPlaylist(g.game_id)}
                                  className="text-xs text-red-400 hover:text-red-300 transition">
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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

export default Library;
