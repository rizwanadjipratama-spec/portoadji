"use client";

import { motion } from "framer-motion";

const MARQUEE_TEXT =
  "LAB SYSTEMS / ELECTRONICS / HARDWARE / AUTOMATION / ENGINEERING / PROBLEM SOLVING / ";

export default function Marquee() {
  return (
    <div className="relative z-20 w-full overflow-hidden border-y border-white/10 bg-black/10 py-6 backdrop-blur-sm">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          }}
          className="flex shrink-0 items-center whitespace-nowrap opacity-30"
        >
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-4 whitespace-pre font-body text-sm tracking-[0.3em] text-white/65 sm:text-base">
              {MARQUEE_TEXT}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
