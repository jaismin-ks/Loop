from flask import Blueprint, request, jsonify
from db import get_db
from validators import validate_create_playlist, validate_add_game_to_playlist

playlists_bp = Blueprint("playlists", __name__)


# ---------------------------------------------------------------------------
# Playlists
# ---------------------------------------------------------------------------

@playlists_bp.route("/users/<int:user_id>/playlists", methods=["GET"])
def get_playlists(user_id):
    """
    Returns all playlists for a user.
    """
    conn = get_db()
    playlists = conn.execute(
        "SELECT * FROM playlists WHERE user_id = ?", (user_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(p) for p in playlists]), 200


@playlists_bp.route("/playlists", methods=["POST"])
def create_playlist():
    """
    Creates a new playlist for a user.
    Expects user_id and name in the request body.
    """
    data = request.get_json()
    error = validate_create_playlist(data)
    if error:
        return jsonify({"error": error}), 400

    user_id = data["user_id"]
    name = data["name"]

    conn = get_db()
    playlist = conn.execute(
        "INSERT INTO playlists (user_id, name) VALUES (?, ?) RETURNING *",
        (user_id, name)
    ).fetchone()
    conn.commit()
    conn.close()
    return jsonify({"message": "Playlist created", "playlist": dict(playlist)}), 201


# ---------------------------------------------------------------------------
# Playlist games
# ---------------------------------------------------------------------------

@playlists_bp.route("/playlists/<int:playlist_id>/games", methods=["GET"])
def get_playlist_games(playlist_id):
    """
    Returns all games in a playlist.
    """
    conn = get_db()
    playlist = conn.execute("SELECT * FROM playlists WHERE id = ?", (playlist_id,)).fetchone()
    if not playlist:
        conn.close()
        return jsonify({"error": "Playlist not found"}), 404

    games = conn.execute(
        "SELECT * FROM playlist_games WHERE playlist_id = ?", (playlist_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(g) for g in games]), 200


@playlists_bp.route("/playlists/<int:playlist_id>/games", methods=["POST"])
def add_game_to_playlist(playlist_id):
    """
    Adds a game to a playlist.
    Expects game_id in the request body.
    """
    data = request.get_json()
    error = validate_add_game_to_playlist(data)
    if error:
        return jsonify({"error": error}), 400

    game_id = data["game_id"]

    conn = get_db()
    playlist = conn.execute("SELECT * FROM playlists WHERE id = ?", (playlist_id,)).fetchone()
    if not playlist:
        conn.close()
        return jsonify({"error": "Playlist not found"}), 404

    conn.execute(
        "INSERT INTO playlist_games (playlist_id, game_id) VALUES (?, ?)",
        (playlist_id, game_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Game added to playlist"}), 201


@playlists_bp.route("/playlists/<int:playlist_id>/games/<int:game_id>", methods=["DELETE"])
def remove_game_from_playlist(playlist_id, game_id):
    """
    Removes a game from a playlist.
    """
    conn = get_db()
    entry = conn.execute(
        "SELECT * FROM playlist_games WHERE playlist_id = ? AND game_id = ?",
        (playlist_id, game_id)
    ).fetchone()
    if not entry:
        conn.close()
        return jsonify({"error": "Game not found in playlist"}), 404

    conn.execute(
        "DELETE FROM playlist_games WHERE playlist_id = ? AND game_id = ?",
        (playlist_id, game_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Game removed from playlist"}), 200


@playlists_bp.route("/playlists/<int:playlist_id>", methods=["DELETE"])
def delete_playlist(playlist_id):
    """
    Deletes a playlist and all its games.
    """
    conn = get_db()
    playlist = conn.execute("SELECT * FROM playlists WHERE id = ?", (playlist_id,)).fetchone()
    if not playlist:
        conn.close()
        return jsonify({"error": "Playlist not found"}), 404

    conn.execute("DELETE FROM playlist_games WHERE playlist_id = ?", (playlist_id,))
    conn.execute("DELETE FROM playlists WHERE id = ?", (playlist_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Playlist deleted"}), 200
