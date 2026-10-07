def validate_register(data):
    """
    Validates registration input.
    Requires 'username' and 'password', both non-empty strings.
    Returns an error message string, or None if valid.
    """
    if not data or "username" not in data or "password" not in data:
        return "username and password are required"
    if not data["username"].strip():
        return "username cannot be empty"
    if not data["password"].strip():
        return "password cannot be empty"
    return None


def validate_login(data):
    """
    Validates login input.
    Requires 'username' and 'password'.
    Returns an error message string, or None if valid.
    """
    if not data or "username" not in data or "password" not in data:
        return "username and password are required"
    return None


def validate_update_profile(data):
    """
    Validates profile update input.
    Requires at least one of: 'email', 'bio', or 'password'.
    Returns an error message string, or None if valid.
    """
    if not data:
        return "request body is required"
    allowed = {"email", "bio", "password"}
    if not any(k in data for k in allowed):
        return "at least one of email, bio, or password is required"
    return None


def validate_add_to_library(data):
    """
    Validates adding a game to a user's library.
    Requires 'user_id' and 'game_id'.
    Returns an error message string, or None if valid.
    """
    if not data or "user_id" not in data or "game_id" not in data:
        return "user_id and game_id are required"
    return None


def validate_update_library_status(data):
    """
    Validates a library status update.
    Requires 'status'.
    Returns an error message string, or None if valid.
    """
    if not data or "status" not in data:
        return "status is required"
    return None


def validate_add_to_wishlist(data):
    """
    Validates adding a game to a user's wishlist.
    Requires 'user_id' and 'game_id'.
    Returns an error message string, or None if valid.
    """
    if not data or "user_id" not in data or "game_id" not in data:
        return "user_id and game_id are required"
    return None


def validate_create_playlist(data):
    """
    Validates playlist creation input.
    Requires 'user_id' and a non-empty 'name'.
    Returns an error message string, or None if valid.
    """
    if not data or "user_id" not in data or "name" not in data:
        return "user_id and name are required"
    if not data["name"].strip():
        return "playlist name cannot be empty"
    return None


def validate_add_game_to_playlist(data):
    """
    Validates adding a game to a playlist.
    Requires 'game_id'.
    Returns an error message string, or None if valid.
    """
    if not data or "game_id" not in data:
        return "game_id is required"
    return None


def validate_create_order(data):
    """
    Validates order creation input.
    Requires 'user_id' and a non-empty 'items' list.
    Each item must have 'game_id' and a non-negative 'price'.
    Returns an error message string, or None if valid.
    """
    if not data or "user_id" not in data or "items" not in data:
        return "user_id and items are required"
    if not isinstance(data["items"], list) or len(data["items"]) == 0:
        return "items must be a non-empty list"
    for item in data["items"]:
        if "game_id" not in item or "price" not in item:
            return "each item must have game_id and price"
        if item["price"] < 0:
            return "price cannot be negative"
    return None
