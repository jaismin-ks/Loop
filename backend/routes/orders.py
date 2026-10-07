from flask import Blueprint, request, jsonify
from db import get_db
from validators import validate_create_order

orders_bp = Blueprint("orders", __name__)


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

@orders_bp.route("/orders/<int:user_id>", methods=["GET"])
def get_orders(user_id):
    """
    Returns all orders for a user.
    """
    conn = get_db()
    orders = conn.execute(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
    ).fetchall()
    result = []
    for order in orders:
        order_dict = dict(order)
        items = conn.execute(
            "SELECT * FROM order_items WHERE order_id = ?", (order_dict["id"],)
        ).fetchall()
        order_dict["items"] = [dict(i) for i in items]
        result.append(order_dict)
    conn.close()
    return jsonify(result), 200


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

@orders_bp.route("/orders", methods=["POST"])
def create_order():
    """
    Creates a new order.
    Expects user_id and items (list of {game_id, price}) in the request body.
    """
    data = request.get_json()
    error = validate_create_order(data)
    if error:
        return jsonify({"error": error}), 400

    user_id = data["user_id"]
    items = data["items"]
    total = sum(item["price"] for item in items)

    conn = get_db()
    order_id = conn.execute(
        "INSERT INTO orders (user_id, total) VALUES (?, ?) RETURNING id",
        (user_id, total)
    ).fetchone()["id"]

    for item in items:
        conn.execute(
            "INSERT INTO order_items (order_id, game_id, price) VALUES (?, ?, ?)",
            (order_id, item["game_id"], item["price"])
        )

    conn.commit()
    order = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    conn.close()
    return jsonify({"message": "Order created", "order": dict(order)}), 201
