"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  AI_ADJI_PROJECT_EVENT,
  PROJECT_KNOWLEDGE,
  type ProjectKnowledge,
} from "@/components/sections/aiAdjiData";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

type TypingMessageProps = {
  text: string;
  active: boolean;
  onComplete?: () => void;
};

type KnowledgeTopic =
  | "about"
  | "work"
  | "skills"
  | "engineering_interests"
  | "projects"
  | "education"
  | "personality"
  | "availability"
  | "free_time";

type KnowledgeEntry = {
  topic: KnowledgeTopic;
  title: string;
  content: string;
  descriptors: string[];
};

type KnowledgeIndexEntry = KnowledgeEntry & {
  normalizedTitle: string;
  normalizedContent: string;
  tokens: string[];
  tokenSet: Set<string>;
  semanticVector: Map<string, number>;
};

type RetrievalMatch = {
  entry: KnowledgeIndexEntry;
  score: number;
};

type ReasoningIntent = "why" | "motivation" | "future_goals" | "learning_philosophy" | null;
type ProcessedQuestionResult = {
  response: string;
  matched: boolean;
};
type PageContextSectionId = "about" | "projects" | "experience" | "education";
type PageContextEntry = {
  id: string;
  section: PageContextSectionId;
  text: string;
  normalizedText: string;
  tokens: string[];
  semanticVector: Map<string, number>;
};

type QuestionIndex = Record<string, number>;

const INITIAL_MESSAGE =
  "I'm Adji Assistant. I can help explain his work, projects, engineering background, and the way he thinks about building systems.";

const INTRO_PHRASES = [
  "That's an interesting question.",
  "Happy to explain.",
  "Glad you asked.",
  "Here's how I'd describe it.",
];

const FALLBACK_RESPONSES = [
  "I don't have a strong answer for that yet, but I can help with Adji's projects, skills, engineering work, or technologies.",
  "I may need a clearer angle on that one, but I can definitely tell you about Adji's engineering work, projects, or technical strengths.",
  "I might not know that precisely yet, though I can still help with Adji's projects, systems work, skills, or background.",
];
const CONVERSATION_CLOSERS = [
  "If you're interested in working together, Adji is open to engineering opportunities.",
  "Feel free to explore the projects in this portfolio or reach out to collaborate.",
  "If any of these projects interest you, Adji would love to discuss them further.",
];

const SUGGESTED_QUESTIONS = [
  "What kind of engineering work does Adji do?",
  "What projects has Adji built?",
  "What technologies does Adji use?",
  "What is Adji like as an engineer?",
];
const QUESTION_INDEX_STORAGE_KEY = "ai-adji-question-index";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "can",
  "do",
  "for",
  "from",
  "has",
  "have",
  "he",
  "his",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "them",
  "they",
  "this",
  "to",
  "what",
  "who",
  "with",
  "you",
  "your",
]);

const SYNONYM_GROUPS: Record<string, string[]> = {
  technology: ["tech", "tools", "stack", "framework", "frameworks", "software"],
  projects: ["project", "build", "builds", "create", "created", "portfolio"],
  skills: ["skill", "expertise", "ability", "abilities", "strength", "strengths"],
  work: ["job", "career", "profession", "role", "experience"],
  education: ["study", "studies", "university", "school", "college", "academic"],
  availability: ["hire", "available", "collaborate", "collaboration", "opportunity"],
  personality: ["mindset", "character", "approach", "attitude"],
  engineering: ["engineer", "engineering", "system", "systems", "technical"],
};

const SYNONYM_LOOKUP = new Map<string, string>();

