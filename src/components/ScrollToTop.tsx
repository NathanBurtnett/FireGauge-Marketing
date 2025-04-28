
import React, { useState, useEffect } from 'react';
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToTop}
        className="bg-firegauge-red hover:bg-firegauge-red/90 text-white border-none rounded-full h-12 w-12 shadow-lg"
      >
        <ArrowUp size={20} />
      </Button>
    </div>
  );
};

export default ScrollToTop;
