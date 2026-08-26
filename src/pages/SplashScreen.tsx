import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Glow style
const SEVEN_SEGMENT_DIGITAL_STYLE = {
  fontFamily: '"Courier New", monospace',
  textShadow: `
    0 0 7px #00ff00,
    0 0 15px #00ff00,
    0 0 30px rgba(0, 255, 0, 0.6),
    0 0 40px rgba(0, 255, 0, 0.2)
  `,
  color: "#00FF00",
  letterSpacing: "0.2em",
};

interface SplashScreenProps {
  onFinish?: () => void; // optional now
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else {
        // default behavior → go to welcome
        navigate("/welcome", { replace: true });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black p-4">
      <h1
        className="text-6xl sm:text-7xl font-extrabold transition-opacity duration-1000 animate-pulse"
        style={SEVEN_SEGMENT_DIGITAL_STYLE}
      >
        XSEVEN
      </h1>

      <p
        className="mt-4 text-xs sm:text-sm text-green-400 font-mono"
        style={{ textShadow: "0 0 3px #0f0" }}
      >
        SYSTEM BOOT // INITIALIZING...
      </p>
    </div>
  );
};

export default SplashScreen;
