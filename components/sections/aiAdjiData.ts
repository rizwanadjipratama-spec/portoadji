export const AI_ADJI_PROJECT_EVENT = "ai-adji-project-explain";

export type ProjectKnowledge = {
  title: string;
  summary: string;
  technologies: string;
  challenges: string;
  purpose: string;
};

export const PROJECT_KNOWLEDGE: ProjectKnowledge[] = [
  {
    title: "TubeX Shaker",
    summary:
      "TubeX Shaker is a custom laboratory shaker system designed for diagnostic testing. It was built to improve repeatability, reduce manual handling, and create a more reliable workflow around sample motion.",
    technologies:
      "The project combines mechanical design, laboratory hardware thinking, diagnostics knowledge, automation concepts, and practical system integration.",
    challenges:
      "One of the biggest challenges was turning a manual process into a more stable repeatable system while keeping the device practical for real laboratory use.",
    purpose:
      "The system was built to make diagnostic testing more consistent and reliable by replacing repetitive manual shaking with a controlled engineered solution.",
  },
  {
    title: "AJCorp Web",
    summary:
      "AJCorp Web is Adji's personal portfolio platform built with Next.js. It presents engineering identity, projects, and technical thinking through a more interactive interface.",
    technologies:
      "The project uses TypeScript, React, Next.js, frontend UI engineering, animation, and responsive interface design.",
    challenges:
      "The main challenge was translating engineering identity into a modern interface that feels technical, memorable, and polished without losing performance.",
    purpose:
      "The platform was built to tell Adji's story as an engineer and make his work, background, and systems mindset easier to explore.",
  },
  {
    title: "Roblox Game Development",
    summary:
      "This project is an independent Roblox development effort focused on scripting, interaction design, and building systems that feel engaging inside a game environment.",
    technologies:
      "It involves scripting, gameplay logic, interactive systems design, and iterative experimentation with how digital environments respond to player behavior.",
    challenges:
      "A key challenge was balancing interaction design, system behavior, and gameplay flow while continuing to learn through experimentation.",
    purpose:
      "The project exists as a hands-on way to explore scripting, interactive systems, and creative problem solving in a different type of engineering environment.",
  },
];
