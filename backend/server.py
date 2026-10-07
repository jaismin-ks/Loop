from flask import Flask
from flask_cors import CORS
from db import init_db
from routes.auth import auth_bp
from routes.games import games_bp
from routes.library import library_bp
from routes.wishlist import wishlist_bp
from routes.playlists import playlists_bp
from routes.orders import orders_bp
from routes.recommendations import recommendations_bp
from routes.prices import prices_bp
from routes.notifications import notifications_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(games_bp)
app.register_blueprint(library_bp)
app.register_blueprint(wishlist_bp)
app.register_blueprint(playlists_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(recommendations_bp)
app.register_blueprint(prices_bp)
app.register_blueprint(notifications_bp)

init_db()

if __name__ == "__main__":
    app.run(debug=True, port=5001, host="0.0.0.0")
