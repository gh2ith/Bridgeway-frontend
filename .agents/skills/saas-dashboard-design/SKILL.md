---
name: saas-dashboard-design
description: >-
  Premier architectural and UI/UX design skill for modern SaaS dashboards, portals, and data-dense enterprise applications. Synthesizes design patterns from industry benchmarks like Linear, Stripe, and Supabase to craft high-clarity, tactile, responsive, and visually stunning dashboards.
---

# SaaS Dashboard & Portal Design System (Linear & Stripe Standard)

A definitive engineering and design guide for constructing modern, high-conversion, and aesthetically elite dashboards for enterprise platforms, B2B portals, and data-driven web applications.

---

## 1. Core Design Philosophy: "Quiet Chrome & High-Clarity Canvas"

Modern dashboards (epitomized by **Linear**, **Stripe**, and **Raycast**) reject chart bloat and visual noise in favor of **rapid scannability, functional density, and tactical ergonomics**.

### The 5-Second Test
Upon landing on any view, a user must understand within 5 seconds:
1. **Who/What** is this view for? (Clear context, verified organization badge, active cohort).
2. **What** is the primary status? (Actionable KPIs with trends, not raw disconnected numbers).
3. **What** needs immediate attention? (Pending reviews, ready-for-grading indicators, active tasks).

### Color Restraint & Semantic Purpose
- **Background & Canvas:** Subdued, calm tones (`#f8fafc` / `#0f172a` in dark mode).
- **Chrome & Cards:** Pure white or dark-slate elevated cards (`#ffffff` / `#1e293b`) with crisp, subtle borders (`border: 1px solid #e2e8f0` / `rgba(255, 255, 255, 0.08)`).
- **Accent Color:** Strict 60-30-10 rule. Use vibrant primary color (`#0066FF` / electric blue) strictly for active states, key CTAs, and primary progress bars.
- **Semantic Status Signals:**
  - `Emerald (#10b981)`: Success, Approved, Ready, Verified, High Performance.
  - `Amber (#f59e0b)`: In Progress, Under Review, Pending Action.
  - `Rose/Red (#ef4444)`: Urgent, Blocked, Needs Revision, At-Risk.
  - `Indigo/Purple (#6366f1)`: Secondary context, milestones, categories.

---

## 2. Anatomical Standards for Dashboard Views

### A. Context Header & Quick-Action Bar
- **Eyebrow Context:** Small, uppercase tracking (`0.75rem`, `font-weight: 700`, uppercase, letter-spacing: `0.06em`). Links the workspace to parent institution or partner network.
- **Verified Entity Pill:** Live status indicator (e.g., `Tech Corp Inc. • Verified Partner • Fall 2026`) with a subtle pulsing green dot.
- **Page Title & Subtitle:** Bold heading (`1.5rem - 1.75rem`, `font-weight: 800`), muted subtitle explaining exact user capabilities.
- **Prominent Primary CTA:** Top-right action button with a directional gradient, high-contrast text, tactile drop shadow, and keyboard shortcut or icon hint.

### B. Interactive KPI Metric Strip
Instead of static data blocks, KPI cards must act as **live interactive lenses**:
- **Micro-Trends & Sub-Badges:** Top-right trend badge (e.g., `+1 this week`, `10 Pending`, `100% Placed`).
- **Colored Icon Well:** 44px rounded container with a low-opacity colored background tint and vibrant icon matching the metric's semantic theme.
- **Number Hierarchy:** Large, high-impact numbers (`1.75rem - 2.1rem`, `font-weight: 800`) paired with concise label and micro-descriptor.
- **Tab Synchronization (`.is-active-kpi`):** Clicking a KPI card switches the tab and gives the KPI card an active colored border/ring, providing continuous spatial awareness.

### C. Master-Detail Workspaces & Interactive HUDs
- **Intern/Student Selector Chips:** For multi-entity review tasks (grading, evaluations, logbooks), provide avatar-driven chips with status flags (`Ready`, `Week 6`, `Review`), allowing one-click context switching without leaving the screen.
- **Real-Time Scoring HUD (Heads-Up Display):**
  - Instant calculation of cumulative points and percentage tiers.
  - Grade tier visualization (`Distinction A+`, `Excellent A`, `Very Good B+`).
  - Animated progress meter displaying completed dimensions (`X of 8 rated`).
  - Quick-Fill Demo & Reset tools for frictionless evaluation and testing.

### D. Tactile Rating Scales & Input Systems
- **Color-Coded Scale Pills:** Segmented buttons that transform from neutral cards to distinct semantic colors upon selection:
  - 1 (Weak) &rarr; Coral Red (`#ef4444`)
  - 2 (Acceptable) &rarr; Warm Amber (`#f59e0b`)
  - 3 (Good) &rarr; Sky Blue (`#0284c7`)
  - 4 (Very Good) &rarr; Deep Indigo (`#4f46e5`)
  - 5 (Excellent) &rarr; Emerald Green (`#10b981`)
- **Micro-Feedback Chips:** One-click recommendation prompt pills that inject structured qualitative feedback into textareas.

### E. Data Table Ergonomics (Stripe Standard)
- **Search & Filter Tray:** Instant client-side text filter combined with status pill filters (`All`, `Accepted`, `Pending`).
- **Scannable Row Typography:** Bold primary identity with avatar initials, secondary ID badge, clear department, and high-contrast GPA badge.
- **Action Trays:** Grouped contextual actions (e.g., `Evaluate`, `Schedule Meeting`, `Approve Seat`) with clear button hierarchies.

---

## 3. Micro-Interactions & CSS Polish Rules

1. **Card Elevation on Hover:**
   ```css
   transform: translateY(-3px);
   box-shadow: 0 14px 30px -4px rgba(15, 23, 42, 0.08);
   border-color: rgba(0, 102, 255, 0.35);
   ```
2. **Button Tap Dynamics:**
   ```css
   transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
   &:active { transform: scale(0.97); }
   ```
3. **Pill Scale Glow:**
   ```css
   box-shadow: 0 4px 14px rgba(0, 102, 255, 0.35);
   ```
4. **Dark Mode Fidelity:**
   Maintain exact contrast ratios in dark mode with deep slate backgrounds (`#0f172a`), elevated card fills (`#1e293b`), and translucent borders (`rgba(255, 255, 255, 0.08)`).
