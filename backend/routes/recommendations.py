from flask import Blueprint, request, jsonify
from db import get_db
from rawg import rawg_get
from collections import Counter
from concurrent.futures import ThreadPoolExecutor

recommendations_bp = Blueprint("recommendations", __name__)

PAGE_SIZE = 12
# 3 genres × 20 results each → up to 60 unique candidates before paginating
MAX_CANDIDATES = 60


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

@recommendations_bp.route("/recommendations/<int:user_id>", methods=["GET"])
def get_recommendations(user_id):
    """
    Returns paginated game recommendations based on the user's library and wishlist.
    Steps:
      1. Collect game_ids from the user's library and wishlist.
      2. Fetch RAWG details for up to 10 source games to extract genres.
      3. Rank genres by frequency and pick the top 3.
      4. Query RAWG for top-rated games in those genres (up to 60 candidates).
      5. Exclude owned/wishlisted games and return a paginated slice.
    Query params:
      ?page=N  (default 1)
    Response:
      { results, page, has_next }
    """
    page = max(1, request.args.get("page", 1, type=int))

    conn = get_db()

    library_rows = conn.execute(
        "SELECT game_id FROM library WHERE user_id = ?", (user_id,)
    ).fetchall()

    wishlist_rows = conn.execute(
        "SELECT game_id FROM wishlist WHERE user_id = ?", (user_id,)
    ).fetchall()

    conn.close()

    source_ids = {row["game_id"] for row in library_rows} | {row["game_id"] for row in wishlist_rows}

    if not source_ids:
        return jsonify({"results": [], "page": page, "has_next": False}), 200

    # Fetch genre data for up to 10 source games to keep RAWG calls reasonable
    # These calls run in parallel since each one waits on RAWG
    genre_counter = Counter()
    with ThreadPoolExecutor(max_workers=10) as pool:
        details = pool.map(lambda gid: rawg_get(f"games/{gid}"), list(source_ids)[:10])
    for data in details:
        for genre in data.get("genres", []):
            genre_counter[genre["slug"]] += 1

    if not genre_counter:
        return jsonify({"results": [], "page": page, "has_next": False}), 200

    top_genres = [slug for slug, _ in genre_counter.most_common(3)]

    # Build a pool of unique candidates not already owned or wishlisted
    seen_ids = set(source_ids)
    candidates = []

    with ThreadPoolExecutor(max_workers=3) as pool:
        genre_results = list(pool.map(
            lambda slug: rawg_get("games", {"genres": slug, "ordering": "-rating", "page_size": 20}),
            top_genres
        ))

    for data in genre_results:
        for game in data.get("results", []):
            if game["id"] not in seen_ids:
                seen_ids.add(game["id"])
                candidates.append(game)
            if len(candidates) >= MAX_CANDIDATES:
                break
        if len(candidates) >= MAX_CANDIDATES:
            break

    # Paginate the candidates list
    start = (page - 1) * PAGE_SIZE
    end = start + PAGE_SIZE
    results = candidates[start:end]
    has_next = end < len(candidates)

    return jsonify({"results": results, "page": page, "has_next": has_next}), 200