for (const [root, words] of Object.entries(SYNONYM_GROUPS)) {
  SYNONYM_LOOKUP.set(root, root);
  for (let i = 0; i < words.length; i++) {
    SYNONYM_LOOKUP.set(words[i], root);
  }
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    topic: "about",
    title: "About Adji",
    content:
      "Adji is an independent builder focused on laboratory instrumentation, electronics repair, and system development. He likes understanding how systems fail, then rebuilding them in a cleaner and more reliable way.",
    descriptors: ["background", "about", "profile", "introduction", "who is adji"],
  },
  {
    topic: "work",
    title: "Work",
    content:
      "Adji works as a laboratory equipment technician at Sarana Megamedilab Sejahtera. His responsibilities include diagnostics, electronics repair, troubleshooting testing equipment, and maintaining laboratory systems.",
    descriptors: ["job", "career", "role", "experience", "laboratory", "technician"],
  },
  {
    topic: "skills",
    title: "Skills",
    content:
      "Adji works across hardware, software, and systems. His strengths include laboratory equipment diagnostics, electronics repair, troubleshooting, reverse engineering, automation, TypeScript, React, Next.js, UI engineering, and hardware-software integration.",
    descriptors: ["skills", "technology", "stack", "tools", "typescript", "react", "nextjs", "hardware", "software"],
  },
  {
    topic: "engineering_interests",
    title: "Engineering Interests",
    content:
      "Adji is especially interested in experimental engineering systems, hardware-software integration, instrument control, practical automation, and first-principles problem solving.",
    descriptors: ["interests", "engineering interests", "systems", "automation", "problem solving"],
  },
  {
    topic: "projects",
    title: "Projects",
    content:
      "Adji's projects include TubeX Shaker, a custom laboratory shaker for diagnostic testing; AJCorp Web, a portfolio platform built with Next.js; and Roblox game development focused on scripting and interactive systems.",
    descriptors: ["projects", "portfolio", "tubex", "roblox", "builds", "things built"],
  },
  {
    topic: "education",
    title: "Education",
    content:
      "Adji studied Mechanical Engineering at SMK PGRI 2 Bogor and continued into Aeronautics at Universitas Surya Darma. That path supports both his practical engineering work and systems thinking.",
    descriptors: ["education", "school", "university", "study", "mechanical engineering", "aeronautics"],
  },
  {
    topic: "personality",
    title: "Personality",
    content:
      "As an engineer, Adji comes across as calm, curious, practical, and hands-on. He tends to approach problems by investigating root causes and turning complexity into clear working systems.",
    descriptors: ["personality", "character", "mindset", "approach", "what is he like"],
  },
  {
    topic: "availability",
    title: "Availability",
    content:
      "Adji is open to interesting engineering challenges and collaborative opportunities, especially where technical ownership, systems thinking, and hands-on execution matter.",
    descriptors: ["hire", "available", "availability", "open to work", "collaboration"],
  },
  {
    topic: "free_time",
    title: "Free Time",
    content:
      "Outside of work, Adji spends much of his time experimenting with engineering systems, building tools, learning new technologies, and exploring ideas through practical projects.",
    descriptors: ["free time", "hobby", "outside work", "weekend", "learning"],
  },
];

const REASONING_PATTERNS: Record<Exclude<ReasoningIntent, null>, string[]> = {
  why: ["why", "reason", "purpose", "meaning"],
  motivation: ["motivation", "motivates", "inspire", "inspiration", "drive", "driven"],
  future_goals: ["future", "goal", "goals", "next", "plan", "plans", "direction"],
  learning_philosophy: ["learn", "learning", "philosophy", "approach", "mindset", "grow"],
};

const REASONING_RESPONSES: Record<Exclude<ReasoningIntent, null>, string> = {
  why:
    "For Adji, engineering is a way to understand how complex systems behave in the real world. The appeal is not just building something that works, but understanding why it works, why it fails, and how it can be improved with clearer system thinking.",
  motivation:
    "What seems to motivate Adji most is curiosity paired with hands-on problem solving. He enjoys taking systems apart mentally and physically, then rebuilding them into something more reliable, useful, and easier to understand.",
  future_goals:
    "Looking forward, Adji seems oriented toward deeper hardware-software integration, more advanced engineering systems, and projects where practical diagnostics, automation, and interface design come together in one workflow.",
  learning_philosophy:
    "Adji's learning philosophy is very practical. He tends to learn by experimenting, diagnosing, rebuilding, and testing ideas directly, which makes his growth path grounded in real systems instead of theory alone.",
};

