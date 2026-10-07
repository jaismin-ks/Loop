// src/components/Showcase.jsx
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Showcase = () => {
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });

  const showcaseRef = useRef(null);
  const maskRef = useRef(null);

  useGSAP(
    () => {
      if (isTablet) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: showcaseRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          pin: true,
        }
      });

      // Animate mask scale and opacity
      tl.fromTo(
        maskRef.current,
        { opacity: 0, transform: "scale(10)" },
        { opacity: 1, transform: "scale(1)", ease: "power1.out" }
      );

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { dependencies: [isTablet] }
  );

  return (
    <section
      ref={showcaseRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Video Background */}
      <div
        ref={maskRef}
        className="absolute inset-0 w-full h-full"
        style={{
          WebkitMaskImage: "url('/mask.png')",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          WebkitMaskSize: "contain",
          maskImage: "url('/mask.png')",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          maskSize: "contain",
        }}
      >
        <video
          src="/videos/game.mp4"
          loop
          muted
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

export default Showcase;