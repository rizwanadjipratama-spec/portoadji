"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const updateHoverTarget = (_nextHoverTarget: string) => {
  // Kept as a compatibility no-op. The ASCII sphere now manages hover state internally.
};

export default function CursorLight() {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springConfig = { damping: 28, stiffness: 160, mass: 0.65 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 240);
      mouseY.set(e.clientY - 240);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      updateHoverTarget("");
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
      }}
      className="pointer-events-none fixed left-0 top-0 z-40 h-[480px] w-[480px] will-change-transform"
    >
      <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_22%,transparent_68%)]" />
    </motion.div>
  );
}
