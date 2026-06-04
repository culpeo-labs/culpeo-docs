---
sidebar_position: 2
---

# C# / .NET

**Repository:** [culpeo-labs/culpeostream-csharp](https://github.com/culpeo-labs/culpeostream-csharp)

ASP.NET Core implementation with NativeAOT support and a Roslyn source generator for handler scaffolding.

## Packages

| Package | Description |
|---------|-------------|
| `CulpeoStream.Core` | Frame parser, session state machine |
| `CulpeoStream.AspNetCore` | ASP.NET Core middleware and DI integration |
| `CulpeoStream.Client` | .NET client library |
| `CulpeoStream.SourceGen` | Roslyn source generator (`[CulpeoStreamHandler]`) |

## Server setup

```csharp
// Program.cs
builder.Services.AddCulpeoStream();
app.MapCulpeoStream("/culpeo");
```

## Handler

```csharp
[CulpeoStreamHandler]
public class TranscriptionHandler : CulpeoStreamHandlerBase
{
    [DeclareStream(ContentType = "audio/pcm", Direction = StreamDirection.ClientToServer)]
    [DeclareStream(ContentType = "text/plain", Direction = StreamDirection.ServerToClient)]
    public override async Task OnConnectAsync(ICulpeoStreamSession session)
    {
        await CulpeoRegisterStreamIds(session);
    }

    public override async Task OnAudioAsync(ICulpeoStreamSession session, ReadOnlyMemory<byte> data)
    {
        var transcript = await _asr.TranscribeAsync(data);
        await session.SendMediaAsync(_textStreamId, transcript);
    }
}
```

## Source generator diagnostics

| Code | Meaning |
|------|---------|
| CULPEO001 | Missing `[CulpeoStreamHandler]` attribute |
| CULPEO002 | Handler does not implement `CulpeoStreamHandlerBase` |
| CULPEO003 | Invalid `[DeclareStream]` combination |
| CULPEO004 | Method suffix collision between declared streams |

## NativeAOT

The implementation is NativeAOT-compatible. JSON serialization uses source-generated contexts (`CulpeoClientJsonContext`). All reflection-based paths have been eliminated.

## Building

```bash
git clone https://github.com/culpeo-labs/culpeostream-csharp
cd culpeostream-csharp
dotnet build
dotnet test
```
