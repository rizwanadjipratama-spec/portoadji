"use client";

import { Mail, Phone } from "lucide-react";
import SectionHeading from "@/components/layout/SectionHeading";
import { StoryItem, StorySection } from "@/components/animation/StoryReveal";

export default function ContactSection() {
  return (
    <section className="section-shell relative z-10 mb-8 w-full">
      <div className="section-stack mx-auto flex max-w-4xl flex-col items-center text-center">
        <StorySection className="section-stack w-full">
          <StoryItem>
            <SectionHeading
              title="Initiate Contact"
              subtitle="Available for engineering opportunities where systems thinking, hands-on execution, and technical ownership matter."
            />
          </StoryItem>

          <StoryItem className="surface-card flex flex-col justify-center gap-8 sm:gap-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <a
                href="mailto:rizwanadjipratama@gmail.com"
                className="surface-card-soft group flex flex-col items-center gap-6 px-6 py-8 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/12 bg-white/[0.03]">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="section-kicker">Email</p>
                  <span className="text-sm text-white/78 transition-colors duration-300 group-hover:text-white md:text-base">
                    rizwanadjipratama@gmail.com
                  </span>
                </div>
              </a>

              <a
href="https://wa.me/6281217738835?text=Hello%20Rizwan%2C%20I%20found%20your%20portfolio."
                className="surface-card-soft group flex flex-col items-center gap-6 px-6 py-8 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/12 bg-white/[0.03]">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
<p className="section-kicker">WhatsApp</p>
                  <span className="text-sm text-white/78 transition-colors duration-300 group-hover:text-white md:text-base">
                    +62 812 1773 8835
                  </span>
                </div>
              </a>
            </div>
          </StoryItem>

          <StoryItem className="pt-8 opacity-30">
            <p className="tech-label text-[10px] tracking-[0.28em] text-white/50">
              SYS_REQ: ENGAGEMENT // PROTOCOL: OPEN
            </p>
          </StoryItem>
        </StorySection>
      </div>
    </section>
  );
}
