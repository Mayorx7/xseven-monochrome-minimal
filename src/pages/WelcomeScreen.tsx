import React from "react";
import { useNavigate } from "react-router-dom";
import BinaryRain from "../components/BinaryRain";

// SVG Ghost Icon
const DottedGhostIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-green-400 mb-4 animate-bounce"
    style={{ textShadow: "0 0 5px rgba(0, 255, 0, 0.7)" }}
  >
    <rect x="5" y="4" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="7" y="6" width="1" height="1" fill="#000000" />
    <rect x="9" y="6" width="1" height="1" fill="#000000" />
    <rect x="5" y="10" width="1" height="1" fill="currentColor" />
    <rect x="7" y="10" width="1" height="1" fill="currentColor" />
    <rect x="9" y="10" width="1" height="1" fill="currentColor" />
    <rect x="11" y="10" width="1" height="1" fill="currentColor" />
    <path
      d="M5 4H11V10H12V11H13V12H3V11H4V10H5V4Z"
      fill="none"
      stroke="rgba(0, 255, 0, 0.5)"
      strokeWidth="0.5"
    />
  </svg>
);

interface WelcomeScreenProps {
  onContinue?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate("/auth"); // fallback route behavior
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center md:justify-between h-screen bg-black p-6 sm:p-8 font-mono overflow-hidden">
      {/* Binary Rain Background */}
      <BinaryRain columns={48} columnWidth={22} charsPerColumn={30} />

      {/* Foreground content */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Top Section */}
      <div className="flex flex-col items-center mt-8 md:mt-24 relative z-10">
        <h1
          className="text-3xl sm:text-5xl font-bold mb-4 text-green-400 text-center"
          style={{ textShadow: "0 0 5px #00ff00", letterSpacing: "0.1em" }}
        >
          WELCOME TO XSEVEN
        </h1>
        <p className="text-base sm:text-lg text-green-500 text-center italic max-w-xs sm:max-w-sm px-2">
          "You are a ghost. You are anonymous. You are invincible."
        </p>
      </div>

      {/* Bottom Section */}
      <div className="w-full flex flex-col items-center mb-10 sm:mb-16 relative z-10">
        <DottedGhostIcon />
        <button
          onClick={handleContinue}
          className="w-full max-w-xs bg-green-400 text-black px-8 py-4 rounded-lg text-lg font-semibold 
                     hover:bg-green-500 transition duration-200 uppercase
                     shadow-[0_0_15px_rgba(0,255,0,0.5)] active:shadow-none"
        >
          INITIATE
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
