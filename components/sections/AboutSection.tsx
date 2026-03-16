"use client";

import SectionHeading from "@/components/layout/SectionHeading";
import { StoryItem, StorySection } from "@/components/animation/StoryReveal";

export default function AboutSection() {
  return (
    <section className="section-shell relative z-10 w-full">
      <div className="section-stack mx-auto flex max-w-6xl flex-col">
        <StorySection className="section-stack">
          <StoryItem>
            <SectionHeading
              title="About"
              subtitle="Independent builder working where laboratory instrumentation, electronics repair, and system design meet."
            />
          </StoryItem>

          <div className="grid grid-cols-1 gap-6 text-left lg:grid-cols-[1.15fr_0.85fr]">
            <StoryItem className="surface-card flex flex-col gap-6">
              <p className="section-copy max-w-none text-white/68">
                Independent builder focused on <span className="text-white/90">laboratory instrumentation</span>,{" "}
                <span className="text-white/90">electronics repair</span>, and{" "}
                <span className="text-white/90">system development</span>.
              </p>
              <p className="section-copy max-w-none text-white/56">
                Adji works across physical systems and digital tools with the same mindset: understand the failure,
                rebuild the workflow, and make the result more reliable than before.
              </p>
            </StoryItem>

            <StoryItem className="surface-card flex flex-col gap-6">
              <p className="section-kicker">Working Style</p>
              <h3 className="text-[clamp(24px,3vw,32px)] leading-tight text-white/95">
                First-principles thinking with practical execution.
              </h3>
              <p className="section-copy max-w-none text-white/60">
                Enjoys breaking complex systems down and rebuilding them from first principles, with most work done
                independently from diagnostics and repair to designing experimental engineering systems.
              </p>
            </StoryItem>
          </div>
        </StorySection>
      </div>
    </section>
  );
}