const NORMALIZED_CACHE = new Map<string, string>();
const TOKEN_CACHE = new Map<string, string[]>();
const DECOMPOSITION_PATTERN = /\b(?:and|also|plus|then)\b/gi;
const PAGE_CONTEXT_IDS: PageContextSectionId[] = ["about", "projects", "experience", "education"];
const PROFILE_QUERY_PATTERNS = [
  "who is adji",
  "tell me about adji",
  "what does adji do",
  "who adji is",
  "describe adji",
  "adji profile",
];
const PROJECT_FOLLOW_UP_BUILDERS = [
  (title: string) => `What technologies were used in ${title}?`,
  (title: string) => `What was the biggest challenge in ${title}?`,
  (title: string) => `Why was ${title} built?`,
  (title: string) => `How does ${title} work?`,
];

function formatResponseText(text: string) {
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/([.!?])([A-Z])/g, "$1 $2")
    .replace(/([a-z])([A-Z][a-z])/g, "$1 $2")
    .replace(/([,:;])([A-Za-z])/g, "$1 $2")
    .trim();

  const sentences = cleaned.match(/[^.!?]+[.!?]?/g) ?? [cleaned];
  const paragraphs: string[] = [];

  for (let i = 0; i < sentences.length; i += 2) {
    const paragraph = sentences
      .slice(i, i + 2)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .join(" ");

    if (paragraph) {
      paragraphs.push(paragraph);
    }
  }

  return paragraphs.join("\n\n");
}

function TypingMessage({ text, active, onComplete }: TypingMessageProps) {
  const [visibleLength, setVisibleLength] = useState(active ? 0 : text.length);
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    setVisibleLength(active ? 0 : text.length);
    startedAtRef.current = null;
    completedRef.current = false;

    if (!active) {
      return;
    }

    const msPerCharacter = 20;

    const tick = (timestamp: number) => {
      if (startedAtRef.current === null) {
        startedAtRef.current = timestamp;
      }

      const elapsed = timestamp - startedAtRef.current;
      const nextLength = Math.min(text.length, Math.floor(elapsed / msPerCharacter));

      setVisibleLength((current) => {
        return nextLength > current ? nextLength : current;
      });

      if (nextLength >= text.length) {
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
        frameRef.current = null;
        return;
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [active, text]);

  return (
    <>
      {text.slice(0, visibleLength)}
      {active && visibleLength < text.length ? <span className="inline-block h-[1em] w-[0.5px] animate-pulse bg-white/60 align-middle" /> : null}
    </>
  );
}

function normalizeText(text: string) {
  const cached = NORMALIZED_CACHE.get(text);
  if (cached) {
    return cached;
  }

  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  NORMALIZED_CACHE.set(text, normalized);
  return normalized;
}

function readQuestionIndex() {
  if (typeof window === "undefined") {
    return {} as QuestionIndex;
  }

  try {
    const raw = window.localStorage.getItem(QUESTION_INDEX_STORAGE_KEY);
    if (!raw) {
      return {} as QuestionIndex;
    }

    const parsed = JSON.parse(raw) as QuestionIndex;
    return parsed && typeof parsed === "object" ? parsed : ({} as QuestionIndex);
  } catch {
    return {} as QuestionIndex;
  }
}

function writeQuestionIndex(index: QuestionIndex) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(QUESTION_INDEX_STORAGE_KEY, JSON.stringify(index));
  } catch {
    // Ignore storage failures to keep chat functional.
  }
}

function getTopQuestions(index: QuestionIndex, limit: number) {
  return Object.entries(index)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([question]) => question);
}

function formatSuggestedQuestion(question: string) {
  if (!question) {
    return question;
  }

  const withCapital = question.charAt(0).toUpperCase() + question.slice(1);
  return /[?!.]$/.test(withCapital) ? withCapital : `${withCapital}?`;
}

