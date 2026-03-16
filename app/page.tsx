import HeroSection from "@/components/sections/HeroSection";
import Marquee from "@/components/ui/Marquee";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import CVSection from "@/components/sections/CVSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import EducationSection from "@/components/sections/EducationSection";
import CertificationsSection from "@/components/sections/CertificationsSection";
import AIAdjiSection from "@/components/sections/AIAdjiSection";
import ContactSection from "@/components/sections/ContactSection";
import SectionShell from "@/components/layout/SectionShell";

export default function Home() {
  return (
    <main id="home" className="flex min-h-screen w-full flex-col items-center">
      <HeroSection />

      <div className="w-full">
        <Marquee />
      </div>


      <SectionShell id="about">
        <AboutSection />
      </SectionShell>

      <SectionShell id="cv">
        <CVSection />
      </SectionShell>

      <SectionShell id="skills">
        <SkillsSection />
      </SectionShell>

      <SectionShell id="projects">
        <ProjectsSection />
      </SectionShell>

      <SectionShell id="experience">
        <ExperienceSection />
      </SectionShell>

      <SectionShell id="education">
        <EducationSection />
      </SectionShell>

      <SectionShell id="certifications">
        <CertificationsSection />
      </SectionShell>

<SectionShell id="ai-assistant">
        <AIAdjiSection />
      </SectionShell>

      <SectionShell id="contact">
        <ContactSection />
      </SectionShell>
    </main>
  );
}
