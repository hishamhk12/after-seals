# Vercel Deployment

This project keeps the local Node server for development:

```bash
npm start
```

Vercel should serve the static frontend files from the project root and use the serverless function at:

```text
POST /api/ask
```

`/api/ask` answers with a local search over the site's own knowledge (`localSearchService.js`, built from `pageKnowledge.js` and `knowledge/pages/`). It needs no environment variables, no API key and no AI service. Do not commit `.env`.

The Gemini/RAG scripts in `package.json` (`llm:*`, `rag:*`, `embeddings:*`, `global-rag:*`, `powerpoint:*`) are offline tooling only; the deployed site does not use them.
