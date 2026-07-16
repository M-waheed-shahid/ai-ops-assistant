# Case Study: AI Ops Assistant for Vantage Point Consulting

## The Problem

Vantage Point Consulting is a fictional 34-person AI/tech consulting firm used as the target company for this project (see `company-profile.md`). Like many small companies without a dedicated automation or BI function, three operational pain points recur across its departments:

1. **Scattered documentation.** Onboarding guides, HR policy, and department SOPs live across Google Drive, Notion, and email threads. New hires and contractors waste time hunting for basic answers.
2. **Delayed visibility into customer sentiment.** Post-engagement feedback lands in a spreadsheet with no categorization or alerting. Negative feedback about an at-risk client can go unnoticed until a scheduled 30/60/90-day check-in — by which point the client relationship may already be damaged.
3. **Manual leadership reporting.** Preparing for the monthly leadership review requires each department head to manually compile numbers from five different systems, with no single source of truth.

These aren't hypothetical — they're documented directly in the mock company's own internal materials (`knowledge-base/raw-docs/meeting-notes-leadership-ops.md`), which frame this exact project as leadership's approved response.

## The Solution

Three connected components, each targeting one pain point:

### 1. AI-searchable knowledge base
11 internal documents (SOPs, policies, meeting notes) were structured and loaded into a Claude Project with custom instructions restricting answers to the uploaded source material. Employees can now ask plain-language questions ("What's our PTO rollover policy?") and get accurate, document-grounded answers instead of searching across three different tools.

### 2. Automated feedback triage
An n8n workflow reads new rows from the customer feedback Google Sheet, sends each entry to an AI model for sentiment and topic classification, writes the result back into the sheet, and automatically emails Customer Success when sentiment is negative — collapsing a process that used to take up to 90 days into minutes.

### 3. Executive dashboard
Two versions were built to demonstrate different skill sets:
- A static React/Recharts dashboard (Claude Artifact) with a custom "Client Pulse" visualization — a heart-rate-monitor-style timeline of feedback colored by sentiment.
- A live Streamlit dashboard that reads directly from the same Google Sheet the automation writes to, auto-refreshing so leadership always sees current data without manual exports.

## Impact (Projected)

Since this is a portfolio project built against a fictional company, these are estimates grounded in the documented pain points rather than measured production results:

- **Onboarding/support friction:** Employees currently referencing 3+ scattered sources for basic policy questions could resolve most of them in a single Claude Project query — estimated at 15–30 minutes saved per question, multiple times a week per employee.
- **Customer churn risk:** Reducing the negative-feedback detection window from up to 90 days to under 5 minutes gives Customer Success a materially earlier opportunity to intervene before a renewal decision is made.
- **Leadership reporting:** Automating data aggregation for the monthly review could eliminate an estimated 3–5 hours of manual cross-system data-pulling per month across department heads.

## Technical Decisions Worth Noting

- **Model flexibility:** The automation was built and tested against three different AI providers (Google AI Studio/Gemini, OpenRouter's GPT-4o, and OpenRouter's free Nemotron 3 Super) over the course of development, due to real-world availability issues (a documented Gemini API regional outage) and rate-limit constraints on free-tier models. The workflow's HTTP Request node is provider-agnostic by design — swapping models only required changing the URL, headers, and body, not the workflow structure.
- **Graceful degradation:** Both the React and Streamlit dashboards explicitly detect and handle unclassified rows (e.g., from a rate-limited AI call) rather than crashing or silently misrepresenting the data.
- **Tested, not assumed:** The Streamlit app was verified end-to-end — server startup, data parsing, KPI math, and edge-case handling — using a local test dataset before being handed off, rather than assumed to work from the code alone.

## What I'd Build Next

- Route negative-feedback alerts to Slack in addition to email for faster visibility
- Add a proper RAG pipeline (embeddings + vector DB) as a more scalable alternative to the Claude Project knowledge base for a larger document set
- Extend the dashboard with capacity/utilization data (flagged as a need in the Delivery team's own meeting notes) alongside customer feedback
- Add automated tests and error-handling/retry logic to the n8n workflow for production-grade reliability
