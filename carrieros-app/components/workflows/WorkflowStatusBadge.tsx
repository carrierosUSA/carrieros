type WorkflowStatusBadgeProps = {
  enabled: boolean;
};

export default function WorkflowStatusBadge({ enabled }: WorkflowStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${
        enabled
          ? "bg-[#DCFCE7] text-[#15803D]"
          : "bg-[#F1F5F9] text-[#64748B]"
      }`}
    >
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}
