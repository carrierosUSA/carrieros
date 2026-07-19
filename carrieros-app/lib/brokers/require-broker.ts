import { notFound } from "next/navigation";
import { getBrokerById } from "@/lib/data/brokers";
import type { Broker } from "@/lib/types";

export function requireBroker(id: string): Broker {
  const broker = getBrokerById(id);

  if (!broker) {
    notFound();
  }

  return broker;
}
