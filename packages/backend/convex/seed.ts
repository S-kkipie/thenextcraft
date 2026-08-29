import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";

const SEED_CONFIRMATION = "SEED_DEMO_V1";
const DAY = 24 * 60 * 60 * 1000;

const STARTUPS = [
  {
    name: "Nova Labs",
    companyName: "Nova Labs",
    sector: "AI / Developer Tools",
    githubHandle: "demo-nova-labs",
    bio: "Builds practical AI tools for teams that need better signals and faster decisions.",
  },
  {
    name: "Pulse Finance",
    companyName: "Pulse Finance",
    sector: "Fintech",
    githubHandle: "demo-pulse-finance",
    bio: "Modern risk operations for financial teams investigating suspicious activity.",
  },
] as const;

const BUILDERS = [
  {
    name: "Priya Nair",
    githubHandle: "demo-priya-nair",
    bio: "AI engineer focused on reliable retrieval, evaluation loops, and useful interfaces for operators.",
    location: "Bengaluru, India",
    skills: ["LLM apps", "Python", "TypeScript", "React", "AI evaluation"],
    level: 8,
    xp: 1_880,
    streak: 12,
  },
  {
    name: "Diego Alvarez",
    githubHandle: "demo-diego-alvarez",
    bio: "Infra engineer who turns deployment telemetry into calm, actionable operating systems.",
    location: "Madrid, Spain",
    skills: [
      "Terraform",
      "Kubernetes",
      "Observability",
      "TypeScript",
      "Convex",
    ],
    level: 7,
    xp: 1_560,
    streak: 9,
  },
  {
    name: "Maya Chen",
    githubHandle: "demo-maya-chen",
    bio: "Frontend specialist who makes complex workflows feel obvious, fast, and trustworthy.",
    location: "Vancouver, Canada",
    skills: ["Frontend", "React", "TypeScript", "Data viz", "Accessibility"],
    level: 6,
    xp: 1_320,
    streak: 8,
  },
  {
    name: "Jon Bell",
    githubHandle: "demo-jon-bell",
    bio: "Full-stack engineer balancing product speed with APIs that stay easy to evolve.",
    location: "Austin, United States",
    skills: ["Full-stack", "React", "Node.js", "TypeScript", "Postgres"],
    level: 5,
    xp: 1_100,
    streak: 6,
  },
  {
    name: "Lucas Kim",
    githubHandle: "demo-lucas-kim",
    bio: "Data engineer who turns noisy event streams into explainable risk and product signals.",
    location: "Seoul, South Korea",
    skills: ["Data engineering", "Python", "SQL", "Data viz", "Analytics"],
    level: 5,
    xp: 1_040,
    streak: 5,
  },
  {
    name: "Sofia Petrov",
    githubHandle: "demo-sofia-petrov",
    bio: "Security-minded builder who designs clear controls without making the product painful to use.",
    location: "Warsaw, Poland",
    skills: ["Security", "OWASP", "React", "TypeScript", "Threat modeling"],
    level: 4,
    xp: 820,
    streak: 4,
  },
  {
    name: "Rafael Ortiz",
    githubHandle: "demo-rafael-ortiz",
    bio: "Backend specialist interested in durable APIs, queues, and systems that explain their failures.",
    location: "Bogotá, Colombia",
    skills: ["Backend", "TypeScript", "Node.js", "Postgres", "API design"],
    level: 4,
    xp: 760,
    streak: 3,
  },
  {
    name: "Amara Okafor",
    githubHandle: "demo-amara-okafor",
    bio: "Product engineer who connects user research, crisp scope, and polished end-to-end delivery.",
    location: "Lagos, Nigeria",
    skills: [
      "Product engineering",
      "Frontend",
      "React",
      "TypeScript",
      "Product discovery",
    ],
    level: 3,
    xp: 620,
    streak: 2,
  },
] as const;

const CHALLENGES = [
  {
    key: "nova-support-triage",
    startupHandle: "demo-nova-labs",
    title: "Build an intelligent support triage desk",
    businessProblem:
      "Support teams manually classify and prioritize a high volume of incoming tickets, so urgent conversations get buried and agents spend too much time reconstructing context.",
    successCriteria: [
      "Classify incoming requests with an explainable category and confidence",
      "Prioritize urgent conversations using customer and issue context",
      "Surface relevant account history and suggested next actions",
      "Show measurable latency and quality signals for the triage loop",
    ],
    tech: ["TypeScript", "AI", "React"],
    reward: "Fast-track interview",
    status: "open" as const,
    deadlineDays: 14,
    updatedDaysAgo: 2,
  },
  {
    key: "pulse-risk-console",
    startupHandle: "demo-pulse-finance",
    title: "Turn suspicious transactions into an investigation queue",
    businessProblem:
      "Operations teams cannot efficiently inspect and prioritize suspicious transactions because risk signals are scattered across reports and investigators lack a shared workflow.",
    successCriteria: [
      "Prioritize suspicious activity with transparent risk indicators",
      "Make the transaction context and evidence easy to inspect",
      "Support a clear investigation workflow from alert to decision",
      "Keep the dashboard responsive while handling a realistic event volume",
    ],
    tech: ["React", "TypeScript", "Data visualization"],
    reward: "Product interview",
    status: "open" as const,
    deadlineDays: 21,
    updatedDaysAgo: 4,
  },
  {
    key: "nova-deployment-signals",
    startupHandle: "demo-nova-labs",
    title: "Give engineering a calmer deployment signal room",
    businessProblem:
      "Engineering teams lack visibility into deployment and reliability signals, so they discover regressions late and spend incident time correlating disconnected tools.",
    successCriteria: [
      "Combine deployment, error, and latency signals in one readable view",
      "Highlight regressions with enough context to choose the next action",
      "Make service health trends useful during an incident",
      "Explain the trade-offs in the signal model and alert thresholds",
    ],
    tech: ["TypeScript", "React", "Observability", "Data visualization"],
    reward: "Reliability product conversation",
    status: "closed" as const,
    deadlineDays: -3,
    updatedDaysAgo: 8,
  },
] as const;

