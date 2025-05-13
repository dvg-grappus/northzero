import React from "react";
import { Button } from "./button";
import { Plus } from "lucide-react";

interface ButtonAddProps {
  label: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "default" | "lg";
}

const ButtonAdd: React.FC<ButtonAddProps> = ({ label, onClick, className = "", size = "sm" }) => (
  <Button
    onClick={onClick}
    className={`bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center gap-2 rounded ${className}`}
    size={size}
    type="button"
  >
    <Plus size={16} />
    {label}
  </Button>
);

export default ButtonAdd; 