function stemToken(token: string) {
  if (token.endsWith("ing") && token.length > 5) {
    return token.slice(0, -3);
  }
  if (token.endsWith("tion") && token.length > 6) {
    return token.slice(0, -4);
  }
  if (token.endsWith("ed") && token.length > 4) {
    return token.slice(0, -2);
  }
  if (token.endsWith("es") && token.length > 4) {
    return token.slice(0, -2);
  }
  if (token.endsWith("s") && token.length > 3) {
    return token.slice(0, -1);
  }
  return token;
}

function mapSynonym(token: string) {
  return SYNONYM_LOOKUP.get(token) ?? token;
}

function tokenize(text: string) {
  const normalized = normalizeText(text);
  const cached = TOKEN_CACHE.get(normalized);
  if (cached) {
    return cached;
  }

  const tokens = normalized
    .split(" ")
    .map(stemToken)
    .map(mapSynonym)
    .filter((token) => token && !STOP_WORDS.has(token));

  TOKEN_CACHE.set(normalized, tokens);
  return tokens;
}

function detectReasoningIntent(query: string): ReasoningIntent {
  const tokens = tokenize(query);

  let bestIntent: ReasoningIntent = null;
  let bestScore = 0;

  for (const intent of Object.keys(REASONING_PATTERNS) as Exclude<ReasoningIntent, null>[]) {
    const patternTokens = REASONING_PATTERNS[intent];
    let score = 0;

    for (let i = 0; i < tokens.length; i++) {
      if (patternTokens.includes(tokens[i])) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestScore > 0 ? bestIntent : null;
}

function decomposeQuestion(query: string) {
  const normalized = query.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [];
  }

  const segments = normalized
    .split(DECOMPOSITION_PATTERN)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  return segments.length > 0 ? segments : [normalized];
}

function wordSimilarity(a: string, b: string) {
  if (a === b) {
    return 1;
  }

  if (a.length > 3 && b.length > 3 && (a.includes(b) || b.includes(a))) {
    return 0.72;
  }

  let prefixLength = 0;
  const limit = Math.min(a.length, b.length);

  while (prefixLength < limit && a[prefixLength] === b[prefixLength]) {
    prefixLength += 1;
  }

  if (prefixLength >= 4) {
    return 0.56;
  }

  return 0;
}

function vectorizeTokens(tokens: string[]) {
  const vector = new Map<string, number>();

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    vector.set(token, (vector.get(token) ?? 0) + 1);
  }

  return vector;
}

function createPageContextIndex() {
  if (typeof document === "undefined") {
    return [];
  }

  const entries: PageContextEntry[] = [];

  for (let i = 0; i < PAGE_CONTEXT_IDS.length; i++) {
    const sectionId = PAGE_CONTEXT_IDS[i];
    const element = document.getElementById(sectionId);
    const text = element?.textContent?.replace(/\s+/g, " ").trim() ?? "";

    if (!text) {
      continue;
    }

    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);

    for (let j = 0; j < sentences.length; j++) {
      const sentence = sentences[j];
      const tokens = tokenize(sentence);

      if (tokens.length === 0) {
        continue;
      }

      entries.push({
        id: `${sectionId}-${j}`,
        section: sectionId,
        text: sentence,
        normalizedText: normalizeText(sentence),
        tokens,
        semanticVector: vectorizeTokens(tokens),
      });
    }
  }

  return entries;
}

function findProjectKnowledge(query: string) {
  const normalizedQuery = normalizeText(query);

  for (let i = 0; i < PROJECT_KNOWLEDGE.length; i++) {
    const project = PROJECT_KNOWLEDGE[i];
    if (normalizedQuery.includes(normalizeText(project.title))) {
      return project;
    }
  }

  return null;
}

