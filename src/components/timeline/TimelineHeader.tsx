
import React from "react";
import { motion } from "framer-motion";

interface TimelineHeaderProps {
  title: string;
  description: string;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ title, description }) => {
  return (
    <motion.div
      className="text-center mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="inter-font font-bold text-[42px] text-foreground mb-3">{title}</h1>
      <p className="inter-font text-[20px] text-muted-foreground max-w-2xl mx-auto">
        {description}
      </p>
    </motion.div>
  );
};

export default TimelineHeader;
