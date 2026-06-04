---
sidebar_position: 3
---

# C++

**Repository:** [culpeo-labs/culpeostream-cpp](https://github.com/culpeo-labs/culpeostream-cpp)

C++23 core library providing zero-copy frame parsing, session management, and Python bindings via pybind11.

## Libraries

| Library | Description |
|---------|-------------|
| `libculpeo-message` | Frame parser and serializer (zero-copy); C API for WASM/FFI |
| `libculpeo-session` | Session state machine and auth lifecycle |
| `libculpeo-transport-ws` | WebSocket transport (µWebSockets) |
| `libculpeo-transport-h2` | HTTP/2 transport (nghttp2) |
| `culpeostream-py` | Python bindings (pybind11) |

## Building

```bash
git clone https://github.com/culpeo-labs/culpeostream-cpp
cd culpeostream-cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
ctest --test-dir build
```

## Python bindings

```python
import culpeostream

transport = culpeostream.WsTransport("wss://example.com/culpeo")
session = culpeostream.Session(
    transport=transport,
    on_auth_validate=lambda token: True,
    on_connected=lambda session: ...,
    on_media=lambda session, stream_id, frame: ...,
)
await session.connect()
```

## C API (WASM/FFI)

`libculpeo-message` exposes a C API for use from Emscripten WASM builds and other FFI consumers:

```c
// Parse headers from a raw frame buffer
int culpeo_parse_headers(
    const uint8_t* buf, size_t buf_len,
    culpeo_header* out, size_t max_headers,
    size_t* count_out
);

// Serialize a frame into a buffer
int culpeo_serialize_frame(
    const culpeo_header* headers, size_t header_count,
    const uint8_t* body, size_t body_len,
    size_t strings_buf_len,
    uint8_t* out, size_t out_len
);
```

Enable with `-DCULPEO_BUILD_C_API=ON` (required for WASM builds).

## Requirements

- CMake ≥ 3.28
- C++23 compiler (GCC 13+ / Clang 17+)
- Python 3.10+ (for Python bindings)
