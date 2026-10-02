/**
 * BHODT Product Database
 * BLACK_HAR_OFFICIAL_DEVELOPING_TEAM
 * Telegram: @blackhatmrx
 * 
 * Edit or add new products to this file.
 */

const products = [
  {
    id: "tool-001",
    name: "BHODT WebAudit Pro",
    image: "assets/tools/tool-001.png",
    description: "Automated website accessibility, performance diagnostics, and SEO compliance inspector for web developers.",
    category: "Web Tools",
    version: "2.4.1",
    platform: "Web / Desktop",
    price: 2500,
    currency: "LKR",
    status: "AVAILABLE",
    isDemo: true,
    features: [
      "Core Web Vitals latency diagnostics",
      "Full WCAG 2.2 accessibility auditor",
      "Multi-viewport stress testing engine",
      "One-click exportable PDF/JSON reports",
      "Zero external tracking & 100% private",
      "Direct BHODT Telegram support"
    ],
    requirements: "Modern browser (Chrome 110+, Firefox 115+, Safari 16+) or Node 18+",
    license: "Commercial Single Developer License",
    fileType: ".zip / Standalone App",
    lastUpdated: "2026-09-18",
    supportInfo: "Direct assistance via Telegram @blackhatmrx"
  },
  {
    id: "tool-002",
    name: "BHODT DevMatrix Core",
    image: "assets/tools/tool-002.png",
    description: "High-throughput syntax validator, schema normalizer, and micro-benchmark harness for TypeScript and Python.",
    category: "Developer Tools",
    version: "3.1.0",
    platform: "Windows, Linux, macOS",
    price: 3500,
    currency: "LKR",
    status: "AVAILABLE",
    isDemo: true,
    features: [
      "Sub-millisecond AST parser and validator",
      "TypeScript & JSON schema validation runner",
      "Micro-benchmarking harness with visualizer",
      "Dual mode: fast CLI + minimalist GUI",
      "Offline-native architecture, zero telemetry",
      "BHODT lifetime minor update guarantee"
    ],
    requirements: "Windows 10/11 (64-bit), Ubuntu 22.04+, or macOS 12+",
    license: "Perpetual Single Developer License",
    fileType: ".exe / .tar.gz / .dmg",
    lastUpdated: "2026-09-25",
    supportInfo: "Direct engineering support via Telegram @blackhatmrx"
  },
  {
    id: "tool-003",
    name: "BHODT GuardSec Auditor",
    image: "assets/tools/tool-003.png",
    description: "Defensive endpoint hardening scanner, TLS certificate inspector, and authorized vulnerability assessment utility.",
    category: "Security Tools",
    version: "1.8.2",
    platform: "Windows / Linux",
    price: 5000,
    currency: "LKR",
    status: "AVAILABLE",
    isDemo: true,
    features: [
      "Authorized defensive network perimeter audit",
      "SSL/TLS cipher suite rating and expiry alert",
      "OWASP Top 10 configuration gap diagnostic",
      "Automated CIS benchmark compliance checks",
      "Safe, passive scan mode with zero downtime",
      "Detailed audit report generator"
    ],
    requirements: "Windows 10/11 or Linux (Admin/root privileges for network socket checks)",
    license: "Defensive Security & Internal Audit License (Strictly Authorized Use)",
    fileType: "Portable Binary (.zip)",
    lastUpdated: "2026-08-30",
    supportInfo: "Inquiry via Telegram @blackhatmrx"
  },
  {
    id: "tool-004",
    name: "BHODT PromptFlow Studio",
    image: "assets/tools/tool-001.png",
    description: "Prompt engineering, pipeline orchestration, and token latency evaluation sandbox for LLM application developers.",
    category: "AI Tools",
    version: "2.0.0",
    platform: "Web / Desktop",
    price: 4200,
    currency: "LKR",
    status: "AVAILABLE",
    isDemo: true,
    features: [
      "Prompt version diffing and evaluation matrix",
      "Token consumption, latency and cost estimator",
      "Deterministic JSON Schema validator",
      "Local encrypted prompt template repository",
      "1-Click Python and TypeScript SDK export",
      "BHODT developer support included"
    ],
    requirements: "Modern web browser or Electron runtime",
    license: "Standard Professional Developer License",
    fileType: "Web App / Desktop Executable",
    lastUpdated: "2026-09-12",
    supportInfo: "Direct assistance via Telegram @blackhatmrx"
  },
  {
    id: "tool-005",
    name: "BHODT TaskFlow Pro",
    image: "assets/tools/tool-002.png",
    description: "Keyboard-centric local workspace manager, sprint milestone tracker, and developer micro-journal with markdown export.",
    category: "Productivity",
    version: "1.4.0",
    platform: "Windows / macOS",
    price: 1800,
    currency: "LKR",
    status: "AVAILABLE",
    isDemo: true,
    features: [
      "100% offline local SQLite storage with encryption",
      "Vim-style quick command palette and navigation",
      "Pomodoro sync with automated daily logs",
      "Bi-directional markdown links for Obsidian",
      "Ultra-lightweight (< 18MB RAM footprint)",
      "Direct support from BHODT team"
    ],
    requirements: "Windows 10/11 or macOS Monterey (12.0) or later",
    license: "Personal Single User License",
    fileType: "Installer (.msi / .dmg)",
    lastUpdated: "2026-07-20",
    supportInfo: "Direct assistance via Telegram @blackhatmrx"
  },
  {
    id: "tool-006",
    name: "BHODT BinaryLab Simulator",
    image: "assets/tools/tool-003.png",
    description: "Interactive educational simulation for learning computer architecture, logic gates, and assembly execution step-by-step.",
    category: "Educational Tools",
    version: "1.2.0",
    platform: "Cross-Platform (Browser/PC)",
    price: 1500,
    currency: "LKR",
    status: "AVAILABLE",
    isDemo: true,
    features: [
      "Visual 8-bit & 16-bit register clock simulator",
      "Interactive logic gate breadboard oscilloscope",
      "40+ curated computer science logic exercises",
      "Step-by-step memory addressing visualizer",
      "Designed for students and instructors",
      "Zero installation required"
    ],
    requirements: "Any modern browser on PC, tablet, or laptop",
    license: "Educational Single User / Academic License",
    fileType: "Standalone HTML5 Suite (.zip)",
    lastUpdated: "2026-08-05",
    supportInfo: "Student & Educator help via Telegram @blackhatmrx"
  },
  {
    id: "tool-007",
    name: "BHODT NetPulse Monitor",
    image: "assets/tools/tool-001.png",
    description: "Minimalist desktop system tray utility for latency jitter monitoring, DNS benchmarking, and gateway packet loss diagnosis.",
    category: "Utility Tools",
    version: "1.0.5",
    platform: "Windows",
    price: 1200,
    currency: "LKR",
    status: "AVAILABLE",
    isDemo: true,
    features: [
      "Discrete taskbar tray icon with latency indicator",
      "Automated DNS benchmark against 12 providers",
      "Connection drop detection with time-stamped logs",
      "Zero background CPU overhead (< 0.1% usage)",
      "Clean dark mode UI with history graphs",
      "Single portable executable"
    ],
    requirements: "Windows 10 / Windows 11 (64-bit)",
    license: "Perpetual Utility License",
    fileType: "Single Portable .exe",
    lastUpdated: "2026-09-02",
    supportInfo: "Inquiries via Telegram @blackhatmrx"
  },
  {
    id: "tool-008",
    name: "BHODT CloudShip CLI",
    image: "assets/tools/tool-002.png",
    description: "Automated container deployment orchestrator and environment variable synchronizer for staging and production pipelines.",
    category: "Developer Tools",
    version: "2.1.0",
    platform: "Linux / macOS / Windows",
    price: 3000,
    currency: "LKR",
    status: "UPDATING",
    isDemo: true,
    features: [
      "Fast multi-environment secret synchronizer",
      "Zero-downtime rolling container health checks",
      "Git pre-push hook integration for checks",
      "Local AES-256 encrypted credential store",
      "Instant rollback with immutable snapshots",
      "Priority engineer onboarding via Telegram"
    ],
    requirements: "Docker 24.0+ and Git 2.30+",
    license: "Team Commercial License",
    fileType: "CLI Binary (.tar.gz / .zip)",
    lastUpdated: "2026-09-28",
    supportInfo: "Engineering support via Telegram @blackhatmrx"
  },
  {
    id: "tool-009",
    name: "BHODT VisionModel Profiler",
    image: "assets/tools/tool-003.png",
    description: "Local dataset validation and inference speed profiling tool for computer vision models (ONNX, PyTorch, TensorRT).",
    category: "AI Tools",
    version: "1.0.0-rc",
    platform: "Windows (CUDA) / Linux",
    price: 4800,
    currency: "LKR",
    status: "COMING SOON",
    isDemo: true,
    features: [
      "Automated latency profiling across batch sizes",
      "VRAM footprint and thermal throttling analytics",
      "Precision drift comparison (FP32/FP16/INT8)",
      "High-resolution confusion matrix generator",
      "Optimized for TensorRT acceleration",
      "LaTeX and CSV benchmark export"
    ],
    requirements: "NVIDIA GPU with CUDA 12.0+ support",
    license: "Research & Developer License",
    fileType: "Python Wheel / Binary Bundle",
    lastUpdated: "2026-09-30",
    supportInfo: "Waitlist notifications via Telegram @blackhatmrx"
  },
  {
    id: "tool-010",
    name: "BHODT API Forge",
    image: "assets/tools/tool-001.png",
    description: "Interactive REST & GraphQL mock server generator with dynamic schema generation, rate limiting, and webhook testing.",
    category: "Web Tools",
    version: "1.5.0",
    platform: "Web / Desktop",
    price: 2200,
    currency: "LKR",
    status: "SOLD OUT",
    isDemo: true,
    features: [
      "Instant mock endpoints from OpenAPI 3.1 specs",
      "Dynamic realistic data generator with seed control",
      "Configurable latency jitter and failure rate",
      "Zero external dependency - runs 100% on localhost",
      "Graphical inspector + headless CI/CD runner",
      "Unlimited local endpoints"
    ],
    requirements: "Windows 10+, macOS 12+, or modern browser",
    license: "Developer Edition License",
    fileType: ".zip / .dmg / .tar.gz",
    lastUpdated: "2026-06-15",
    supportInfo: "Waitlist inquiries via Telegram @blackhatmrx"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { products };
}
