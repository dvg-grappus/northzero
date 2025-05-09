
import { Step } from "./timeline";

export interface CardStyle {
  zIndex: number;
  opacity: number;
  scale: number;
  rotateY?: string;
  rotateX?: string;
  translateZ?: string;
  translateX?: string;
  translateY?: string;
}

export interface CarouselProps {
  steps: Step[];
  onBegin: (id: number) => void;
}