const SUBMISSIONS = [
  {
    key: "priya-support",
    challengeKey: "nova-support-triage",
    builderHandle: "demo-priya-nair",
    repositoryName: "support-signal",
    pitch:
      "A retrieval-backed triage workspace that explains why a ticket is urgent before an agent opens it.",
    description:
      "Combines lightweight classification, account context, and a confidence-aware queue so support leads can tune quality without hiding uncertainty.",
    tech: ["TypeScript", "AI", "React", "LLM apps"],
    submittedDaysAgo: 4,
    evaluation: {
      status: "completed" as const,
      fitScore: 96,
      qualityScore: 92,
      architectureScore: 91,
      securityScore: 88,
      totalScore: 94,
      rank: 1,
      strengths: [
        "Maps the triage workflow directly to the stated support bottleneck",
        "Confidence and retrieved context make the AI output inspectable",
        "The queue interaction keeps the operator in control of escalation",
      ],
      issues: [
        "Evaluation quality would benefit from a larger labeled ticket set",
      ],
      rankedReview:
        "The strongest end-to-end response to the support problem: clear operator workflow, credible AI boundaries, and a thoughtful path to measuring quality.",
      authorshipStatus: "approved" as const,
      aiEvidence:
        "Strong criterion coverage across classification, urgency, context, and measurable feedback loops.",
    },
  },
  {
    key: "jon-support",
    challengeKey: "nova-support-triage",
    builderHandle: "demo-jon-bell",
    repositoryName: "ticket-compass",
    pitch:
      "A practical ticket compass that gives agents a ranked queue and a concise context brief.",
    description:
      "Uses a small service boundary around ticket enrichment and a focused React queue to make prioritization easier to audit.",
    tech: ["TypeScript", "React", "Node.js"],
    submittedDaysAgo: 6,
    evaluation: {
      status: "completed" as const,
      fitScore: 89,
      qualityScore: 86,
      architectureScore: 84,
      securityScore: 82,
      totalScore: 88,
      rank: 2,
      strengths: [
        "Keeps the core triage loop narrow and easy for an agent to learn",
        "Good separation between enrichment and presentation",
        "Useful fallback behavior when context is incomplete",
      ],
      issues: [
        "Priority calibration is described more clearly than it is measured",
      ],
      rankedReview:
        "A polished, credible submission with strong workflow fit. It falls just short of the top spot because the evaluation story needs more concrete quality evidence.",
      authorshipStatus: "interview" as const,
      aiEvidence:
        "Strong fit and build quality; measurement depth is the main gap against the leading submission.",
    },
  },
  {
    key: "amara-support",
    challengeKey: "nova-support-triage",
    builderHandle: "demo-amara-okafor",
    repositoryName: "agent-inbox",
    pitch:
      "A fast support inbox that groups repeat issues and gives agents a helpful first draft.",
    description:
      "Prioritizes a delightful queue experience and makes the suggested response easy to edit before sending.",
    tech: ["React", "TypeScript", "AI"],
    submittedDaysAgo: 8,
    evaluation: {
      status: "completed" as const,
      fitScore: 84,
      qualityScore: 80,
      architectureScore: 78,
      securityScore: 79,
      totalScore: 82,
      rank: 3,
      strengths: [
        "The interaction design makes the queue approachable for a busy support team",
        "Human editing remains central to the suggested response flow",
      ],
      issues: [
        "Context retrieval is shallow for multi-account conversations",
        "The prioritization model needs stronger handling for rare urgent cases",
      ],
      rankedReview:
        "A thoughtful product response with a strong operator experience. More rigorous context and edge-case handling would move it higher in the shortlist.",
      authorshipStatus: "video" as const,
      aiEvidence:
        "Good coverage of classification and workflow usability; context depth and urgent-case recall remain open questions.",
    },
  },
  {
    key: "maya-support",
    challengeKey: "nova-support-triage",
    builderHandle: "demo-maya-chen",
    repositoryName: "queue-lens",
    pitch:
      "A visual triage board that helps support leads spot queue pressure and route tickets quickly.",
    description:
      "Leans into clear information hierarchy, filters, and a compact explanation panel for each priority decision.",
    tech: ["React", "TypeScript", "Data visualization"],
    submittedDaysAgo: 10,
    evaluation: {
      status: "completed" as const,
      fitScore: 81,
      qualityScore: 78,
      architectureScore: 77,
      securityScore: 76,
      totalScore: 79,
      rank: 4,
      strengths: [
        "Excellent visual hierarchy for scanning queue pressure",
        "Makes prioritization decisions legible instead of presenting a black box",
      ],
      issues: [
        "The AI layer is comparatively thin",
        "Large queues need more deliberate loading behavior",
      ],
      rankedReview:
        "A strong interface-led solution that communicates queue state well. Its technical response is less complete than the higher-ranked AI implementations.",
      authorshipStatus: "pending" as const,
      aiEvidence:
        "Good usability and visual clarity; limited evidence for context retrieval and model quality.",
    },
  },
  {
    key: "rafael-support",
    challengeKey: "nova-support-triage",
    builderHandle: "demo-rafael-ortiz",
    repositoryName: "triage-api",
    pitch:
      "A dependable API foundation for classifying tickets and exposing a ranked support queue.",
    description:
      "Focuses on clean backend contracts and deterministic prioritization rules that can later accept a learned model.",
    tech: ["TypeScript", "Node.js", "Postgres", "Backend"],
    submittedDaysAgo: 12,
    evaluation: {
      status: "pending" as const,
    },
  },
  {
    key: "lucas-risk",
    challengeKey: "pulse-risk-console",
    builderHandle: "demo-lucas-kim",
    repositoryName: "pulse-riskboard",
    pitch:
      "An investigation queue that combines transaction features, peer baselines, and explainable risk bands.",
    description:
      "Turns noisy transaction events into a prioritized queue with drill-down evidence and a compact analyst workflow.",
    tech: ["React", "TypeScript", "Data visualization", "Python"],
    submittedDaysAgo: 5,
    evaluation: {
      status: "completed" as const,
      fitScore: 93,
      qualityScore: 90,
      architectureScore: 88,
      securityScore: 89,
      totalScore: 91,
      rank: 1,
      strengths: [
        "Risk indicators are connected to evidence an investigator can inspect",
        "The queue prioritizes action without pretending the score is a verdict",
        "Data modeling supports both case review and aggregate trend analysis",
      ],
      issues: [
        "Needs a clearer retention and access-control story for sensitive case notes",
      ],
      rankedReview:
        "The best response for Pulse Finance: it makes suspicious activity actionable while preserving the analyst's judgment and explaining the source of risk.",
      authorshipStatus: "approved" as const,
      aiEvidence:
        "Excellent coverage of prioritization, indicators, investigation flow, and responsive data presentation.",
    },
  },
  {
    key: "sofia-risk",
    challengeKey: "pulse-risk-console",
    builderHandle: "demo-sofia-petrov",
    repositoryName: "clearcase-risk",
    pitch:
      "A security-first case console that makes risk evidence and investigator decisions auditable.",
    description:
      "Pairs a deliberate evidence panel with safe defaults, explicit case states, and a compact review trail.",
    tech: ["React", "TypeScript", "Security", "Data visualization"],
    submittedDaysAgo: 7,
    evaluation: {
      status: "completed" as const,
      fitScore: 89,
      qualityScore: 87,
      architectureScore: 86,
      securityScore: 95,
      totalScore: 88,
      rank: 2,
      strengths: [
        "Strongest security posture and clearest audit trail in the cohort",
        "Investigator decisions and supporting evidence stay visible together",
      ],
      issues: [
        "The first-use workflow is denser than it needs to be",
        "Trend views are less developed than case review",
      ],
      rankedReview:
        "A highly credible security-minded submission. It nearly matches the winner, but its workflow carries more cognitive load and offers less operational trend context.",
      authorshipStatus: "interview" as const,
      aiEvidence:
        "Very strong security and evidence handling; usability and trend coverage keep it in second place.",
    },
  },
  {
    key: "maya-risk",
    challengeKey: "pulse-risk-console",
    builderHandle: "demo-maya-chen",
    repositoryName: "risk-radar",
    pitch:
      "A responsive risk radar that helps investigators scan, filter, and compare suspicious transactions.",
    description:
      "Uses a fast visual queue and side-by-side transaction context to make the investigation surface easy to navigate.",
    tech: ["React", "TypeScript", "Data visualization"],
    submittedDaysAgo: 9,
    evaluation: {
      status: "completed" as const,
      fitScore: 84,
      qualityScore: 82,
      architectureScore: 79,
      securityScore: 78,
      totalScore: 82,
      rank: 3,
      strengths: [
        "Excellent scanability for a high-volume queue",
        "Filters and comparison views are easy to understand",
      ],
      issues: [
        "Risk explanations are more visual than evidentiary",
        "The workflow stops short of a complete case lifecycle",
      ],
      rankedReview:
        "A very usable investigation surface with good visual judgment. It needs stronger evidence modeling and case lifecycle depth to become a complete operations tool.",
      authorshipStatus: "video" as const,
      aiEvidence:
        "Strong dashboard usability and responsive interaction; evidence and workflow completeness are moderate.",
    },
  },
  {
    key: "rafael-risk",
    challengeKey: "pulse-risk-console",
    builderHandle: "demo-rafael-ortiz",
    repositoryName: "signal-case-api",
    pitch:
      "A backend-first case API that gives risk operations a clean foundation for alert review and decisions.",
    description:
      "Defines clear alert, evidence, and disposition boundaries with a simple operator endpoint for the demo.",
    tech: ["TypeScript", "Node.js", "Postgres", "API design"],
    submittedDaysAgo: 11,
    evaluation: {
      status: "completed" as const,
      fitScore: 78,
      qualityScore: 76,
      architectureScore: 84,
      securityScore: 80,
      totalScore: 76,
      rank: 4,
      strengths: [
        "Clear domain boundaries",
        "Good foundation for case state and evidence APIs",
      ],
      issues: [
        "The user-facing investigation workflow is underdeveloped",
        "Prioritization remains mostly rule-based",
      ],
      rankedReview:
        "A solid backend foundation that answers part of the problem well. The lack of a richer investigator experience limits its usefulness as a complete product response.",
      authorshipStatus: "pending" as const,
      aiEvidence:
        "Good architecture fundamentals; limited proof of an end-to-end operations workflow.",
    },
  },
  {
    key: "amara-risk",
    challengeKey: "pulse-risk-console",
    builderHandle: "demo-amara-okafor",
    repositoryName: "caseflow",
    pitch:
      "A friendly caseflow prototype that helps non-specialists understand why a transaction was flagged.",
    description:
      "Prioritizes approachable language and a guided disposition path for smaller operations teams.",
    tech: ["React", "TypeScript", "Product engineering"],
    submittedDaysAgo: 14,
    evaluation: {
      status: "completed" as const,
      fitScore: 73,
      qualityScore: 71,
      architectureScore: 68,
      securityScore: 70,
      totalScore: 71,
      rank: 5,
      strengths: [
        "Clear plain-language explanations",
        "Guided disposition flow reduces first-use friction",
      ],
      issues: [
        "Risk scoring lacks enough detail for expert investigators",
        "The dashboard becomes noisy with larger queues",
      ],
      rankedReview:
        "A promising product direction with accessible language, but it currently simplifies away too much of the evidence and scale required by Pulse Finance.",
      authorshipStatus: "pending" as const,
      aiEvidence:
        "Good onboarding and usability instincts; risk depth and scale behavior need significant work.",
    },
  },
  {
    key: "diego-signals",
    challengeKey: "nova-deployment-signals",
    builderHandle: "demo-diego-alvarez",
    repositoryName: "signal-room",
    pitch:
      "A deployment signal room that connects release events to service health before an incident escalates.",
    description:
      "Combines deployment markers, latency changes, and error trends with a clear next-action view for on-call teams.",
    tech: [
      "React",
      "TypeScript",
      "Observability",
      "Terraform",
      "Data visualization",
    ],
    submittedDaysAgo: 3,
    evaluation: {
      status: "completed" as const,
      fitScore: 95,
      qualityScore: 93,
      architectureScore: 94,
      securityScore: 89,
      totalScore: 94,
      rank: 1,
      strengths: [
        "Connects deployment changes to reliability signals in a genuinely useful timeline",
        "The operating view is calm under incident pressure and points to next actions",
        "Architecture choices reflect realistic telemetry volume and failure modes",
      ],
      issues: [
        "Alert threshold tuning needs production calibration and ownership rules",
      ],
      rankedReview:
        "The clearest answer to Nova's reliability problem. It demonstrates strong systems thinking, excellent signal composition, and a workflow an engineering team could adopt quickly.",
      authorshipStatus: "approved" as const,
      aiEvidence:
        "Exceptional coverage of deployment, latency, error, context, and actionable incident workflow criteria.",
    },
  },
  {
    key: "rafael-signals",
    challengeKey: "nova-deployment-signals",
    builderHandle: "demo-rafael-ortiz",
    repositoryName: "release-observer",
    pitch:
      "A backend service that normalizes deployment events and exposes a reliable health signal API.",
    description:
      "Focuses on durable ingestion, clean service boundaries, and queryable release-to-health relationships.",
    tech: ["TypeScript", "Node.js", "Postgres", "Observability"],
    submittedDaysAgo: 5,
    evaluation: {
      status: "completed" as const,
      fitScore: 92,
      qualityScore: 89,
      architectureScore: 93,
      securityScore: 86,
      totalScore: 91,
      rank: 2,
      strengths: [
        "Excellent event and service boundary design",
        "Makes release-to-signal relationships queryable and durable",
      ],
      issues: [
        "The incident-facing UI is minimal",
        "Alert interpretation is left to a future consumer",
      ],
      rankedReview:
        "A technically excellent foundation that solves the data and architecture problem deeply. It ranks just behind Signal Room because the operator-facing experience is thinner.",
      authorshipStatus: "interview" as const,
      aiEvidence:
        "Outstanding architecture and strong reliability modeling; the UI and action loop are less complete.",
    },
  },
  {
    key: "jon-signals",
    challengeKey: "nova-deployment-signals",
    builderHandle: "demo-jon-bell",
    repositoryName: "deploy-pulse",
    pitch:
      "A focused dashboard for comparing deploys with recent error and latency movement.",
    description:
      "Keeps the first version small: a release timeline, service filters, and a concise regression summary.",
    tech: ["React", "TypeScript", "Data visualization", "Node.js"],
    submittedDaysAgo: 7,
    evaluation: {
      status: "completed" as const,
      fitScore: 89,
      qualityScore: 86,
      architectureScore: 83,
      securityScore: 82,
      totalScore: 88,
      rank: 3,
      strengths: [
        "Focused scope with a useful release timeline",
        "Regression summary is easy to scan",
      ],
      issues: [
        "Limited service-level drill-down",
        "The signal model assumes cleaner telemetry than most teams have",
      ],
      rankedReview:
        "A strong and shippable reliability dashboard with sensible scope. It lacks the signal depth and resilience of the top two submissions but communicates the core idea well.",
      authorshipStatus: "video" as const,
      aiEvidence:
        "Good end-to-end fit and usability; signal depth and messy-data handling are the key gaps.",
    },
  },
  {
    key: "sofia-signals",
    challengeKey: "nova-deployment-signals",
    builderHandle: "demo-sofia-petrov",
    repositoryName: "guarded-deploys",
    pitch:
      "A deployment dashboard that adds security and change-risk context to reliability signals.",
    description:
      "Brings ownership, change scope, and rollback notes into the same view as service health movement.",
    tech: ["React", "TypeScript", "Security", "Observability"],
    submittedDaysAgo: 9,
    evaluation: {
      status: "completed" as const,
      fitScore: 83,
      qualityScore: 82,
      architectureScore: 80,
      securityScore: 91,
      totalScore: 82,
      rank: 4,
      strengths: [
        "Useful change-risk and ownership context",
        "Strong attention to least-privilege operational details",
      ],
      issues: [
        "Reliability trend views are less developed",
        "The dashboard asks for too much setup before it becomes useful",
      ],
      rankedReview:
        "A differentiated, security-aware take on deployment visibility. Its operational setup and lighter reliability analysis keep it below the more complete signal rooms.",
      authorshipStatus: "approved" as const,
      aiEvidence:
        "Strong security and ownership context; reliability trend coverage and setup simplicity need improvement.",
    },
  },
  {
    key: "lucas-signals",
    challengeKey: "nova-deployment-signals",
    builderHandle: "demo-lucas-kim",
    repositoryName: "deploy-metrics",
    pitch:
      "A data-heavy release explorer for finding patterns across deploys, latency, and error budgets.",
    description:
      "Offers flexible aggregation and trend exploration for teams that want to investigate reliability patterns over time.",
    tech: ["Python", "SQL", "Data viz", "Observability"],
    submittedDaysAgo: 11,
    evaluation: {
      status: "completed" as const,
      fitScore: 80,
      qualityScore: 80,
      architectureScore: 78,
      securityScore: 75,
      totalScore: 79,
      rank: 5,
      strengths: [
        "Good trend exploration and aggregation primitives",
        "Makes historical reliability patterns discoverable",
      ],
      issues: [
        "The incident-time workflow is too exploratory",
        "It needs stronger signal prioritization and ownership cues",
      ],
      rankedReview:
        "A capable analytics surface with good historical depth, but it is better for post-incident exploration than for the fast decisions Nova needs during an active incident.",
      authorshipStatus: "pending" as const,
      aiEvidence:
        "Strong data exploration; weaker real-time prioritization and incident workflow fit.",
    },
  },
  {
    key: "amara-signals",
    challengeKey: "nova-deployment-signals",
    builderHandle: "demo-amara-okafor",
    repositoryName: "calm-release",
    pitch:
      "A lightweight release checklist with a small health summary for teams new to observability.",
    description:
      "Makes release context approachable and gives smaller teams a simple starting point for reliability habits.",
    tech: ["React", "TypeScript", "Product engineering"],
    submittedDaysAgo: 13,
    evaluation: {
      status: "completed" as const,
      fitScore: 67,
      qualityScore: 69,
      architectureScore: 64,
      securityScore: 70,
      totalScore: 66,
      rank: 6,
      strengths: [
        "Approachable first step for teams with limited observability maturity",
      ],
      issues: [
        "Signal coverage is too shallow for Nova's stated problem",
        "The view does not explain regressions well enough to guide incidents",
      ],
      rankedReview:
        "A friendly onboarding concept, but it does not yet provide the deployment and reliability visibility required by this challenge. It is a useful wedge rather than a complete solution.",
      authorshipStatus: "pending" as const,
      aiEvidence:
        "Clear onboarding intent, but limited criterion coverage and insufficient incident-time signal depth.",
    },
  },
] as const;

