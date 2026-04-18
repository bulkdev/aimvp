"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { HairDesignStudioConfig, ServiceItem } from "@/types";

type Ctx = {
  locationId: string;
  setLocationId: (id: string) => void;
  openBooking: () => void;
  closeBooking: () => void;
  bookingOpen: boolean;
  /** Pre-fill booking drawer */
  presetService: ServiceItem | null;
  setPresetService: (s: ServiceItem | null) => void;
  presetStylistId: string | null;
  setPresetStylistId: (id: string | null) => void;
  studio: HairDesignStudioConfig;
};

const HairStudioCtx = createContext<Ctx | null>(null);

export function HairStudioProvider({
  children,
  studio,
  initialLocationId,
}: {
  children: React.ReactNode;
  studio: HairDesignStudioConfig;
  initialLocationId: string;
}) {
  const [locationId, setLocationId] = useState(initialLocationId);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [presetService, setPresetService] = useState<ServiceItem | null>(null);
  const [presetStylistId, setPresetStylistId] = useState<string | null>(null);

  const openBooking = useCallback(() => setBookingOpen(true), []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  const value = useMemo(
    () => ({
      locationId,
      setLocationId,
      openBooking,
      closeBooking,
      bookingOpen,
      presetService,
      setPresetService,
      presetStylistId,
      setPresetStylistId,
      studio,
    }),
    [
      locationId,
      openBooking,
      closeBooking,
      bookingOpen,
      presetService,
      presetStylistId,
      studio,
    ]
  );

  return <HairStudioCtx.Provider value={value}>{children}</HairStudioCtx.Provider>;
}

export function useHairStudio() {
  const v = useContext(HairStudioCtx);
  if (!v) throw new Error("useHairStudio must be used within HairStudioProvider");
  return v;
}