function buildProjectResponse(query: string, project: ProjectKnowledge) {
  const normalizedQuery = normalizeText(query);

  if (normalizedQuery.includes("technolog") || normalizedQuery.includes("tech") || normalizedQuery.includes("tool")) {
    return `${project.title} uses ${project.technologies}`;
  }

  if (normalizedQuery.includes("challenge") || normalizedQuery.includes("difficult") || normalizedQuery.includes("hard")) {
    return `One of the biggest challenges in ${project.title} was ${project.challenges}`;
  }

  if (normalizedQuery.includes("purpose") || normalizedQuery.includes("why") || normalizedQuery.includes("built")) {
    return `${project.title} was built because ${project.purpose}`;
  }

  if (normalizedQuery.includes("how") || normalizedQuery.includes("work")) {
    return `${project.title} works as a system where ${project.summary} ${project.technologies}`;
  }

  return project.summary;
}

function scoreSemanticSimilarity(queryVector: Map<string, number>, knowledgeEntry: KnowledgeIndexEntry) {
  let score = 0;

  queryVector.forEach((queryWeight, queryToken) => {
    if (knowledgeEntry.semanticVector.has(queryToken)) {
      score += queryWeight * (knowledgeEntry.semanticVector.get(queryToken) ?? 0) * 2.2;
      return;
    }

    let bestPartial = 0;
    for (let i = 0; i < knowledgeEntry.tokens.length; i++) {
      const similarity = wordSimilarity(queryToken, knowledgeEntry.tokens[i]);
      if (similarity > bestPartial) {
        bestPartial = similarity;
      }
    }

    score += bestPartial * queryWeight;
  });

  return score;
}

function scorePageContextSimilarity(queryVector: Map<string, number>, pageEntry: PageContextEntry) {
  let score = 0;

  queryVector.forEach((queryWeight, queryToken) => {
    if (pageEntry.semanticVector.has(queryToken)) {
      score += queryWeight * (pageEntry.semanticVector.get(queryToken) ?? 0) * 1.9;
      return;
    }

    let bestPartial = 0;
    for (let i = 0; i < pageEntry.tokens.length; i++) {
      const similarity = wordSimilarity(queryToken, pageEntry.tokens[i]);
      if (similarity > bestPartial) {
        bestPartial = similarity;
      }
    }

    score += bestPartial * queryWeight;
  });

  return score;
}

const KNOWLEDGE_INDEX: KnowledgeIndexEntry[] = KNOWLEDGE_BASE.map((entry) => {
  const normalizedTitle = normalizeText(entry.title);
  const normalizedContent = normalizeText(`${entry.content} ${entry.descriptors.join(" ")}`);
  const tokens = tokenize(`${entry.title} ${entry.content} ${entry.descriptors.join(" ")}`);

  return {
    ...entry,
    normalizedTitle,
    normalizedContent,
    tokens,
    tokenSet: new Set(tokens),
    semanticVector: vectorizeTokens(tokens),
  };
});

function detectIntent(query: string, popularityBoost = 0) {
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenize(query);
  const queryVector = vectorizeTokens(queryTokens);

  const matches: RetrievalMatch[] = [];

  for (let i = 0; i < KNOWLEDGE_INDEX.length; i++) {
    const entry = KNOWLEDGE_INDEX[i];
    let score = 0;

    if (normalizedQuery.includes(entry.normalizedTitle)) {
      score += 4;
    }

    score += scoreSemanticSimilarity(queryVector, entry);
    if (score > 0 && popularityBoost > 0) {
      score += popularityBoost;
    }

    matches.push({ entry, score });
  }

  matches.sort((a, b) => b.score - a.score);

  const topMatches = matches.filter((match) => match.score >= 2.4).slice(0, 2);

  return {
    matches: topMatches,
    topScore: matches[0]?.score ?? 0,
  };
}

function buildContext(entries: KnowledgeIndexEntry[]) {
  return {
    topics: entries.map((entry) => entry.topic),
    titles: entries.map((entry) => entry.title),
    content: entries.map((entry) => entry.content).join(" "),
  };
}

