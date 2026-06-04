---
sidebar_position: 1
---

# CulpeoStream

CulpeoStream is a lightweight, bidirectional streaming protocol for real-time AI media applications.

## Key features

- **Self-describing frames** — HTTP-inspired headers on every frame; parseable without external schemas
- **Multi-stream sessions** — multiple concurrent streams of different media types in a single connection
- **Session resumption** — reconnect and resume after drops using server-assigned session IDs and per-stream offsets
- **Low-latency handshake** — session establishment in a single round trip
- **Transport-agnostic** — defined independently of transport; canonical binding is WebSocket

## Repositories

| Repo | Description |
|------|-------------|
| [culpeostream-spec](https://github.com/culpeo-labs/culpeostream-spec) | Protocol specification, security analysis, interop fixtures |
| [culpeostream-ts](https://github.com/culpeo-labs/culpeostream-ts) | TypeScript — browser + Node.js |
| [culpeostream-csharp](https://github.com/culpeo-labs/culpeostream-csharp) | C# — ASP.NET Core |
| [culpeostream-cpp](https://github.com/culpeo-labs/culpeostream-cpp) | C++ core libraries + Python bindings |

## Quick start

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="ts" label="TypeScript">

```ts
import { CulpeoStreamClient } from 'culpeostream-client';

const client = new CulpeoStreamClient('wss://example.com/culpeo');
await client.connect();
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp
// Server registration (ASP.NET Core)
builder.Services.AddCulpeoStream();
app.MapCulpeoStream("/culpeo");

// Handler
[CulpeoStreamHandler]
public class MyHandler : CulpeoStreamHandlerBase
{
    public override Task OnConnectAsync(ICulpeoStreamSession session) { ... }
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import culpeostream

client = culpeostream.WsTransport("wss://example.com/culpeo")
session = culpeostream.Session(client)
await session.connect()
```

</TabItem>
</Tabs>
