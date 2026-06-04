---
sidebar_position: 3
---

# Security

The security analysis for CulpeoStream lives in [culpeo-labs/culpeostream-spec](https://github.com/culpeo-labs/culpeostream-spec/tree/main/security).

## Threat model

CulpeoStream's threat model covers:

- **Authentication bypass** — token theft, nonce reuse, replay attacks
- **Session hijacking** — forged session IDs on resumption
- **Denial of service** — unbounded message accumulation, rate limit bypass, stream flooding
- **Information disclosure** — error message leakage, timing side-channels
- **Memory safety** — C API bounds violations, integer truncation

Full threat model: [`security/threat-model.md`](https://github.com/culpeo-labs/culpeostream-spec/blob/main/security/threat-model.md)

## Required security tests

All implementations must pass a shared set of security test cases covering:

- Malformed frame rejection
- Auth token expiry enforcement  
- Session resume ownership verification
- Rate limiting under flood conditions
- Header injection prevention

Full list: [`security/required-security-tests.md`](https://github.com/culpeo-labs/culpeostream-spec/blob/main/security/required-security-tests.md)

## Reporting vulnerabilities

Please open a private security advisory on the affected repository via GitHub's **Security → Report a vulnerability** feature.
