"use client";

/**
 * Compatibility layer — Transpo Driver App™ uses DriverAppProvider.
 * Existing driver-mobile views keep importing useDriverMobile.
 */
export {
  DriverAppProvider as DriverMobileProvider,
  useDriverMobileCompat as useDriverMobile,
} from "@/components/driver-app/DriverAppProvider";
