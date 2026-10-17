# Changelog

All notable changes to the **SamityWheel** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-17

### Added
- **Core Micro-Savings Architecture**:
  - Full relational data model using Prisma ORM with SQLite backend (`User`, `Samity`, `SamityMember`, `Deposit`, `Winner`, `Guess`).
  - Persistent authentication via phone number and password with dynamic session persistence.
  - Role-based access control where Samity Admins enjoy full member perks plus administrative oversight.
- **Deposit Management**:
  - Multi-channel deposit support: bKash, Nagad, Rocket, Bank Transfer, and In-Person Cash.
  - Dynamic admin name and phone resolution for cash handover instructions.
  - Verifiable digital deposit slips with tamper-evident visual verification stamps.
  - Administrative pending deposit verification interface with one-click approve/reject actions.
- **Lucky Wheel Lottery Engine**:
  - HTML5 canvas wheel with dynamic member segments, physics-based deceleration, tick sound effects, and confetti celebrations.
  - Admin-only official draw execution enforced via `/api/samity/[id]/draw-winner` API route.
  - Member-side "See Winner" spin animation reveal so all members can experience the excitement of the draw.
  - Exclusion of past winners in the current cycle to ensure strictly 1 win per member per cycle.
- **Cycle & Schedule Management**:
  - Cycle participant customization allowing admins to select/deselect members for active cycles.
  - Serial monthly draw date picker (e.g. 15th of every month) with dynamic calendar schedule preview.
- **"Guess the Next Winner" Mini-Game**:
  - Automatically unlocks 1 day after a monthly draw completes.
  - Lets members vote for which remaining candidate will win the next pot.
  - Displays real-time community voting breakdown percentages with progress bars.
  - Includes a developer simulator toggle for instant testing and demonstration.
- **Administrative Leadership Transfer**:
  - Atomic admin role handover to any active member via Prisma interactive transactions.
  - Automatically synchronizes samity creator ID and updates cash handover instructions across all screens.
- **Progressive Web App (PWA)**:
  - Added `manifest.json` with fintech branding, standalone display, and mobile viewport optimization.
- **Documentation & Open Source Tooling**:
  - Comprehensive `.gitignore`, `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and GitHub issue/PR templates.

---

[1.0.0]: https://github.com/your-username/SamityWheel/releases/tag/v1.0.0