const BADGES = [
  ...SUBMISSIONS.map((submission) => ({
    builderHandle: submission.builderHandle,
    type: "shipped" as const,
    challengeKey: submission.challengeKey,
  })),
  {
    builderHandle: "demo-priya-nair",
    type: "first-ship" as const,
    challengeKey: "nova-support-triage",
  },
  {
    builderHandle: "demo-diego-alvarez",
    type: "first-ship" as const,
    challengeKey: "nova-deployment-signals",
  },
  {
    builderHandle: "demo-maya-chen",
    type: "first-ship" as const,
    challengeKey: "nova-support-triage",
  },
  {
    builderHandle: "demo-jon-bell",
    type: "first-ship" as const,
    challengeKey: "nova-support-triage",
  },
  {
    builderHandle: "demo-lucas-kim",
    type: "first-ship" as const,
    challengeKey: "pulse-risk-console",
  },
  {
    builderHandle: "demo-sofia-petrov",
    type: "first-ship" as const,
    challengeKey: "pulse-risk-console",
  },
  {
    builderHandle: "demo-rafael-ortiz",
    type: "first-ship" as const,
    challengeKey: "nova-support-triage",
  },
  {
    builderHandle: "demo-amara-okafor",
    type: "first-ship" as const,
    challengeKey: "nova-support-triage",
  },
  {
    builderHandle: "demo-priya-nair",
    type: "top-10" as const,
    challengeKey: "nova-support-triage",
  },
  {
    builderHandle: "demo-lucas-kim",
    type: "top-10" as const,
    challengeKey: "pulse-risk-console",
  },
  {
    builderHandle: "demo-diego-alvarez",
    type: "top-10" as const,
    challengeKey: "nova-deployment-signals",
  },
  {
    builderHandle: "demo-rafael-ortiz",
    type: "top-10" as const,
    challengeKey: "nova-deployment-signals",
  },
  {
    builderHandle: "demo-sofia-petrov",
    type: "top-10" as const,
    challengeKey: "pulse-risk-console",
  },
  {
    builderHandle: "demo-priya-nair",
    type: "startup-approved" as const,
    challengeKey: "nova-support-triage",
  },
  {
    builderHandle: "demo-priya-nair",
    type: "authorship-verified" as const,
    challengeKey: "nova-support-triage",
  },
  {
    builderHandle: "demo-lucas-kim",
    type: "authorship-verified" as const,
    challengeKey: "pulse-risk-console",
  },
  {
    builderHandle: "demo-diego-alvarez",
    type: "authorship-verified" as const,
    challengeKey: "nova-deployment-signals",
  },
] as const;

