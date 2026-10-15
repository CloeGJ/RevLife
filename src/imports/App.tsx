import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type View =
  | "home"
  | "login"
  | "signup"
  | "support"
  | "processing"
  | "dashboard"
  | "reviewer"
  | "quiz"
  | "results";
type DashSection =
  | "overview"
  | "flashcards"
  | "quiz"
  | "mock-exam"
  | "key-points"
  | "voice"
  | "history"
  | "profile";
type HistoryType = "flashcard" | "quiz" | "mock-exam" | "key-points" | "voice";
type HistoryFilter = "all" | HistoryType;

export interface ReviewCard {
  id: number;
  concept: string;
  definition: string;
  example?: string;
  tip?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface HistoryItem {
  id: string;
  module: string;
  type: HistoryType;
  date: string;
  score?: number;
  total?: number;
  cards?: number;
}

interface UserProfile {
  name: string;
  email: string;
  major: string;
  year: string;
  goal: string;
  bio: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const REVIEW_CARDS: ReviewCard[] = [
  {
    id: 1,
    concept: "Plasma Membrane",
    definition:
      "A selectively permeable lipid bilayer surrounding the cell, controlling what substances enter and exit through active and passive transport.",
    example:
      "Phospholipids arrange with hydrophilic heads outward and hydrophobic tails inward.",
    tip: "Think of it as a gatekeeper — it decides what gets in and what stays out.",
  },
  {
    id: 2,
    concept: "Nucleus",
    definition:
      "The control center of the cell, containing DNA and directing cellular activities through gene expression and RNA transcription.",
    example:
      "The nucleolus inside the nucleus produces ribosomal RNA for ribosome assembly.",
    tip: '"Brain" of the cell — holds the DNA instructions for everything the cell does.',
  },
  {
    id: 3,
    concept: "Mitochondria",
    definition:
      "Double-membraned organelles that generate most of the cell's ATP through cellular respiration via oxidative phosphorylation.",
    example: "Aerobic respiration: glucose + oxygen → CO₂ + H₂O + 36–38 ATP.",
    tip: '"Powerhouse of the cell." Cristae (inner membrane folds) maximize surface area for ATP.',
  },
  {
    id: 4,
    concept: "Endoplasmic Reticulum",
    definition:
      "A network of membranes involved in protein and lipid synthesis. Rough ER has ribosomes attached; smooth ER handles lipid metabolism.",
    example:
      "Rough ER synthesizes proteins destined for secretion, membranes, or organelles.",
    tip: "Rough = ribosomes = proteins. Smooth = lipid synthesis and detox.",
  },
  {
    id: 5,
    concept: "Golgi Apparatus",
    definition:
      "A stack of flattened membrane sacs that modifies, packages, and routes proteins and lipids to their final destinations.",
    example:
      "Proteins from the ER enter the cis-face and are dispatched from the trans-face.",
    tip: "The cell's post office — processes and ships molecular packages.",
  },
  {
    id: 6,
    concept: "Ribosomes",
    definition:
      "Molecular machines made of rRNA and proteins that translate mRNA into polypeptide chains, found free or bound to rough ER.",
    example:
      "Free ribosomes make cytoplasmic proteins; bound ribosomes make secreted proteins.",
    tip: "Not membrane-bound — not technically organelles. Present in ALL cells.",
  },
  {
    id: 7,
    concept: "Lysosomes",
    definition:
      "Membrane-bound organelles containing hydrolytic enzymes at acidic pH, digesting macromolecules, old organelles, and pathogens.",
    example:
      "During autophagy, a lysosome fuses with an autophagosome to degrade damaged organelles.",
    tip: "Recycling center and waste disposal system of the cell.",
  },
  {
    id: 8,
    concept: "Cytoskeleton",
    definition:
      "A dynamic network of protein filaments (microfilaments, intermediate filaments, microtubules) that maintains cell shape and enables movement.",
    example:
      "Microtubules form the mitotic spindle during cell division, separating chromosomes.",
    tip: "Scaffolding + highway system — gives structure and enables intracellular transport.",
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question:
      "Which organelle is primarily responsible for ATP synthesis in eukaryotic cells?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"],
    correct: 2,
    explanation:
      'Mitochondria generate most of a cell\'s ATP through cellular respiration, earning the nickname "powerhouse of the cell."',
  },
  {
    id: 2,
    question: "What distinguishes rough ER from smooth ER?",
    options: [
      "Rough ER is significantly larger",
      "Rough ER has ribosomes attached to its surface",
      "Rough ER synthesises lipids instead of proteins",
      "Rough ER is only found in plant cells",
    ],
    correct: 1,
    explanation:
      "Ribosomes studding the outer surface give rough ER its textured appearance and are responsible for synthesising secretory proteins.",
  },
  {
    id: 3,
    question: "The plasma membrane is best described as:",
    options: [
      "A rigid barrier preventing any material from passing",
      "A selectively permeable lipid bilayer",
      "A protein-only barrier surrounding the cell",
      "A structure exclusive to animal cells",
    ],
    correct: 1,
    explanation:
      "The plasma membrane is a selectively permeable lipid bilayer, allowing some substances to pass freely while restricting others via transport proteins.",
  },
  {
    id: 4,
    question: "Which of the following is NOT a cytoskeleton component?",
    options: [
      "Microfilaments",
      "Microtubules",
      "Intermediate filaments",
      "Phospholipids",
    ],
    correct: 3,
    explanation:
      "Phospholipids form cell membranes, not the cytoskeleton. The cytoskeleton consists of microfilaments, intermediate filaments, and microtubules.",
  },
  {
    id: 5,
    question: "What is the primary function of the Golgi apparatus?",
    options: [
      "DNA replication and transcription",
      "ATP synthesis via oxidative phosphorylation",
      "Modifying, packaging, and routing proteins and lipids",
      "Breaking down damaged organelles",
    ],
    correct: 2,
    explanation:
      "The Golgi acts as the cell's post office: it modifies proteins from the ER, packages them into vesicles, and routes them to correct destinations.",
  },
  {
    id: 6,
    question: "Lysosomes contain which type of enzymes?",
    options: [
      "Kinases",
      "Hydrolytic enzymes",
      "DNA polymerases",
      "ATP synthases",
    ],
    correct: 1,
    explanation:
      "Lysosomes contain hydrolytic enzymes that function optimally at acidic pH (~5), digesting macromolecules, damaged organelles, and pathogens.",
  },
  {
    id: 7,
    question: "Where are secretory proteins primarily synthesised?",
    options: [
      "Free ribosomes in the cytoplasm",
      "Mitochondrial ribosomes",
      "Ribosomes bound to rough ER",
      "The nucleus",
    ],
    correct: 2,
    explanation:
      "Secretory proteins are made by ribosomes on the rough ER surface, threaded into the ER lumen for processing and eventual export.",
  },
  {
    id: 8,
    question: "Which structure within the nucleus produces ribosomal RNA?",
    options: ["Nuclear pore", "Chromatin", "Nucleolus", "Nuclear envelope"],
    correct: 2,
    explanation:
      "The nucleolus is a dense, non-membrane-bound region that transcribes rRNA genes and assembles ribosomal subunits.",
  },
  {
    id: 9,
    question:
      "During cell division, microtubules form which structure to separate chromosomes?",
    options: [
      "Cell plate",
      "Mitotic spindle",
      "Contractile ring",
      "Cleavage furrow",
    ],
    correct: 1,
    explanation:
      "The mitotic spindle attaches to chromosomes at the kinetochore and pulls sister chromatids to opposite poles during mitosis.",
  },
  {
    id: 10,
    question: "The inner membrane folds of mitochondria are called:",
    options: ["Thylakoids", "Cristae", "Grana", "Lamellae"],
    correct: 1,
    explanation:
      "Cristae are inner mitochondrial membrane folds that increase surface area for the electron transport chain and ATP synthase complexes.",
  },
];

const HISTORY_DATA: HistoryItem[] = [
  {
    id: "1",
    module: "Cell Biology — Chapter 3",
    type: "quiz",
    date: "Today, 2:14 PM",
    score: 8,
    total: 10,
  },
  {
    id: "2",
    module: "Cell Biology — Chapter 3",
    type: "flashcard",
    date: "Today, 1:50 PM",
    cards: 8,
  },
  {
    id: "3",
    module: "Human Anatomy — Skeletal System",
    type: "mock-exam",
    date: "Yesterday",
    score: 17,
    total: 20,
  },
  {
    id: "4",
    module: "Organic Chemistry — Reactions",
    type: "quiz",
    date: "Oct 27",
    score: 12,
    total: 15,
  },
  {
    id: "5",
    module: "Human Anatomy — Skeletal System",
    type: "flashcard",
    date: "Oct 26",
    cards: 14,
  },
  {
    id: "6",
    module: "Calculus II — Integration",
    type: "key-points",
    date: "Oct 25",
  },
  {
    id: "7",
    module: "Organic Chemistry — Reactions",
    type: "mock-exam",
    date: "Oct 24",
    score: 9,
    total: 15,
  },
  {
    id: "8",
    module: "Calculus II — Integration",
    type: "quiz",
    date: "Oct 23",
    score: 10,
    total: 12,
  },
  {
    id: "9",
    module: "Cell Biology — Chapter 2",
    type: "voice",
    date: "Oct 22",
  },
  {
    id: "10",
    module: "Cell Biology — Chapter 2",
    type: "flashcard",
    date: "Oct 21",
    cards: 10,
  },
];

const KEY_POINTS = [
  "The plasma membrane is a selectively permeable lipid bilayer — it controls entry and exit of all substances.",
  "The nucleus is the cell's control center, housing DNA and directing gene expression through RNA transcription.",
  "Mitochondria generate ATP via cellular respiration; cristae (inner membrane folds) maximize their surface area.",
  "Rough ER (ribosomes attached) synthesises secretory proteins; smooth ER handles lipid synthesis and detox.",
  "The Golgi apparatus modifies, packages, and routes proteins from the ER to their final destinations.",
  "Ribosomes translate mRNA into polypeptides and exist in all cells — prokaryotes and eukaryotes alike.",
  "Lysosomes contain hydrolytic enzymes at acidic pH for digesting macromolecules, damaged organelles, and pathogens.",
  "The cytoskeleton (microfilaments, intermediate filaments, microtubules) maintains shape and enables movement.",
];

// ── Shared helpers ─────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function TypeBadge({ type }: { type: HistoryType }) {
  const map: Record<HistoryType, { label: string; bg: string; color: string }> =
    {
      flashcard: { label: "Flashcards", bg: "#C4D1BC", color: "#2D4A2C" },
      quiz: { label: "Quiz", bg: "#D4C8B0", color: "#5A3A1A" },
      "mock-exam": { label: "Mock Exam", bg: "#BFD0E0", color: "#1A3A5A" },
      "key-points": { label: "Key Points", bg: "#DDD4C4", color: "#4A3A1A" },
      voice: { label: "Voice", bg: "#D4C4D8", color: "#3A1A5A" },
    };
  const s = map[type];
  return (
    <span
      className="text-xs font-medium px-2.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const NAV = [
  {
    id: "overview" as DashSection,
    label: "Overview",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "flashcards" as DashSection,
    label: "Flashcards",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    id: "quiz" as DashSection,
    label: "Quiz",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
      </svg>
    ),
  },
  {
    id: "mock-exam" as DashSection,
    label: "Mock Exam",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "key-points" as DashSection,
    label: "Key Points",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "voice" as DashSection,
    label: "Voice Reviewer",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8" />
      </svg>
    ),
  },
];

