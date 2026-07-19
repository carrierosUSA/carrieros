"use client";

import { useSyncExternalStore } from "react";
import {
  getAdminStore,
  subscribeAdminStore,
} from "@/lib/admin/store";

export function useAdminStore() {
  return useSyncExternalStore(
    subscribeAdminStore,
    getAdminStore,
    getAdminStore,
  );
}
