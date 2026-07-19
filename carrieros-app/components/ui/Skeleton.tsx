type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-[carrieros-shimmer_1.4s_ease-in-out_infinite] rounded-md bg-gradient-to-r from-[#EEF2F6] via-[#F8FAFC] to-[#EEF2F6] bg-[length:200%_100%] ${className}`}
    />
  );
}
