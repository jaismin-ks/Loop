from flask import Blueprint, request, jsonify
from db import get_db
from validators import validate_add_to_wishlist

wishlist_bp = Blueprint("wishlist", __name__)


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

@wishlist_bp.route("/wishlist/<int:user_id>", methods=["GET"])
def get_wishlist(user_id):
    """
    Returns all games in a user's wishlist.
    """
    conn = get_db()
    entries = conn.execute(
        "SELECT * FROM wishlist WHERE user_id = ?", (user_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(e) for e in entries]), 200


# ---------------------------------------------------------------------------
# Write
# ---------------------------------------------------------------------------

@wishlist_bp.route("/wishlist", methods=["POST"])
def add_to_wishlist():
    """
    Adds a game to a user's wishlist.
    Expects user_id and game_id in the request body.
    """
    data = request.get_json()
    error = validate_add_to_wishlist(data)
    if error:
        return jsonify({"error": error}), 400

    user_id = data["user_id"]
    game_id = data["game_id"]

    conn = get_db()
    existing = conn.execute(
        "SELECT id FROM wishlist WHERE user_id = ? AND game_id = ?", (user_id, game_id)
    ).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "Game already in wishlist"}), 409

    conn.execute(
        "INSERT INTO wishlist (user_id, game_id) VALUES (?, ?)",
        (user_id, game_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Game added to wishlist"}), 201


@wishlist_bp.route("/wishlist/<int:entry_id>", methods=["DELETE"])
def remove_from_wishlist(entry_id):
    """
    Removes a game from the user's wishlist.
    """
    conn = get_db()
    entry = conn.execute("SELECT * FROM wishlist WHERE id = ?", (entry_id,)).fetchone()
    if not entry:
        conn.close()
        return jsonify({"error": "Entry not found"}), 404

    conn.execute("DELETE FROM wishlist WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Game removed from wishlist"}), 200
