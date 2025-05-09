
import React from "react";
import { motion } from "framer-motion";

interface CircleSegmentProps {
  label: string;
  radius: number;
  isActive: boolean;
  onClick: () => void;
}

const CircleSegment: React.FC<CircleSegmentProps> = ({ label, radius, isActive, onClick }) => {
  return (
    <motion.g
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
    >
      {/* Clickable background circle */}
      <circle
        cx="140"
        cy="140"
        r={radius}
        fill={isActive ? "rgba(255, 255, 255, 0.1)" : "transparent"}
        className="transition-colors duration-300"
      />
      
      {/* Visible circle outline */}
      <circle
        cx="140"
        cy="140"
        r={radius}
        fill="transparent"
        stroke={isActive ? "#888888" : "#E0E0E0"}
        strokeWidth="2"
        className="transition-colors duration-300"
      />
      
      <text
        x="140"
        y={140 - radius + 20}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isActive ? "#888888" : "#999999"}
        className="font-semibold text-lg transition-colors duration-300 pointer-events-none"
      >
        {label}
      </text>
    </motion.g>
  );
};

export default CircleSegment;
