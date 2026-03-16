"use client";

import Image from "next/image";
import { AI_ADJI_PROJECT_EVENT } from "@/components/sections/aiAdjiData";
import SectionHeading from "@/components/layout/SectionHeading";
import { StoryItem, StorySection } from "@/components/animation/StoryReveal";

const projects = [
  {
    title: "TubeX Shaker",
imageSrc: "/projects/tubex-shaker.jpeg",
    imageAlt: "TubeX Shaker Project",
    description:
"A laboratory diagnostic shaker device designed and developed for TubeX testing workflows. The system was engineered from the ground up including mechanical structure, control system, and operational mechanism. Currently implemented in two hospitals in Bogor, Indonesia.",
    labels: ["Hardware", "Diagnostics", "Automation"],
  },
  {
    title: "AJCorp Web",
imageSrc: "/projects/ajcorp-web.jpeg",
    imageAlt: "AJCorp Web Project",
    description:
"A modern portfolio website showcasing engineering projects, technical work, and development experience. Built using modern web technologies with a focus on clean UI and performance.",
    labels: ["Next.js", "TypeScript", "Frontend"],
  },
  {
    title: "Roblox Game Development",
imageSrc: "/projects/roblox-dev.jpeg",
    imageAlt: "Roblox Dev Project",
    description:
"Development of game systems and scripting within the Roblox platform, focusing on gameplay mechanics and system functionality.",
    labels: ["Scripting", "Interactive Systems", "Game Logic"],
  },
];

export default function ProjectsSection() {
  const handleExplainProject = (projectTitle: string) => {
    window.dispatchEvent(
      new CustomEvent(AI_ADJI_PROJECT_EVENT, {
        detail: { projectTitle },
      })
    );
  };

  return (
    <section className="section-shell relative z-10 w-full">
      <div className="section-stack mx-auto max-w-[1200px]">
        <StorySection className="section-stack">
          <StoryItem>
            <SectionHeading
              title="Projects"
              subtitle="Selected work across lab hardware, interactive systems, and the portfolio platform itself."
            />
          </StoryItem>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {projects.map((project) => (
              <StoryItem
                key={project.title}
                className="surface-card flex flex-col gap-8 transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_28px_72px_rgba(0,0,0,0.3)]"
              >
                <div className="w-full flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleExplainProject(project.title)}
                    className="surface-card-soft relative w-full overflow-hidden rounded-[20px] text-left"
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={project.imageSrc}
                        alt={project.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] hover:scale-110"
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/10 to-black/25" />
                    <div className="absolute inset-0 opacity-[0.12]">
                      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="1" />
                        <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    </div>

                    <div className="relative aspect-[16/10] px-8 py-7">
                      <div className="flex h-full flex-col justify-between">
                        <p className="section-kicker">Project Preview</p>
                        <p className="text-[clamp(24px,4vw,34px)] leading-none text-white/18">{project.title}</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="w-full space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {project.labels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/52"
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-[clamp(28px,3.6vw,40px)] leading-tight text-white/96">{project.title}</h3>

                  <p className="section-copy max-w-none text-white/58">{project.description}</p>

                  <a href="#ai-assistant" className="tech-label w-fit text-[11px] text-white/68 transition-colors duration-300 hover:text-white inline-block" onClick={(e) => handleExplainProject(project.title)}>
                    Ask Adji Assistant About This Project
                  </a>
                </div>
              </StoryItem>
            ))}
          </div>
        </StorySection>
      </div>
    </section>
  );
}
