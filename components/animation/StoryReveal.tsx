"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/components/layout/cn";

type StoryRevealContextValue = {
  isVisible: boolean;
};

const StoryRevealContext = createContext<StoryRevealContextValue>({ isVisible: false });

function useRevealOnce(rootMargin = "0px 0px -18% 0px") {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.18,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return { ref, isVisible };
}

type StorySectionProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  rootMargin?: string;
};

export function StorySection({
  children,
  className,
  stagger = 0.12,
  delay = 0.08,
  rootMargin,
}: StorySectionProps) {
  const { ref, isVisible } = useRevealOnce(rootMargin);
  const value = useMemo(() => ({ isVisible }), [isVisible]);

  return (
    <StoryRevealContext.Provider value={value}>
      <motion.div
        ref={ref}
        initial={false}
        animate={isVisible ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: stagger,
              delayChildren: delay,
            },
          },
        }}
        className={className}
      >
        {children}
      </motion.div>
    </StoryRevealContext.Provider>
  );
}

type StoryItemProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
};

export function StoryItem({
  children,
  className,
  delay = 0,
  distance = 40,
}: StoryItemProps) {
  const { isVisible } = useContext(StoryRevealContext);

  return (
    <motion.div
      initial={false}
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className={cn("transform-gpu will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
