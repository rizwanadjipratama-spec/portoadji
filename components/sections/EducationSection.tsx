"use client";

import SectionHeading from "@/components/layout/SectionHeading";
import { StoryItem, StorySection } from "@/components/animation/StoryReveal";

const education = [
  {
    school: "SMK PGRI 2 Bogor",
    field: "Mechanical Engineering",
  },
  {
    school: "Universitas Surya Darma",
    field: "Aeronautics",
  },
];

export default function EducationSection() {
  return (
    <section className="section-shell relative z-10 w-full">
      <div className="section-stack mx-auto max-w-5xl">
        <StorySection className="section-stack">
          <StoryItem>
            <SectionHeading
              title="Education"
              subtitle="Academic foundations that support practical engineering work and systems-focused thinking."
            />
          </StoryItem>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {education.map((item) => (
              <StoryItem key={item.school} className="surface-card flex flex-col gap-5">
                <p className="section-kicker">Academic Path</p>
                <h3 className="text-[clamp(24px,3vw,32px)] leading-tight text-white/94">{item.school}</h3>
                <p className="text-base text-white/58 md:text-lg">{item.field}</p>
              </StoryItem>
            ))}
          </div>
        </StorySection>
      </div>
    </section>
  );
}
