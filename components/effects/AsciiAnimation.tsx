"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function AsciiAnimation() {
  const preRef = useRef<HTMLPreElement>(null);
  
  useEffect(() => {
    let animationFrameId: number;
    let time = 0;
    let targetLookX = 0;
    let currentLookX = 0;
    let scrollY = 0;
    
    // ASCII characters sorted by visual density
    const density = " .:-=+*#%@";

    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });

    const renderAscii = () => {
      time += 0.05;
      
      // Randomly change look direction every few seconds
      if (Math.random() < 0.01) {
        targetLookX = (Math.random() - 0.5) * 1.5; // -0.75 to 0.75
      }
      
      // Smoothly interpolate current look towards target
      currentLookX += (targetLookX - currentLookX) * 0.05;

      // Scroll influences look downward
      const lookY = Math.min(scrollY * 0.005, 1.5);
      
      const width = 80;
      const height = 40;
      const b: string[] = [];
      const z: number[] = [];

      for (let k = 0; k < width * height; k++) {
        b[k] = k % width === width - 1 ? "\n" : " ";
        z[k] = 0;
      }

      // Sphere-like rendering function to create a "face" shape
      // very simplified abstract representation of a face using math
      for (let j = 0; j < Math.PI * 2; j += 0.07) {
        for (let i = 0; i < Math.PI; i += 0.07) {
          
          // Base sphere coordinates
          let x = Math.sin(i) * Math.cos(j);
          let y = Math.sin(i) * Math.sin(j);
          let z_coord = Math.cos(i);

          // Head tilt / Look deformation
          x += currentLookX * Math.sin(i) * 0.5;
          y += lookY * Math.cos(i) * 0.5;

          // Project to 2D screen
          const scale = 15;
          const screenX = Math.floor(width / 2 + x * scale * 2);
          const screenY = Math.floor(height / 2 + y * scale);
          
          if (screenX >= 0 && screenX < width - 1 && screenY >= 0 && screenY < height) {
            const o = screenX + width * screenY;
            
            // Calculate pseudo-depth (z-buffer)
            // Add subtle noise/movement to feel alive
            const depth = z_coord + Math.sin(time + x * 2) * 0.1;
            
            if (depth > z[o]) {
              z[o] = depth;
              
              // Calculate lighting/density index
              // Light source moving slightly
              const lightX = Math.sin(time * 0.5);
              const lightY = Math.cos(time * 0.3) - 1; 
              const lightZ = 1;
              
              // Normal dot product with light vector
              let intensity = x * lightX + y * lightY + z_coord * lightZ;
              intensity = Math.max(0, Math.min(1, (intensity + 1) / 2));
              
              const charIndex = Math.floor(intensity * (density.length - 1));
              b[o] = density[charIndex];
            }
          }
        }
      }
      
      if (preRef.current) {
        preRef.current.textContent = b.join("");
      }
      
      animationFrameId = requestAnimationFrame(renderAscii);
    };
    
    animationFrameId = requestAnimationFrame(renderAscii);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "easeOut" }}
      className="flex items-center justify-center w-full h-full text-white/40 text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs leading-[6px] sm:leading-[8px] md:leading-[10px] lg:leading-3 overflow-hidden mix-blend-screen"
    >
      <pre className="font-mono scale-110" ref={preRef}></pre>
    </motion.div>
  );
}
