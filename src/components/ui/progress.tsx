import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative w-full h-3 rounded-full bg-gray-200", className)}
        {...props}
      >
        <div
          className="absolute h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };