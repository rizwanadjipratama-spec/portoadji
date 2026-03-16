"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";

export default function ParallaxGrid() {
  const gridX = useMotionValue(0);
  const gridY = useMotionValue(0);
  const { scrollY } = useScroll();
  const smoothX = useSpring(gridX, { stiffness: 38, damping: 18, mass: 0.8 });
  const smoothY = useSpring(gridY, { stiffness: 38, damping: 18, mass: 0.8 });
  const depthY = useTransform(scrollY, (value) => value * 0.2);
  const composedY = useTransform(() => smoothY.get() + depthY.get());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      gridX.set((e.clientX / window.innerWidth - 0.5) * 30);
      gridY.set((e.clientY / window.innerHeight - 0.5) * 30);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [gridX, gridY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-black">
      <motion.div
        style={{ x: smoothX, y: composedY }}
        className="absolute inset-[-100px] bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] will-change-transform"
      />
      <div className="absolute left-1/2 top-[18%] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.012)_28%,transparent_72%)] opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,8,10,0.95)_100%)] opacity-90" />
    </div>
  );
}
