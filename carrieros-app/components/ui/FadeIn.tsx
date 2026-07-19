type FadeInProps = {
  children: React.ReactNode;
  className?: string;
};

export default function FadeIn({ children, className = "" }: FadeInProps) {
  // Avoid animation-fill-mode "both" with opacity:0 — if the animation is
  // interrupted, content can stay invisible (blank white page).
  return (
    <div
      className={`animate-[carrieros-fade-in_0.35s_ease-out_forwards] opacity-100 ${className}`}
    >
      {children}
    </div>
  );
}
