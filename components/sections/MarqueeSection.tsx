"use client";

import { motion } from "framer-motion";

const MARQUEE_TEXT = "LABORATORY SYSTEMS ◆ ELECTRONICS ◆ HARDWARE ◆ AUTOMATION ◆ ENGINEERING ◆ PROBLEM SOLVING ◆ ";

export default function MarqueeSection() {
  return (
    <div className="w-full py-8 overflow-hidden bg-black/40 border-y border-white/10 backdrop-blur-sm relative z-20">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          }}
          className="flex whitespace-nowrap shrink-0 items-center"
        >
          <span className="font-heading text-xl sm:text-2xl tracking-[0.2em] text-white/85 mx-4">
            {MARQUEE_TEXT}
          </span>
          <span className="font-heading text-xl sm:text-2xl tracking-[0.2em] text-white/85 mx-4">
            {MARQUEE_TEXT}
          </span>
          <span className="font-heading text-xl sm:text-2xl tracking-[0.2em] text-white/85 mx-4">
            {MARQUEE_TEXT}
          </span>
          <span className="font-heading text-xl sm:text-2xl tracking-[0.2em] text-white/85 mx-4">
            {MARQUEE_TEXT}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
