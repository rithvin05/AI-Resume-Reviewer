"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";

// Animates from 0 to the given target value
export function ProgressDemo({ target }: { target: number }) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const clampedTarget = Math.max(0, Math.min(100, target)); // Ensure target is in [0, 100]

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= clampedTarget) {
          clearInterval(interval);
          return clampedTarget;
        }
        return prev + 1;
      });
    }, 20); // Adjust speed here

    return () => clearInterval(interval);
  }, [target]);

  return <Progress value={progress} className="w-[60%]" />;
}