const OPPORTUNITIES = [
  {
    builderHandle: "demo-priya-nair",
    startupHandle: "demo-nova-labs",
    challengeKey: "nova-support-triage",
    role: "AI Product Engineer",
    matchPct: 95,
    reason:
      "Strongest combination of product fit, architecture quality, and AI implementation in the support triage challenge.",
    status: "sent" as const,
    createdDaysAgo: 1,
  },
  {
    builderHandle: "demo-lucas-kim",
    startupHandle: "demo-pulse-finance",
    challengeKey: "pulse-risk-console",
    role: "Risk Intelligence Engineer",
    matchPct: 93,
    reason:
      "Exceptional data modeling and evidence-first investigation flow for suspicious transaction operations.",
    status: "accepted" as const,
    createdDaysAgo: 3,
  },
  {
    builderHandle: "demo-diego-alvarez",
    startupHandle: "demo-nova-labs",
    challengeKey: "nova-deployment-signals",
    role: "Developer Experience Engineer",
    matchPct: 94,
    reason:
      "The signal room shows the systems thinking and operational judgment Nova needs to make deployments safer.",
    status: "sent" as const,
    createdDaysAgo: 2,
  },
] as const;

async function findUser(ctx: MutationCtx, githubHandle: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_githubHandle", (q) => q.eq("githubHandle", githubHandle))
    .unique();
}

