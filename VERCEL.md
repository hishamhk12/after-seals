# Vercel Deployment

This project keeps the local Node server for development:

```bash
npm start
```

Vercel should serve the static frontend files from the project root and use the serverless function at:

```text
POST /api/ask
```

Required Vercel environment variable for both Production and Preview:

```text
ai = <Gemini API key>
```

Do not expose this key in frontend code and do not commit `.env`.

The committed embedding store at `data/embeddings/intro-tour.json` is read at request time as a bundled, read-only deployment file. Embeddings are not rebuilt by the Vercel function.
