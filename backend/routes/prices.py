import random
from flask import Blueprint, jsonify
from db import get_db
from rawg import rawg_get

prices_bp = Blueprint("prices", __name__)

# Tuning knobs for the sale simulation — tweak these to change how often sales happen
SALE_CHANCE = 0.30       # 30% chance a game goes on sale each update
RESTORE_CHANCE = 0.25    # 25% chance a sale price restores to base price
MIN_DISCOUNT = 0.10      # minimum 10% off
MAX_DISCOUNT = 0.50      # maximum 50% off


def base_price(rating):
    """
    Converts a RAWG rating into a price tier.
    Mirrors the getPrice() function in the frontend so both always agree
    on what the full (non-sale) price of a game is.
    """
    if rating >= 4.5:
        return 59.99
    if rating >= 4.0:
        return 49.99
    if rating >= 3.5:
        return 39.99
    if rating >= 3.0:
        return 29.99
    return 19.99


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

@prices_bp.route("/prices/<int:game_id>", methods=["GET"])
def get_price_history(game_id):
    """
    Returns the full price history for a game, newest first.
    The frontend uses this to show the current price and spot price drops.
    """
    conn = get_db()
    rows = conn.execute(
        "SELECT price, recorded_at FROM prices WHERE game_id = ? ORDER BY recorded_at DESC",
        (game_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows]), 200


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------

@prices_bp.route("/prices/update", methods=["POST"])
def update_prices():
    """
    Simulates a price-check event for every game currently on any wishlist.
    Called when the user presses "Check for Sales" on the wishlist page.

    Logic per game:
      - First time seen → snapshot the base price (no sale yet)
      - Already on sale  → small chance it restores to full price
      - Full price        → random chance it goes on sale at a random discount
      - No change        → nothing is written to the DB

    Only inserts a new row when the price actually changes, so the history
    table stays clean and diffs are meaningful.
    """
    conn = get_db()

    # Grab every unique game across all users' wishlists
    rows = conn.execute("SELECT DISTINCT game_id FROM wishlist").fetchall()
    game_ids = [r["game_id"] for r in rows]

    changes = []

    for game_id in game_ids:
        # Pull the most recent price we have stored for this game (if any)
        latest = conn.execute(
            "SELECT price FROM prices WHERE game_id = ? ORDER BY recorded_at DESC LIMIT 1",
            (game_id,)
        ).fetchone()

        # Ask RAWG for the current rating so we can compute the base price
        data = rawg_get(f"games/{game_id}")
        rating = data.get("rating", 0)
        bp = base_price(rating)  # what the game costs at full price

        if latest is None:
            # No price on record yet — just store the base price as the starting point
            new_price = bp
        else:
            current = latest["price"]
            on_sale = current < bp  # if stored price is below base, it's already on sale

            if on_sale:
                # Give it a chance to bounce back to full price
                new_price = bp if random.random() < RESTORE_CHANCE else current
            else:
                # Give it a chance to go on sale at a random discount
                if random.random() < SALE_CHANCE:
                    discount = random.uniform(MIN_DISCOUNT, MAX_DISCOUNT)
                    new_price = round(bp * (1 - discount), 2)
                else:
                    new_price = current  # price stays the same, nothing to record

        # Skip the write entirely if nothing changed — keeps history clean
        if latest is None or new_price != latest["price"]:
            conn.execute(
                "INSERT INTO prices (game_id, price) VALUES (?, ?)",
                (game_id, new_price)
            )

            old_price = latest["price"] if latest else None
            changes.append({
                "game_id": game_id,
                "old_price": old_price,
                "new_price": new_price,
            })

            # If the price went down, notify every user who has this game wishlisted
            if old_price is not None and new_price < old_price:
                game_name = data.get("name", f"Game {game_id}")
                discount_pct = round((1 - new_price / old_price) * 100)
                message = (
                    f"{game_name} is now ${new_price:.2f} "
                    f"(was ${old_price:.2f}, -{discount_pct}% off)"
                )

                # Find all users who have this game on their wishlist
                wishlist_users = conn.execute(
                    "SELECT DISTINCT user_id FROM wishlist WHERE game_id = ?",
                    (game_id,)
                ).fetchall()

                # Create a notification for each of them
                for row in wishlist_users:
                    conn.execute(
                        """
                        INSERT INTO notifications (user_id, type, message, game_id)
                        VALUES (?, 'price_drop', ?, ?)
                        """,
                        (row["user_id"], message, game_id)
                    )

    conn.commit()
    conn.close()
    return jsonify({"updated": len(changes), "changes": changes}), 200
