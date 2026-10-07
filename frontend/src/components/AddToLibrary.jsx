// src/components/AddToLibrary.jsx
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { API_URL } from "../lib/api";

const STATUS_COLORS = {
  Playing: "bg-yellow-600 hover:bg-yellow-500",
  Completed: "bg-green-600 hover:bg-green-500",
};

const AddToLibrary = ({ gameId, onStatusChange, onRemove }) => {
  const { user } = useContext(UserContext);
  const [status, setStatus] = useState("");
  const [entryId, setEntryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchLibraryEntry = async () => {
      try {
        const res = await fetch(`${API_URL}/library/${user.id}`);
        const data = await res.json();
        const entry = data.find((e) => e.game_id === gameId);
        if (entry) {
          setStatus(entry.status);
          setEntryId(entry.id);
          setInLibrary(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLibraryEntry();
  }, [gameId, user]);

  const handleAdd = async (newStatus = "Playing") => {
    if (!user) { alert("Please log in to add to library"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/library`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, game_id: gameId, status: newStatus }),
      });
      if (res.ok) {
        const libRes = await fetch(`${API_URL}/library/${user.id}`);
        const libData = await libRes.json();
        const entry = libData.find((e) => e.game_id === gameId);
        if (entry) {
          setEntryId(entry.id);
          setStatus(entry.status);
          setInLibrary(true);
          if (onStatusChange) onStatusChange(entry.status);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!entryId) return;
    if (newStatus === "Remove") {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/library/${entryId}`, { method: "DELETE" });
        if (res.ok) {
          setStatus(""); setEntryId(null); setInLibrary(false);
          if (onRemove) onRemove();
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/library/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (!inLibrary) {
    return (
      <div className="mt-3 w-full">
        <button
          onClick={() => handleAdd("Playing")}
          disabled={loading}
          className="w-full py-2 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 text-white transition"
        >
          {loading ? "Adding..." : "Add to Library"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 relative w-full">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={loading}
        className={`w-full px-4 py-2 rounded-xl font-semibold text-white appearance-none pr-10 transition ${
          STATUS_COLORS[status] || "bg-purple-600"
        }`}
      >
        {["Playing", "Completed", "Remove"].map((s) => (
          <option key={s} value={s}>
            {s === "Remove" ? "Remove from Library" : s}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2 w-5 h-5">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default AddToLibrary;