async function ensureBuilder(
  ctx: MutationCtx,
  definition: (typeof BUILDERS)[number],
) {
  const existing = await findUser(ctx, definition.githubHandle);
  if (existing) {
    if (existing.role !== "builder") {
      throw new Error(
        `Demo handle ${definition.githubHandle} belongs to a startup`,
      );
    }
    return { id: existing._id, changed: false };
  }

  const id = await ctx.db.insert("users", {
    role: "builder",
    name: definition.name,
    githubHandle: definition.githubHandle,
    bio: definition.bio,
    location: definition.location,
    skills: [...definition.skills],
    level: definition.level,
    xp: definition.xp,
    streak: definition.streak,
    onboarded: true,
    updatedAt: Date.now(),
  });
  return { id, changed: true };
}

async function ensureStartup(
  ctx: MutationCtx,
  definition: (typeof STARTUPS)[number],
) {
  const existing = await findUser(ctx, definition.githubHandle);
  if (existing) {
    if (existing.role !== "startup") {
      throw new Error(
        `Demo handle ${definition.githubHandle} belongs to a builder`,
      );
    }
    return { id: existing._id, changed: false };
  }

  const id = await ctx.db.insert("users", {
    role: "startup",
    name: definition.name,
    companyName: definition.companyName,
    sector: definition.sector,
    githubHandle: definition.githubHandle,
    bio: definition.bio,
    onboarded: true,
    updatedAt: Date.now(),
  });
  return { id, changed: true };
}

