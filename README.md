# LexGuard AI — Contract Intelligence Platform

<div align="center">

![LexGuard AI](https://img.shields.io/badge/LexGuard-AI-6366f1?style=for-the-badge&logo=shield&logoColor=white)
![Gemini 1.5 Pro](https://img.shields.io/badge/Gemini_1.5_Pro-4285F4?style=for-the-badge&logo=google&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_+_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Cloud Run](https://img.shields.io/badge/Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

**"Know What You're Signing Before You Sign It."**

An AI-powered legal contract intelligence platform that analyzes contracts, detects risks, explains legal implications in plain English, and provides actionable negotiation guidance — powered by Google Gemini 1.5 Pro.

[🚀 Live Demo](https://lexguard-ai.run.app) · [📦 GitHub](https://github.com/Bellamkonda-Nokesh/LexGuard-AI)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [AI Workflow](#ai-workflow)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Testing](#testing)
- [Deployment to Cloud Run](#deployment-to-cloud-run)
- [Google Services](#google-services)
- [Limitations & Future Roadmap](#limitations--future-roadmap)

---

## Overview

LexGuard AI is a production-grade legal intelligence platform that:

- 📄 **Parses** PDF, DOCX, and scanned image contracts
- 🔍 **Extracts** 12+ types of contractual clauses intelligently
- ⚖️ **Scores** each clause LOW / MEDIUM / HIGH / CRITICAL
- 💬 **Explains** legal jargon in plain English
- 📊 **Compares** against industry benchmarks
- 💡 **Recommends** negotiation strategies and safer wording
- 📈 **Visualizes** risks with an animated dashboard
- 📑 **Exports** professional PDF reports

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│               React + Vite Frontend                     │
│  Landing Page → Upload → AI Loading → Risk Dashboard    │
│  Framer Motion + TailwindCSS + Recharts + Zustand       │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│                FastAPI Backend                          │
│                                                         │
│  POST /api/upload   → File validation + storage         │
│  POST /api/analyze  → 3-Agent AI Pipeline               │
│  GET  /api/analysis/:id → Retrieve results              │
│  GET  /api/export/:id   → PDF report generation         │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Agent 1: Clause Extractor (Gemini 1.5 Pro)      │  │
│  │  Agent 2: Risk Analyzer    (Gemini 1.5 Pro)      │  │
│  │  Agent 3: Legal Advisor    (Gemini 1.5 Pro)      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Parsers: PyMuPDF | python-docx | Google Cloud Vision   │
└─────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Google Cloud Services                      │
│  Gemini 1.5 Pro | Cloud Run | Cloud Storage             │
│  Google Cloud Vision API (OCR)                          │
└─────────────────────────────────────────────────────────┘
```

### Deployment Architecture (Single Container)

```
Docker Container (Cloud Run)
├── FastAPI (serves API + static files)
│   ├── /api/* → API routes
│   └── /* → React SPA (built frontend)
└── Port 8080
```

---

## AI Workflow

### 3-Agent Pipeline

```
Contract Text
     │
     ▼
┌─────────────────────────────────┐
│  Agent 1: Clause Extractor      │
│  • Identifies all clauses       │
│  • Classifies clause types      │
│  • Extracts exact text          │
│  • Finds character positions    │
└──────────────┬──────────────────┘
               │ Structured JSON
               ▼
┌─────────────────────────────────┐
│  Agent 2: Risk Analyzer         │
│  • Scores each clause           │
│  • Detects exploitative terms   │
│  • Identifies legal imbalance   │
│  • Compares to industry norms   │
│  • Sets confidence scores       │
└──────────────┬──────────────────┘
               │ Risk-Scored Clauses
               ▼
┌─────────────────────────────────┐
│  Agent 3: Legal Advisor         │
│  • Plain English explanation    │
│  • Real-world consequence       │
│  • Scenario simulation          │
│  • Negotiation strategy         │
│  • Safer wording alternatives   │
│  • Executive summary            │
└──────────────┬──────────────────┘
               │ Complete Analysis
               ▼
         Dashboard + PDF
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework + build tool |
| TailwindCSS v3 | Utility-first styling |
| Framer Motion | Animations |
| Recharts | Charts and visualizations |
| Zustand | State management |
| TanStack Query | Server state management |
| React Router v6 | Navigation |
| Lucide React | Icons |
| jsPDF | PDF export |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | API framework |
| Uvicorn | ASGI server |
| PyMuPDF (fitz) | PDF parsing |
| python-docx | DOCX parsing |
| Google Generative AI | Gemini 1.5 Pro SDK |
| ReportLab | PDF report generation |
| slowapi | Rate limiting |
| pytest + pytest-asyncio | Testing |

### Google Cloud
| Service | Purpose |
|---------|---------|
| Gemini 1.5 Pro | AI reasoning for all 3 agents |
| Cloud Run | Container hosting |
| Cloud Storage | File storage (optional) |
| Cloud Vision API | OCR for scanned documents |
| Firebase Auth | User authentication (optional) |
| Firestore | Analysis history (optional) |

---

## Features

### Core Features
- ✅ Drag-and-drop contract upload (PDF, DOCX, images)
- ✅ 3-agent AI pipeline (Extractor → Analyzer → Advisor)
- ✅ 12+ clause type detection
- ✅ 4-tier risk scoring (LOW/MEDIUM/HIGH/CRITICAL)
- ✅ Animated risk dashboard with Recharts
- ✅ Clause explorer with search and filter
- ✅ AI reasoning panel with 4 tabs
- ✅ Inline document viewer with color-coded highlights
- ✅ PDF report export

### Innovation Features
- ✅ Scenario simulation ("What if this clause is violated?")
- ✅ Safer wording alternatives
- ✅ Industry benchmark comparison
- ✅ AI confidence scores
- ✅ Contract type auto-detection
- ✅ Rich mock mode for demo without API key

---

## Project Structure

```
LexGuard-AI/
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/         # Hero, Features, HowItWorks, Testimonials
│   │   │   ├── analysis/        # Upload, Loading, Dashboard, Clauses
│   │   │   └── shared/          # Navbar, Footer
│   │   ├── pages/               # LandingPage, AnalysisPage
│   │   ├── services/            # API client
│   │   ├── store/               # Zustand state
│   │   ├── types/               # TypeScript types
│   │   └── lib/                 # Utilities
│   └── package.json
│
├── backend/                     # FastAPI
│   ├── app/
│   │   ├── agents/              # 3 AI agents
│   │   ├── parsers/             # PDF, DOCX, OCR
│   │   ├── routers/             # API routes
│   │   ├── schemas/             # Pydantic models
│   │   └── main.py
│   └── tests/                   # pytest tests (15+)
│
├── Dockerfile                   # Multi-stage build
├── .env.example
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Node.js 20+
- Python 3.11+
- Google Gemini API Key (get at [ai.google.dev](https://ai.google.dev))

### 1. Clone the Repository

```bash
git clone https://github.com/Bellamkonda-Nokesh/LexGuard-AI.git
cd LexGuard-AI
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
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

## Running Locally

### Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8080
```

### Start Frontend (development)

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173` with API proxy to `http://localhost:8080`.

---

## Testing

```bash
cd backend
pytest tests/ -v
```

### Test Coverage
- **Parser Tests**: PDF parsing, DOCX parsing, OCR, edge cases
- **Agent Tests**: Clause extraction, risk scoring, legal advice, summary generation
- **API Tests**: Upload, analyze, export, health, error handling
- **Total**: 20+ test cases

---

## Deployment to Cloud Run

### Using the included Dockerfile:

```bash
# 1. Authenticate
gcloud auth login
gcloud config set project promptwars-community-x-ascent

# 2. Build and deploy
gcloud run deploy lexguard-ai \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here \
  --memory 2Gi \
  --cpu 2
```

The Dockerfile automatically:
1. Builds the React frontend with `npm run build`
2. Copies the `dist/` into FastAPI's `static/` directory
3. FastAPI serves both the API and the React SPA from a single container

---

## Google Services

### Gemini 1.5 Pro
Used by all 3 AI agents for legal reasoning. Configured via `GEMINI_API_KEY`. Falls back to rich mock data if unavailable.

### Cloud Run
Hosts the single Docker container serving both frontend and API. Auto-scales from 0 to N instances.

### Google Cloud Vision API
Used for OCR on scanned contract images. Falls back to pytesseract if unavailable.

### Cloud Storage (Optional)
Stores uploaded contract files securely. Can be enabled by setting `GCS_BUCKET_NAME`.

### Firebase (Optional)
- **Firebase Auth**: User authentication and login history
- **Firestore**: Persistent analysis history storage

---

## Limitations & Future Roadmap

### Current Limitations
- Analysis history is in-memory (lost on restart without Firebase)
- Large documents (>15,000 chars) are truncated for AI processing
- OCR quality depends on image resolution

### Future Roadmap
- [ ] Firebase Auth + persistent history
- [ ] Multi-document batch analysis
- [ ] Clause comparison between two contracts
- [ ] User accounts and saved analyses
- [ ] Webhook integrations (Slack, email)
- [ ] API for enterprise customers
- [ ] Multi-language support
- [ ] Browser extension for inline contract review

---

## ⚠️ Legal Disclaimer

LexGuard AI is an AI-powered tool for educational and informational purposes only. It does not constitute legal advice. Always consult a qualified attorney before signing any contract.

---

<div align="center">
Built with ❤️ using Google Gemini 1.5 Pro + Cloud Run
</div>
