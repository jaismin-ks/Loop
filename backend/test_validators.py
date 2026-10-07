import unittest
from validators import (
    validate_register,
    validate_login,
    validate_update_profile,
    validate_add_to_library,
    validate_update_library_status,
    validate_add_to_wishlist,
    validate_create_playlist,
    validate_add_game_to_playlist,
    validate_create_order,
)


class TestValidateRegister(unittest.TestCase):
    # --- Valid ---
    def test_valid(self):
        self.assertIsNone(validate_register({"username": "justin", "password": "pass123"}))

    # --- Invalid ---
    def test_missing_username(self):
        self.assertIsNotNone(validate_register({"password": "pass123"}))

    def test_missing_password(self):
        self.assertIsNotNone(validate_register({"username": "justin"}))

    def test_empty_username(self):
        self.assertIsNotNone(validate_register({"username": "  ", "password": "pass123"}))

    def test_empty_password(self):
        self.assertIsNotNone(validate_register({"username": "justin", "password": "  "}))

    def test_empty_body(self):
        self.assertIsNotNone(validate_register({}))

    def test_none_body(self):
        self.assertIsNotNone(validate_register(None))


class TestValidateLogin(unittest.TestCase):
    # --- Valid ---
    def test_valid(self):
        self.assertIsNone(validate_login({"username": "justin", "password": "pass"}))

    # --- Invalid ---
    def test_missing_username(self):
        self.assertIsNotNone(validate_login({"password": "pass"}))

    def test_missing_password(self):
        self.assertIsNotNone(validate_login({"username": "justin"}))

    def test_empty_body(self):
        self.assertIsNotNone(validate_login(None))


class TestValidateUpdateProfile(unittest.TestCase):
    # --- Valid ---
    def test_valid_email(self):
        self.assertIsNone(validate_update_profile({"email": "j@test.com"}))

    def test_valid_bio(self):
        self.assertIsNone(validate_update_profile({"bio": "gamer"}))

    def test_valid_password(self):
        self.assertIsNone(validate_update_profile({"password": "newpass"}))

    # --- Invalid ---
    def test_no_valid_fields(self):
        self.assertIsNotNone(validate_update_profile({"random": "stuff"}))

    def test_empty_body(self):
        self.assertIsNotNone(validate_update_profile({}))

    def test_none_body(self):
        self.assertIsNotNone(validate_update_profile(None))


class TestValidateAddToLibrary(unittest.TestCase):
    # --- Valid ---
    def test_valid(self):
        self.assertIsNone(validate_add_to_library({"user_id": 1, "game_id": 10}))

    # --- Invalid ---
    def test_missing_user_id(self):
        self.assertIsNotNone(validate_add_to_library({"game_id": 10}))

    def test_missing_game_id(self):
        self.assertIsNotNone(validate_add_to_library({"user_id": 1}))

    def test_empty_body(self):
        self.assertIsNotNone(validate_add_to_library(None))


class TestValidateUpdateLibraryStatus(unittest.TestCase):
    # --- Valid ---
    def test_valid(self):
        self.assertIsNone(validate_update_library_status({"status": "Completed"}))

    # --- Invalid ---
    def test_missing_status(self):
        self.assertIsNotNone(validate_update_library_status({}))

    def test_none_body(self):
        self.assertIsNotNone(validate_update_library_status(None))


class TestValidateAddToWishlist(unittest.TestCase):
    # --- Valid ---
    def test_valid(self):
        self.assertIsNone(validate_add_to_wishlist({"user_id": 1, "game_id": 5}))

    # --- Invalid ---
    def test_missing_game_id(self):
        self.assertIsNotNone(validate_add_to_wishlist({"user_id": 1}))

    def test_missing_user_id(self):
        self.assertIsNotNone(validate_add_to_wishlist({"game_id": 5}))


class TestValidateCreatePlaylist(unittest.TestCase):
    # --- Valid ---
    def test_valid(self):
        self.assertIsNone(validate_create_playlist({"user_id": 1, "name": "RPGs"}))

    # --- Invalid ---
    def test_missing_name(self):
        self.assertIsNotNone(validate_create_playlist({"user_id": 1}))

    def test_empty_name(self):
        self.assertIsNotNone(validate_create_playlist({"user_id": 1, "name": "  "}))

    def test_missing_user_id(self):
        self.assertIsNotNone(validate_create_playlist({"name": "RPGs"}))


class TestValidateAddGameToPlaylist(unittest.TestCase):
    # --- Valid ---
    def test_valid(self):
        self.assertIsNone(validate_add_game_to_playlist({"game_id": 42}))

    # --- Invalid ---
    def test_missing_game_id(self):
        self.assertIsNotNone(validate_add_game_to_playlist({}))

    def test_none_body(self):
        self.assertIsNotNone(validate_add_game_to_playlist(None))


class TestValidateCreateOrder(unittest.TestCase):
    # --- Valid ---
    def test_valid(self):
        data = {"user_id": 1, "items": [{"game_id": 1, "price": 9.99}]}
        self.assertIsNone(validate_create_order(data))

    # --- Invalid ---
    def test_missing_user_id(self):
        self.assertIsNotNone(validate_create_order({"items": [{"game_id": 1, "price": 9.99}]}))

    def test_missing_items(self):
        self.assertIsNotNone(validate_create_order({"user_id": 1}))

    def test_empty_items_list(self):
        self.assertIsNotNone(validate_create_order({"user_id": 1, "items": []}))

    def test_item_missing_price(self):
        self.assertIsNotNone(validate_create_order({"user_id": 1, "items": [{"game_id": 1}]}))

    def test_item_missing_game_id(self):
        self.assertIsNotNone(validate_create_order({"user_id": 1, "items": [{"price": 9.99}]}))

    def test_negative_price(self):
        self.assertIsNotNone(validate_create_order({"user_id": 1, "items": [{"game_id": 1, "price": -5}]}))

    def test_none_body(self):
        self.assertIsNotNone(validate_create_order(None))


if __name__ == "__main__":
    unittest.main()
