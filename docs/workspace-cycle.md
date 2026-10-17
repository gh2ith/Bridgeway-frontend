# Connected workspace redesign

The student portal now uses a card deck, explicit card selection, compact role dialogs, and a separate learning itinerary. The company, supervisor, college, and platform portals share a browser-session sample workspace.

## Workflow

1. A company submits an internship for Platform Admin review. Pending or rejected listings never enter the student deck. Approved listings reach all active colleges rather than only partner colleges.
2. Student applications remain pending until the host company accepts or rejects them. Acceptance does not create a placement.
3. The student's college assigns an academic supervisor and activates the placement. This creates an eight-week checklist plan.
4. The company edits future or revision-requested plans, records objective completion and evidence, and submits hours. Earlier plan revisions remain inspectable.
5. The assigned supervisor assesses each objective, verifies hours, or returns required revision notes. Submitted and verified reports are read-only for the company until a revision is requested.
6. Supervisor visibility controls hide report evidence, completion results, and review notes from the student. Planned objectives remain visible. Platform oversight can inspect hidden reports.
7. Company final evaluation submission requires 320 verified hours. Platform completion requires verified hours and a company evaluation. Ended placement history is retained.
8. Support tickets retain threaded replies, priority, status, and a reference to the relevant report or listing. Requester portals show their own tickets; Platform Admin sees the complete sample queue.

## Platform oversight

The student register filters by name, ID, institution, company, and placement outcome. Student records include current and former placements, dates, exit reasons, verified hours, plans, reports, and company evaluations. CSV export follows the current filters and includes placement rows rather than discarding earlier placements.

## Preview boundaries

`shared/js/workspace-cycle.js` stores sample workspace state under `bridgeway:workspace-cycle:v1` in session storage. Navigate between portals in the same tab to inspect handoffs. Independent tabs may have separate session copies. No server, real messaging, uploads, real account authorization, or organization-wide data synchronization is implemented. Browser storage is not secure access control. CV handling retains filename and size only. There is no reset action in the user interface.

## Student workbench and report access

The Career Launchpad uses a perspective coverflow rather than a directory or a large landing-page hero. A 240ms eased slide moves cards on selection without spring overshoot; rotation and depth are restrained. Only the active card tilts with a fine pointer. Company-tinted light stays behind the stage. Search, category filters, arrow controls, keyboard navigation and a role index remain available. A native-dialog blueprint drawer contains the role description, skills, practical details and application action; the application remains a separate, guarded preview step. Narrow screens use flat horizontal card movement, and reduced-motion mode disables slide, tilt and drawer entrance motion. Cards and drawers retain the AI role-fit preview: no CV means no percentage; known fixture scores are labeled as illustrative samples, never real analysis or acceptance probability. Only CV filename and size are retained.

A floating dock connects Explore, Applications and My training; Support and My profile remain in the top bar. The profile shares that shell and keeps the academic dossier beside personal-details and CV panels; editing remains preview-only. Placed students with a plan default to My training unless an explicit tab link was requested. Light/dark surfaces reuse the portal tokens, and bottom padding keeps the dock from covering the last controls when scrolled to the end.

Supervisor report access appears immediately below the selected week's heading, before objectives and assessments. It explicitly states whether that week's report is visible or hidden; locking does not hide the weekly plan. The former top issue-report shortcut is removed; support lives in the ticket workspace.

The existing partnership/account previews still use their own page-local fixtures. Home, login, and the standalone theatre are outside this redesign.

## Browser checks

Checked the student deck, card selection, role dialog, light/dark themes, training plans, company acceptance, college supervisor assignment, initial plan setup, checklist submission, supervisor revision, objective assessment, hour verification, student report locking, publication submission/approval, linked ticket replies, placement history, and filtered CSV download. Responsive checks target 1920×1080, 1280×720, and a narrow 480px viewport.

The repository site checker continues to flag the existing embedded script in root `exploded-view.html`; that unrelated file is preserved.
