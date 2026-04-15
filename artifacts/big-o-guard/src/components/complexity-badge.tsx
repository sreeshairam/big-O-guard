import React from "react";
import { cn } from "@/lib/utils";

interface ComplexityBadgeProps {
  complexity: string;
  type?: "time" | "space";
  className?: string;
}

export function ComplexityBadge({ complexity, type = "time", className }: ComplexityBadgeProps) {
  // Normalize complexity string for matching
  const normalized = complexity.toLowerCase().replace(/\s+/g, "");

  let colorClass = "bg-muted text-muted-foreground border-muted-border";
  let glowClass = "";

  if (normalized.includes("o(1)") || normalized.includes("o(logn)")) {
    colorClass = "bg-accent/10 text-accent border-accent/30";
    glowClass = "shadow-[0_0_10px_rgba(0,255,100,0.2)]";
  } else if (normalized.includes("o(n)") && !normalized.includes("o(nlogn)") && !normalized.includes("o(n^2)")) {
    colorClass = "bg-primary/10 text-primary border-primary/30";
    glowClass = "shadow-[0_0_10px_rgba(0,255,255,0.2)]";
  } else if (normalized.includes("o(nlogn)")) {
    colorClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    glowClass = "shadow-[0_0_10px_rgba(250,204,21,0.2)]";
  } else if (normalized.includes("o(n^2)") || normalized.includes("o(n^3)")) {
    colorClass = "bg-orange-500/10 text-orange-400 border-orange-500/30";
    glowClass = "shadow-[0_0_10px_rgba(249,115,22,0.2)]";
  } else if (normalized.includes("o(2^n)") || normalized.includes("o(n!)")) {
    colorClass = "bg-destructive/10 text-destructive border-destructive/30";
    glowClass = "shadow-[0_0_10px_rgba(255,0,0,0.2)]";
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
        {type === "time" ? "TIME" : "SPACE"}
      </span>
      <span
        className={cn(
          "px-2 py-0.5 rounded text-xs font-mono font-bold border",
          colorClass,
          glowClass
        )}
      >
        {complexity}
      </span>
    </div>
  );
}