<p align="center">
  <img src="./frontend/src/assets/banner_gemini.png" alt="GovVault Banner" width="100%">
</p>

# 🏛️ GovVault

**A local-first RAG (Retrieval-Augmented Generation) assistant for government documents.**

Upload dense policy PDFs, government orders, or circulars — ask questions in plain English, and get cited, page-accurate answers in seconds. No manual Ctrl+F through 200-page documents.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [⚠️ Deployment Note (Read This First)](#️-deployment-note-read-this-first)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running the Full Stack](#running-the-full-stack)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Known Limitations](#-known-limitations)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 Problem Statement

Government offices, legal teams, and policy researchers deal with hundreds of dense, unstructured PDF documents — circulars, orders, notifications. Finding a single relevant clause today means manually searching page by page, with no way to verify an answer's source at a glance.

GovVault turns that pile of PDFs into a searchable, conversational knowledge base — with every answer traceable back to the exact page it came from.

---

## ⚠️ Deployment Note (Read This First)

**Only the frontend of this project is publicly deployed.**

The backend depends on `sentence-transformers`, which pulls in a full **PyTorch** installation. This pushes the deployed image size and RAM footprint well past what free-tier hosting (Render, Railway, etc.) can handle — repeated attempts resulted in out-of-memory crashes during deployment. Upgrading to a paid tier to accommodate this wasn't a viable option for this project.

**As a result:**
- The **live frontend** you may find deployed is a **UI showcase only** — it is not connected to a running backend.
- The full RAG pipeline (PDF upload → local embedding → pgvector search → Groq inference) **only runs locally**, exactly as described in [Getting Started](#-getting-started) below.
- A **video walkthrough** of the complete, working pipeline is embedded on the landing page for anyone who wants to see it in action without setting it up themselves.

**To actually run and test the full project — backend included — you must fork or clone this repository and run it locally** using the setup instructions below. There is currently no hosted, end-to-end working version.

---

## ✨ Features

- 📄 **PDF Upload & Parsing** — Text-selectable PDFs are parsed page-by-page using PyMuPDF
- 🧠 **Local Embeddings** — Documents are vectorized on-device with SentenceTransformers (`paraphrase-MiniLM-L3-v2`, 384 dimensions) — zero embedding API cost
- 🔍 **Vector Search** — Postgres + `pgvector` extension for cosine-similarity retrieval, capped at top-5 chunks with a relevance threshold
- ⚡ **Fast Inference** — Final answer generation via Groq (`openai/gpt-oss-20b`)
- 📌 **Page-Level Citations** — Every answer links back to the exact source page; the in-app PDF viewer jumps there automatically
- 🗂️ **Multi-Session Chat** — Collapsible sidebar with independent chat sessions, each scoped to its own uploaded documents (100% session isolation)
- ⚙️ **Async Processing** — PDF vectorization runs as a background Celery task, so large uploads don't block the request thread
- 🎨 **ChatGPT-Style UI** — React + Tailwind, with `react-markdown` rendering for formatted AI responses

---

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌────────────────┐
│   React     │─────▶│   Django + DRF    │─────▶│   PostgreSQL    │
│  (Vite SPA) │◀─────│   REST API        │◀─────│   + pgvector    │
└─────────────┘      └────────┬─────────┘      └────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼──────┐      ┌───────▼────────┐
              │  Celery     │      │  Groq API       │
              │  + Redis    │      │  (LLM inference) │
              │  (async     │      └────────────────┘
              │  PDF jobs)  │
              └─────┬──────┘
                     │
              ┌──────▼───────┐
              │ SentenceTransformers │
              │ (local embeddings)   │
              └──────────────┘
```

**Flow:**
1. User uploads a PDF → Django saves it, kicks off a Celery task, returns immediately
2. Celery worker extracts text (PyMuPDF) → embeds each page locally → stores vectors in Postgres via pgvector
3. Frontend polls a status endpoint until processing completes
4. User asks a question → query is embedded the same way → cosine similarity search retrieves top-5 relevant chunks
5. Chunks + question are sent to Groq → answer streams back with a link to the source page

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS v4, Axios, React Router, react-markdown |
| **Backend** | Django, Django REST Framework |
| **Database** | PostgreSQL + pgvector |
| **Task Queue** | Celery + Redis |
| **Embeddings** | SentenceTransformers (`paraphrase-MiniLM-L3-v2`, 384-dim) |
| **LLM Inference** | Groq API (`openai/gpt-oss-20b`) |
| **PDF Parsing** | PyMuPDF (fitz) |
| **Containerization** | Docker (Postgres + Redis) |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- A [Groq API key](https://console.groq.com) (free tier works)

### Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start Postgres + Redis containers
docker-compose up -d

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create a .env file (see Environment Variables section below)
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create a .env file
echo "VITE_API_URL=http://127.0.0.1:8000/api" > .env
```

### Running the Full Stack

You'll need **three terminals** running simultaneously:

```bash
# Terminal 1 — Docker containers (from backend/)
docker-compose up -d

# Terminal 2 — Celery worker (from backend/, with venv active)
celery -A core worker --loglevel=info --pool=solo

# Terminal 3 — Django server (from backend/, with venv active)
python manage.py runserver
```

```bash
# Terminal 4 — Frontend (from frontend/)
npm run dev
```

Visit `http://localhost:5173`.

> **Note:** `--pool=solo` is required for Celery on Windows. On macOS/Linux you can omit it and use the default prefork pool.

---

## 🔐 Environment Variables

**`backend/.env`**

```env
DEBUG=True
DATABASE_URL=postgres://admin:adminpassword@localhost:5432/govvault_db
GROQ_API_KEY=your_groq_api_key_here
CELERY_BROKER_URL=redis://localhost:6379/0
```

**`frontend/.env`**

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/documents/upload/` | Upload a PDF, triggers async vectorization |
| `GET` | `/api/documents/<id>/status/` | Poll processing status (`pending` / `processing` / `completed` / `failed`) |
| `POST` | `/api/chat/` | Ask a question, scoped to `document_ids` |

---

## 📁 Project Structure

```
GovVault/
├── backend/
│   ├── core/                  # Django project settings, Celery config
│   ├── knowledge_base/        # Main app — models, views, services, tasks
│   │   ├── models.py          # Document, DocumentChunk
│   │   ├── views.py           # Upload, Status, Chatbot views
│   │   ├── services.py        # PDF parsing + embedding logic
│   │   └── tasks.py           # Celery async task
│   └── docker-compose.yml     # Postgres (pgvector) + Redis
└── frontend/
    └── src/
        ├── components/
        │   ├── layouts/        # Navbar
        │   ├── sections/       # Hero, Features, HowItWorks, TechStack, Footer, VideoShowcase
        │   └── rag-demo/       # RagDemoSection — main chat UI
        └── pages/               # LandingPage, ChatPage
```

---

## ⚠️ Known Limitations

- **Scanned/image-based PDFs are not supported** — PyMuPDF only extracts text from text-selectable PDFs. OCR is not currently implemented.
- **No authentication layer** — this is a demo/showcase project, not production-hardened.
- **Backend is local-only** — see the [Deployment Note](#️-deployment-note-read-this-first) above.

---

## 🗺️ Roadmap

- [ ] OCR support for scanned documents
- [ ] User authentication and per-user document libraries
- [ ] Lighter-weight embedding model to make cloud deployment feasible
- [ ] Streaming LLM responses token-by-token instead of waiting for the full completion

---

## 📄 License

This project was built as a hackathon/showcase project. Feel free to fork, learn from, or build on it.

---

## 🙏 Acknowledgments

- [Groq](https://groq.com) for fast LLM inference
- [pgvector](https://github.com/pgvector/pgvector) for making Postgres a viable vector store
- [SentenceTransformers](https://www.sbert.net/) for local, cost-free embeddings