function retrievePageContext(query: string, pageContextIndex: PageContextEntry[]) {
  const queryVector = vectorizeTokens(tokenize(query));
  const matches: { entry: PageContextEntry; score: number }[] = [];

  for (let i = 0; i < pageContextIndex.length; i++) {
    const entry = pageContextIndex[i];
    const score = scorePageContextSimilarity(queryVector, entry);

    if (score > 0) {
      matches.push({ entry, score });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 2);
}

function isProfileQuestion(query: string) {
  const normalizedQuery = normalizeText(query);

  for (let i = 0; i < PROFILE_QUERY_PATTERNS.length; i++) {
    if (normalizedQuery.includes(PROFILE_QUERY_PATTERNS[i])) {
      return true;
    }
  }

  return (
    normalizedQuery.includes("about adji") ||
    (normalizedQuery.includes("adji") &&
      (normalizedQuery.includes("who") || normalizedQuery.includes("tell me") || normalizedQuery.includes("what does")))
  );
}

function generateProfileSummary(pageContextIndex: PageContextEntry[]) {
  const profileQuery = "who is adji tell me about adji what does adji do engineering work projects education";
  const matches = retrievePageContext(profileQuery, pageContextIndex);

  if (matches.length === 0) {
    return KNOWLEDGE_BASE.find((entry) => entry.topic === "about")?.content ?? INITIAL_MESSAGE;
  }

  const uniqueSentences: string[] = [];

  for (let i = 0; i < matches.length; i++) {
    const sentence = matches[i].entry.text.trim();
    if (sentence && !uniqueSentences.includes(sentence)) {
      uniqueSentences.push(sentence);
    }
  }

  const aboutSentence =
    pageContextIndex.find((entry) => entry.section === "about")?.text ??
    KNOWLEDGE_BASE.find((entry) => entry.topic === "about")?.content ??
    "";
  const experienceSentence =
    pageContextIndex.find((entry) => entry.section === "experience")?.text ??
    KNOWLEDGE_BASE.find((entry) => entry.topic === "work")?.content ??
    "";
  const educationSentence =
    pageContextIndex.find((entry) => entry.section === "education")?.text ??
    KNOWLEDGE_BASE.find((entry) => entry.topic === "education")?.content ??
    "";

  const orderedProfileSentences = [aboutSentence, experienceSentence, educationSentence]
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  for (let i = 0; i < orderedProfileSentences.length; i++) {
    const sentence = orderedProfileSentences[i];
    if (!uniqueSentences.includes(sentence)) {
      uniqueSentences.push(sentence);
    }
  }

  return uniqueSentences.slice(0, 3).join(" ");
}

function appendConversationCloser(response: string) {
  if (Math.random() > 0.28) {
    return response;
  }

  const closer =
    CONVERSATION_CLOSERS[Math.floor(Math.random() * CONVERSATION_CLOSERS.length)] ?? CONVERSATION_CLOSERS[0];
  return `${response} ${closer}`;
}

function generateResponseForSingleQuestion(
  query: string,
  pageContextIndex: PageContextEntry[],
  questionCount = 0
): ProcessedQuestionResult {
  if (isProfileQuestion(query)) {
    const intro = INTRO_PHRASES[Math.floor(Math.random() * INTRO_PHRASES.length)] ?? INTRO_PHRASES[0];
    return {
      response: appendConversationCloser(`${intro} ${generateProfileSummary(pageContextIndex)}`),
      matched: true,
    };
  }

  const project = findProjectKnowledge(query);
  if (project) {
    const intro = INTRO_PHRASES[Math.floor(Math.random() * INTRO_PHRASES.length)] ?? INTRO_PHRASES[0];
    return {
      response: appendConversationCloser(`${intro} ${buildProjectResponse(query, project)}`),
      matched: true,
    };
  }

  const popularityBoost = Math.min(questionCount, 6) * 0.2;
  const retrieval = detectIntent(query, popularityBoost);
  const reasoningIntent = detectReasoningIntent(query);
  const pageMatches = retrievePageContext(query, pageContextIndex);

  if (reasoningIntent && retrieval.matches.length === 0 && pageMatches.length === 0) {
    const intro = INTRO_PHRASES[Math.floor(Math.random() * INTRO_PHRASES.length)] ?? INTRO_PHRASES[0];
    return {
      response: appendConversationCloser(`${intro} ${REASONING_RESPONSES[reasoningIntent]}`),
      matched: true,
    };
  }

  if (retrieval.matches.length === 0 && pageMatches.length === 0) {
    return {
      response: appendConversationCloser(
        FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)] ?? FALLBACK_RESPONSES[0]
      ),
      matched: false,
    };
  }

  const knowledgeContext =
    retrieval.matches.length > 0 ? buildContext(retrieval.matches.map((match) => match.entry)).content : "";
  const pageContext = pageMatches.map((match) => match.entry.text).join(" ");
  const intro = INTRO_PHRASES[Math.floor(Math.random() * INTRO_PHRASES.length)] ?? INTRO_PHRASES[0];
  const reasoningLayer = reasoningIntent ? ` ${REASONING_RESPONSES[reasoningIntent]}` : "";
  const synthesizedContent = [knowledgeContext, pageContext].filter(Boolean).join(" ");

  return {
    response: appendConversationCloser(`${intro} ${synthesizedContent}${reasoningLayer}`),
    matched: true,
  };
}

