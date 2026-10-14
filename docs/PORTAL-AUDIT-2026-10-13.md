# Bridgeway portal review — 13 October 2026

Reviewed live portal code against AGENTS.md, inspected the five dashboards in the browser, and exercised report selection and verification. This is a targeted workflow and presentation audit, not exhaustive testing of every interaction.

## Corrected

- College roster omitted Lina while her student preview existed. Added Lina and her college user entry, and corrected the shared college student total.
- Omar's pending application was described as awaiting placement and offered supervisor assignment before company acceptance. Pending and newly registered students now show assignment as available after company acceptance.
- Supervisor verification reset when switching students. The current report, tracker, student picker, roster status, and buttons now retain the local review result until reload.
- Completed reports still allowed a revision request. The revision action is disabled on verified reports.
- Revision requests had fixed Week 6 text and prefilled technical notes. The dialog now refers to the selected report and requires entered notes; the local revision status is reflected in the tracker and picker.
- Sarah's current weekly report displayed the entire 320-hour total as the week's reviewed hours. It now displays 40 hours; the overall 320-hour total remains in her summary.
- Removed older endorsement language from the displayed training review statuses.
- Application confirmation used the same fallback deadline for different opportunities. It now reads the selected opportunity's displayed deadline.
- Withdrawal matched either the role or company, potentially affecting another application. It now matches both fields and only adjusts the active count for changed rows.
- Opportunity navigation retained an older count in its tooltip. It now uses the current partner-scoped opportunity count.
- Replaced misleading “Applications Sent” with “Active applications” and removed leftover term labels and the misleading Software Engineering-only opportunity description.
- The CV verification script used an outdated page extraction and lacked the browser crypto dependency. Repaired its harness and reran its metadata-only validation.

## Design observations

The report picker remains visible alongside the report on desktop. Mobile uses the existing stacked layout. The checked views had no page-wide horizontal overflow at 2560px and 480px CSS widths. Light desktop and dark phone views were inspected; these checks do not certify every size or contrast ratio.

Existing table scrolling is retained where needed rather than hiding inaccessible columns. The partnership map and existing card expansion remain in place.

## Decisions and limitations

- Report review and other preview actions remain local to a page and reset on reload. No saving, delivery, or cross-portal synchronization was introduced.
- Jitsi sample rooms are independently generated per page load. They demonstrate joining a room, but do not represent a shared delivered invitation. A real shared schedule requires a backend or an explicitly designed shared demo mechanism.
- Evaluation score-to-letter-grade thresholds remain existing sample behavior. The college's actual grading policy has not been supplied; treat these as a future product decision rather than an authoritative grading system.
- Older standalone pages and shared initialization overlap still exist. Consolidating them is a future maintenance task, separate from changing the approved user workflows.
- No deployment or GitHub upload was performed.