async function findChallenge(
  ctx: MutationCtx,
  startupId: Id<"users">,
  title: string,
) {
  for await (const challenge of ctx.db
    .query("challenges")
    .withIndex("by_startupId_and_updatedAt", (q) =>
      q.eq("startupId", startupId),
    )) {
    if (challenge.title === title) return challenge;
  }
  return null;
}

async function ensureChallenge(
  ctx: MutationCtx,
  definition: (typeof CHALLENGES)[number],
  startupId: Id<"users">,
  now: number,
) {
  const existing = await findChallenge(ctx, startupId, definition.title);
  if (existing) return { id: existing._id, changed: false };

  const updatedAt = now - definition.updatedDaysAgo * DAY;
  const deadline = now + definition.deadlineDays * DAY;
  const publishedAt = now - (definition.updatedDaysAgo + 1) * DAY;

  if (definition.status === "open") {
    const id = await ctx.db.insert("challenges", {
      startupId,
      title: definition.title,
      businessProblem: definition.businessProblem,
      successCriteria: [...definition.successCriteria],
      reward: definition.reward,
      tech: [...definition.tech],
      deadline,
      status: "open",
      updatedAt,
      publishedAt,
    });
    return { id, changed: true };
  }

  const id = await ctx.db.insert("challenges", {
    startupId,
    title: definition.title,
    businessProblem: definition.businessProblem,
    successCriteria: [...definition.successCriteria],
    reward: definition.reward,
    tech: [...definition.tech],
    deadline,
    status: "closed",
    updatedAt,
    publishedAt,
    closedAt: now - 2 * DAY,
  });
  return { id, changed: true };
}

