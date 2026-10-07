from flask import Blueprint, request, jsonify
from db import get_db
from validators import validate_add_to_library, validate_update_library_status

library_bp = Blueprint("library", __name__)


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

@library_bp.route("/library/<int:user_id>", methods=["GET"])
def get_library(user_id):
    """
    Returns all games in a user's library.
    """
    conn = get_db()
    entries = conn.execute(
        "SELECT * FROM library WHERE user_id = ?", (user_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(e) for e in entries]), 200


# ---------------------------------------------------------------------------
# Write
# ---------------------------------------------------------------------------

@library_bp.route("/library", methods=["POST"])
def add_to_library():
    """
    Adds a game to a user's library.
    Expects user_id, game_id, and status in the request body.
    """
    data = request.get_json()
    error = validate_add_to_library(data)
    if error:
        return jsonify({"error": error}), 400

    user_id = data["user_id"]
    game_id = data["game_id"]
    status = data.get("status", "Playing")

    conn = get_db()
    existing = conn.execute(
        "SELECT id FROM library WHERE user_id = ? AND game_id = ?", (user_id, game_id)
    ).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "Game already in library"}), 409

    conn.execute(
        "INSERT INTO library (user_id, game_id, status) VALUES (?, ?, ?)",
        (user_id, game_id, status)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Game added to library"}), 201


@library_bp.route("/library/<int:entry_id>", methods=["PUT"])
def update_library_status(entry_id):
    """
    Updates the status of a game in the library.
    Expects status in the request body.
    """
    data = request.get_json()
    error = validate_update_library_status(data)
    if error:
        return jsonify({"error": error}), 400

    status = data["status"]

    conn = get_db()
    entry = conn.execute("SELECT * FROM library WHERE id = ?", (entry_id,)).fetchone()
    if not entry:
        conn.close()
        return jsonify({"error": "Entry not found"}), 404

    conn.execute("UPDATE library SET status = ? WHERE id = ?", (status, entry_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Status updated"}), 200


@library_bp.route("/library/<int:entry_id>", methods=["DELETE"])
def remove_from_library(entry_id):
    """
    Removes a game from the user's library.
    """
    conn = get_db()
    entry = conn.execute("SELECT * FROM library WHERE id = ?", (entry_id,)).fetchone()
    if not entry:
        conn.close()
        return jsonify({"error": "Entry not found"}), 404

    conn.execute("DELETE FROM library WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Game removed from library"}), 200
