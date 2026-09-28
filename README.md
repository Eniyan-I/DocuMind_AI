<h1>DocuMind AI</h1>
<p>An end-to-end Retrieval-Augmented Generation (RAG) application that allows users to interact with a knowledge base using natural-language queries. The application combines LangChain, Google Gemini, FastAPI, React.js, and Docker to provide an AI-powered question-answering system.</p>
<h3>Overview</h3>
<p>This project implements a RAG pipeline that retrieves relevant information from a knowledge base and uses a Google Gemini LLM to generate contextual responses.</p>
<p>The application is divided into:</p>
<li>Frontend: React.js</li>
<li>Backend: FastAPI</li>
<li>AI/RAG Pipeline: LangChain</li>
<li>Embedding & LLM: Google Gemini API</li>
<li>Containerization: Docker</li>
<h3>Architecture</h3> 

```bash
                  ┌──────────────────┐
                  │   React Frontend │
                  │                  │
                  │  User Query      │
                  └────────┬─────────┘
                           │
                           │ HTTP Request
                           ▼
                  ┌──────────────────┐
                  │  FastAPI Backend │
                  │                  │
                  │  API Endpoints   │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │    LangChain     │
                  │   RAG Pipeline   │
                  └────────┬─────────┘
                           │
                    Retrieve Context
                           │
                           ▼
                  ┌──────────────────┐
                  │ Vector Retrieval │
                  │   / Embeddings   │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   Google Gemini  │
                  │       LLM        │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Generated Answer │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   React UI       │
                  └──────────────────┘
```
<h3>How It Works</h3>
<ul>The user submits a question through the React.js frontend.

The query is sent to the FastAPI backend.

LangChain processes the query and performs retrieval against the knowledge base.

Relevant document chunks are retrieved using semantic similarity.

The retrieved context is passed to the Google Gemini LLM.

Gemini generates a context-aware response.

The response is returned through the FastAPI API and displayed in the React interface.</ul>

<h3>Project Structure</h3>

```bash
DocuMind_AI/
│
├── frontend/
│   ├── src
│        ├── App.js
│        ├── App.css
│        ├──index.js
│        ├──index.css
│        └──App.test.js
├── backend/
│   ├── main.py
│   ├──Dockerfile
│   ├──data_ingestion.py
│   └── rag.py
├── requirements.txt
├── .env.example
└── README.md

```
<h3>Use Cases</h3>
<p>This RAG architecture can be adapted for:</p>
<li>Document question answering</li>
<li>Knowledge-base assistants</li>
<li>Internal company knowledge systems</li>
<li>Research assistants</li>
<li>Context-aware chatbots</li>
