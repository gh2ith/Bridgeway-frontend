# Bridgeway Platform — Master Front-End Handover & Architecture Guide

> **Workflow correction (October 10, 2026):** The user confirmed that only the host company accepts or rejects internship applications. Supervisors review training reports, not applications, and view company-submitted evaluations read-only. Applying creates a pending application. College supervisor assignment/placement administration is separate from the company's hiring decision. The student approval callout, confirmation modal, homepage application preview/FAQ, and conflicting specification have been corrected. See root `AGENTS.md` for the maintained rules. Older descriptions below and backup archives are historical, not implementation instructions.

> **Design fixes completed:** `portal-refinement.css` now contains sidebar badge containment, compact mobile header, task-tab metric visibility, dark evaluation colors, sticky mobile table identities, and posting proportions. `portal-consistency.js` renders a searchable two-line evaluation roster and conditional table scroll hints. Native selection remains hidden as the compatibility state for existing handlers. All state remains page-local; public homepage/login are unchanged.

> **Frontend audit corrections complete (October 9):** `portal-consistency.js` aligns directory search, report selection, listing applicant context, preview edit links, counts, and role-specific settings. Shared sample records remain fixed and reset on reload. Modal background isolation is in `portal-refinement.js`. See `design-walkthrough-report.md` for the second, design-focused audit; backend-dependent actions are intentionally excluded from defects. Homepage/login and protected shared files are unchanged.

> **Supervisor evaluations:** Sidebar Evaluations opens `#tab-endorsement`. `supervisor-evaluations.js` holds fixed submitted/pending examples; `supervisor-evaluations.css` styles the searchable directory and read-only eight-criterion assessment. Scores/comments cannot be edited. The previous Edit Rubric modal and endorsement checkbox were removed. Student rows link directly to their evaluation. Backend submission integration remains pending.

> **UI/UX Pro Max refinement:** All eleven portal pages load `portal-refinement.css` and `portal-refinement.js`. These add the shared typography/spacing system, readable controls and tables, responsive collapsed navigation, context headings, skip link, and modal keyboard handling. `portal-design-system.md` records design decisions. Homepage and login are excluded; their source and shared stylesheet hashes were verified unchanged.

> **Partnership follow-up:** `partnership-data.js` defines shared static organizations, links, and student placement ownership. `portal-cycle.js` scopes company applicants/interns, college directories, partner views, and notification previews. Company applicants may be reviewed only for the host's listings; only confirmed interns appear in weekly reports/evaluations. College pages show their own students/supervisors. Partner colleges never expose their entire directory to companies. Platform Admin can pause/resume links and inspect the role-specific cycle preview; effective access also depends on active organization accounts. Posting screens name the partner audience and students see active partner opportunities. Pausing prevents new activity in the preview model while preserving existing placement records. All pages reload the same baseline fixtures, with no synchronization or persistent read state. Backend must enforce ownership and lifecycle transitions server-side.

> **Current five-role portal update:** `platform-admin.html`, `platform-admin.css`, and `platform-admin.js` implement Platform Admin previews. `portal-unified.css` and `portal-unified.js` extend the company design to all remaining portal pages. The homepage and login stylesheet are preserved; login only gains the fifth role and College Admin wording. `account-settings.html?role=platform_admin` uses role context for presentation only, never authorization. Account creation, access changes, partnerships, and issue updates reset on reload. Recovery sends no email. Progress and verification are recorded in `portal-redesign-progress.md`.

> **Current UI refinements:** Light theme is the default on all entry pages. Theme controls use plain sidebar text. Company evaluations are college-required **end-of-term evaluations**, with a searchable, bounded student roster next to the form instead of student cards. Both company applications views have simplified table styling. Preserve the frontend-only scope; do not introduce new workflows without a user request.

