import os
import sqlite3
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

# If DATABASE_URL is set (e.g. on Vercel with Neon), use Postgres.
# Otherwise fall back to a local SQLite file so local dev and Docker work as before.
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
USE_POSTGRES = bool(DATABASE_URL)
SQLITE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "loop.db")

if USE_POSTGRES:
    import psycopg
    from psycopg.rows import dict_row

    # Routes catch db.IntegrityError so they work with either database
    IntegrityError = (sqlite3.IntegrityError, psycopg.IntegrityError)
else:
    IntegrityError = sqlite3.IntegrityError


class PostgresConnection:
    """
    Thin wrapper so Postgres can be used with the same code as sqlite3:
    conn.execute("... WHERE id = ?", (x,)).fetchone(), conn.commit(), conn.close().
    """

    def __init__(self):
        self.conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)

    def execute(self, sql, params=()):
        sql = sql.replace("?", "%s")
        if "INSERT OR IGNORE" in sql:
            sql = sql.replace("INSERT OR IGNORE", "INSERT") + " ON CONFLICT DO NOTHING"
        return PostgresCursor(self.conn.execute(sql, params))

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()


class PostgresCursor:
    """Formats timestamps the same way SQLite does so the frontend gets identical data."""

    def __init__(self, cursor):
        self.cursor = cursor

    @staticmethod
    def _clean(row):
        if row is None:
            return None
        return {
            k: v.strftime("%Y-%m-%d %H:%M:%S") if isinstance(v, datetime) else v
            for k, v in row.items()
        }

    def fetchone(self):
        return self._clean(self.cursor.fetchone())

    def fetchall(self):
        return [self._clean(r) for r in self.cursor.fetchall()]


def get_db():
    """
    Opens a database connection.
    row_factory just means we can access the data like a dictionary instead of a tuple.
    """
    if USE_POSTGRES:
        return PostgresConnection()
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Creates all tables when the server starts up.
    IF NOT EXISTS means it won't crash if the table is already there.
    """
    # Postgres uses SERIAL instead of AUTOINCREMENT, and REAL there is low precision
    pk = "SERIAL PRIMARY KEY" if USE_POSTGRES else "INTEGER PRIMARY KEY AUTOINCREMENT"
    money = "DOUBLE PRECISION" if USE_POSTGRES else "REAL"

    conn = get_db()
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS users (
            id {pk},
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT DEFAULT '',
            bio TEXT DEFAULT ''
        )
    """)
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS library (
            id {pk},
            user_id INTEGER NOT NULL,
            game_id INTEGER NOT NULL,
            status TEXT DEFAULT 'Playing',
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS wishlist (
            id {pk},
            user_id INTEGER NOT NULL,
            game_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS playlists (
            id {pk},
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS playlist_games (
            id {pk},
            playlist_id INTEGER NOT NULL,
            game_id INTEGER NOT NULL,
            FOREIGN KEY (playlist_id) REFERENCES playlists(id)
        )
    """)
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS orders (
            id {pk},
            user_id INTEGER NOT NULL,
            total {money} NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS order_items (
            id {pk},
            order_id INTEGER NOT NULL,
            game_id INTEGER NOT NULL,
            price {money} NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )
    """)
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS prices (
            id {pk},
            game_id INTEGER NOT NULL,
            price {money} NOT NULL,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS notifications (
            id {pk},
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            game_id INTEGER,
            is_read INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS known_dlc (
            id {pk},
            game_id INTEGER NOT NULL,
            dlc_id INTEGER NOT NULL,
            dlc_name TEXT NOT NULL,
            discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(game_id, dlc_id)
        )
    """)
    conn.commit()
    conn.close()