async function ensureSubmission(
  ctx: MutationCtx,
  definition: (typeof SUBMISSIONS)[number],
  challengeId: Id<"challenges">,
  builderId: Id<"users">,
  now: number,
) {
  const existing = await ctx.db
    .query("submissions")
    .withIndex("by_challengeId_and_builderId", (q) =>
      q.eq("challengeId", challengeId).eq("builderId", builderId),
    )
    .unique();
  if (existing) return { id: existing._id, changed: false };

  const submittedAt = now - definition.submittedDaysAgo * DAY;
  const id = await ctx.db.insert("submissions", {
    challengeId,
    builderId,
    repositoryUrl: `https://github.com/${definition.builderHandle}/${definition.repositoryName}`,
    demoUrl: `https://demo.thenextcraft.dev/${definition.repositoryName}`,
    pitch: definition.pitch,
    description: definition.description,
    tech: [...definition.tech],
    status: "submitted",
    submittedAt,
    updatedAt: submittedAt,
  });
  return { id, changed: true };
}

async function ensureEvaluation(
  ctx: MutationCtx,
  definition: (typeof SUBMISSIONS)[number],
  challengeId: Id<"challenges">,
  submissionId: Id<"submissions">,
  now: number,
) {
  const existing = await ctx.db
    .query("evaluations")
    .withIndex("by_submissionId", (q) => q.eq("submissionId", submissionId))
    .unique();

  if (existing) {
    if (
      definition.evaluation.status === "completed" &&
      existing.status === "pending"
    ) {
      const evaluation = definition.evaluation;
      await ctx.db.patch("evaluations", existing._id, {
        challengeId,
        status: "completed",
        fitScore: evaluation.fitScore,
        qualityScore: evaluation.qualityScore,
        architectureScore: evaluation.architectureScore,
        securityScore: evaluation.securityScore,
        totalScore: evaluation.totalScore,
        rank: evaluation.rank,
        strengths: [...evaluation.strengths],
        issues: [...evaluation.issues],
        rankedReview: evaluation.rankedReview,
        authorshipStatus: evaluation.authorshipStatus,
        aiEvidence: evaluation.aiEvidence,
        updatedAt: now - definition.submittedDaysAgo * DAY,
      });
      return { changed: true };
    }
    return { changed: false };
  }

  const evaluation = definition.evaluation;
  if (evaluation.status === "pending") {
    await ctx.db.insert("evaluations", {
      challengeId,
      submissionId,
      status: "pending",
      authorshipStatus: "pending",
      updatedAt: now - definition.submittedDaysAgo * DAY,
    });
    return { changed: true };
  }

  await ctx.db.insert("evaluations", {
    challengeId,
    submissionId,
    status: "completed",
    fitScore: evaluation.fitScore,
    qualityScore: evaluation.qualityScore,
    architectureScore: evaluation.architectureScore,
    securityScore: evaluation.securityScore,
    totalScore: evaluation.totalScore,
    rank: evaluation.rank,
    strengths: [...evaluation.strengths],
    issues: [...evaluation.issues],
    rankedReview: evaluation.rankedReview,
    authorshipStatus: evaluation.authorshipStatus,
    aiEvidence: evaluation.aiEvidence,
    updatedAt: now - definition.submittedDaysAgo * DAY,
  });
  return { changed: true };
}

