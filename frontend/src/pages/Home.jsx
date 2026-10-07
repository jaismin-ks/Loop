import Navbar from '../components/Navbar';
import Aurora from '../components/style/Aurora.jsx';
import BlurText from '../components/style/BlurText.jsx';
import SplitText from '../components/style/SplitText.jsx';
import Showcase from '../components/Showcase.jsx';
import Carousel from '../components/Carousel.jsx';
import RecommendationsCarousel from '../components/RecommendationsCarousel.jsx';
import { Link } from 'react-router-dom';
const Home = () => {
  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  return (
    <div className="relative w-full bg-black text-white overflow-x-hidden">

      {/* Aurora Background — covers full page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Aurora
          colorStops={["#ff0080", "#8000ff", "#00ffff"]}
          blend={0.7}
          amplitude={1.2}
          speed={1.5}
        />
      </div>

      {/* Hero section — full viewport height */}
      <div className="relative h-screen w-full">

        {/* Navbar */}
        <div className="absolute top-0 left-0 w-full z-50">
          <Navbar />
        </div>

        {/* Center Text */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <BlurText
            text="Welcome to loop"
            delay={250}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="text-5xl md:text-6xl font-bold mb-6"
          />
          <SplitText
            text="Discover Your Favourite Games"
            className="text-2xl text-center mb-10"
            delay={20}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
            showCallback
          />
          <Link to="/games">
            <button className="relative z-10 bg-purple-500 text-white py-2 px-6 mt-10 lg:mt-0 mb-5 rounded-full font-semibold text-lg cursor-pointer hover:bg-white hover:text-black transform opacity-0 -translate-y-6 animate-fadeIn">
              Explore
            </button>
          </Link>
        </div>

      </div>

      {/* Content below the hero — scroll into it */}
      <div className="relative z-10">
        <Showcase />
        <Carousel category="trending" />
        <RecommendationsCarousel />
      </div>

    </div>

    
    
  );
};

export default Home;