import ClickSpark from './components/style/ClickSpark.jsx';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import GameDetails from './pages/GameDetails.jsx';
import Games from './pages/Games.jsx';
import Search from './pages/Search.jsx';
import Library from './pages/Library.jsx';
import Store from './pages/Store.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Wishlist from './pages/Wishlist.jsx';

function App() {
  return (
    // <ClickSpark
    //   sparkColor='#fff'
    //   sparkSize={10}
    //   sparkRadius={20}
    //   sparkCount={8}
    //   duration={400}
    // >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:id" element={<GameDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/store" element={<Store />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    // </ClickSpark>
  );
}

export default App;