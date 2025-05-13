import React from "react";
import { Button } from "./button";
import { Zap } from "lucide-react";

interface ButtonMoreProps {
  label: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "default" | "lg";
}

const ButtonMore: React.FC<ButtonMoreProps> = ({ label, onClick, className = "", size = "sm" }) => (
  <Button
    onClick={onClick}
    className={`bg-gray-200 text-black border border-white flex items-center gap-2 shadow-sm hover:bg-gray-300 rounded ${className}`}
    size={size}
    type="button"
  >
    <Zap size={16} className="text-yellow-500" />
    {label}
  </Button>
);

export default ButtonMore; 