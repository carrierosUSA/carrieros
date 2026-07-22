export type PickupNumberSource = "ocr" | "manual";

/**
 * An ordered pickup identifier. Stop IDs are optional because a rate
 * confirmation may identify the number without identifying a unique stop.
 */
export type PickupNumber = {
  id: string;
  value: string;
  label?: string;
  pickupStopId?: string;
  pickupStopLabel?: string;
  displayOrder: number;
  confidence?: number;
  stopAssociationConfidence?: number;
  requiresHumanVerification?: boolean;
  requiresStopAssociationReview?: boolean;
  source?: PickupNumberSource;
};

export type PickupNumberInput = Omit<PickupNumber, "id"> & {
  id?: string;
};
