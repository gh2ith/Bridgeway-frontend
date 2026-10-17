# Partnership review exports

Platform Admin → **Partnerships → Export partnership workbook** downloads an offline `.xlsx` snapshot. The blue **Export filtered register** action on Student register remains CSV. No remote spreadsheet service or network library is required.

## Review question

For a company’s concern about a college’s trainees, examine the exact placements and dates, the agreed learning plan, company-declared attendance, supervisor-reviewed training evidence, and the support conversation. Do not infer misconduct from a withdrawn placement or unverified complaint.

The workbook includes five different record grains:

- **Partnerships:** one row per company–college pair, organization contacts and access, unique students trained, placements, outcomes, verified hours, attendance coverage and linked-ticket counts. Includes historical-only pairs even without a current partnership.
- **Placements:** one row per placement, including returning students, role, dates, outcome/reason, available academic supervisor and final company assessment.
- **Weekly evidence:** one row per placement/week. Objectives, company completion/evidence, supervisor assessments and review notes, student visibility, and company-entered attendance. A missing historical plan is explicitly flagged.
- **Ticket review:** one row per explicitly linked ticket. Allegation, category, period, evidence, attributed responses, finding, action/owner/due date and the dated conversation.
- **Definitions:** scope, calculation definitions, missing-data rules, limitations, and real university references.

## Recording evidence in the frontend

Company → Weekly Reports → choose a student/week → **Attendance**. Scheduled hours must equal attended + excused + unexcused hours. Late arrivals are incident counts. An evidence/schedule reference is required. Attendance is a company declaration, not independently verified, and does not change verified report hours. Revisions retain earlier values in session state. Verified/closed reports are read-only.

Company → **Ask Platform Admin** on a report, or Support tickets → New ticket. Classify the concern and link the report or college–company pair. The first message is the reported concern, never an automatic finding.

Platform Admin → Tickets → choose the conversation → **Review evidence & follow-up**. Record period, reviewed evidence, student and college responses with their sources, finding, and action owner/due date. A finding requires evidence notes; a follow-up action requires an owner and due date. Review changes retain prior notes in session state. This does not send a request to either party or alter anyone’s placement.

## Calculation and scope rules

- Unique students trained is a distinct student count among recorded placements, not applicants or completed students only.
- Completion rate uses completed / (completed + left), excluding active placements. No closed placements means unavailable, not zero.
- Missing attendance is unknown, not perfect attendance or zero absence. Absence totals describe recorded weeks only.
- Verified hours come only from the matching current/archived plan or an explicitly retained historical total. Never substitute current hours for an older placement.
- The optional date range selects **placement start dates**. It is a cohort filter, not an attendance-date filter. General partnership tickets without a selected placement are excluded for date-filtered cohorts.
- Free-text ticket mentions are never guessed as links. Unlinked tickets are excluded. Current sample supervisor/college assignments are not fabricated for historical placements.
- XLSX cells use typed numbers/dates and literal strings; no user-controlled formulas, macros, or external connections. Headers and the first identifier column freeze; filters and fitted wrapped rows support inspection.
- Exports are static sample snapshots, not a live Excel integration. Re-export after preview changes. Session simulation is not backend persistence, real authorization, notification delivery, or organization-wide synchronization. Organization/link edits still reset on reload.

## Real-world design references

- [Florida State University employer evaluation](https://dedman.fsu.edu/academics/internship-work-experience/employer-evaluation-form): employer/student identity, placement dates and hours, attendance and punctuality as separate observations, supervisor identity and improvement remarks.
- [Penn State Brandywine site-supervisor responsibilities](https://www.brandywine.psu.edu/acs-internship-supervisor-role): agreed learning objectives, appropriate work schedules, supervision and prompt reporting of problems to the faculty instructor.

These examples inform the data fields, not Bridgeway’s hiring or approval rules. No institution’s grading scheme or policy is adopted.

Run `node tools/check-partnership-export.mjs`, `node tools/check-site.mjs`, and `node tools/check-workflow.mjs` after relevant changes.
