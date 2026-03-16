"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function AsciiAnimation() {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    let A = 0;
    let B = 0;
    let animationFrameId: number;
    let speedMultiplier = 1;
    let targetSpeed = 1;

    // Handle scroll to increase speed
    const handleScroll = () => {
      targetSpeed = 1 + window.scrollY * 0.01;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const renderAscii = () => {
      // Lerp speed for smooth transition
      speedMultiplier += (targetSpeed - speedMultiplier) * 0.1;

      const b = [];
      const z = [];

      A += 0.04 * speedMultiplier;
      B += 0.02 * speedMultiplier;

      const cA = Math.cos(A), sA = Math.sin(A),
        cB = Math.cos(B), sB = Math.sin(B);

      for (let k = 0; k < 1760; k++) {
        b[k] = k % 80 === 79 ? "\n" : " ";
        z[k] = 0;
      }

      for (let j = 0; j < 6.28; j += 0.07) {
        const ct = Math.cos(j), st = Math.sin(j);
        for (let i = 0; i < 6.28; i += 0.02) {
          const sp = Math.sin(i), cp = Math.cos(i),
            h = ct + 2,
            D = 1 / (sp * h * sA + st * cA + 5),
            t = sp * h * cA - st * sA;

          const x = (40 + 30 * D * (cp * h * cB - t * sB)) | 0,
            y = (12 + 15 * D * (cp * h * sB + t * cB)) | 0,
            o = x + 80 * y,
            N = (8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB)) | 0;

          if (y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
            z[o] = D;
            b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
          }
        }
      }

      if (preRef.current) {
        preRef.current.textContent = b.join("");
      }

      animationFrameId = requestAnimationFrame(renderAscii);

      // Decay target speed back to 1 slowly if not scrolling
      if (targetSpeed > 1) {
        targetSpeed -= 0.05;
        if (targetSpeed < 1) targetSpeed = 1;
      }
    };

    renderAscii();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="flex items-center justify-center w-full h-full text-white/85 text-[8px] sm:text-[10px] md:text-xs leading-[8px] sm:leading-[10px] md:leading-3 overflow-hidden"
    >
      <pre className="font-mono" ref={preRef}></pre>
    </motion.div>
  );
}
