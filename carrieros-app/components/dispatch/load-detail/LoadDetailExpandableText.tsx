"use client";

import { useState } from "react";

type LoadDetailExpandableTextProps = {
  text: string;
  maxChars?: number;
  className?: string;
  clampLines?: 1 | 2;
};

export default function LoadDetailExpandableText({
  text,
  maxChars = 72,
  className = "",
  clampLines = 2,
}: LoadDetailExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > maxChars;
  const clampClass = clampLines === 1 ? "line-clamp-1" : "line-clamp-2";

  if (!isLong) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      <span className={expanded ? "" : clampClass}>{text}</span>{" "}
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="font-semibold text-[#1E3A8A] hover:underline"
      >
        {expanded ? "Less" : "More..."}
      </button>
    </span>
  );
}
