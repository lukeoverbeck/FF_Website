import React from "react";
import { cn } from "../lib/utils";

const SkeletonCard = ({ className }) => {
  return (
    <div
      className={cn("animate-pulse bg-gray-300 gap-3 h-24", className)}
    ></div>
  );
};

export default SkeletonCard;