function generateResponse(query: string, pageContextIndex: PageContextEntry[], questionIndex: QuestionIndex) {
  const parts = decomposeQuestion(query);
  const normalizedQuery = normalizeText(query);
  const questionCount = questionIndex[normalizedQuery] ?? 0;

  if (parts.length <= 1) {
    return generateResponseForSingleQuestion(query, pageContextIndex, questionCount).response;
  }

  const results: ProcessedQuestionResult[] = [];

  for (let i = 0; i < parts.length; i++) {
    const partCount = questionIndex[normalizeText(parts[i])] ?? questionCount;
    results.push(generateResponseForSingleQuestion(parts[i], pageContextIndex, partCount));
  }

  const matchedResults = results.filter((result) => result.matched);

  if (matchedResults.length === 0) {
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)] ?? FALLBACK_RESPONSES[0];
  }

  return matchedResults.map((result) => result.response).join(" ");
}

export default function AIAdjiSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "assistant", text: formatResponseText(INITIAL_MESSAGE) },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [animatingMessageId, setAnimatingMessageId] = useState<number | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(SUGGESTED_QUESTIONS);
  const [activeProjectTitle, setActiveProjectTitle] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const pageContextRef = useRef<PageContextEntry[]>([]);
  const questionIndexRef = useRef<QuestionIndex>({});
  const activeProjectRef = useRef<ProjectKnowledge | null>(null);

  useEffect(() => {
    pageContextRef.current = createPageContextIndex();
    questionIndexRef.current = readQuestionIndex();
    const topQuestions = getTopQuestions(questionIndexRef.current, 4);
    if (topQuestions.length > 0) {
      setSuggestedQuestions(topQuestions);
    }
  }, []);

  useEffect(() => {
    const handleProjectExplain = (event: Event) => {
      const customEvent = event as CustomEvent<{ projectTitle?: string }>;
      const projectTitle = customEvent.detail?.projectTitle;
      const project = PROJECT_KNOWLEDGE.find((entry) => entry.title === projectTitle);

      if (!project || isTyping) {
        return;
      }

      submitPrompt(`Tell me about the ${project.title} project`);
    };

    window.addEventListener(AI_ADJI_PROJECT_EVENT, handleProjectExplain as EventListener);

    return () => {
      window.removeEventListener(AI_ADJI_PROJECT_EVENT, handleProjectExplain as EventListener);
    };
  }, [isTyping]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping, animatingMessageId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const getProjectSuggestions = (project: ProjectKnowledge) =>
    PROJECT_FOLLOW_UP_BUILDERS.map((builder) => builder(project.title));

  const submitPrompt = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isTyping) {
      return;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };

    const normalizedQuestion = normalizeText(trimmed);
    const nextQuestionIndex = {
      ...questionIndexRef.current,
      [normalizedQuestion]: (questionIndexRef.current[normalizedQuestion] ?? 0) + 1,
    };
    questionIndexRef.current = nextQuestionIndex;
    writeQuestionIndex(nextQuestionIndex);

    const project = findProjectKnowledge(trimmed);
    if (project) {
      activeProjectRef.current = project;
      setActiveProjectTitle(project.title);
      setSuggestedQuestions(getProjectSuggestions(project));
    } else {
      activeProjectRef.current = null;
      setActiveProjectTitle(null);
      const topQuestions = getTopQuestions(nextQuestionIndex, 4);
      setSuggestedQuestions(topQuestions.length > 0 ? topQuestions : SUGGESTED_QUESTIONS);
    }

    const response = generateResponse(trimmed, pageContextRef.current, nextQuestionIndex);
    const typingDelay = 600 + Math.floor(Math.random() * 601);

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsTyping(true);

    timeoutRef.current = window.setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: formatResponseText(response),
      };

      setMessages((previous) => [...previous, assistantMessage]);
      setAnimatingMessageId(assistantMessage.id);
      setIsTyping(false);
      timeoutRef.current = null;
    }, typingDelay);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitPrompt(input);
    setInput("");
  };

  const showSuggestions = messages.length === 1 && !isTyping;
  const projectFollowUps =
    activeProjectTitle !== null
      ? PROJECT_FOLLOW_UP_BUILDERS.map((builder) => builder(activeProjectTitle))
      : [];

  return (
<section id="ai-assistant" className="py-[120px] relative z-10 w-full">
      <div className="max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-12"
        >
          <div className="text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-light tracking-wide text-white">
              Adji Assistant
            </h2>
            <div className="w-12 h-[1px] bg-white/30 mx-auto" />
            <p className="text-white/45 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              assistant for explaining Adji&apos;s background, projects, and engineering mindset.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-5 md:p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div
              ref={messagesRef}
              className="rounded-[24px] border border-white/8 bg-black/30 p-4 md:p-5 h-[420px] overflow-y-auto space-y-4"
            >
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed ${
                        message.role === "user"
                          ? "bg-white text-black"
                          : "bg-white/[0.05] text-white/80 border border-white/10"
                      }`}
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {message.role === "assistant" ? (
                        <TypingMessage
                          text={message.text}
                          active={animatingMessageId === message.id}
                          onComplete={() => {
                            setAnimatingMessageId((current) => (current === message.id ? null : current));
                          }}
                        />
                      ) : (
                        message.text
                      )}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    key="typing-indicator"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex justify-start"
                  >
                    <div className="rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed bg-white/[0.05] text-white/70 border border-white/10">
                      <div className="flex items-center gap-2">
                        <span>Thinking</span>
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" />
                          <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-pulse [animation-delay:120ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-white/30 animate-pulse [animation-delay:240ms]" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {showSuggestions && (
                <div className="pt-3 space-y-3">
                  <p className="tech-label text-[10px] tracking-[0.28em] text-white/35">Suggested Questions</p>
                  <div className="flex flex-wrap gap-3">
                    {suggestedQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => handleSuggestedQuestion(question)}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs sm:text-sm text-white/70 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                      >
                        {formatSuggestedQuestion(question)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask Adji Assistant about background, work, projects, education, or availability..."
                className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/30 outline-none transition-colors duration-300 focus:border-white/30"
              />
              <button
                type="submit"
                disabled={isTyping}
                className="rounded-2xl border border-white/15 bg-white text-black px-5 py-3 text-sm tracking-[0.2em] uppercase transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                Send
              </button>
            </form>

            {projectFollowUps.length > 0 && (
              <div className="mt-5 space-y-3">
                <p className="tech-label text-[10px] tracking-[0.28em] text-white/35">Project Follow-Ups</p>
                <div className="flex flex-wrap gap-3">
                  {projectFollowUps.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => handleSuggestedQuestion(question)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs sm:text-sm text-white/70 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
