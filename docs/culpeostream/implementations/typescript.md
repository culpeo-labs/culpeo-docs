---
sidebar_position: 1
---

# TypeScript

**Repository:** [culpeo-labs/culpeostream-ts](https://github.com/culpeo-labs/culpeostream-ts)

Browser + Node.js implementation using [`@culpeo/async-ws`](https://github.com/culpeo-labs/async-ws) for structured WebSocket communication.

## Packages

| Package | Description |
|---------|-------------|
| `culpeostream` | Core types, frame codec, session state machine |
| `culpeostream-client` | Browser + Node.js client |
| `culpeostream-server` | Node.js server middleware |
| `culpeostream-wasm` | WebAssembly-accelerated parser/serializer |
| `culpeostream-http2` | HTTP/2 transport |

## Installation

```bash
npm install culpeostream-client
```

## Client example

```ts
import { CulpeoStreamClient } from 'culpeostream-client';

const client = new CulpeoStreamClient('wss://example.com/culpeo', {
  streams: [
    { contentType: 'audio/pcm', direction: 'client-to-server', purpose: 'mic' },
    { contentType: 'text/plain', direction: 'server-to-client', purpose: 'transcript' },
  ],
});

await client.connect();

// Send audio
for await (const chunk of micStream) {
  await client.sendMedia('mic', chunk);
}
```

## Server example

```ts
import { createCulpeoStreamServer } from 'culpeostream-server';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const culpeo = createCulpeoStreamServer({
  onConnect: async (session) => { ... },
  onMedia: async (session, streamId, frame) => { ... },
});

wss.on('connection', (ws) => culpeo.handleConnection(ws));
```

## WASM parser

The `culpeostream-wasm` package provides an Emscripten-compiled WASM build of the C++ frame parser and serializer. It falls back transparently to a pure-TypeScript implementation when WASM is unavailable.

## Building

```bash
git clone https://github.com/culpeo-labs/culpeostream-ts
cd culpeostream-ts
npm ci
npm test
```
