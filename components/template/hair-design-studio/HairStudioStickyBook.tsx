"use client";

import { motion } from "framer-motion";
import { useHairStudio } from "./HairStudioContext";

export default function HairStudioStickyBook() {
  const { openBooking } = useHairStudio();

  return (
    <motion.div
      className="fixed bottom-0 inset-x-0 z-[85] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <div className="mx-auto max-w-xl pointer-events-auto">
        <button
          type="button"
          onClick={openBooking}
          className="w-full rounded-2xl py-4 text-xs font-semibold uppercase tracking-[0.25em] bg-[#d4e157] text-zinc-950 shadow-[0_-8px_40px_rgba(0,0,0,0.45)] hover:brightness-110 transition-all"
        >
          Book appointment
        </button>
      </div>
    </motion.div>
  );
}
