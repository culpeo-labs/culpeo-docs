---
sidebar_position: 2
---

# Protocol Specification

**Version:** 0.3.0-draft  
**Status:** Draft  
**Source of truth:** [culpeo-labs/culpeostream-spec](https://github.com/culpeo-labs/culpeostream-spec/blob/main/spec/culpeostream-spec.md)

---

## Overview

CulpeoStream is transport-agnostic. Its frame format and session model are defined independently of any specific transport. The canonical binding is WebSocket.

## Frame Format

Every frame follows the same structure:

```
(<header-name>: <header-value>\r\n)*
\r\n
<body>
```

- Headers are `\r\n`-terminated key-value pairs (HTTP-inspired, case-insensitive)
- The header block is terminated by a bare `\r\n`
- For control/event frames the body is UTF-8 JSON; for media frames it is raw bytes

### Core headers

| Header | Required | Description |
|--------|----------|-------------|
| `Frame-Type` | Yes | `connect`, `connected`, `media`, `event`, `ping`, `pong`, `close` |
| `Session-Id` | See spec | Server-assigned; echoed by client on resume |
| `Stream-Id` | Media frames | Server-assigned stream identifier |
| `Content-Type` | Media frames | MIME type of the payload |
| `Offset` | Media/resume | Frame sequence number (uint64) |

## Session Lifecycle

```
Client                       Server
  │                             │
  │── CONNECT ─────────────────>│  declare streams, auth token
  │<─ CONNECTED ────────────────│  assign session-id + stream-ids
  │                             │
  │<─ MEDIA (stream A) ────────>│  bidirectional media frames
  │── MEDIA (stream B) ────────>│
  │                             │
  │   [connection drop]         │
  │                             │
  │── CONNECT (resume) ────────>│  session-id + per-stream offsets
  │<─ CONNECTED ────────────────│  resume from last acked offset
  │                             │
  │── CLOSE ───────────────────>│
  │<─ CLOSE ────────────────────│
```

## Streams

Streams are declared in the `CONNECT` frame. Each stream has:
- A **content-type** (e.g. `audio/pcm`, `text/plain`)
- A **direction** (`client-to-server`, `server-to-client`, `bidirectional`)
- An optional **purpose** hint string

The server assigns numeric stream IDs in the `CONNECTED` response.

## Authentication

Described in Addendum A of the spec. CulpeoStream uses a challenge-response pattern with rotating nonces and configurable token lifetimes.

## Full specification

The complete specification — including all frame types, error codes, session resumption semantics, ping/pong latency measurement, event system, and transport addenda — lives in the spec repository:

**[culpeostream-spec.md](https://github.com/culpeo-labs/culpeostream-spec/blob/main/spec/culpeostream-spec.md)**