> **October 9, 2026 update — current implementation:** The company dashboard content has been redesigned with a restrained header, compact metrics, searchable listing rows, and consistent light/dark styling. The original floating sidebar is preserved. `company-workspace.css` and `company-workspace.js` contain the company-specific presentation changes.
>
> **Frontend-only requirement:** Browser persistence has been removed from the source, including the shared `DB` abstraction and saved theme preferences. There is no local storage, session storage, cookie-based state, or cross-page data synchronization. Existing records are static examples; UI interactions reset on reload. Posting forms validate inputs and display a backend-pending message without saving or claiming to publish. Connect actual data, authentication, and submissions to the future backend. The persistence and cross-page workflow descriptions below are historical and no longer describe the running prototype.

**Platform:** Bridgeway — Academic Internship & Cooperative Education Management System  
**Client / Institution:** Al-Balqa Applied University (BAU) Partner Network  
**Reference Ground Truth:** `Backupway2` ASP.NET Core Project (`WebApplication1`)  
**Specification Document:** [`backupway2_functionality_spec.md`](backupway2_functionality_spec.md)  
**Target Codebase:** `c:\Users\user\Downloads\Bridgeway-Front-end-main`  
**Tech Stack:** Pure Semantic HTML5, Vanilla CSS3 (Custom Properties & Design Tokens), Vanilla JavaScript (ES2024), static examples (`users.json`) with temporary in-memory UI state.  
**Date:** October 9, 2026  
**Status:** Frontend prototype; backend integration pending

---

## 1. Executive Summary & Purpose

**Bridgeway** is an enterprise-grade academic internship and cooperative education portal engineered to bridge higher education with industry employers. It coordinates five core stakeholders:
1. **Undergraduate Students:** Browse curated opportunities, track application pipelines, log training progress across an 8-week curriculum, and review company mentor evaluations.
2. **Academic Supervisors (Faculty):** Oversee assigned trainees, review and verify company-submitted training reports, request report revisions, and view company-submitted evaluations. They do not accept or reject internship applications.
3. **Host Partner Companies (Employers):** Publish vetted internship postings, review student applicant profiles, log weekly progress notes, and execute standardized 8-dimension final evaluation rubrics.
4. **College Admin:** Manage students and supervisors within the college, assign academic advisors, and oversee academic placements.
5. **Platform Admin:** Create company and college accounts, manage access and administrator contacts, maintain partnerships, monitor aggregate totals, and handle escalated issues. No company approval flow or administrative activity log.

The original four-role reference is extended by the user-approved Platform Admin role. This prototype does not implement backend authorization.

---

## 2. Platform Architecture & File Catalog

```
c:\Users\user\Downloads\Bridgeway-Front-end-main\
├── 📄 backupway2_functionality_spec.md    # Comprehensive backend parity & entity mapping spec
├── 📄 handover.md                         # Master site handover document (this file)
│
├── 🌐 Public & Authentication Views
│   ├── index.html                         # Platform landing page (Figma-faithful animations)
│   ├── login.html                         # 5-Role authentication portal (3D pendulum lanyard physics)
│   ├── login.css                          # Dedicated styles for lanyard simulation & 2x2 role grid
│   └── login.js                           # Lanyard physics engine & credential quick-fill router
│
├── 🎓 Student Experience
│   ├── student-dashboard.html             # Student portal (Opportunities, Applications, 8-Wk Progress)
│   └── student-profile.html               # Student academic SIS profile & advisor oversight details
│
├── 👨‍🏫 Faculty Supervisor Experience
│   └── supervisor-dashboard.html          # Supervisor portal (Roster, Weekly logs review, Rubric cert)
│
├── 🏢 Host Partner Company Experience
│   ├── company-dashboard.html             # Ground-up redesigned portal (Masar sidebar, KPIs, Rubric HUD)
│   ├── company-candidates.html            # Dedicated candidate directory & applicant screening
│   ├── company-post-role.html             # Internship posting publication form
│   └── company-profile.html               # Corporate profile & industry settings
│
├── 🏛️ University Administration Experience
│   ├── admin-dashboard.html               # Admin portal (6 entity tabs & cascading confirm modals)
│   └── admin-register-student.html        # Direct undergraduate student provisioning form
│
├── ⚙️ Shared Utilities & Settings
│   ├── account-settings.html              # Account password change & security preferences
│   ├── styles.css                         # Global tokens, typography, buttons, badges, theme variables
│   ├── portal.css                         # Shared portal design system (dashboards, modals, tables, HUDs)
│   ├── portal.js                          # Shared client controller (tabs, modals, toasts, DB persistence)
│   ├── script.js                          # Landing page micro-interactions & smooth scroll
│   └── users.json                         # 8 seeded authentic accounts (matched to DbSeeder.cs)
```

