"use client";

import SectionHeading from "@/components/layout/SectionHeading";
import { StoryItem, StorySection } from "@/components/animation/StoryReveal";

const responsibilities = [
  "Laboratory instrument diagnostics",
  "Electronics repair",
  "Troubleshooting testing equipment",
  "Maintenance of laboratory systems",
];

export default function ExperienceSection() {
  return (
    <section className="section-shell relative z-10 w-full">
      <div className="section-stack mx-auto max-w-5xl">
        <StorySection className="section-stack">
          <StoryItem>
            <SectionHeading
              title="Experience"
              subtitle="Hands-on technical ownership focused on diagnostics, repair, and keeping laboratory systems reliable."
            />
          </StoryItem>

          <StoryItem className="surface-card">
            <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="section-kicker mb-4">Current Role</p>
                <h3 className="text-[clamp(28px,3vw,38px)] leading-tight text-white/96">
                  Laboratory Equipment Technician
                </h3>
              </div>
              <p className="text-base text-white/52 md:text-lg">Sarana Megamedilab Sejahtera</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {responsibilities.map((item) => (
                <div key={item} className="surface-card-soft px-5 py-4 text-white/62">
                  {item}
                </div>
              ))}
            </div>
          </StoryItem>
        </StorySection>
      </div>
    </section>
  );
}
