from flask import Blueprint, request, jsonify
from rawg import rawg_get

games_bp = Blueprint("games", __name__)


# ---------------------------------------------------------------------------
# Browse
# ---------------------------------------------------------------------------

@games_bp.route("/games", methods=["GET"])
def get_games():
    """
    Returns a list of popular games from RAWG.
    Pass ?page=2 to get the next page. page_size is fixed at 20.
    """
    page = request.args.get("page", 1, type=int)
    data = rawg_get("games", {"ordering": "-rating", "page_size": 20, "page": page})
    return jsonify({
        "results": data.get("results", []),
        "count": data.get("count", 0),
        "next": data.get("next"),
        "previous": data.get("previous")
    }), 200


@games_bp.route("/games/<int:game_id>", methods=["GET"])
def get_game(game_id):
    """
    Returns details for a single game from RAWG using its id.
    """
    data = rawg_get(f"games/{game_id}")
    if "detail" in data:
        return jsonify({"error": "Game not found"}), 404
    return jsonify(data), 200


# ---------------------------------------------------------------------------
# Search & filter
# ---------------------------------------------------------------------------

@games_bp.route("/games/search", methods=["GET"])
def search_games():
    """
    Searches RAWG for games by title.
    Pass a query like /games/search?q=pokemon
    """
    query = request.args.get("q", "")
    data = rawg_get("games", {"search": query, "page_size": 10})
    return jsonify(data.get("results", [])), 200


@games_bp.route("/games/genre/<string:genre_slug>", methods=["GET"])
def get_games_by_genre(genre_slug):
    """
    Returns a list of games filtered by RAWG genre slug.
    Example genre_slugs: action, adventure, rpg, shooter, strategy
    """
    page = request.args.get("page", 1, type=int)
    data = rawg_get("games", {
        "genres": genre_slug,
        "page_size": 20,
        "page": page,
        "ordering": "-rating",
    })
    return jsonify({
        "results": data.get("results", []),
        "next": data.get("next"),
    }), 200
