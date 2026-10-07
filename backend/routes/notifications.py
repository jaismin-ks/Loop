from flask import Blueprint, jsonify
from db import get_db
from rawg import rawg_get

notifications_bp = Blueprint("notifications", __name__)


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

@notifications_bp.route("/notifications/<int:user_id>", methods=["GET"])
def get_notifications(user_id):
    """
    Returns all notifications for a user, unread first then newest first.
    """
    conn = get_db()
    rows = conn.execute(
        """
        SELECT id, type, message, game_id, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY is_read ASC, created_at DESC
        """,
        (user_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows]), 200


# ---------------------------------------------------------------------------
# Mark read
# ---------------------------------------------------------------------------

@notifications_bp.route("/notifications/<int:notification_id>/read", methods=["PUT"])
def mark_read(notification_id):
    """Marks a single notification as read."""
    conn = get_db()
    row = conn.execute(
        "SELECT id FROM notifications WHERE id = ?", (notification_id,)
    ).fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Notification not found"}), 404

    conn.execute(
        "UPDATE notifications SET is_read = 1 WHERE id = ?", (notification_id,)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Marked as read"}), 200


@notifications_bp.route("/notifications/read-all/<int:user_id>", methods=["PUT"])
def mark_all_read(user_id):
    """Marks all notifications for a user as read."""
    conn = get_db()
    conn.execute(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "All notifications marked as read"}), 200


# ---------------------------------------------------------------------------
# DLC check
# ---------------------------------------------------------------------------

@notifications_bp.route("/notifications/check-dlc", methods=["POST"])
def check_dlc():
    """
    Scans every game across all users' libraries for new DLC via RAWG.
    For each DLC not yet in known_dlc, notifies every user who has the
    parent game in their library and records the DLC so it won't fire again.

    Returns a summary of how many new DLC entries were found.
    """
    conn = get_db()

    # Map game_id → set of user_ids who own it
    library_rows = conn.execute(
        "SELECT user_id, game_id FROM library"
    ).fetchall()

    game_to_users = {}
    for row in library_rows:
        game_to_users.setdefault(row["game_id"], set()).add(row["user_id"])

    new_dlc_count = 0

    for game_id, user_ids in game_to_users.items():
        data = rawg_get(f"games/{game_id}/additions")
        additions = data.get("results", [])

        for dlc in additions:
            dlc_id = dlc.get("id")
            dlc_name = dlc.get("name", "Unknown DLC")

            # Skip if we've already seen this DLC
            existing = conn.execute(
                "SELECT id FROM known_dlc WHERE game_id = ? AND dlc_id = ?",
                (game_id, dlc_id)
            ).fetchone()
            if existing:
                continue

            # Record it so future checks don't re-notify
            conn.execute(
                "INSERT OR IGNORE INTO known_dlc (game_id, dlc_id, dlc_name) VALUES (?, ?, ?)",
                (game_id, dlc_id, dlc_name)
            )

            # Fetch the parent game name for a readable message
            game_data = rawg_get(f"games/{game_id}")
            game_name = game_data.get("name", f"Game {game_id}")

            message = f"New DLC available for {game_name}: {dlc_name}"

            for user_id in user_ids:
                conn.execute(
                    """
                    INSERT INTO notifications (user_id, type, message, game_id)
                    VALUES (?, 'dlc_update', ?, ?)
                    """,
                    (user_id, message, game_id)
                )

            new_dlc_count += 1

    conn.commit()
    conn.close()
    return jsonify({"new_dlc_found": new_dlc_count}), 200