---

## 3. Site Navigation & Page-by-Page Specifications

| # | File | Stakeholder | Key Features & Modules | Key Modals |
|---|------|-------------|------------------------|------------|
| 1 | [`index.html`](index.html) | Public | Hero banner, suspension bridge SVG logo, role benefits, active employer ticker, curriculum highlights, quick login CTA. | None |
| 2 | [`login.html`](login.html) | All Roles | Interactive 3D lanyard pendulum physics, card flip, 2x2 role switcher (`Student`, `Supervisor`, `Company`, `Admin`), auto-fill credentials. | None |
| 3 | [`student-dashboard.html`](student-dashboard.html) | Student | Full-width workspace, 4 KPI cards, Tab 1 (Curated Opportunities with seat capacity meters), Tab 2 (My Applications with status pills & withdrawal action), Tab 3 (Training Progress: 8-week graduation gauge, weekly log cards, read-only 8-dimension rubric). | `#applyModal`, `#withdrawModal` |
| 4 | [`student-profile.html`](student-profile.html) | Student | SIS academic record, editable bio/skills, read-only institutional data (GPA 3.75, Dept, Advisor Dr. Tariq Al-Husseini, SIS ID #20220148). | None |
| 5 | [`supervisor-dashboard.html`](supervisor-dashboard.html) | Supervisor | 4 KPI cards, Tab 1 (Supervised Students Roster with live search), Tab 2 (Weekly Reports Oversight: intern switcher, 8-week timeline track, deliverables review, "Approve & Verify" action), Tab 3 (Degree Endorsement & Rubric). | `#requestRevisionModal`, `#editRubricModal`, `#supervisorProfileModal` |
| 6 | [`company-dashboard.html`](company-dashboard.html) | Company | **Redesigned from 0**: Floating Masar.hr sidebar card, Command Header card with `TC` monogram, 4 interactive KPI lenses, Tab 1 (Active Listings with Edit/Close/Delete), Tab 2 (Manage Candidates with search & filters), Tab 3 (Weekly Progress Log master-detail), Tab 4 (Final 8-Dimension Rubric with live score HUD & feedback prompt chips). | `#postJobModal`, `#deletePostModal`, `#hrMeetingsModal`, `#companyPoliciesModal`, `#feedbackModal` |
| 7 | [`company-candidates.html`](company-candidates.html) | Company | Dedicated applicant directory, GPA filters, status badges, applicant detail drawer. | `#hrMeetingsModal` |
| 8 | [`company-post-role.html`](company-post-role.html) | Company | Comprehensive internship posting form matching `Company/CreatePost.cshtml` (Title, Description, Requirements, Location, Capacity, Deadline). | None |
| 9 | [`company-profile.html`](company-profile.html) | Company | Corporate legal settings, office location, industry classification, locked institutional email. | None |
| 10 | [`admin-dashboard.html`](admin-dashboard.html) | Admin | University governance portal (`admin@uni.edu`), 6 Entity Management Tabs (Users, Students, Companies, Supervisors, Posts, Placements). | `#deleteModal`, `#terminateModal`, `#unassignModal`, `#registerStudentModal` |
| 11 | [`admin-register-student.html`](admin-register-student.html) | Admin | Student academic provisioning form matching `Admin/Index.cshtml` `OnPostAddStudentAsync` (Name, Department, GPA, College, Initial Password). | None |
| 12 | [`account-settings.html`](account-settings.html) | All Roles | Password management, session security, notification toggles, theme switcher. | None |

---

## 4. Architectural Highlights & Key Inventions

### A. The Linear & Stripe SaaS Standard (Company Portal Redesign)
The Partner Company Portal ([`company-dashboard.html`](company-dashboard.html)) was completely rebuilt from scratch applying premier SaaS design patterns:
1. **Masar Floating Sidebar Card:**
   - Independent floating card (`border-radius: 28px; border-bottom: 5.5px solid #0066FF; box-shadow: 0 10px 32px rgba(0, 0, 0, 0.05);`).
   - Clean flexbox grouping (`.bw-masar-top` and `.bw-masar-bottom-group`) with `justify-content: space-between`, ensuring generous, natural whitespace before the hairline divider.
   - Exact navigation rhythm: `Dashboard`, `Manage Applicants`, `Weekly Reports`, `Task Evaluations`, `Post Internship`, followed by `Profile`, `Dark Mode`, and `Logout`.
   - Responsive hamburger collapse toggle (`#bwSidebarToggle`) shrinking width to 78px with centered icons.
2. **Command Header Card:**
   - Monogram avatar box (`TC` in electric blue gradient with ambient drop shadow).
   - Live status indicator: `● Active Employer Sponsor • Fall 2026 Cycle`.
   - Direct tactile action buttons: `+ Post New Internship` (gradient CTA), `Candidate Interviews`, and `Guidelines & Policies`.
3. **Interactive 4-Lens KPI Metric Strip:**
   - Cards act as interactive navigation triggers, synchronized with tabs via `.is-active-kpi`.
   - Live trends: `+1 this week`, `10 Pending`, `4 of 4 Placed`, `3 In Review`.
4. **Real-Time Rubric Scoring HUD (Heads-Up Display):**
   - Cumulative live score (`/ 40 pts`) with dynamic grade tier calculation:
     - 36–40 pts &rarr; `Distinction A+`
     - 32–35 pts &rarr; `Excellent A`
     - 28–31 pts &rarr; `Very Good B+`
     - 24–27 pts &rarr; `Good B`
     - < 24 pts &rarr; `Passing C`
   - Animated progress bar tracking evaluated dimensions (`X of 8 Dimensions Evaluated`).
   - 8 Standardized criteria rows with 5 color-coded rating pills:
     - 1: Coral Red (`#ef4444`)
     - 2: Warm Amber (`#f59e0b`)
     - 3: Sky Blue (`#0284c7`)
     - 4: Deep Indigo (`#4f46e5`)
     - 5: Emerald Green (`#10b981`)
   - Testing tools: `Quick Fill (4–5)` for instant demonstration and `Reset`.
   - Qualitative mentor feedback with 3 one-click recommendation prompt chips.
5. **2-Column Master-Detail Weekly Reports Workspace:**
   - Left column features intern roster cards displaying individual progress bars (e.g. 160h/320h, 240h/320h) and completed weeks.
   - Right column provides the official weekly curriculum logbook form.

### B. Student Experience Improvements
1. **Full-Width Decluttered Workspace:** Removed the cramped left profile card, expanding the layout into an expansive, modern workspace.
2. **Segmented Control Tabs:** Pill tabs with gradient active states, badge counters, and smooth transitions.
3. **Application Withdrawal Workflow:** Added interactive "Withdraw" button with `#withdrawModal` confirmation dialog that updates the table and KPI in real time.
4. **Training Progress Curriculum Tab:** Displays an 8-week graduation progress gauge, weekly log cards (Week 1–8), and an official 8-dimension host evaluation rubric card with composite grade `Excellent A+` (4.85 / 5.0).

### C. Supervisor Experience Improvements
1. **Streamlined Header:** Eliminated redundant "Dashboard" text from the top navigation bar, replacing it with the dynamic vector brand logo and faculty profile link (`#supervisorProfileModal`).
2. **Role Boundaries Protected:** Permanently removed unassign capabilities from supervisor screens (supervisor assignment is strictly administered by University Admin).
3. **Full-Width 3-Tab Structure:**
   - Tab 1: Supervised Students Roster (real-time search filter `#rosterSearchInput`, GPA badges, 8-week progress meters).
   - Tab 2: Weekly Reports Oversight (intern switcher chips, 8-week visual timeline track, deliverables review, `#requestRevisionModal`, and "Approve & Verify" action).
   - Tab 3: Degree Endorsement & Rubric (Grade 94/100, 8-criterion matrix `#editRubricModal`, and SIS 3.0 academic credit endorsement checkbox).

### D. Official Brand Logo Standard
- Integrated the authentic Bridgeway Suspension Bridge & Graduation Cap vector SVG across all portals (`.logo--nav`).
- Implemented dynamic SVG fill inversion in [`portal.css`](portal.css): in dark mode, the graduation cap and wordmark automatically fill `#f8fafc`.
- Permanently purged all obsolete raster PNG logos (`assets/logo.png`, `assets/bridgeway-logo-dark.png`, etc.) from the repository.

---

## 5. Client-Side State Persistence Engine (`portal.js`)

The platform includes a lightweight, zero-dependency `localStorage` persistence engine (`DB`) that allows realistic end-to-end demonstrations across separate browser tabs and pages without requiring an active database server:

```javascript
// Lightweight Storage Abstraction in portal.js
const DB = {
  get: (key, fallback) => { ... },
  set: (key, val) => { ... },
  push: (key, item) => { ... }
};
```

### Cross-Page Reactive Workflows:
1. **Opportunity Creation:** Publishing an internship in [`company-post-role.html`](company-post-role.html) or via `#postJobModal` automatically persists to `DB('posts')` and immediately renders as an active opportunity card in both [`student-dashboard.html`](student-dashboard.html) and [`company-dashboard.html`](company-dashboard.html).
2. **Student Applications:** Clicking "Apply Now" in [`student-dashboard.html`](student-dashboard.html) persists to `DB('applications')`, updates "My Applications" tab, decrements open capacity, and immediately appears in [`company-candidates.html`](company-candidates.html) and [`company-dashboard.html`](company-dashboard.html) Tab 2.
3. **Student Provisioning:** Registering an undergraduate student in [`admin-register-student.html`](admin-register-student.html) or via `#registerStudentModal` injects the student into the active roster in [`admin-dashboard.html`](admin-dashboard.html) and increments the Total Students KPI.
4. **Theme Synchronization:** Theme preference (`light` or `dark`) is persisted in `localStorage('bridgeway_theme')` and applied across all 12 pages automatically.

---

## 6. Design System Tokens & Styling Guide

The design system is defined using CSS Custom Properties in [`styles.css`](styles.css) and [`portal.css`](portal.css):

### Color Tokens
| Token | Light Value | Dark Value | Semantic Purpose |
|:---|:---|:---|:---|
| `--bw-primary` | `#0066FF` | `#3B82F6` | Primary action, active tabs, brand accent |
| `--bw-primary-light` | `rgba(0, 102, 255, 0.08)` | `rgba(59, 130, 246, 0.15)` | Active tab pills, soft card backgrounds |
| `--bw-bg` | `#f8fafc` | `#0f172a` | Main canvas background |
| `--bw-surface` | `#ffffff` | `#1e293b` | Elevated cards, dialogs, sidebars |
| `--bw-border` | `#e2e8f0` | `rgba(255, 255, 255, 0.08)` | Hairline dividers, card outlines |
| `--bw-text` | `#0f172a` | `#f8fafc` | Primary titles and high-contrast labels |
| `--bw-text-muted` | `#64748b` | `#94a3b8` | Subtitles, metadata, micro-copy |
| `--bw-success` | `#10b981` | `#10b981` | Accepted status, approved reports, 5-star rating |
| `--bw-warning` | `#f59e0b` | `#f59e0b` | Pending review, midterm milestones, 2-star rating |
| `--bw-danger` | `#ef4444` | `#ef4444` | Deadlines, deletion modals, 1-star rating |

### Typography
- **Headings & Monograms:** `'Montserrat', sans-serif` (Weights: 600, 700, 800)
- **Body & Controls:** `'Plus Jakarta Sans', sans-serif` (Weights: 400, 500, 600, 700)
- **Data & Tables:** `'Inter', sans-serif` (Weights: 400, 500, 600)

---

## 7. Quality Assurance & Verification Results

1. **Link Integrity Audit:**
   - Ran `check_links.ps1` automated audit across all 12 HTML files.
   - **Result:** `ALL LINKS VALID! 0 broken file links found across all 12 HTML files.`
2. **Responsive Layouts:**
   - Desktop (&ge; 1280px): Spacious 2-column workspace with floating sidebar and 4-column KPI grids.
   - Tablet (768px – 1024px): 2-column opportunity cards, responsive table trays.
   - Mobile (&le; 640px): Sidebar stacks naturally or collapses into top drawer, cards and tables fluidly stack.
3. **Accessibility:**
   - High contrast ratios (WCAG AA compliant in both light and dark modes).
   - Full keyboard accessibility on tabs, buttons, inputs, and modal dismiss buttons (`Escape` / `backdrop click`).
   - Semantic HTML5 landmark elements (`<aside>`, `<main>`, `<nav>`, `<header>`, `<section>`).

---

## 8. Backend Integration Roadmap (ASP.NET Core Handover)

When connecting this front-end prototype to an ASP.NET Core backend (such as `Backupway2`), map the client interactions to the following Razor Page handlers and Controller endpoints:

| Front-End Trigger | Current Mock Behavior | Target ASP.NET Core Endpoint | HTTP Method |
|---|---|---|---|
| Role Login (`login.html`) | Redirects to role dashboard | `/Identity/Account/Login` | `POST` |
| Apply to Job (`#applyModal`) | `DB.push('applications')` | `Student/Index?handler=Apply` | `POST` |
| Withdraw App (`#withdrawModal`) | Row removed from DOM | `Student/Index?handler=Withdraw` | `POST` |
| Submit Weekly Report | Toast feedback | `Company/Index?handler=SubmitReport` | `POST` |
| Verify Weekly Report | Pill changes to "Verified" | `Supervisor/Index?handler=VerifyReport` | `POST` |
| Request Revision Modal | Modal dismissed & toast | `Supervisor/Index?handler=RequestRevision` | `POST` |
| Submit Final Evaluation | Rubric certified & toast | `Company/Index?handler=SubmitEvaluation` | `POST` |
| Create Post (`#postJobModal`) | `DB.push('posts')` | `Company/CreatePost?handler=OnPostAsync` | `POST` |
| Delete Post (`#deletePostModal`) | Card removed & KPI decremented | `Company/Index?handler=DeletePost` | `POST` |
| Register Student Form | `DB.push('users')` | `Admin/Index?handler=AddStudent` | `POST` |
| Unassign Supervisor | Row removed & toast | `Admin/Index?handler=UnassignSupervisor` | `POST` |
| Terminate Placement | Modal confirmed & toast | `Admin/Index?handler=TerminatePlacement` | `POST` |

---

## 9. Conclusion & Maintainer Checklist

The Bridgeway front-end codebase is clean, elegant, robust, and completely self-contained. It contains zero external runtime library dependencies (no heavy React/Vue runtime, no npm build bloat, no Tailwind dependencies), making it immediately servable via any static server (IIS, Nginx, Azure Static Web Apps, GitHub Pages, or ASP.NET Core `wwwroot`).

### Quick Start for Developers:
```bash
# To run locally with any HTTP server:
npx -y serve ./
# or
python -m http.server 8080
# Open http://localhost:8080/index.html in any modern browser
```
All assets, stylesheets, scripts, and fonts load instantly with zero console errors.


## Simplified company applicant actions
- Three presentation statuses: Applied, Awaiting placement, Active intern.
- Applied: Accept applicant. Awaiting placement: College confirmation pending (plain text). Active intern: Log report for the correct student.
- Dashboard Zoom meeting buttons retained and explicitly labelled. Evaluations remain in the Evaluations section. Both application views and filters use the same status wording.
- Verified acceptance and awaiting-placement filtering in both views; preview only, reset on reload.
