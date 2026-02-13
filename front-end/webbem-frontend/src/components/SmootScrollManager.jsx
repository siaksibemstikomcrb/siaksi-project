import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

const SmoothScrollManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== '/') {
      return; 
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      document.documentElement.style.removeProperty('overflow'); 
      document.body.style.removeProperty('overflow');
    };
  }, [pathname]);

  return null;
};

export default SmoothScrollManager;