async function ensureBadge(
  ctx: MutationCtx,
  definition: (typeof BADGES)[number],
  builderId: Id<"users">,
  challengeId: Id<"challenges">,
  now: number,
) {
  const existing = await ctx.db
    .query("badges")
    .withIndex("by_userId_and_type_and_challengeId", (q) =>
      q
        .eq("userId", builderId)
        .eq("type", definition.type)
        .eq("challengeId", challengeId),
    )
    .unique();
  if (existing) return { changed: false };

  await ctx.db.insert("badges", {
    userId: builderId,
    type: definition.type,
    challengeId,
    awardedAt: now - 1 * DAY,
  });
  return { changed: true };
}

async function ensureOpportunity(
  ctx: MutationCtx,
  definition: (typeof OPPORTUNITIES)[number],
  builderId: Id<"users">,
  startupId: Id<"users">,
  challengeId: Id<"challenges">,
  now: number,
) {
  for await (const opportunity of ctx.db
    .query("opportunities")
    .withIndex("by_builderId", (q) => q.eq("builderId", builderId))) {
    if (
      opportunity.startupId === startupId &&
      opportunity.challengeId === challengeId &&
      opportunity.role === definition.role
    ) {
      return { changed: false };
    }
  }

  await ctx.db.insert("opportunities", {
    builderId,
    startupId,
    challengeId,
    role: definition.role,
    matchPct: definition.matchPct,
    reason: definition.reason,
    status: definition.status,
    createdAt: now - definition.createdDaysAgo * DAY,
  });
  return { changed: true };
}

export const demo = mutation({
  args: {
    confirm: v.literal(SEED_CONFIRMATION),
  },
  returns: v.object({
    status: v.union(v.literal("seeded"), v.literal("already_seeded")),
    users: v.number(),
    startups: v.number(),
    builders: v.number(),
    challenges: v.number(),
    submissions: v.number(),
    evaluations: v.number(),
    badges: v.number(),
    opportunities: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    let changed = false;

    const startupIds = new Map<string, Id<"users">>();
    for (const startup of STARTUPS) {
      const result = await ensureStartup(ctx, startup);
      startupIds.set(startup.githubHandle, result.id);
      changed ||= result.changed;
    }

    const builderIds = new Map<string, Id<"users">>();
    for (const builder of BUILDERS) {
      const result = await ensureBuilder(ctx, builder);
      builderIds.set(builder.githubHandle, result.id);
      changed ||= result.changed;
    }

    const challengeIds = new Map<string, Id<"challenges">>();
    for (const challenge of CHALLENGES) {
      const startupId = startupIds.get(challenge.startupHandle);
      if (!startupId) throw new Error(`Missing startup for ${challenge.key}`);
      const result = await ensureChallenge(ctx, challenge, startupId, now);
      challengeIds.set(challenge.key, result.id);
      changed ||= result.changed;
    }

    const submissionIds = new Map<string, Id<"submissions">>();
    let evaluationCount = 0;
    for (const submission of SUBMISSIONS) {
      const challengeId = challengeIds.get(submission.challengeKey);
      const builderId = builderIds.get(submission.builderHandle);
      if (!challengeId || !builderId) {
        throw new Error(`Missing relationship for ${submission.key}`);
      }
      const submissionResult = await ensureSubmission(
        ctx,
        submission,
        challengeId,
        builderId,
        now,
      );
      submissionIds.set(submission.key, submissionResult.id);
      changed ||= submissionResult.changed;

      const evaluationResult = await ensureEvaluation(
        ctx,
        submission,
        challengeId,
        submissionResult.id,
        now,
      );
      changed ||= evaluationResult.changed;
      evaluationCount += 1;
    }

    for (const badge of BADGES) {
      const builderId = builderIds.get(badge.builderHandle);
      const challengeId = challengeIds.get(badge.challengeKey);
      if (!builderId || !challengeId) {
        throw new Error(`Missing relationship for ${badge.type}`);
      }
      const result = await ensureBadge(ctx, badge, builderId, challengeId, now);
      changed ||= result.changed;
    }

    for (const opportunity of OPPORTUNITIES) {
      const builderId = builderIds.get(opportunity.builderHandle);
      const startupId = startupIds.get(opportunity.startupHandle);
      const challengeId = challengeIds.get(opportunity.challengeKey);
      if (!builderId || !startupId || !challengeId) {
        throw new Error(`Missing relationship for ${opportunity.role}`);
      }
      const result = await ensureOpportunity(
        ctx,
        opportunity,
        builderId,
        startupId,
        challengeId,
        now,
      );
      changed ||= result.changed;
    }

    return {
      status: changed ? ("seeded" as const) : ("already_seeded" as const),
      users: STARTUPS.length + BUILDERS.length,
      startups: STARTUPS.length,
      builders: BUILDERS.length,
      challenges: CHALLENGES.length,
      submissions: submissionIds.size,
      evaluations: evaluationCount,
      badges: BADGES.length,
      opportunities: OPPORTUNITIES.length,
    };
  },
});
