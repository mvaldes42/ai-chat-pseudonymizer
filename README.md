# AI Chat Pseudonymizer

Proof of concept for an AI chatbot that detects and pseudonymizes PII in the browser before sending text to the AI API. Original values stay on the client; only placeholders reach the backend.

This is a POC, not a production privacy system.

## Current status

The chat UI, GraphQL API, Redux store, client-side PII detection, and **streaming** OpenAI replies are in place.

1. Detect PII in the browser with [`onnx-community/bert-small-pii-detection-ONNX`](https://huggingface.co/onnx-community/bert-small-pii-detection-ONNX) via Transformers.js.
2. Replace entities with placeholders such as `[PERSON_1]` and `[EMAIL_ADDRESS_1]`.
3. Keep the mapping in Redux; send only pseudonymized text to the backend.
4. Subscribe over WebSocket. The server streams OpenAI (`gpt-5-nano`) tokens. Conversation context stays on OpenAI via `previous_response_id`.
5. Decode placeholders on the **accumulated** reply (so a token split like `[PER` + `SON_1]` still restores), and grow the assistant bubble in the UI.

The first message can be slow while the browser downloads the ONNX model.

## Stack

**Frontend:** React, TypeScript, Create React App, Redux Toolkit, Apollo Client, ChatScope, Transformers.js, graphql-ws

**Backend:** Node.js 22, TypeScript, Express, Apollo Server, GraphQL, OpenAI SDK, graphql-ws

No database. Chat state and PII mappings live in Redux on the client.

## Getting started

Requires [Node 22](https://nodejs.org/) (see `.nvmrc`).

```bash
npm install
cp .env.example .env
npm run dev
```

Set `OPENAI_API_KEY` in `.env`. The server uses it to call OpenAI.

- App: [http://localhost:3000](http://localhost:3000)
- GraphQL: [http://localhost:4000/graphql](http://localhost:4000/graphql)
- Subscriptions: `ws://localhost:4000/subscriptions`

### Scripts

| Command          | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `npm run dev`    | Start GraphQL server and React app together                                 |
| `npm run server` | Start Apollo Server on port 4000 (`tsx watch` restarts when `server/` changes) |
| `npm start`      | Start the React app on port 3000 (CRA already hot-reloads `src/`)           |
| `npm run build`  | Production build of the frontend                                            |

## Future ideas (not in scope)

These will not be implemented here. They are useful constraints if this were more than a POC.

**Placeholders hide strings, not meaning.** “I am `[PERSON_1]`, I live in `[LOCATION_1]`, I work at the hospital on that street” can still identify someone. Coreference (“he”, “my boss”) never hits the NER model. Placeholder types (`PERSON`, `EMAIL_ADDRESS`) leak metadata to the API. A serious version would treat this as risk reduction, not anonymization: a threat model, residual-risk examples, maybe type-less tokens (`[E_1]`) so the API does not even learn the category.

**The mapping is the real secret, and it only lives in Redux.** A refresh, another tab, or a second device and you cannot decode old replies — or you persist chats without the vault and they stay full of `[PERSON_1]`. Saving history would need an encrypted client vault (IndexedDB / passphrase) that the backend never sees. Sync across devices then becomes key management and recovery.

**Browser NER distributes compute, which is good; UX and quality do not come for free.** The ONNX file is downloaded per user, the pipeline is created on the send path, and a small BERT will miss names, non-English text, and messy messages. Worth considering: load the model once (Web Worker / SharedWorker), WebGPU, a second pass for emails/phones with regex, and a fallback that refuses to send when confidence is low. Moving detection to the server would be easier to operate and would destroy the main claim of this POC.

**`previous_response_id` couples the app to OpenAI’s stored session.** The GraphQL API is stateless and would scale horizontally; conversation memory lives at OpenAI and can expire or fail. A real product would keep a local (already pseudonymized) transcript and send a bounded window of messages itself.

**Placeholders fight the model.** Long chats, invented tokens, and a naive `\[...\]` replace will smash markdown, citations, and code. A reserved token alphabet, round-trip tests, and treating an unknown placeholder in the reply as an error would be more robust.

**Demo UX vs a real product.** The mapping footer is useful here and dangerous in a screenshot. Anything beyond a POC would need per-conversation maps, a “what left this machine” inspector, no PII in logs, auth, rate limits, and an explicit warning that this is not a HIPAA/GDPR control.