function Sidebar({
  section,
  onSelect,
  profile,
  avatarUrl,
  onNewUpload,
}: {
  section: DashSection;
  onSelect: (s: DashSection) => void;
  profile: UserProfile;
  avatarUrl: string | null;
  onNewUpload: () => void;
}) {
  return (
    <aside
      className="flex flex-col h-full flex-shrink-0"
      style={{
        width: "220px",
        background: "#243D23",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8FA489"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          <span className="font-semibold text-sm" style={{ color: "#E8F0E7" }}>
            RevLife
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <p
          className="text-xs px-2 mb-2 font-medium uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Tools
        </p>
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all duration-150 text-left"
            style={{
              background:
                section === item.id ? "rgba(255,255,255,0.12)" : "transparent",
              color: section === item.id ? "#E8F0E7" : "rgba(255,255,255,0.5)",
            }}
            onMouseEnter={(e) => {
              if (section !== item.id)
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              if (section !== item.id)
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
            }}
            onMouseLeave={(e) => {
              if (section !== item.id)
                e.currentTarget.style.background = "transparent";
              if (section !== item.id)
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <span style={{ opacity: section === item.id ? 1 : 0.7 }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}

        <div
          className="mt-4 mb-1"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "12px",
          }}
        >
          <p
            className="text-xs px-2 mb-2 font-medium uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Account
          </p>
          {[
            {
              id: "history" as DashSection,
              label: "History",
              icon: (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 8 14" />
                </svg>
              ),
            },
            {
              id: "profile" as DashSection,
              label: "Profile",
              icon: (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ),
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all duration-150 text-left"
              style={{
                background:
                  section === item.id
                    ? "rgba(255,255,255,0.12)"
                    : "transparent",
                color:
                  section === item.id ? "#E8F0E7" : "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => {
                if (section !== item.id)
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                if (section !== item.id)
                  e.currentTarget.style.color = "rgba(255,255,255,0.75)";
              }}
              onMouseLeave={(e) => {
                if (section !== item.id)
                  e.currentTarget.style.background = "transparent";
                if (section !== item.id)
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              <span style={{ opacity: section === item.id ? 1 : 0.7 }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={onNewUpload}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mt-2 transition-all"
          style={{
            background: "rgba(196,209,188,0.15)",
            color: "#A8C4A4",
            border: "1px solid rgba(196,209,188,0.2)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(196,209,188,0.22)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(196,209,188,0.15)")
          }
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          New upload
        </button>
      </nav>

      {/* Profile mini */}
      <div
        className="px-4 py-4 flex items-center gap-3 cursor-pointer"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        onClick={() => onSelect("profile")}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: "#4A6645" }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-white">
              {getInitials(profile.name)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-medium truncate"
            style={{ color: "#E8F0E7" }}
          >
            {profile.name}
          </p>
          <p
            className="text-xs truncate"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {profile.major}
          </p>
        </div>
      </div>
    </aside>
  );
}

// ── Dashboard: Overview ───────────────────────────────────────────────────────

function OverviewContent({
  profile,
  avatarUrl,
  onSection,
  onStartReviewer,
  onStartQuiz,
}: {
  profile: UserProfile;
  avatarUrl: string | null;
  onSection: (s: DashSection) => void;
  onStartReviewer: () => void;
  onStartQuiz: () => void;
}) {
  const stats = [
    { label: "Modules uploaded", value: "1", sub: "Cell Bio Ch3" },
    { label: "Cards reviewed", value: "8", sub: "Today" },
    { label: "Avg quiz score", value: "80%", sub: "8 of 10" },
    { label: "Study streak", value: "5", sub: "days" },
  ];

  const tools = [
    {
      id: "flashcards" as DashSection,
      label: "Flashcards",
      desc: "Flip through 8 cards",
      bg: "#C4D1BC",
      action: onStartReviewer,
    },
    {
      id: "quiz" as DashSection,
      label: "Quiz",
      desc: "10 questions",
      bg: "#D4C8B0",
      action: onStartQuiz,
    },
    {
      id: "mock-exam" as DashSection,
      label: "Mock Exam",
      desc: "Timed, 10 questions",
      bg: "#BFD0E0",
      action: onStartQuiz,
    },
    {
      id: "key-points" as DashSection,
      label: "Key Points",
      desc: "8 extracted points",
      bg: "#DDD4C4",
      action: () => onSection("key-points"),
    },
    {
      id: "voice" as DashSection,
      label: "Voice Reviewer",
      desc: "AI reads it back",
      bg: "#D4C4D8",
      action: () => onSection("voice"),
    },
  ];

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm mb-1" style={{ color: "#8A9A8A" }}>
            {getGreeting()},
          </p>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
          >
            {profile.name.split(" ")[0]} 👋
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium" style={{ color: "#8A9A8A" }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#AABAA8" }}>
            Cell Biology — Chapter 3 loaded
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl"
            style={{
              background: "#F2F0E4",
              border: "1px solid rgba(30,46,29,0.08)",
            }}
          >
            <div
              className="text-2xl font-bold mb-0.5"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#2D4A2C" }}
            >
              {s.value}
            </div>
            <div className="text-xs font-medium" style={{ color: "#1E2E1D" }}>
              {s.label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#8A9A8A" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Current module */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{
          background: "#CDDAC7",
          border: "1px solid rgba(45,74,44,0.15)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-xs font-medium uppercase tracking-widest mb-1"
              style={{ color: "#4A6645" }}
            >
              Active module
            </p>
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
            >
              Cell Biology — Chapter 3
            </h3>
            <p className="text-sm mt-0.5" style={{ color: "#4A6645" }}>
              PDF · 2.4 MB · 8 cards · 10 questions
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
              style={{ background: "#2D4A2C", color: "#F2F0E4" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#3A5E38")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#2D4A2C")
              }
              onClick={onStartReviewer}
            >
              Review cards
            </button>
            <button
              className="px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
              style={{ background: "rgba(45,74,44,0.15)", color: "#2D4A2C" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(45,74,44,0.25)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(45,74,44,0.15)")
              }
              onClick={onStartQuiz}
            >
              Take quiz
            </button>
          </div>
        </div>
      </div>

      {/* Tool grid */}
      <h2 className="text-sm font-semibold mb-4" style={{ color: "#5A6E5A" }}>
        Quick launch
      </h2>
      <div className="grid grid-cols-5 gap-3 mb-8">
        {tools.map((t) => (
          <button
            key={t.id}
            className="text-left p-4 rounded-2xl transition-all duration-150 group"
            style={{ background: t.bg, border: "1.5px solid transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(30,46,29,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={t.action}
          >
            <p
              className="font-semibold text-sm mb-1"
              style={{ color: "#1E2E1D", fontFamily: "Lora, Georgia, serif" }}
            >
              {t.label}
            </p>
            <p className="text-xs" style={{ color: "rgba(30,46,29,0.6)" }}>
              {t.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Recent activity */}
      <h2 className="text-sm font-semibold mb-4" style={{ color: "#5A6E5A" }}>
        Recent activity
      </h2>
      <div className="space-y-2">
        {HISTORY_DATA.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: "#F2F0E4" }}
          >
            <TypeBadge type={item.type} />
            <span
              className="flex-1 text-sm font-medium"
              style={{ color: "#1E2E1D" }}
            >
              {item.module}
            </span>
            <span className="text-sm" style={{ color: "#8A9A8A" }}>
              {item.score !== undefined
                ? `${item.score}/${item.total}`
                : item.cards
                  ? `${item.cards} cards`
                  : "—"}
            </span>
            <span className="text-xs" style={{ color: "#AABAA8" }}>
              {item.date}
            </span>
          </div>
        ))}
        <button
          className="text-sm font-medium w-full text-center py-2 transition-colors"
          style={{ color: "#2D4A2C" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#4A6645")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#2D4A2C")}
          onClick={() => onSection("history")}
        >
          View full history →
        </button>
      </div>
    </div>
  );
}

// ── Dashboard: Flashcards ─────────────────────────────────────────────────────

function FlashcardsContent({ onStart }: { onStart: () => void }) {
  return (
    <div className="p-8 max-w-2xl">
      <p
        className="text-xs font-medium uppercase tracking-widest mb-1"
        style={{ color: "#8A9A8A" }}
      >
        Tool
      </p>
      <h2
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
      >
        Flashcards
      </h2>
      <p className="text-sm mb-8" style={{ color: "#5A6E5A" }}>
        Flip through key concepts at your own pace. Cards are ranked by what you
        keep missing.
      </p>

      <div className="rounded-2xl p-6 mb-6" style={{ background: "#CDDAC7" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p
              className="font-semibold text-base"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
            >
              Cell Biology — Chapter 3
            </p>
            <p className="text-sm" style={{ color: "#4A6645" }}>
              8 cards · Last reviewed today
            </p>
          </div>
          <button
            className="px-6 py-3 rounded-full font-semibold text-sm transition-colors"
            style={{ background: "#2D4A2C", color: "#F2F0E4" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3A5E38")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2D4A2C")}
            onClick={onStart}
          >
            Start review →
          </button>
        </div>

        {/* Preview of cards */}
        <div className="grid grid-cols-4 gap-2">
          {REVIEW_CARDS.slice(0, 4).map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl text-xs font-medium"
              style={{ background: "rgba(45,74,44,0.1)", color: "#2D4A2C" }}
            >
              {c.concept}
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{
          background: "#F2F0E4",
          border: "1px solid rgba(30,46,29,0.08)",
        }}
      >
        <p
          className="text-xs font-medium uppercase tracking-widest mb-3"
          style={{ color: "#8A9A8A" }}
        >
          How it works
        </p>
        {[
          "Front shows the concept name.",
          "Tap to flip and reveal the full definition.",
          "Use the dots or arrows to navigate.",
          "Study all 8 cards before your exam.",
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-3 mb-2">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
              style={{ background: "rgba(45,74,44,0.1)", color: "#2D4A2C" }}
            >
              {i + 1}
            </span>
            <p className="text-sm" style={{ color: "#5A6E5A" }}>
              {s}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard: Quiz ────────────────────────────────────────────────────────────

function QuizContent({
  onStart,
  isMock = false,
}: {
  onStart: () => void;
  isMock?: boolean;
}) {
  return (
    <div className="p-8 max-w-2xl">
      <p
        className="text-xs font-medium uppercase tracking-widest mb-1"
        style={{ color: "#8A9A8A" }}
      >
        Tool
      </p>
      <h2
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
      >
        {isMock ? "Mock Exam" : "Quiz"}
      </h2>
      <p className="text-sm mb-8" style={{ color: "#5A6E5A" }}>
        {isMock
          ? "A timed, quiet run-through with real exam conditions. See where you stand before it counts."
          : "Multiple-choice questions with immediate feedback and detailed explanations after each answer."}
      </p>

      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: isMock ? "#BFD0E0" : "#D4C8B0" }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p
              className="font-semibold text-base mb-1"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
            >
              Cell Biology — Chapter 3
            </p>
            <div className="flex gap-4">
              <span className="text-sm" style={{ color: "#5A6E5A" }}>
                10 questions
              </span>
              {isMock && (
                <span className="text-sm" style={{ color: "#5A6E5A" }}>
                  ⏱ 20 minutes
                </span>
              )}
              <span className="text-sm" style={{ color: "#5A6E5A" }}>
                Last score: 8/10
              </span>
            </div>
          </div>
          <button
            className="px-6 py-3 rounded-full font-semibold text-sm transition-colors flex-shrink-0"
            style={{ background: "#2D4A2C", color: "#F2F0E4" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3A5E38")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2D4A2C")}
            onClick={onStart}
          >
            {isMock ? "Begin exam →" : "Start quiz →"}
          </button>
        </div>

        {/* Topic breakdown */}
        <div className="space-y-2">
          {[
            { topic: "Membrane & Transport", q: 2 },
            { topic: "Organelle Functions", q: 5 },
            { topic: "Cytoskeleton & Division", q: 2 },
            { topic: "Protein Synthesis", q: 1 },
          ].map((t) => (
            <div key={t.topic} className="flex items-center gap-3">
              <div
                className="flex-1 h-1.5 rounded-full"
                style={{ background: "rgba(30,46,29,0.15)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(t.q / 10) * 100}%`,
                    background: "#2D4A2C",
                  }}
                />
              </div>
              <span
                className="text-xs w-40 flex-shrink-0"
                style={{ color: "#5A6E5A" }}
              >
                {t.topic}
              </span>
              <span
                className="text-xs w-8 text-right flex-shrink-0"
                style={{ color: "#8A9A8A" }}
              >
                {t.q}q
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Best score", value: "9/10" },
          { label: "Attempts", value: "3" },
          { label: "Avg time", value: "4m 22s" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl text-center"
            style={{ background: "#F2F0E4" }}
          >
            <div
              className="text-xl font-bold mb-0.5"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#2D4A2C" }}
            >
              {s.value}
            </div>
            <div className="text-xs" style={{ color: "#8A9A8A" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard: Key Points ─────────────────────────────────────────────────────

function KeyPointsContent({ onNewUpload }: { onNewUpload: () => void }) {
  return (
    <div className="p-8 max-w-2xl">
      <p
        className="text-xs font-medium uppercase tracking-widest mb-1"
        style={{ color: "#8A9A8A" }}
      >
        Tool
      </p>
      <h2
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
      >
        Key Points
      </h2>
      <p className="text-sm mb-8" style={{ color: "#5A6E5A" }}>
        The three or four things worth actually remembering from your notes —
        not forty.
      </p>

      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: "#F2F0E4",
          border: "1px solid rgba(30,46,29,0.08)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="font-semibold text-sm"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
            >
              Cell Biology — Chapter 3
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#8A9A8A" }}>
              8 points extracted · Oct 28
            </p>
          </div>
          <button
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
            style={{ border: "1px solid rgba(30,46,29,0.2)", color: "#5A6E5A" }}
            onClick={onNewUpload}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(30,46,29,0.04)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            New document
          </button>
        </div>

        <div className="space-y-3">
          {KEY_POINTS.map((pt, i) => (
            <div key={i} className="flex items-start gap-4">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5"
                style={{ background: "#CDDAC7", color: "#2D4A2C" }}
              >
                {i + 1}
              </span>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#1E2E1D" }}
              >
                {pt}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload new */}
      <button
        className="w-full p-5 rounded-2xl text-center transition-all"
        style={{
          border: "1.5px dashed rgba(30,46,29,0.2)",
          background: "transparent",
          cursor: "pointer",
        }}
        onClick={onNewUpload}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(30,46,29,0.03)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <p className="text-sm font-medium mb-0.5" style={{ color: "#5A6E5A" }}>
          Upload another document
        </p>
        <p className="text-xs" style={{ color: "#8A9A8A" }}>
          PDF, DOCX, TXT, or MD
        </p>
      </button>
    </div>
  );
}

// ── Dashboard: Voice Reviewer ─────────────────────────────────────────────────

function VoiceContent() {
  const [playing, setPlaying] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setCardIndex((i) => (i + 1) % REVIEW_CARDS.length);
      }, 5000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing]);

  const card = REVIEW_CARDS[cardIndex];
  const waveDelays = [0, 0.15, 0.3, 0.15, 0];

  return (
    <div className="p-8 max-w-2xl">
      <p
        className="text-xs font-medium uppercase tracking-widest mb-1"
        style={{ color: "#8A9A8A" }}
      >
        Tool
      </p>
      <h2
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
      >
        Voice Reviewer
      </h2>
      <p className="text-sm mb-8" style={{ color: "#5A6E5A" }}>
        Close your eyes and listen through a unit while you walk somewhere. AI
        reads your key points back to you.
      </p>

      {/* Player card */}
      <div className="rounded-2xl p-8 mb-6" style={{ background: "#D4C4D8" }}>
        {/* Waveform */}
        <div
          className="flex items-end justify-center gap-1.5 mb-8"
          style={{ height: "48px" }}
        >
          {waveDelays.map((delay, i) => (
            <div
              key={i}
              className={playing ? "wave-bar" : ""}
              style={{
                width: "5px",
                height: "100%",
                background: "#2D4A2C",
                borderRadius: "3px",
                transformOrigin: "bottom",
                transform: playing ? undefined : "scaleY(0.2)",
                animationDelay: `${delay}s`,
                opacity: playing ? 1 : 0.4,
                transition: "opacity 0.3s",
              }}
            />
          ))}
        </div>

        {/* Current card being read */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{ background: "rgba(255,255,255,0.5)" }}
        >
          <p
            className="text-xs font-medium uppercase tracking-widest mb-2"
            style={{ color: "#8A9A8A" }}
          >
            {playing ? "Now reading" : "Ready to play"}
          </p>
          <p
            className="font-semibold text-base mb-1"
            style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
          >
            {card.concept}
          </p>
          {playing && (
            <p
              className="text-sm leading-relaxed fade-in"
              style={{ color: "#5A6E5A" }}
            >
              {card.definition}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(45,74,44,0.12)", color: "#2D4A2C" }}
            onClick={() =>
              setCardIndex(
                (i) => (i - 1 + REVIEW_CARDS.length) % REVIEW_CARDS.length,
              )
            }
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line
                x1="5"
                y1="19"
                x2="5"
                y2="5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </button>

          <button
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "#2D4A2C",
              color: "white",
              boxShadow: "0 4px 16px rgba(45,74,44,0.35)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3A5E38")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2D4A2C")}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ marginLeft: "2px" }}
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(45,74,44,0.12)", color: "#2D4A2C" }}
            onClick={() => setCardIndex((i) => (i + 1) % REVIEW_CARDS.length)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line
                x1="19"
                y1="5"
                x2="19"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Card progress */}
      <div className="flex gap-2 justify-center mb-6">
        {REVIEW_CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCardIndex(i)}
            className="rounded-full transition-all"
            style={{
              width: i === cardIndex ? "20px" : "6px",
              height: "6px",
              background: i === cardIndex ? "#2D4A2C" : "rgba(45,74,44,0.2)",
            }}
          />
        ))}
      </div>

      <p className="text-center text-xs" style={{ color: "#8A9A8A" }}>
        Card {cardIndex + 1} of {REVIEW_CARDS.length} · Cell Biology — Chapter 3
      </p>
    </div>
  );
}

// ── Dashboard: History ────────────────────────────────────────────────────────

function HistoryContent() {
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const filters: { id: HistoryFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "flashcard", label: "Flashcards" },
    { id: "quiz", label: "Quiz" },
    { id: "mock-exam", label: "Mock Exam" },
    { id: "key-points", label: "Key Points" },
    { id: "voice", label: "Voice" },
  ];

  const visible =
    filter === "all"
      ? HISTORY_DATA
      : HISTORY_DATA.filter((h) => h.type === filter);

  return (
    <div className="p-8 max-w-3xl">
      <p
        className="text-xs font-medium uppercase tracking-widest mb-1"
        style={{ color: "#8A9A8A" }}
      >
        Account
      </p>
      <h2
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
      >
        History
      </h2>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: filter === f.id ? "#2D4A2C" : "#F2F0E4",
              color: filter === f.id ? "#F2F0E4" : "#5A6E5A",
              border: "1px solid",
              borderColor: filter === f.id ? "#2D4A2C" : "rgba(30,46,29,0.1)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* History list */}
      <div className="space-y-2">
        {visible.length === 0 && (
          <div className="text-center py-12" style={{ color: "#8A9A8A" }}>
            <p className="text-sm">No sessions yet for this filter.</p>
          </div>
        )}
        {visible.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 rounded-xl transition-all"
            style={{
              background: "#F2F0E4",
              border: "1px solid rgba(30,46,29,0.06)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#EAE8DA")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#F2F0E4")}
          >
            <TypeBadge type={item.type} />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "#1E2E1D" }}
              >
                {item.module}
              </p>
            </div>
            <div
              className="text-sm font-medium flex-shrink-0"
              style={{ color: "#2D4A2C" }}
            >
              {item.score !== undefined
                ? `${item.score}/${item.total} · ${Math.round((item.score! / item.total!) * 100)}%`
                : item.cards
                  ? `${item.cards} cards`
                  : "—"}
            </div>
            <div
              className="text-xs flex-shrink-0 w-28 text-right"
              style={{ color: "#AABAA8" }}
            >
              {item.date}
            </div>
            <button
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{ background: "rgba(45,74,44,0.08)", color: "#2D4A2C" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(45,74,44,0.16)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(45,74,44,0.08)")
              }
            >
              Retry
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard: Profile ─────────────────────────────────────────────────────────

function ProfileContent({
  profile,
  setProfile,
  avatarUrl,
  setAvatarUrl,
}: {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSave = () => {
    setProfile(draft);
    setEditing(false);
  };

  const Field = ({
    label,
    field,
    type = "text",
  }: {
    label: string;
    field: keyof UserProfile;
    type?: string;
  }) => (
    <div>
      <label
        className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
        style={{ color: "#8A9A8A" }}
      >
        {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={draft[field]}
          onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: "#F2F0E4",
            border: "1.5px solid rgba(45,74,44,0.3)",
            color: "#1E2E1D",
            fontFamily: "inherit",
          }}
        />
      ) : (
        <p className="text-sm py-2.5" style={{ color: "#1E2E1D" }}>
          {profile[field] || "—"}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <p
        className="text-xs font-medium uppercase tracking-widest mb-1"
        style={{ color: "#8A9A8A" }}
      >
        Account
      </p>
      <h2
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
      >
        Profile
      </h2>

      {/* Avatar section */}
      <div
        className="rounded-2xl p-8 mb-6 flex items-center gap-8"
        style={{
          background: "#F2F0E4",
          border: "1px solid rgba(30,46,29,0.08)",
        }}
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
            style={{
              background: "#4A6645",
              border: "3px solid white",
              boxShadow: "0 4px 20px rgba(30,46,29,0.15)",
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {getInitials(profile.name)}
              </span>
            )}
          </div>
          <button
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "#2D4A2C",
              color: "white",
              border: "2px solid #F2F0E4",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3A5E38")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2D4A2C")}
            onClick={() => avatarInputRef.current?.click()}
            title="Change photo"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="flex-1">
          <h3
            className="text-xl font-bold mb-0.5"
            style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
          >
            {profile.name}
          </h3>
          <p className="text-sm mb-3" style={{ color: "#5A6E5A" }}>
            {profile.major} · {profile.year}
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "#8A9A8A", maxWidth: "260px" }}
          >
            {profile.bio}
          </p>
        </div>

        <button
          className="self-start px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0"
          style={{
            background: editing ? "#2D4A2C" : "transparent",
            color: editing ? "#F2F0E4" : "#5A6E5A",
            border: "1px solid rgba(30,46,29,0.2)",
          }}
          onClick={editing ? handleSave : () => setEditing(true)}
        >
          {editing ? "Save changes" : "Edit profile"}
        </button>
      </div>

      {/* Form fields */}
      <div
        className="rounded-2xl p-6 mb-6 space-y-5"
        style={{
          background: "#F2F0E4",
          border: "1px solid rgba(30,46,29,0.08)",
        }}
      >
        <div className="grid grid-cols-2 gap-5">
          <Field label="Full name" field="name" />
          <Field label="Email" field="email" type="email" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Major / Subject" field="major" />
          <Field label="Year / Level" field="year" />
        </div>
        <Field label="Study goal" field="goal" />
        <Field label="About me" field="bio" />
        {editing && (
          <div className="flex gap-3 pt-2">
            <button
              className="px-6 py-2.5 rounded-full font-semibold text-sm transition-colors"
              style={{ background: "#2D4A2C", color: "#F2F0E4" }}
              onClick={handleSave}
            >
              Save changes
            </button>
            <button
              className="px-6 py-2.5 rounded-full text-sm transition-colors"
              style={{
                border: "1px solid rgba(30,46,29,0.2)",
                color: "#5A6E5A",
              }}
              onClick={() => {
                setDraft(profile);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Modules", value: "1" },
          { label: "Sessions", value: "10" },
          { label: "Cards reviewed", value: "40" },
          { label: "Avg score", value: "82%" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl text-center"
            style={{ background: "#F2F0E4" }}
          >
            <div
              className="text-xl font-bold mb-0.5"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#2D4A2C" }}
            >
              {s.value}
            </div>
            <div className="text-xs" style={{ color: "#8A9A8A" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard View ─────────────────────────────────────────────────────────────

function DashboardView({
  onStartReviewer,
  onStartQuiz,
  onUpload,
}: {
  onStartReviewer: () => void;
  onStartQuiz: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [section, setSection] = useState<DashSection>("overview");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const dashboardFileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Alex Rivera",
    email: "alex@student.edu",
    major: "Biology",
    year: "Junior",
    goal: "Pass finals with distinction",
    bio: "Pre-med student passionate about cellular biology and organic chemistry.",
  });

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#E8E6D8" }}
    >
      <input
        ref={dashboardFileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.txt,.md"
        onChange={onUpload}
      />
      <Sidebar
        section={section}
        onSelect={setSection}
        profile={profile}
        avatarUrl={avatarUrl}
        onNewUpload={() => dashboardFileInputRef.current?.click()}
      />

      <main
        className="flex-1 overflow-y-auto"
        style={{ background: "#E8E6D8" }}
      >
        {section === "overview" && (
          <OverviewContent
            profile={profile}
            avatarUrl={avatarUrl}
            onSection={setSection}
            onStartReviewer={onStartReviewer}
            onStartQuiz={onStartQuiz}
          />
        )}
        {section === "flashcards" && (
          <FlashcardsContent onStart={onStartReviewer} />
        )}
        {section === "quiz" && <QuizContent onStart={onStartQuiz} />}
        {section === "mock-exam" && (
          <QuizContent onStart={onStartQuiz} isMock />
        )}
        {section === "key-points" && (
          <KeyPointsContent
            onNewUpload={() => dashboardFileInputRef.current?.click()}
          />
        )}
        {section === "voice" && <VoiceContent />}
        {section === "history" && <HistoryContent />}
        {section === "profile" && (
          <ProfileContent
            profile={profile}
            setProfile={setProfile}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
          />
        )}
      </main>
    </div>
  );
}

// ── Shared card stack visual (home page) ──────────────────────────────────────

function CardStackVisual() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flex flex-col items-center select-none">
      <p className="text-sm mb-4" style={{ color: "#8A9A8A" }}>
        Tap the card
      </p>
      <div
        className="card-scene cursor-pointer"
        style={{ width: "300px", height: "200px", position: "relative" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="absolute"
          style={{
            width: "280px",
            height: "180px",
            background: "#AFC0A9",
            borderRadius: "16px",
            top: "18px",
            left: "50%",
            transform: "translateX(-50%) rotate(-3.5deg)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "280px",
            height: "180px",
            background: "#BDD0B7",
            borderRadius: "16px",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%) rotate(-1.5deg)",
          }}
        />
        <div
          className={`card-inner ${flipped ? "flipped" : ""} float-card`}
          style={{
            width: "280px",
            height: "180px",
            position: "absolute",
            top: "0px",
            left: "50%",
            marginLeft: "-140px",
          }}
        >
          <div
            className="card-face flex items-center justify-center"
            style={{
              width: "100%",
              height: "100%",
              background: "#CDDAC7",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(30,46,29,0.15)",
            }}
          >
            <span
              className="text-xl font-semibold text-center px-6"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
            >
              Transport layer
            </span>
          </div>
          <div
            className="card-face card-back-face flex flex-col items-center justify-center px-6"
            style={{
              width: "100%",
              height: "100%",
              background: "#F2F0E4",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(30,46,29,0.12)",
            }}
          >
            <p
              className="text-xs font-medium mb-2 uppercase tracking-widest"
              style={{ color: "#8A9A8A" }}
            >
              Definition
            </p>
            <p
              className="text-sm text-center leading-relaxed"
              style={{ color: "#1E2E1D", fontFamily: "Lora, Georgia, serif" }}
            >
              Responsible for end-to-end communication between applications
              across a network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Critter Visual (shared by Login + Signup) ─────────────────────────────────

function CritterVisual({
  isShy,
  caption,
}: {
  isShy: boolean;
  caption: string;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const handleMouse = (e: MouseEvent) => updateEyes(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) updateEyes(t.clientX, t.clientY);
    };

    function updateEyes(clientX: number, clientY: number) {
      const pupils = scene!.querySelectorAll<HTMLElement>(".pupil");
      pupils.forEach((pupil) => {
        const eye = pupil.parentElement;
        if (!eye) return;
        const rect = eye.getBoundingClientRect();
        const eyeCX = rect.left + rect.width / 2;
        const eyeCY = rect.top + rect.height / 2;
        const angle = Math.atan2(clientY - eyeCY, clientX - eyeCX);
        const maxOffset = 3.5;
        pupil.style.transform = `translate(${Math.cos(angle) * maxOffset}px, ${Math.sin(angle) * maxOffset}px)`;
      });
    }

    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("touchmove", handleTouch);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("touchmove", handleTouch);
    };
  }, []);

  return (
    <div className="auth-visual" ref={sceneRef}>
      <div className="critters">
        {/* circle critter */}
        <div
          className={`critter critter-circle-wrap${isShy ? " is-shy" : ""}`}
          data-critter
        >
          <div className="critter-body critter-circle" />
          <div className="eyes">
            <div className="eye">
              <div className="pupil" />
            </div>
            <div className="eye">
              <div className="pupil" />
            </div>
          </div>
          <div className="shy-lids" />
        </div>
        {/* arch critter */}
        <div
          className={`critter critter-arch-wrap${isShy ? " is-shy" : ""}`}
          data-critter
        >
          <div className="critter-body critter-arch" />
          <div className="eyes">
            <div className="eye">
              <div className="pupil" />
            </div>
            <div className="eye">
              <div className="pupil" />
            </div>
          </div>
          <div className="shy-lids" />
        </div>
        {/* square critter */}
        <div
          className={`critter critter-square-wrap${isShy ? " is-shy" : ""}`}
          data-critter
        >
          <div className="critter-body critter-square" />
          <div className="eyes">
            <div className="eye">
              <div className="pupil" />
            </div>
            <div className="eye">
              <div className="pupil" />
            </div>
          </div>
          <div className="shy-lids" />
        </div>
      </div>
      <p className="auth-visual-caption">{caption}</p>
    </div>
  );
}

// ── Login View ────────────────────────────────────────────────────────────────

function LoginView({
  onLogin,
  onGoSignup,
  onBack,
}: {
  onLogin: () => void;
  onGoSignup: () => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isShy, setIsShy] = useState(false);
  const [caption, setCaption] = useState(
    "Type your password. Watch them look away.",
  );

  const setShy = (shy: boolean) => {
    setIsShy(shy);
    setCaption(
      shy
        ? "No peeking — they're giving you privacy."
        : "Type your password. Watch them look away.",
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="auth-page">
      <div className="auth-screen">
        <CritterVisual isShy={isShy} caption={caption} />

        <div className="auth-form-panel">
          <div className="auth-form-inner">
            {/* Logo */}
            <a
              href="#"
              className="auth-logo"
              onClick={(e) => {
                e.preventDefault();
                onBack();
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4A6645"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
              RevLife
            </a>

            <p className="auth-eyebrow">Welcome back</p>
            <h2 className="auth-title">Let's get you reviewing.</h2>

            <form onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShy(
                      e.target.value.length > 0 ||
                        document.activeElement === e.target,
                    );
                  }}
                  onFocus={() => setShy(true)}
                  onBlur={(e) => {
                    if (e.target.value.length === 0) setShy(false);
                  }}
                  required
                  autoComplete="current-password"
                />
              </label>

              <div className="auth-field-row">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember for 30 days
                </label>
                <a
                  href="#"
                  className="auth-link-muted"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="auth-btn-primary">
                Log in
              </button>
            </form>

            <p className="auth-alt">
              Don't have an account?{" "}
              <a
                href="#"
                className="auth-link-strong"
                onClick={(e) => {
                  e.preventDefault();
                  onGoSignup();
                }}
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Signup View ───────────────────────────────────────────────────────────────

function SignupView({
  onSignup,
  onGoLogin,
  onBack,
}: {
  onSignup: () => void;
  onGoLogin: () => void;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isShy, setIsShy] = useState(false);
  const [caption, setCaption] = useState(
    "Type your password. Watch them look away.",
  );

  const setShy = (shy: boolean) => {
    setIsShy(shy);
    setCaption(
      shy
        ? "No peeking — they're giving you privacy."
        : "Type your password. Watch them look away.",
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup();
  };

  return (
    <div className="auth-page">
      <div className="auth-screen">
        <CritterVisual isShy={isShy} caption={caption} />

        <div className="auth-form-panel">
          <div className="auth-form-inner">
            {/* Logo */}
            <a
              href="#"
              className="auth-logo"
              onClick={(e) => {
                e.preventDefault();
                onBack();
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4A6645"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
              RevLife
            </a>

            <p className="auth-eyebrow">Create your account</p>
            <h2 className="auth-title">Start studying smarter.</h2>

            <form onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>Full name</span>
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </label>

              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShy(
                      e.target.value.length > 0 ||
                        document.activeElement === e.target,
                    );
                  }}
                  onFocus={() => setShy(true)}
                  onBlur={(e) => {
                    if (e.target.value.length === 0) setShy(false);
                  }}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>

              <div style={{ marginTop: "24px" }}>
                <button type="submit" className="auth-btn-primary">
                  Create account
                </button>
              </div>
            </form>

            <p className="auth-alt">
              Already have an account?{" "}
              <a
                href="#"
                className="auth-link-strong"
                onClick={(e) => {
                  e.preventDefault();
                  onGoLogin();
                }}
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Home View ─────────────────────────────────────────────────────────────────

function HomeView({
  isDragging,
  fileInputRef,
  uploadError,
  onDragOver,
  onDragLeave,
  onDrop,
  onChooseFile,
  onUpload,
  onSignIn,
  onContactSupport,
}: {
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadError: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onChooseFile: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignIn: () => void;
  onContactSupport: () => void;
}) {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const featureCards = [
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
      title: "Flashcards",
      desc: "Pulled straight from your notes, ranked by what you keep missing.",
      bg: "#C4D1BC",
      rot: "-4deg",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
          <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8" />
        </svg>
      ),
      title: "Voice reviewer",
      desc: "Close your eyes and listen through a unit while you walk somewhere.",
      bg: "#CDDAC7",
      rot: "-1.5deg",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
      title: "Key points",
      desc: "The three or four things worth actually remembering — not forty.",
      bg: "#F2F0E4",
      rot: "1deg",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: "Mock exams",
      desc: "A quiet run-through with real timing, before the real one.",
      bg: "#D4C8B0",
      rot: "3.5deg",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#E8E6D8" }}
    >
      <nav
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(30,46,29,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4A6645"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          <span
            className="font-semibold text-base"
            style={{ color: "#1E2E1D" }}
          >
            RevLife
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-5">
            {[
              { label: "Home", id: "home" },
              { label: "Features", id: "features" },
              { label: "About", id: "about" },
              { label: "Contact", id: "contact" },
            ].map((item) => (
              <button
                key={item.id}
                className="text-sm font-medium transition-colors"
                style={{ color: "#5A6E5A" }}
                onClick={() => scrollTo(item.id)}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#2D4A2C")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#5A6E5A")}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            className="text-sm font-medium px-5 py-2 rounded-full transition-colors"
            style={{ border: "1px solid rgba(30,46,29,0.2)", color: "#1E2E1D" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(30,46,29,0.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onClick={onSignIn}
          >
            Sign in
          </button>
        </div>
      </nav>

      <main
        id="home"
        className="flex-1 px-8 pt-12 pb-20 max-w-5xl mx-auto w-full"
      >
        <div
          className="grid gap-12 items-center mb-20"
          style={{ gridTemplateColumns: "1fr auto" }}
        >
          <div>
            <p className="text-sm mb-5" style={{ color: "#5A6E5A" }}>
              for the night before the exam,{" "}
              <span style={{ color: "#2D4A2C", fontWeight: 500 }}>
                and every night before that
              </span>
            </p>
            <h1
              className="text-5xl leading-[1.1] font-bold mb-5"
              style={{
                fontFamily: "Lora, Georgia, serif",
                color: "#1E2E1D",
                maxWidth: "480px",
              }}
            >
              Notes settle better when you stop rushing them.
            </h1>
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: "#5A6E5A", maxWidth: "400px" }}
            >
              RevLife turns whatever you throw at it — slides, PDFs, messy typed
              notes — into flashcards, short quizzes, and a voice that reads
              your key points back to you.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt,.md"
              onChange={onUpload}
            />
            <button
              className="px-7 py-3.5 rounded-full font-semibold text-sm transition-colors"
              style={{ background: "#2D4A2C", color: "#F2F0E4" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#3A5E38")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#2D4A2C")
              }
              onClick={onChooseFile}
            >
              Upload your first set
            </button>
            <p
              className="text-xs mt-3"
              style={{ color: uploadError ? "#B03030" : "#8A9A8A" }}
            >
              {uploadError ??
                "PDF, DOCX, TXT, or MD · drag and drop also supported"}
            </p>
          </div>
          <div
            className="rounded-2xl p-10 flex items-center justify-center"
            style={{
              background: isDragging
                ? "rgba(45,74,44,0.06)"
                : "rgba(45,74,44,0.04)",
              border: `1.5px dashed ${isDragging ? "#4A6645" : "rgba(45,74,44,0.2)"}`,
              transition: "all 0.2s",
              minWidth: "360px",
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <CardStackVisual />
          </div>
        </div>

        <div
          id="features"
          className="flex gap-4 items-end pt-6 mb-24"
          style={{ paddingBottom: "8px" }}
        >
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="flex-1 p-5 transition-transform duration-200 cursor-default"
              style={{
                background: card.bg,
                borderRadius: "16px",
                transform: `rotate(${card.rot})`,
                minHeight: "180px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform =
                  "rotate(0deg) translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = `rotate(${card.rot})`)
              }
            >
              <div
                className="w-9 h-9 flex items-center justify-center rounded-lg mb-4"
                style={{ background: "rgba(30,46,29,0.1)", color: "#2D4A2C" }}
              >
                {card.icon}
              </div>
              <h3
                className="font-semibold text-base mb-1.5"
                style={{ color: "#1E2E1D", fontFamily: "Lora, Georgia, serif" }}
              >
                {card.title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#4A6645" }}
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        <section
          id="about"
          className="grid grid-cols-2 gap-12 items-center mb-24 p-10 rounded-2xl"
          style={{ background: "#CDDAC7" }}
        >
          <div>
            <p
              className="text-xs font-medium uppercase tracking-widest mb-3"
              style={{ color: "#4A6645" }}
            >
              About RevLife
            </p>
            <h2
              className="text-3xl font-bold leading-tight"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
            >
              Less time formatting. More time understanding.
            </h2>
          </div>
          <p className="text-sm leading-7" style={{ color: "#4A6645" }}>
            RevLife is the learning workspace inside StudyForge. Upload the
            material you already have and turn it into focused flashcards,
            quizzes, mock exams, key points, and audio review sessions.
          </p>
        </section>

        <section
          id="contact"
          className="flex items-center justify-between gap-8 p-10 rounded-2xl"
          style={{ background: "#243D23" }}
        >
          <div>
            <p
              className="text-xs font-medium uppercase tracking-widest mb-3"
              style={{ color: "#8FA489" }}
            >
              Contact & support
            </p>
            <h2
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#F2F0E4" }}
            >
              Need a hand with your study set?
            </h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              Our support team can help with uploads, study tools, and account
              questions.
            </p>
          </div>
          <button
            className="px-6 py-3 rounded-full font-semibold text-sm flex-shrink-0 transition-colors"
            style={{ background: "#CDDAC7", color: "#243D23" }}
            onClick={onContactSupport}
          >
            Contact support
          </button>
        </section>
      </main>
      <footer
        className="px-8 py-6 text-center text-xs"
        style={{ color: "#8A9A8A", borderTop: "1px solid rgba(30,46,29,0.08)" }}
      >
        StudyForge · RevLife learning workspace
      </footer>
    </div>
  );
}

// ── Contact Support View ───────────────────────────────────────────────────────

function ContactSupportView({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState("Upload issue");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "Why is my file not uploading?",
      answer:
        "Check that your file is a PDF, DOCX, TXT, or MD document. If it is supported, try renaming the file with a shorter name and uploading it again.",
    },
    {
      question: "How long does a study set take to generate?",
      answer:
        "Most documents are ready within a minute. Longer files may take more time while RevLife extracts concepts and builds each study format.",
    },
    {
      question: "Can I edit generated flashcards?",
      answer:
        "Editing generated content is not available in this prototype yet, but it is planned for a future version of the workspace.",
    },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "#E8E6D8" }}>
      <nav
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(30,46,29,0.08)" }}
      >
        <button className="flex items-center gap-2" onClick={onBack}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4A6645"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          <span
            className="font-semibold text-base"
            style={{ color: "#1E2E1D" }}
          >
            RevLife
          </span>
        </button>
        <button
          className="text-sm font-medium px-4 py-2 rounded-full transition-colors"
          style={{ color: "#5A6E5A", border: "1px solid rgba(30,46,29,0.15)" }}
          onClick={onBack}
        >
          Back to home
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-14">
        <div className="max-w-2xl mb-12">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-3"
            style={{ color: "#4A6645" }}
          >
            Support center
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-4"
            style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
          >
            Tell us where you got stuck.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#5A6E5A" }}>
            Share what happened and our support team will help you get back to
            studying. Most questions receive a response within one business day.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-6 items-start">
          <div
            className="rounded-2xl p-7 md:p-9"
            style={{
              background: "#F2F0E4",
              border: "1px solid rgba(30,46,29,0.08)",
            }}
          >
            {submitted ? (
              <div className="min-h-96 flex flex-col items-center justify-center text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                  style={{ background: "#CDDAC7", color: "#2D4A2C" }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{
                    fontFamily: "Lora, Georgia, serif",
                    color: "#1E2E1D",
                  }}
                >
                  Your message is on its way.
                </h2>
                <p
                  className="text-sm leading-relaxed max-w-sm mb-6"
                  style={{ color: "#5A6E5A" }}
                >
                  We have received your support request and will reply to the
                  email address you provided.
                </p>
                <button
                  className="px-6 py-3 rounded-full text-sm font-semibold"
                  style={{ background: "#2D4A2C", color: "#F2F0E4" }}
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-7">
                  <p
                    className="text-xs font-medium uppercase tracking-widest mb-3"
                    style={{ color: "#8A9A8A" }}
                  >
                    What can we help with?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Upload issue",
                      "Study tools",
                      "Account",
                      "Billing",
                      "Something else",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        style={{
                          background:
                            category === item ? "#2D4A2C" : "transparent",
                          color: category === item ? "#F2F0E4" : "#5A6E5A",
                          border: `1px solid ${category === item ? "#2D4A2C" : "rgba(30,46,29,0.16)"}`,
                        }}
                        onClick={() => setCategory(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 mb-5">
                  <label className="block">
                    <span
                      className="block text-xs font-medium mb-2"
                      style={{ color: "#5A6E5A" }}
                    >
                      Name
                    </span>
                    <input
                      required
                      type="text"
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{
                        background: "#E8E6D8",
                        color: "#1E2E1D",
                        border: "1px solid rgba(30,46,29,0.12)",
                      }}
                    />
                  </label>
                  <label className="block">
                    <span
                      className="block text-xs font-medium mb-2"
                      style={{ color: "#5A6E5A" }}
                    >
                      Email
                    </span>
                    <input
                      required
                      type="email"
                      placeholder="you@university.edu"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{
                        background: "#E8E6D8",
                        color: "#1E2E1D",
                        border: "1px solid rgba(30,46,29,0.12)",
                      }}
                    />
                  </label>
                </div>

                <label className="block mb-5">
                  <span
                    className="block text-xs font-medium mb-2"
                    style={{ color: "#5A6E5A" }}
                  >
                    Subject
                  </span>
                  <input
                    required
                    type="text"
                    placeholder="A short summary of the issue"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: "#E8E6D8",
                      color: "#1E2E1D",
                      border: "1px solid rgba(30,46,29,0.12)",
                    }}
                  />
                </label>

                <label className="block mb-7">
                  <span
                    className="block text-xs font-medium mb-2"
                    style={{ color: "#5A6E5A" }}
                  >
                    What happened?
                  </span>
                  <textarea
                    required
                    rows={6}
                    placeholder="Include the steps you took and what you expected to happen."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{
                      background: "#E8E6D8",
                      color: "#1E2E1D",
                      border: "1px solid rgba(30,46,29,0.12)",
                    }}
                  />
                </label>

                <div className="flex items-center justify-between gap-5">
                  <p className="text-xs" style={{ color: "#8A9A8A" }}>
                    Category: {category}
                  </p>
                  <button
                    type="submit"
                    className="px-7 py-3 rounded-full text-sm font-semibold transition-colors"
                    style={{ background: "#2D4A2C", color: "#F2F0E4" }}
                  >
                    Send message
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl p-6" style={{ background: "#CDDAC7" }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(45,74,44,0.12)", color: "#2D4A2C" }}
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16v16H4z" />
                  <path d="m4 6 8 6 8-6" />
                </svg>
              </div>
              <p
                className="text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color: "#4A6645" }}
              >
                Email support
              </p>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "#1E2E1D" }}
              >
                support@studyforge.app
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#5A6E5A" }}
              >
                Monday–Friday, 9 AM–5 PM
              </p>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: "#F2F0E4",
                border: "1px solid rgba(30,46,29,0.08)",
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-widest mb-4"
                style={{ color: "#8A9A8A" }}
              >
                Quick answers
              </p>
              <div className="space-y-2">
                {faqs.map((faq, index) => (
                  <div
                    key={faq.question}
                    style={{
                      borderBottom:
                        index < faqs.length - 1
                          ? "1px solid rgba(30,46,29,0.08)"
                          : "none",
                    }}
                  >
                    <button
                      className="w-full flex items-start justify-between gap-3 py-3 text-left"
                      onClick={() =>
                        setOpenFaq(openFaq === index ? null : index)
                      }
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#1E2E1D" }}
                      >
                        {faq.question}
                      </span>
                      <span
                        className="text-lg leading-none"
                        style={{ color: "#4A6645" }}
                      >
                        {openFaq === index ? "−" : "+"}
                      </span>
                    </button>
                    {openFaq === index && (
                      <p
                        className="text-xs leading-relaxed pb-4"
                        style={{ color: "#5A6E5A" }}
                      >
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

// ── Processing View ────────────────────────────────────────────────────────────

function ProcessingView({
  progress,
  fileName,
}: {
  progress: number;
  fileName: string;
}) {
  const steps = [
    { label: "Parsing document structure", threshold: 20 },
    { label: "Extracting key concepts", threshold: 50 },
    { label: "Generating flashcards", threshold: 75 },
    { label: "Building quiz questions", threshold: 95 },
  ];
  const currentStep = steps.findLastIndex((s) => progress >= s.threshold);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#E8E6D8" }}
    >
      <nav
        className="flex items-center px-6 py-4"
        style={{ borderBottom: "1px solid rgba(30,46,29,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4A6645"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          <span
            className="font-semibold text-base"
            style={{ color: "#1E2E1D" }}
          >
            RevLife
          </span>
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md">
          <div
            className="inline-flex items-center gap-2 mb-8 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: "rgba(45,74,44,0.1)", color: "#2D4A2C" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Processing
          </div>
          <h2
            className="text-3xl font-bold mb-2 break-words"
            style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
          >
            {fileName}
          </h2>
          <p className="text-sm mb-10" style={{ color: "#5A6E5A" }}>
            Turning your notes into something useful…
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "#8A9A8A" }}>
              {steps[currentStep]?.label ?? "Finalising…"}
            </span>
            <span className="text-xs font-medium" style={{ color: "#2D4A2C" }}>
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>
          <div
            className="w-full rounded-full mb-10"
            style={{ height: "4px", background: "rgba(45,74,44,0.12)" }}
          >
            <div
              className="h-full rounded-full progress-bar"
              style={{
                width: `${Math.min(100, progress)}%`,
                background: "#2D4A2C",
              }}
            />
          </div>
          <div className="space-y-3.5">
            {steps.map((step) => {
              const done = progress >= step.threshold;
              return (
                <div key={step.label} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: done ? "#2D4A2C" : "rgba(45,74,44,0.12)",
                    }}
                  >
                    {done && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm transition-all duration-300"
                    style={{
                      color: done ? "#2D4A2C" : "#8A9A8A",
                      fontWeight: done ? 500 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reviewer View ──────────────────────────────────────────────────────────────

function ReviewerView({
  cards,
  onBack,
}: {
  cards: ReviewCard[];
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const goTo = (next: number) => {
    setFlipped(false);
    setTimeout(() => setIndex(next), 180);
  };
  const card = cards[index];
  const progress = ((index + 1) / cards.length) * 100;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#E8E6D8" }}
    >
      <nav
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(30,46,29,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4A6645"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          <span
            className="font-semibold text-base"
            style={{ color: "#1E2E1D" }}
          >
            RevLife
          </span>
        </div>
        <button
          className="text-sm font-medium transition-colors px-3 py-1.5 rounded-full"
          style={{ color: "#5A6E5A", border: "1px solid rgba(30,46,29,0.15)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(30,46,29,0.05)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          onClick={onBack}
        >
          ← Dashboard
        </button>
      </nav>
      <main className="flex-1 flex flex-col px-8 py-10 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: "#2D4A2C" }}>
            Flashcards
          </span>
          <span className="text-sm" style={{ color: "#8A9A8A" }}>
            {index + 1} of {cards.length}
          </span>
        </div>
        <div
          className="w-full rounded-full mb-10"
          style={{ height: "3px", background: "rgba(45,74,44,0.12)" }}
        >
          <div
            className="h-full rounded-full progress-bar"
            style={{ width: `${progress}%`, background: "#2D4A2C" }}
          />
        </div>
        <div
          className="card-scene flex-1 mb-8 cursor-pointer"
          style={{ minHeight: "360px" }}
          onClick={() => setFlipped((f) => !f)}
        >
          <div
            className={`card-inner ${flipped ? "flipped" : ""}`}
            style={{ minHeight: "360px" }}
          >
            <div
              className="card-face flex flex-col items-center justify-center p-12 rounded-2xl"
              style={{
                background: "#CDDAC7",
                minHeight: "360px",
                boxShadow: "0 4px 24px rgba(30,46,29,0.1)",
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-widest mb-8"
                style={{ color: "#4A6645" }}
              >
                Concept
              </p>
              <h2
                className="text-4xl font-bold text-center mb-4"
                style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
              >
                {card.concept}
              </h2>
              <p
                className="text-sm mt-8 flex items-center gap-2"
                style={{ color: "#8A9A8A" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Tap to flip
              </p>
            </div>
            <div
              className="card-face card-back-face flex flex-col justify-center p-10 rounded-2xl"
              style={{
                background: "#F2F0E4",
                minHeight: "360px",
                boxShadow: "0 4px 24px rgba(30,46,29,0.1)",
                border: "1.5px solid rgba(45,74,44,0.2)",
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-widest mb-4"
                style={{ color: "#8A9A8A" }}
              >
                Definition
              </p>
              <p
                className="text-xl leading-relaxed mb-7"
                style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
              >
                {card.definition}
              </p>
              {card.example && (
                <>
                  <p
                    className="text-xs font-medium uppercase tracking-widest mb-2"
                    style={{ color: "#8A9A8A" }}
                  >
                    Example
                  </p>
                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: "#5A6E5A" }}
                  >
                    {card.example}
                  </p>
                </>
              )}
              {card.tip && (
                <div
                  className="pl-4 py-1"
                  style={{ borderLeft: "2px solid #2D4A2C" }}
                >
                  <p className="text-sm italic" style={{ color: "#8A9A8A" }}>
                    {card.tip}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-30"
            style={{ border: "1px solid rgba(30,46,29,0.2)", color: "#5A6E5A" }}
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            onMouseEnter={(e) =>
              !e.currentTarget.disabled &&
              (e.currentTarget.style.background = "rgba(30,46,29,0.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            ← Previous
          </button>
          <div className="flex gap-2 items-center">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === index ? "20px" : "6px",
                  height: "6px",
                  background: i === index ? "#2D4A2C" : "rgba(45,74,44,0.25)",
                }}
              />
            ))}
          </div>
          <button
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-30"
            style={{ border: "1px solid rgba(30,46,29,0.2)", color: "#5A6E5A" }}
            disabled={index === cards.length - 1}
            onClick={() => goTo(index + 1)}
            onMouseEnter={(e) =>
              !e.currentTarget.disabled &&
              (e.currentTarget.style.background = "rgba(30,46,29,0.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Next →
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Quiz View ─────────────────────────────────────────────────────────────────

const OPTION_LETTERS = ["A", "B", "C", "D"];

function QuizView({
  questions,
  currentIndex,
  selectedAnswer,
  answers,
  onAnswer,
  onNext,
  onBack,
}: {
  questions: QuizQuestion[];
  currentIndex: number;
  selectedAnswer: number | null;
  answers: (number | null)[];
  onAnswer: (i: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const q = questions[currentIndex];
  const answered = selectedAnswer !== null;
  const isLast = currentIndex === questions.length - 1;
  const progress = (currentIndex / questions.length) * 100;

  const optionStyle = (i: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      background: "#F2F0E4",
      border: "1.5px solid rgba(30,46,29,0.1)",
      color: "#1E2E1D",
      cursor: answered ? "default" : "pointer",
      borderRadius: "14px",
      transition: "all 0.15s",
    };
    if (!answered) return base;
    if (i === q.correct)
      return {
        ...base,
        background: "rgba(45,74,44,0.1)",
        borderColor: "#2D4A2C",
        color: "#2D4A2C",
      };
    if (i === selectedAnswer)
      return {
        ...base,
        background: "rgba(176,48,48,0.08)",
        borderColor: "#B03030",
        color: "#B03030",
      };
    return { ...base, opacity: 0.4 };
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#E8E6D8" }}
    >
      <nav
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(30,46,29,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4A6645"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          <span
            className="font-semibold text-base"
            style={{ color: "#1E2E1D" }}
          >
            RevLife
          </span>
        </div>
        <button
          className="text-sm font-medium transition-colors px-3 py-1.5 rounded-full"
          style={{ color: "#5A6E5A", border: "1px solid rgba(30,46,29,0.15)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(30,46,29,0.05)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          onClick={onBack}
        >
          ← Dashboard
        </button>
      </nav>
      <main className="flex-1 px-8 py-10 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: "#2D4A2C" }}>
            Quiz
          </span>
          <span className="text-sm" style={{ color: "#8A9A8A" }}>
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div
          className="w-full rounded-full mb-10"
          style={{ height: "3px", background: "rgba(45,74,44,0.12)" }}
        >
          <div
            className="h-full rounded-full progress-bar"
            style={{ width: `${progress}%`, background: "#2D4A2C" }}
          />
        </div>
        <div className="fade-in">
          <h2
            className="text-2xl font-bold leading-snug mb-7"
            style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
          >
            {q.question}
          </h2>
          <div className="space-y-3 mb-6">
            {q.options.map((option, i) => (
              <button
                key={i}
                className="w-full text-left flex items-center gap-4 px-5 py-4"
                style={optionStyle(i)}
                onClick={() => onAnswer(i)}
                onMouseEnter={(e) => {
                  if (!answered) {
                    e.currentTarget.style.background = "rgba(45,74,44,0.06)";
                    e.currentTarget.style.borderColor = "rgba(45,74,44,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!answered) {
                    e.currentTarget.style.background = "#F2F0E4";
                    e.currentTarget.style.borderColor = "rgba(30,46,29,0.1)";
                  }
                }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                  style={{
                    background:
                      answered && i === q.correct
                        ? "#2D4A2C"
                        : answered && i === selectedAnswer && i !== q.correct
                          ? "#B03030"
                          : "rgba(30,46,29,0.1)",
                    color:
                      answered &&
                      (i === q.correct ||
                        (i === selectedAnswer && i !== q.correct))
                        ? "white"
                        : "#5A6E5A",
                  }}
                >
                  {OPTION_LETTERS[i]}
                </span>
                <span className="text-sm font-medium">{option}</span>
                {answered && i === q.correct && (
                  <svg
                    className="ml-auto flex-shrink-0"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2D4A2C"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {answered && i === selectedAnswer && i !== q.correct && (
                  <svg
                    className="ml-auto flex-shrink-0"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#B03030"
                    strokeWidth="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          {answered && (
            <div
              className="p-5 rounded-2xl mb-6 fade-in"
              style={{
                background:
                  selectedAnswer === q.correct
                    ? "rgba(45,74,44,0.06)"
                    : "rgba(176,48,48,0.06)",
                border: `1px solid ${selectedAnswer === q.correct ? "rgba(45,74,44,0.2)" : "rgba(176,48,48,0.2)"}`,
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-widest mb-2"
                style={{
                  color: selectedAnswer === q.correct ? "#2D4A2C" : "#B03030",
                }}
              >
                {selectedAnswer === q.correct ? "Correct" : "Not quite"}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#5A6E5A" }}
              >
                {q.explanation}
              </p>
            </div>
          )}
          {answered && (
            <div className="flex justify-end fade-in">
              <button
                className="px-7 py-3 rounded-full font-semibold text-sm transition-colors"
                style={{ background: "#2D4A2C", color: "#F2F0E4" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#3A5E38")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#2D4A2C")
                }
                onClick={onNext}
              >
                {isLast ? "See results →" : "Next question →"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Results View ──────────────────────────────────────────────────────────────

function ResultsView({
  questions,
  answers,
  score,
  onRetry,
  onHome,
  onReview,
}: {
  questions: QuizQuestion[];
  answers: (number | null)[];
  score: number;
  onRetry: () => void;
  onHome: () => void;
  onReview: () => void;
}) {
  const pct = Math.round((score / questions.length) * 100);
  const grade =
    pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
  const gradeColor = pct >= 70 ? "#2D4A2C" : pct >= 60 ? "#7A6020" : "#B03030";
  const gradeBg = pct >= 70 ? "#CDDAC7" : pct >= 60 ? "#D4C8B0" : "#E8C8C8";
  const label =
    pct >= 90
      ? "Excellent work."
      : pct >= 70
        ? "Good progress."
        : pct >= 50
          ? "Keep at it."
          : "More review needed.";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#E8E6D8" }}
    >
      <nav
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(30,46,29,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4A6645"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
          <span
            className="font-semibold text-base"
            style={{ color: "#1E2E1D" }}
          >
            RevLife
          </span>
        </div>
        <button
          className="text-sm font-medium transition-colors px-3 py-1.5 rounded-full"
          style={{ color: "#5A6E5A", border: "1px solid rgba(30,46,29,0.15)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(30,46,29,0.05)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          onClick={onHome}
        >
          ← Dashboard
        </button>
      </nav>
      <main className="px-8 py-10 max-w-2xl mx-auto w-full">
        <div
          className="flex items-center gap-6 p-8 rounded-2xl mb-6"
          style={{ background: gradeBg }}
        >
          <div
            className="text-7xl font-bold leading-none flex-shrink-0"
            style={{ fontFamily: "Lora, Georgia, serif", color: gradeColor }}
          >
            {grade}
          </div>
          <div>
            <div
              className="text-4xl font-bold leading-none mb-2"
              style={{ fontFamily: "Lora, Georgia, serif", color: "#1E2E1D" }}
            >
              {score}/{questions.length}
            </div>
            <p className="text-sm" style={{ color: gradeColor }}>
              {pct}% correct — {label}
            </p>
          </div>
        </div>
        <p
          className="text-xs font-medium uppercase tracking-widest mb-4"
          style={{ color: "#8A9A8A" }}
        >
          Question breakdown
        </p>
        <div className="space-y-2 mb-8">
          {questions.map((q, i) => {
            const correct = answers[i] === q.correct;
            return (
              <div
                key={q.id}
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{
                  background: "#F2F0E4",
                  border: `1px solid ${correct ? "rgba(45,74,44,0.15)" : "rgba(176,48,48,0.15)"}`,
                }}
              >
                <div
                  className="text-xs font-medium mt-0.5 flex-shrink-0 w-5 text-center"
                  style={{ color: "#8A9A8A" }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm leading-snug"
                    style={{ color: "#1E2E1D" }}
                  >
                    {q.question}
                  </p>
                  {!correct && (
                    <p className="text-xs mt-1" style={{ color: "#8A9A8A" }}>
                      Answer: {q.options[q.correct]}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 mt-0.5">
                  {correct ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2D4A2C"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#B03030"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3">
          <button
            className="flex-1 py-3.5 rounded-full font-semibold text-sm transition-colors"
            style={{ background: "#2D4A2C", color: "#F2F0E4" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3A5E38")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2D4A2C")}
            onClick={onRetry}
          >
            Try again
          </button>
          <button
            className="flex-1 py-3.5 rounded-full font-semibold text-sm transition-colors"
            style={{
              border: "1.5px solid rgba(30,46,29,0.25)",
              color: "#2D4A2C",
              background: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(45,74,44,0.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onClick={onReview}
          >
            Review flashcards
          </button>
          <button
            className="px-5 py-3.5 rounded-full text-sm transition-colors"
            style={{
              border: "1.5px solid rgba(30,46,29,0.15)",
              color: "#8A9A8A",
              background: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(30,46,29,0.04)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onClick={onHome}
          >
            Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("home");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("Your study set");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(QUIZ_QUESTIONS.length).fill(null),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (view !== "processing") return;
    setProcessingProgress(0);
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setView("dashboard"), 600);
          return 100;
        }
        return Math.min(100, prev + Math.random() * 7 + 2);
      });
    }, 150);
    return () => clearInterval(interval);
  }, [view]);

  const handleFile = useCallback(
    (file: File, destination: "login" | "processing") => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !["pdf", "docx", "txt", "md"].includes(extension)) {
        setUploadError("Please choose a PDF, DOCX, TXT, or MD file.");
        return;
      }
      setUploadError(null);
      setUploadedFileName(file.name);
      setView(destination);
    },
    [],
  );

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file, "login");
    },
    [handleFile],
  );

  const handleDashboardUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file, "processing");
    },
    [handleFile],
  );
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file, "login");
    },
    [handleFile],
  );

  const startQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers(new Array(QUIZ_QUESTIONS.length).fill(null));
    setView("quiz");
  };

  const handleAnswer = (i: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(i);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = i;
      return next;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setSelectedAnswer(answers[nextIdx]);
    } else {
      setView("results");
    }
  };

  const score = answers.filter(
    (a, i) => a === QUIZ_QUESTIONS[i].correct,
  ).length;

  if (view === "login")
    return (
      <LoginView
        onLogin={() => setView("dashboard")}
        onGoSignup={() => setView("signup")}
        onBack={() => setView("home")}
      />
    );
  if (view === "signup")
    return (
      <SignupView
        onSignup={() => setView("dashboard")}
        onGoLogin={() => setView("login")}
        onBack={() => setView("home")}
      />
    );
  if (view === "support")
    return <ContactSupportView onBack={() => setView("home")} />;
  if (view === "processing")
    return (
      <ProcessingView
        progress={processingProgress}
        fileName={uploadedFileName}
      />
    );
  if (view === "dashboard")
    return (
      <DashboardView
        onStartReviewer={() => setView("reviewer")}
        onStartQuiz={startQuiz}
        onUpload={handleDashboardUpload}
      />
    );
  if (view === "reviewer")
    return (
      <ReviewerView cards={REVIEW_CARDS} onBack={() => setView("dashboard")} />
    );
  if (view === "quiz")
    return (
      <QuizView
        questions={QUIZ_QUESTIONS}
        currentIndex={currentQuestionIndex}
        selectedAnswer={selectedAnswer}
        answers={answers}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onBack={() => setView("dashboard")}
      />
    );
  if (view === "results")
    return (
      <ResultsView
        questions={QUIZ_QUESTIONS}
        answers={answers}
        score={score}
        onRetry={startQuiz}
        onHome={() => setView("dashboard")}
        onReview={() => setView("reviewer")}
      />
    );

  return (
    <HomeView
      isDragging={isDragging}
      fileInputRef={fileInputRef}
      uploadError={uploadError}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onChooseFile={() => fileInputRef.current?.click()}
      onUpload={handleUpload}
      onSignIn={() => setView("login")}
      onContactSupport={() => setView("support")}
    />
  );
}
