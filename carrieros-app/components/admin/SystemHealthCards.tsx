"use client";

import PremiumStatusBadge from "@/components/premium/StatusBadge";
import { formatAdminWhen } from "@/components/admin/admin-format";
import { useAdminStore } from "@/hooks/useAdminStore";
import { formatUptime, healthLabel, healthTone } from "@/lib/admin/health";

export default function SystemHealthCards() {
  const { health } = useAdminStore();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
          System health
        </h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Overall status, core services, and uptime.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[14px] bg-white p-4 ring-1 ring-[#EAEAEA]">
          <p className="text-[13px] font-medium text-[#6B7280]">Overall</p>
          <div className="mt-2">
            <PremiumStatusBadge
              label={healthLabel(health.overall)}
              tone={healthTone(health.overall)}
            />
          </div>
        </div>
        <div className="rounded-[14px] bg-white p-4 ring-1 ring-[#EAEAEA]">
          <p className="text-[13px] font-medium text-[#6B7280]">Uptime</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#111827]">
            {health.uptimePercent.toFixed(2)}%
          </p>
          <p className="mt-0.5 text-[13px] text-[#94A3B8]">
            Since {formatUptime(health.uptimeSince)} ago
          </p>
        </div>
        <div className="rounded-[14px] bg-white p-4 ring-1 ring-[#EAEAEA]">
          <p className="text-[13px] font-medium text-[#6B7280]">Last check</p>
          <p className="mt-1 text-[18px] font-bold text-[#111827]">
            {formatAdminWhen(health.checkedAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {health.services.map((service) => (
          <div
            key={service.id}
            className="rounded-[14px] bg-white p-4 ring-1 ring-[#EAEAEA]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold text-[#111827]">
                  {service.name}
                </p>
                <p className="mt-1 text-[13px] leading-5 text-[#6B7280]">
                  {service.detail}
                </p>
              </div>
              <PremiumStatusBadge
                label={healthLabel(service.status)}
                tone={healthTone(service.status)}
              />
            </div>
            <p className="mt-3 text-[13px] font-medium text-[#94A3B8]">
              {service.latencyMs} ms latency
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
