# LexGuard AI — Contract Intelligence Platform

<div align="center">

![LexGuard AI](https://img.shields.io/badge/LexGuard_AI-6366f1?style=for-the-badge&logo=shield&logoColor=white)
![Gemini 1.5 Pro](https://img.shields.io/badge/Gemini_1.5_Pro-4285F4?style=for-the-badge&logo=google&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_+_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Cloud Run](https://img.shields.io/badge/Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![License MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-30%2B_Passing-22c55e?style=for-the-badge)

**"Know What You're Signing Before You Sign It."**

An AI-powered legal contract intelligence platform that analyzes contracts in seconds, detects risk clauses, explains legal implications in plain English, and provides actionable negotiation guidance — powered by **Google Gemini 1.5 Pro**.

[🚀 Live Demo](https://lexguard-ai-65287397927.us-central1.run.app) · [📦 GitHub](https://github.com/Bellamkonda-Nokesh/LexGuard-AI)

</div>

---

## 📋 Table of Contents

- [Chosen Vertical](#chosen-vertical)
- [Problem Statement](#problem-statement)
- [Approach & Logic](#approach--logic)
- [How the Solution Works](#how-the-solution-works)
- [Architecture](#architecture)
- [AI Workflow](#ai-workflow)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Google Services](#google-services)
- [Security Implementation](#security-implementation)
- [Accessibility](#accessibility)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Testing](#testing)
- [Deployment to Cloud Run](#deployment-to-cloud-run)
- [Assumptions](#assumptions)
- [Limitations & Future Roadmap](#limitations--future-roadmap)

---

## Chosen Vertical

**Legal Tech / Personal Finance & Contract Safety**

LexGuard AI is built around the **Legal Intelligence Assistant** vertical. The target personas are:

| Persona | Problem | How LexGuard Helps |
|---------|---------|-------------------|
| Job seekers | Signing employment contracts without understanding non-compete, IP assignment clauses | Instant risk detection + plain English explanation |
| Freelancers | Unequal contractor agreements, surprise IP ownership clauses | Clause-by-clause analysis + safer wording suggestions |
| Small business owners | Vendor/SaaS contracts with hidden auto-renewal or liability caps | Industry benchmark comparison + negotiation strategies |
| HR Managers | Reviewing employment contracts at scale | Batch-ready analysis with exportable PDF reports |

---

## Problem Statement

**Every year, millions of people sign contracts they do not fully understand.** Legal counsel costs $250–$500/hour — completely inaccessible for individuals and small businesses. The consequences range from losing career freedom (non-compete clauses) to surrendering personal IP, losing arbitration rights, or being locked into auto-renewing subscriptions.

LexGuard AI democratizes legal intelligence by making contract analysis **fast, accessible, and affordable** — in under 30 seconds, for free.

---

## Approach & Logic

### Core Design Philosophy

1. **No Legal Jargon** — Every clause is explained in plain English that a non-lawyer can understand
2. **Actionable, Not Just Informational** — Every risk identified comes with a negotiation strategy and safer wording alternative
3. **Risk-First UX** — Critical issues are surfaced immediately, not buried in a report
4. **Transparent AI** — Confidence scores and agent timelines show exactly how conclusions were reached

### Decision-Making Logic

The system employs a **3-tier cascading AI reasoning pipeline**:

```
Layer 1: Structural Extraction (What is there?)
  → Identifies clause boundaries, types, and exact text positions

Layer 2: Risk Quantification (How dangerous is it?)
  → Scores each clause against legal imbalance metrics:
     - Scope/duration extremity
     - One-sidedness / enforceability
     - Financial exposure magnitude
     - Industry standard deviation

Layer 3: Strategic Advice (What should you do?)
  → Generates per-clause:
     - Plain English explanation
     - Real-world consequence scenario
     - "What if violated?" simulation
     - Specific negotiation counter-proposal
     - Legally safer alternative wording
```

### Risk Scoring Model

| Score | Level | Meaning |
|-------|-------|---------|
| 0–30 | LOW | Standard industry clause, minimal concern |
| 31–60 | MEDIUM | Somewhat unusual, worth negotiating |
| 61–80 | HIGH | Significantly unfavorable, negotiate before signing |
| 81–100 | CRITICAL | Immediate legal concern, do not sign without changes |

---

## How the Solution Works

### End-to-End User Flow

```
1. User visits LexGuard AI (lexguard-ai-65287397927.us-central1.run.app)
2. Drag-and-drops or clicks to upload a contract (PDF/DOCX/image)
3. File is validated (type, size, content) and stored in /tmp/lexguard_uploads/
4. POST /api/analyze triggers the 3-Agent Gemini pipeline:
   a. Agent 1 (Clause Extractor)  → identifies 12+ clause types
   b. Agent 2 (Risk Analyzer)     → scores each clause CRITICAL/HIGH/MEDIUM/LOW
   c. Agent 3 (Legal Advisor)     → generates plain English + negotiation advice
5. Results are stored in memory and returned to the frontend
6. User sees animated risk dashboard, can explore each clause in detail
7. User can export a professional text/PDF report
```

### What Makes It Smart

- **Context-Aware Classification** — Gemini understands legal nuance (e.g., a 12-month non-compete is LOW, but 36-month + 200-mile radius is CRITICAL)
- **Position Tracking** — Clauses are tracked by character position in the original document, enabling the inline Document Viewer to highlight exact text
- **Confidence Scoring** — Each clause gets an AI confidence score (0–1) indicating certainty of the risk assessment
- **Graceful Degradation** — If the Gemini API is unavailable, the system falls back to a rich demo analysis with a realistic employment contract

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│               React + Vite Frontend (SPA)               │
│  LandingPage → Upload → AI Loading → Risk Dashboard     │
│  Framer Motion + TailwindCSS + CSS Variables + Zustand  │
│  Dark/Light theme · WCAG 2.1 AA Accessible              │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────▼──────────────────────────────────┐
│            FastAPI Backend (Python 3.11)                 │
│                                                          │
│  POST /api/upload       → Validate + store file          │
│  POST /api/analyze      → Run 3-Agent AI pipeline        │
│  GET  /api/analysis/:id → Retrieve stored analysis       │
│  GET  /api/export/:id   → Generate PDF report            │
│  GET  /api/health       → Health check                   │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │   Agent 1: Clause Extractor  (Gemini 1.5 Pro)    │  │
│  │   Agent 2: Risk Analyzer     (Gemini 1.5 Pro)    │  │
│  │   Agent 3: Legal Advisor     (Gemini 1.5 Pro)    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Parsers: PyMuPDF │ python-docx │ Google Cloud Vision   │
│  Security: Rate limiting │ File validation │ Non-root    │
└─────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Google Cloud Services                       │
│  Gemini 1.5 Pro API    → AI reasoning (all 3 agents)    │
│  Cloud Run             → Auto-scaling container host     │
│  Google Cloud Vision   → OCR for scanned documents      │
└─────────────────────────────────────────────────────────┘
```

### Deployment Architecture

```
Docker Container (Cloud Run)
├── FastAPI app (port 8080)
│   ├── /api/*  → API routes (upload, analyze, export, health)
│   └── /*      → React SPA (index.html + Vite assets)
├── Non-root user (appuser, UID 1000)
└── Read-only filesystem (except /tmp/lexguard_uploads)
```

---

## AI Workflow

### 3-Agent Pipeline (Sequential Reasoning)

```
Contract Text
     │
     ▼
┌─────────────────────────────────────────┐
│  Agent 1: Clause Extractor              │
│  Model: Gemini 1.5 Pro                  │
│  • Identifies clause boundaries         │
│  • Classifies 12+ clause types          │
│  • Extracts exact verbatim text         │
│  • Records character positions          │
│  Output: List[RawClause]                │
└──────────────────┬──────────────────────┘
                   │ Structured JSON
                   ▼
┌─────────────────────────────────────────┐
│  Agent 2: Risk Analyzer                 │
│  Model: Gemini 1.5 Pro                  │
│  • Scores severity (LOW→CRITICAL)       │
│  • Detects legal imbalance patterns     │
│  • Identifies exploitative terms        │
│  • Compares to industry norms           │
│  • Sets confidence scores (0.0–1.0)     │
│  Output: List[ScoredClause]             │
└──────────────────┬──────────────────────┘
                   │ Risk-Scored Clauses
                   ▼
┌─────────────────────────────────────────┐
│  Agent 3: Legal Advisor                 │
│  Model: Gemini 1.5 Pro                  │
│  • Plain English explanation            │
│  • Real-world consequence               │
│  • "If violated" scenario simulation    │
│  • Negotiation strategy                 │
│  • Safer alternative wording            │
│  • Industry benchmark comparison        │
│  • Executive summary generation         │
│  Output: List[AdvisedClause] + Summary  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
         Risk Dashboard + PDF Report
```

### Supported Clause Types

| Type | Description |
|------|-------------|
| `non-compete` | Competition restrictions post-employment |
| `arbitration` | Mandatory arbitration, jury waiver |
| `ip-assignment` | Intellectual property transfer |
| `liability-limitation` | Caps on damages |
| `auto-renewal` | Automatic contract renewal |
| `confidentiality` | NDA / trade secret obligations |
| `termination` | Termination conditions and notice periods |
| `data-privacy` | Monitoring and data collection consent |
| `payment-terms` | Payment schedules and late fees |
| `indemnification` | Who pays if something goes wrong |
| `force-majeure` | Acts of God / unforeseeable events |
| `governing-law` | Which state/country's law applies |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI framework |
| Vite | 5.4 | Build tool + dev server |
| TypeScript | 5.5 | Type safety |
| TailwindCSS | 3.4 | Utility-first styling |
| Framer Motion | 11.3 | Smooth animations |
| Zustand | 4.5 | Lightweight state management |
| React Router | 6.26 | Client-side routing |
| Lucide React | 0.441 | Accessible SVG icons |
| Axios | 1.7 | HTTP client with interceptors |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.110.0 | High-performance async API framework |
| Python | 3.11 | Runtime |
| Pydantic | 2.6.3 | Data validation and serialization |
| PyMuPDF | 1.24.0 | PDF parsing |
| python-docx | 1.1.0 | DOCX parsing |
| ReportLab | 4.1.0 | PDF report generation |
| slowapi | 0.1.9 | Rate limiting |
| pytest | 8.1.1 | Testing framework |

### Google Cloud Services
| Service | Integration | Usage |
|---------|------------|-------|
| **Gemini 1.5 Pro** | `google-generativeai` SDK | Powers all 3 AI agents |
| **Cloud Run** | Docker + gcloud CLI | Serverless container hosting |
| **Cloud Vision API** | `google-cloud-vision` | OCR for scanned documents |
| **Cloud Storage** | `google-cloud-storage` | Optional persistent file storage |

---

## Features

### Core Features
- ✅ **Drag-and-drop upload** — PDF, DOCX, and scanned image contracts
- ✅ **3-agent AI pipeline** — Extractor → Analyzer → Advisor (sequential Gemini reasoning)
- ✅ **12+ clause type detection** — Auto-classified from document content
- ✅ **4-tier risk scoring** — LOW / MEDIUM / HIGH / CRITICAL with confidence scores
- ✅ **Animated risk dashboard** — SVG score ring + CSS horizontal bar charts
- ✅ **Clause explorer** — Search, filter by severity, sort by risk level
- ✅ **AI reasoning panel** — 4-tab deep-dive: Overview, Implications, Benchmark, Negotiate
- ✅ **Inline document viewer** — Color-coded highlighted clauses in original document
- ✅ **Report export** — PDF (via ReportLab backend) or text fallback (client-side)
- ✅ **Dark / Light theme** — Full CSS variable theming system, smooth transitions

### Innovation Features
- ✅ **Scenario simulation** — "What if this clause is violated?" consequences
- ✅ **Safer wording alternatives** — AI generates legally balanced replacement text
- ✅ **Industry benchmark comparison** — How unusual is this clause vs. industry standard?
- ✅ **Contract type auto-detection** — Employment, SaaS, Freelance, Real Estate, etc.
- ✅ **Trust score** — Overall trustworthiness metric (inverse of risk score)
- ✅ **Agent timeline visualization** — See each AI agent's processing step + time taken
- ✅ **Rate limiting** — 10 analyses/minute per IP to prevent abuse
- ✅ **Graceful degradation** — Rich demo mode when API is unavailable

---

## Google Services

### Gemini 1.5 Pro — AI Reasoning Engine
```python
# All 3 agents use Gemini 1.5 Pro via google-generativeai SDK
import google.generativeai as genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-pro")
```
Each agent sends a carefully engineered prompt to Gemini 1.5 Pro and parses the structured JSON response. The model's 1M token context window allows analysis of large contracts.

### Google Cloud Run — Serverless Deployment
- Single Docker container auto-scales 0 → N instances
- 2 GB RAM, 2 vCPUs allocated per instance
- Deployed to `us-central1` for low latency
- Non-root user (`appuser`) for container security

### Google Cloud Vision API — OCR
```python
from google.cloud import vision
client = vision.ImageAnnotatorClient()
response = client.text_detection(image=image)
```
Used to extract text from scanned/photographed contract images when PyMuPDF cannot read them.

### Cloud Storage (Configured, Optional)
```python
from google.cloud import storage
storage_client = storage.Client()
bucket = storage_client.bucket(os.getenv("GCS_BUCKET_NAME"))
```
Ready for integration; currently uses `/tmp/` for ephemeral storage in MVP.

---

## Security Implementation

### Input Validation
- **File type whitelist**: Only `.pdf`, `.docx`, `.doc`, `.png`, `.jpg`, `.jpeg` accepted
- **File size limit**: Maximum 20 MB enforced at upload
- **Content validation**: Minimum content length check (>100 bytes) prevents empty uploads
- **UUID-based file IDs**: Prevents path traversal attacks

### Container Security
- **Non-root user**: Application runs as `appuser` (UID 1000), not root
- **Minimal base image**: `python:3.11-slim` reduces attack surface
- **No secrets in image**: All secrets passed via Cloud Run environment variables

### API Security
- **Rate limiting**: `slowapi` limits analysis to 10 requests/minute per IP
- **CORS**: Configurable origins (wildcard in dev, restricted in production)
- **Error sanitization**: Internal errors never exposed to client

### Frontend Security
- **CSP headers** via FastAPI middleware
- **Input sanitization**: All file names sanitized before storage
- **No sensitive data in localStorage**: Analysis results stored in React state only

---

## Accessibility

LexGuard AI is built with **WCAG 2.1 AA** compliance as a core requirement:

### Implemented Standards
- **Semantic HTML5**: `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>` elements used throughout
- **ARIA labels**: All interactive elements have descriptive `aria-label` attributes
- **Keyboard navigation**: All buttons, links, and inputs are keyboard-accessible (Tab, Enter, Space)
- **Focus management**: Visible focus rings on all interactive elements
- **Color contrast**: All text meets 4.5:1 contrast ratio (checked against WCAG AA)
- **Alternative text**: All meaningful images have descriptive `alt` attributes
- **Screen reader support**: Status messages use `role="alert"` and `aria-live` regions
- **Responsive design**: Full functionality from 320px mobile to 2560px desktop

### Theme Accessibility
- Dark mode preserves all contrast ratios
- Color is never the sole indicator of information (icons + text always accompany color badges)
- Motion respects `prefers-reduced-motion` media query via Framer Motion

---

## Project Structure

```
LexGuard-AI/
├── frontend/                         # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/
│   │   │   │   ├── Hero.tsx          # Hero section with animated contract card
│   │   │   │   ├── Features.tsx      # Feature grid (1→2→3 col responsive)
│   │   │   │   ├── HowItWorks.tsx    # 3-step process (1→3 col responsive)
│   │   │   │   └── Testimonials.tsx  # User testimonials + stats
│   │   │   ├── analysis/
│   │   │   │   ├── UploadZone.tsx    # Drag-and-drop with progress
│   │   │   │   ├── LoadingOrchestrator.tsx  # Agent timeline animation
│   │   │   │   ├── RiskDashboard.tsx        # Score ring + CSS bar charts
│   │   │   │   ├── ClauseExplorer.tsx       # Search/filter clause list
│   │   │   │   ├── AIReasoningPanel.tsx     # 4-tab clause detail view
│   │   │   │   ├── InlineDocumentViewer.tsx # Highlighted original document
│   │   │   │   └── ExportButton.tsx         # PDF/text report download
│   │   │   └── shared/
│   │   │       ├── Navbar.tsx        # Responsive nav + theme toggle
│   │   │       └── Footer.tsx        # Footer with links and legal info
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx       # Main landing page composition
│   │   │   └── AnalysisPage.tsx      # Full analysis dashboard
│   │   ├── services/
│   │   │   └── api.ts                # Axios client + export fallback
│   │   ├── store/
│   │   │   └── analysisStore.ts      # Zustand global state
│   │   ├── context/
│   │   │   └── ThemeContext.tsx      # Dark/light theme context
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   └── lib/
│   │       └── utils.ts              # Risk colors, badge classes
│   ├── index.css                     # CSS variables + Tailwind base
│   └── package.json
│
├── backend/                          # FastAPI Python backend
│   ├── app/
│   │   ├── agents/
│   │   │   ├── clause_extractor.py   # Agent 1: Clause identification
│   │   │   ├── risk_analyzer.py      # Agent 2: Risk scoring
│   │   │   └── legal_advisor.py      # Agent 3: Advice + summary generation
│   │   ├── parsers/
│   │   │   ├── pdf_parser.py         # PyMuPDF PDF text extraction
│   │   │   ├── docx_parser.py        # python-docx DOCX extraction
│   │   │   └── ocr_parser.py         # Cloud Vision / pytesseract OCR
│   │   ├── routers/
│   │   │   ├── upload.py             # File upload + validation
│   │   │   ├── analyze.py            # 3-agent pipeline orchestration
│   │   │   └── export.py             # PDF report generation
│   │   ├── schemas/
│   │   │   └── contract.py           # Pydantic models (type-safe)
│   │   └── main.py                   # FastAPI app + middleware
│   ├── tests/
│   │   ├── conftest.py               # pytest fixtures (async client)
│   │   ├── test_api.py               # API endpoint tests (12 tests)
│   │   ├── test_agents.py            # AI agent unit tests (10 tests)
│   │   ├── test_parsers.py           # Parser unit tests (8 tests)
│   │   ├── test_security.py          # Security tests (6 tests)
│   │   └── test_schemas.py           # Pydantic schema tests (6 tests)
│   └── requirements.txt
│
├── Dockerfile                        # Multi-stage: Node build + Python serve
├── .dockerignore                     # Excludes node_modules, .env, .git
├── .env.example                      # Environment variable template
├── .gitignore                        # Excludes secrets, builds, caches
├── LICENSE                           # MIT License
└── README.md                         # This file
```

---

## Setup & Installation

### Prerequisites
- **Node.js** 20+
- **Python** 3.11+
- **Google Gemini API Key** — Get free at [ai.google.dev](https://ai.google.dev)

### 1. Clone the Repository

```bash
git clone https://github.com/Bellamkonda-Nokesh/LexGuard-AI.git
cd LexGuard-AI
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Open .env and fill in your API key:
# GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
cd ..
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | **Yes** | Google Gemini 1.5 Pro API key from [ai.google.dev](https://ai.google.dev) |
| `GCS_BUCKET_NAME` | No | Google Cloud Storage bucket for persistent file storage |
| `PORT` | No | Server port (default: `8080`) |
| `GOOGLE_APPLICATION_CREDENTIALS` | No | Path to GCP service account JSON for Cloud Vision/Storage |

The app runs in **demo mode** if `GEMINI_API_KEY` is not set — it will analyze a realistic sample contract to demonstrate all features.

---

## Running Locally

### Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload --port 8080
# API available at http://localhost:8080
# API docs at http://localhost:8080/docs
```

### Start Frontend Dev Server

```bash
cd frontend
npm run dev
# App available at http://localhost:5173
# Proxies /api/* requests to http://localhost:8080
```

### Build Frontend for Production

```bash
cd frontend
npm run build
# Creates optimized static files in frontend/dist/
```

---

## Testing

### Run All Tests

```bash
cd backend
pytest tests/ -v --tb=short
```

### Run Specific Test Suites

```bash
pytest tests/test_api.py -v           # API endpoint tests
pytest tests/test_agents.py -v        # AI agent unit tests
pytest tests/test_parsers.py -v       # Parser tests
pytest tests/test_security.py -v      # Security tests
pytest tests/test_schemas.py -v       # Schema validation tests
```

### Test Coverage Report

```bash
pip install pytest-cov
pytest tests/ --cov=app --cov-report=term-missing
```

### Test Categories

| File | Tests | Coverage Area |
|------|-------|---------------|
| `test_api.py` | 12 | Upload, analyze, export, health endpoints |
| `test_agents.py` | 10 | Clause extraction, risk scoring, legal advice |
| `test_parsers.py` | 8 | PDF parsing, DOCX parsing, OCR fallback |
| `test_security.py` | 6 | File validation, rate limiting, path safety |
| `test_schemas.py` | 6 | Pydantic model validation, edge cases |
| **Total** | **42** | Full stack coverage |

---

## Deployment to Cloud Run

### Quick Deploy (from source)

```bash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Deploy from source (Dockerfile is included)
gcloud run deploy lexguard-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here \
  --memory 2Gi \
  --cpu 2
```

### What the Dockerfile Does

```
Stage 1 (Node 20 Alpine):
  → Installs npm dependencies
  → Runs npm run build → creates frontend/dist/

Stage 2 (Python 3.11 Slim):
  → Installs Python dependencies
  → Copies backend source code
  → Copies frontend/dist/ → backend/static/
  → Creates non-root appuser (UID 1000)
  → Exposes port 8080
  → Starts uvicorn
```

FastAPI serves both the REST API (`/api/*`) and the React SPA (`/*`) from a single container.

---

## Assumptions

1. **Single-tenant MVP**: Analyses are stored in-memory per container instance. In production, Firestore or Redis would provide persistence across instances.
2. **PDF quality**: OCR fallback handles scanned documents, but text-based PDFs produce significantly more accurate results.
3. **Contract length**: Documents over ~15,000 characters are processed in chunks; very long contracts may take 30–60 seconds.
4. **English-only**: Current clause detection is optimized for English-language contracts. Multi-language support is a roadmap item.
5. **Demo mode**: When `GEMINI_API_KEY` is absent, the system analyzes a pre-built realistic employment contract to demonstrate full UI functionality.
6. **Not legal advice**: LexGuard AI provides AI-generated analysis for informational purposes only. Users should consult qualified attorneys before making legal decisions.

---

## Limitations & Future Roadmap

### Current Limitations
- Analysis history is in-memory (lost on Cloud Run cold start)
- No user accounts or saved history
- English-only clause detection
- Maximum ~20 MB file size

### Future Roadmap

| Priority | Feature |
|----------|---------|
| 🔴 High | Firebase Auth + Firestore for persistent history |
| 🔴 High | Google Cloud Storage for persistent file storage |
| 🟡 Medium | Multi-document batch analysis |
| 🟡 Medium | Contract comparison (side-by-side clause diff) |
| 🟡 Medium | Multi-language support (Hindi, Spanish, French) |
| 🟢 Low | Browser extension for inline review |
| 🟢 Low | Slack/email webhook integrations |
| 🟢 Low | Enterprise API with per-customer rate limits |

---

## ⚠️ Legal Disclaimer

LexGuard AI is an AI-powered tool for **educational and informational purposes only**. It does not constitute legal advice. AI analysis may contain errors or omissions. Always consult a qualified, licensed attorney before signing any legal contract.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Built with ❤️ for the **Google Antigravity Hackathon 2026**

Powered by **Google Gemini 1.5 Pro** + **Google Cloud Run** + **Google Cloud Vision**

[🚀 Try It Live](https://lexguard-ai-65287397927.us-central1.run.app)

</div>
