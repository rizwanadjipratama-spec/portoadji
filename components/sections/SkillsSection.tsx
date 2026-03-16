"use client";

import SectionHeading from "@/components/layout/SectionHeading";
import { StoryItem, StorySection } from "@/components/animation/StoryReveal";

const skillGroups = [
  {
    title: "Hardware & Engineering",
    skills: [
      "Laboratory Equipment Diagnostics",
      "Electronics Repair",
      "Hardware Troubleshooting",
      "Reverse Engineering",
      "System Automation",
    ],
  },
  {
    title: "Software",
    skills: [
      "TypeScript",
      "React / Next.js",
      "UI Engineering",
      "System Architecture",
    ],
  },
  {
    title: "Systems",
    skills: [
      "Hardware-Software Integration",
      "Experimental Prototyping",
      "Instrument Control Systems",
    ],
  },
];

export default function SkillsSection() {
  return (
    <section className="section-shell relative z-10 w-full">
      <div className="section-stack mx-auto w-full max-w-6xl">
        <StorySection className="section-stack">
          <StoryItem>
            <SectionHeading
              title="Skills"
              subtitle="A deliberately structured mix of diagnostics, build execution, and frontend system thinking."
            />
          </StoryItem>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {skillGroups.map((group) => (
              <StoryItem key={group.title} className="surface-card flex flex-col gap-8">
                <div className="space-y-3">
                  <p className="section-kicker">{group.title}</p>
                  <h3 className="text-[clamp(22px,2.8vw,28px)] leading-tight text-white/92">{group.title}</h3>
                </div>
                <div className="space-y-4">
                  {group.skills.map((skill) => (
                    <div key={skill} className="flex items-start gap-3">
                      <div className="mt-3 h-[1px] w-5 shrink-0 bg-white/25" />
                      <span className="text-base leading-relaxed text-white/60">{skill}</span>
                    </div>
                  ))}
                </div>
              </StoryItem>
            ))}
          </div>
        </StorySection>
      </div>
    </section>
  );
}
