import secrets
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db, IntegrityError
from validators import validate_register, validate_login, validate_update_profile

auth_bp = Blueprint("auth", __name__)


def public_user(user):
    """Returns the user as a dict without the password hash, which should never leave the server."""
    user = dict(user)
    user.pop("password", None)
    return user


def password_matches(stored, given):
    """
    Checks a password against what's stored.
    Accounts made before hashing was added still have a plain-text password, so fall back to that.
    """
    if stored.startswith(("scrypt:", "pbkdf2:")):
        return check_password_hash(stored, given)
    return secrets.compare_digest(stored, given)


# ---------------------------------------------------------------------------
# Register / Login
# ---------------------------------------------------------------------------

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Creates a new user account.
    Expects a JSON body with 'username' and 'password'.
    Returns an error if the username is already taken.
    """
    data = request.get_json()
    error = validate_register(data)
    if error:
        return jsonify({"error": error}), 400

    username = data["username"]
    password = data["password"]

    conn = get_db()

    try:
        conn.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, generate_password_hash(password))
        )
        conn.commit()
        user = conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
        return jsonify({"message": "Account created", "user": public_user(user)}), 201
    except IntegrityError:
        return jsonify({"error": "Username already taken"}), 409
    finally:
        conn.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Logs in a user by checking their username and password.
    Expects a JSON body with 'username' and 'password'.
    Returns the user info if credentials match, or an error if not.
    """
    data = request.get_json()
    error = validate_login(data)
    if error:
        return jsonify({"error": error}), 400

    username = data["username"]
    password = data["password"]

    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ?", (username,)
    ).fetchone()

    if not user or not password_matches(user["password"], password):
        conn.close()
        return jsonify({"error": "Invalid username or password"}), 401

    # Upgrade old plain-text passwords to a hash the first time they log in
    if not user["password"].startswith(("scrypt:", "pbkdf2:")):
        conn.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            (generate_password_hash(password), user["id"])
        )
        conn.commit()
    conn.close()

    return jsonify({"message": "Login successful", "user": public_user(user)}), 200


@auth_bp.route("/guest", methods=["POST"])
def guest():
    """
    Creates a throwaway guest account so visitors can try the app without signing up.
    Each guest gets their own account, so guests don't see each other's libraries or wishlists.
    """
    conn = get_db()
    try:
        for _ in range(5):
            username = f"guest_{secrets.token_hex(3)}"
            try:
                conn.execute(
                    "INSERT INTO users (username, password) VALUES (?, ?)",
                    (username, generate_password_hash(secrets.token_urlsafe(16)))
                )
                conn.commit()
                break
            except IntegrityError:
                conn.rollback()
                continue  # rare name collision, try another
        else:
            return jsonify({"error": "Could not create guest account"}), 500

        user = conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
        return jsonify({"message": "Guest account created", "user": public_user(user)}), 201
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

@auth_bp.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    """
    Returns a user's profile info by user_id.
    """
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": public_user(user)}), 200


@auth_bp.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    """
    Updates a user's profile info: email, bio, password.
    The user_id comes from the URL like /profile/1.
    Only updates the fields that are included in the request body.
    """
    data = request.get_json()
    error = validate_update_profile(data)
    if error:
        return jsonify({"error": error}), 400

    conn = get_db()

    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404

    if "email" in data:
        conn.execute("UPDATE users SET email = ? WHERE id = ?", (data["email"], user_id))
    if "bio" in data:
        conn.execute("UPDATE users SET bio = ? WHERE id = ?", (data["bio"], user_id))
    if "password" in data:
        conn.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            (generate_password_hash(data["password"]), user_id)
        )

    conn.commit()

    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()

    return jsonify({"message": "Profile updated", "user": public_user(user)}), 200
