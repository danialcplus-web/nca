# Developer Guide — Agent Chat (Frontend + Backend)

This repository contains two main parts:

- `back_end/` — FastAPI service that handles chat adapter endpoints, ChatKit session/message helpers, document ingestion, embeddings, and integrations with OpenAI, Supabase, and Pinecone.
- `nca/` — Next.js (App Router) frontend that provides the UI, Supabase auth flows, Chat UI, and client utilities that call the backend.

This developer guide explains the project structure, key files, how to run locally, and where to look when things break.

---

**Quick links**

- Backend entry: `back_end/main.py`
- Frontend entry: `nca/app/page.tsx` and `nca/app/chat/page.tsx`
- Frontend chat client helper: `nca/lib/chatkit-client.ts`
- Backend README: `back_end/README.md`
- Frontend README: `nca/README.md`

---

## Repo layout (top-level)

```
/ (repo root)
├── back_end/        # FastAPI backend
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── README.md
├── nca/             # Next.js frontend (App Router)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── README.md
├── README_DEVELOPER.md (this file)
```

---

## High-level architecture

- Frontend (`nca`) authenticates users with Supabase and provides a chat UI. When users send messages, the frontend either:
  - Uses ChatKit flow (initializes a ChatKit session via `POST /api/chatkit/session` on the backend and sends messages via `/api/chatkit/message`), or
  - Falls back to calling the backend agent endpoint (`POST /agent/answer`) which runs embedding retrieval + an LLM prompt to produce an answer.

- Backend (`back_end`) serves multiple roles:
  - Adapter for ChatKit (create sessions, proxy messages).
  - Agent endpoint that computes embeddings (via OpenAI), queries a vector store (Pinecone), and calls an LLM/agents workflow to produce an answer.
  - Document upload endpoint which extracts text from files, chunks them, computes embeddings, and upserts vectors to Pinecone namespaced by `user_id`.
  - Middleware to validate/attach Supabase session when required.

---

## Important environment variables

Frontend (`nca/.env.local`):

- `NEXT_PUBLIC_FASTAPI_URL` — URL to the running backend (e.g., `http://localhost:8001`). This is critical: if the frontend calls `/api/chatkit/session` on the frontend host, you'll get `405 Method Not Allowed`. Ensure `nca/lib/chatkit-client.ts` uses this var as the backend base URL.

---

## Running locally (recommended dev flow)

1. Backend (Windows PowerShell):

```powershell
cd back_end
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# create back_end/.env with required vars (see back_end/README.md)
& .\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

2. Frontend (Next.js):

```powershell
cd nca
# install Node deps if needed
npm install
# set NEXT_PUBLIC_FASTAPI_URL in nca/.env.local to http://localhost:8001
npm run dev
```

3. Test the ChatKit session from the frontend by opening the app and confirming the `initializeChatKitSession()` call in `nca/lib/chatkit-client.ts` fetches `${NEXT_PUBLIC_FASTAPI_URL}/api/chatkit/session` and returns `{ client_secret }`.

---

## Key files and responsibilities

- `back_end/main.py` — FastAPI app, registers routers, contains ChatKit adapter endpoints and `/chat` alias. Good place to add request-level logging and global error handlers.
- `back_end/routes/agent.py` — `POST /agent/answer`: builds embeddings for the user query, queries Pinecone (namespace = `user_id`), assembles context, and calls an LLM or Agents runner to produce the assistant message.
- `back_end/routes/documents.py` — `POST /documents/upload`: handles file uploads, extracts text (`services/file_processing.py`), chunks the text, embeds chunks, and upserts into Pinecone.
- `back_end/services/embeddings.py` — wrapper around OpenAI embeddings with batching and chunking.
- `back_end/services/file_processing.py` — extract text from PDFs/DOCX/CSV and plain text.
- `nca/app/chat/page.tsx` — chat UI; optimistic UI update when sending messages; calls either ChatKit (via `nca/lib/chatkit-client.ts`) or backend `/agent/answer`.
- `nca/lib/chatkit-client.ts` — responsible for calling backend session/message endpoints; must use `NEXT_PUBLIC_FASTAPI_URL`.
- `nca/app/auth/*` — Supabase sign-up, sign-in, and verification flows (resend verification, onAuthStateChange listener implemented).

---

## Known gotchas & debugging tips

- 405 Method Not Allowed on `/api/chatkit/session`: the frontend is likely calling the route on the frontend host (nextjs) instead of the backend. Fix: set `NEXT_PUBLIC_FASTAPI_URL` to `http://localhost:8001` (dev) or your backend host.

- 422 Unprocessable Entity on `/api/chat`: the backend accepts either `{ input_as_text: string }` or `{ messages: [...] }`. Ensure your payload matches one of those shapes.

- OpenAI SDK / ChatKit `workflow` shape errors: SDKs change frequently — if you see BadRequest or type errors, check that the `workflow` passed to ChatKit/session creation matches the installed `openai`/`openai-agents` package's expected type (object vs string id). Use the versions referenced in `back_end/requirements.txt`.

- Stale assistant responses / delayed replies: ensure the frontend sends the newly-created user message (optimistic message) in the outbound payload if your backend expects full `messages` array. The code in `nca/app/chat/page.tsx` now includes the optimistic message before calling the backend.

- Pinecone namespace mismatch: document uploads upsert vectors under `namespace = user_id`. When querying, ensure you use the same namespace.

- Venv vs system Python: Always activate `.venv` before running `uvicorn` so the process uses the project dependencies.

- Small code issues to review:
  - `back_end/routes/agent.py`: there is a noted typo in context assembly — search for `m["metadata"].get("text""file_name")` or similar.
  - `back_end/services/embeddings.py`: some helpers may reference `user_id` in a scope where it's not defined — run tests to catch these.

---

## Testing & smoke tests

- Add simple pytest + httpx tests under `back_end/tests/` (not included by default).
- A small smoke test can POST to `/api/chatkit/session` and `/api/chatkit/message` to verify basic flows. See `back_end/DEV_GUIDE.md` for example commands and a smoke test snippet.

---

## Suggested next improvements (developer wishlist)

- Add unit tests for route handlers (`pytest` + `httpx.AsyncClient`).
- Add a `docker-compose.yml` to run the API + Redis + (optionally) Pinecone local emulator for easier onboarding.
- Add a simple Postman collection or a small Python CLI that runs smoke tests against the running backend.
- Add a RequestValidationError handler in `main.py` to log request bodies for debugging occasional 422s.

---

## Helpful commands summary

```powershell
# Backend
cd back_end
& .\.venv\Scripts\Activate.ps1
& .\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8001

# Frontend
cd nca
npm install
# set NEXT_PUBLIC_FASTAPI_URL in .env.local
npm run dev
```

---

If you want, I can:

- Add a `back_end/tests/smoke_test.py` and run it locally for you,
- Create a `docker-compose.yml` that launches the backend + Redis,
- Add linter/formatter configs and a pre-commit hook.

---

Last updated: 2025-11-27
