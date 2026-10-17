# Security Policy

## Supported Versions

We take the security and integrity of **SamityWheel** very seriously, especially given its financial micro-savings and deposit verification role. The table below lists currently supported versions receiving security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🔒 Financial & Ledger Security Principles

SamityWheel adheres to core security practices designed to safeguard community funds:

1. **Role Gating & Privilege Separation**:
   - Only users with the `ADMIN` role can approve deposits, trigger the official lucky wheel draw, configure cycle participants, and transfer admin rights.
   - Non-admin attempts to invoke administrative endpoints are rejected at the API boundary with `HTTP 403 Forbidden`.

2. **Tamper-Evident Records**:
   - Deposit records require valid transaction references (`TrxID`) and are mapped to verifiable digital vouchers with creation timestamps.
   - Winner history is immutable within active cycles; winners cannot be drawn twice in the same cycle.

3. **Input Validation & Query Parameter Safety**:
   - All server routes validate incoming request payloads before executing Prisma queries.
   - Object-relational mapping via Prisma prevents SQL injection attacks.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or vulnerability in the lottery fairness algorithm, **please do not disclose it publicly in a GitHub issue**.

Instead, follow this process:

1. **Send an Email**: Send an encrypted or direct email to `security@samitywheel.internal` or reach out to the repository administrators.
2. **Include Details**:
   - A description of the issue and affected components (e.g., API route, frontend component, database model).
   - Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
   - Potential impact on user funds, lottery draws, or tenant isolation.
3. **Response Timeline**:
   - **Initial Acknowledgement**: Within 24–48 hours.
   - **Assessment & Status Update**: Within 5 business days.
   - **Fix & Disclosure**: Coordinated disclosure after a patch is released to production.

---

## 🛡️ Responsible Disclosure Policy

We ask that you:
- Give us reasonable time to investigate and mitigate an issue before making any public announcement.
- Avoid accessing or modifying data belonging to other users.
- Act in good faith to preserve data integrity and prevent service degradation.

Thank you for helping keep SamityWheel safe for our communities!
