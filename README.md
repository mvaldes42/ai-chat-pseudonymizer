# AI Chat Pseudonymizer

Proof of concept for an AI chatbot that will detect and pseudonymize PII in the browser before sending text to the AI API. Original values stay on the client; only placeholders reach the backend.

This is a POC, not a production privacy system.

## Current status

The chat UI, GraphQL API, and Redux message store are in place. Sending a message returns a **stub** (`"This is a test response"`). The following are not implemented yet:

- Client-side PII detection (Transformers.js / CamemBERT-NER-PII)
- Local pseudonymization and reverse mapping
- OpenAI API calls
- GraphQL subscription streaming

## Stack

**Frontend:** React, TypeScript, Create React App, Redux Toolkit, Apollo Client, ChatScope

**Backend:** Node.js, TypeScript, Express, Apollo Server, GraphQL

No database. Chat state lives in Redux on the client.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- GraphQL: [http://localhost:4000/graphql](http://localhost:4000/graphql)

`OPENAI_API_KEY` in `.env` is reserved for a later step; the stub resolver does not use it.

### Scripts


| Command          | Description                                 |
| ---------------- | ------------------------------------------- |
| `npm run dev`    | Start GraphQL server and React app together |
| `npm run server` | Start Apollo Server on port 4000            |
| `npm start`      | Start the React app on port 3000            |
| `npm run build`  | Production build of the frontend            |


Restart `npm run server` (or `npm run dev`) after backend changes; `tsx` does not watch files.

## Planned flow

1. Detect French PII in the browser with CamemBERT-NER-PII (INT8) via Transformers.js.
2. Replace entities with placeholders such as `[PERSON_1]` and `[EMAIL_1]`.
3. Keep the mapping in Redux; send only pseudonymized text to the backend.
4. Stream the OpenAI response over a GraphQL subscription keyed by `streamId`.
5. Restore original values in the browser before displaying the reply.

