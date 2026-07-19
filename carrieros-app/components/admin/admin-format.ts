export function formatAdminWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatAdminBytes(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function statusHttpTone(
  status: number,
): "green" | "amber" | "red" | "blue" | "slate" {
  if (status >= 200 && status < 300) return "green";
  if (status >= 400 && status < 500) return "amber";
  if (status >= 500) return "red";
  return "slate";
}
