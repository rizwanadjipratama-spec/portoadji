"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/components/layout/cn";

const navItems = [
  { name: "HOME", href: "#home" },
  { name: "ABOUT", href: "#about" },
  { name: "SKILLS", href: "#skills" },
  { name: "PROJECTS", href: "#projects" },
  { name: "EXPERIENCE", href: "#experience" },
  { name: "EDUCATION", href: "#education" },
  { name: "CERTIFICATIONS", href: "#certifications" },
{ name: "AI ASSISTANT", href: "#ai-assistant" },
  { name: "CONTACT", href: "#contact" },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#home");
  const lastYRef = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const lastY = lastYRef.current;
    setScrolled(latest > 80);

    if (latest < lastY) {
      setHidden(false);
    } else if (latest > 100 && latest > lastY) {
      setHidden(true);
      setIsMobileMenuOpen(false);
    }

    lastYRef.current = latest;
  });

  useEffect(() => {
    const sectionElements = navItems
      .map((item) => ({
        href: item.href,
        element: document.querySelector(item.href),
      }))
      .filter((entry): entry is { href: string; element: Element } => Boolean(entry.element));

    if (sectionElements.length === 0) {
      return;
    }

    const visibleSections = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const section = sectionElements.find((item) => item.element === entry.target);
          if (!section) {
            continue;
          }

          if (entry.isIntersecting) {
            visibleSections.set(section.href, entry.intersectionRatio);
          } else {
            visibleSections.delete(section.href);
          }
        }

        let nextHref = "#home";
        let highestRatio = -1;

        visibleSections.forEach((ratio, href) => {
          if (ratio > highestRatio) {
            highestRatio = ratio;
            nextHref = href;
          }
        });

        if (highestRatio >= 0) {
          setActiveHref(nextHref);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -45% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7],
      }
    );

    sectionElements.forEach(({ element }) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setActiveHref(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-120%", opacity: 0 },
        }}
        initial="visible"
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed left-0 right-0 z-50 transition-[top] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          scrolled ? "top-4" : "top-6"
        )}
      >
        <div className="flex w-full justify-center px-0">
          <div
            className={cn(
              "relative flex w-full items-center justify-between rounded-[18px] border border-white/[0.08] bg-[rgba(15,15,18,0.55)] shadow-[0_24px_60px_rgba(0,0,0,0.28)] transition-[padding,backdrop-filter] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
              scrolled ? "px-8 py-[10px] backdrop-blur-[20px] sm:px-12" : "px-8 py-3 backdrop-blur-[18px] sm:px-12"
            )}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-gradient-to-b from-white/[0.08] to-transparent opacity-50" />
            <div className="relative hidden w-full items-center md:grid md:grid-cols-[1fr_auto_1fr]">
              <div className="justify-self-start pr-10">
                <span className="tech-label whitespace-nowrap text-[13px] tracking-[0.08em] text-white/62">Rizwan Adji</span>
              </div>

              <div className="flex items-center justify-center gap-7">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className={cn(
                      "translate-y-0 text-[13px] uppercase tracking-[0.08em] transition-all duration-300 hover:-translate-y-0.5 hover:text-white",
                      activeHref === item.href
                        ? "text-white/92"
                        : "text-white/60"
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              <div aria-hidden="true" className="min-w-[60px] justify-self-end" />
            </div>

            <button
              className="relative ml-auto text-white/80 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.35 }}
className="fixed inset-x-0 top-[72px] md:top-0 z-40 px-5 sm:px-8 md:hidden"
          >
            <div className="site-container">
              <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-6 rounded-[28px] border border-white/10 bg-[rgba(12,12,16,0.88)] p-8 shadow-[0_28px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className={cn(
                      "text-sm uppercase tracking-[0.28em] transition-colors duration-300 hover:text-white",
                      activeHref === item.href ? "text-white" : "text-white/74"
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
