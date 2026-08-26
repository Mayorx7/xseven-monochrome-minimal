import React from "react";
import "./BinaryRain.css";

interface BinaryRainProps {
  columns?: number;
  columnWidth?: number;
  charsPerColumn?: number;
}

const BinaryRain: React.FC<BinaryRainProps> = ({
  columns = 40,
  columnWidth = 24,
  charsPerColumn = 28,
}) => {
  const cols = Array.from({ length: columns }, (_, i) => {
    const left = i * columnWidth;
    const duration = (Math.random() * 2 + 2.2).toFixed(2);
    const delay = -(Math.random() * 4).toFixed(2);
    const chars = Array.from({ length: charsPerColumn }, () =>
      Math.random() > 0.5 ? "1" : "0"
    );
    return { id: i, left, duration, delay, chars };
  });

  return (
    <div className="binary-container">
      <div className="binary-pattern" style={{ width: columns * columnWidth }}>
        {cols.map((col) => (
          <div
            key={col.id}
            className="binary-column"
            style={{
              left: `${col.left}px`,
              animationDuration: `${col.duration}s`,
              animationDelay: `${col.delay}s`,
              width: `${columnWidth}px`,
            }}
          >
            {col.chars.map((ch, idx) => (
              <span className="binary-char" key={idx}>
                {ch}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BinaryRain;



