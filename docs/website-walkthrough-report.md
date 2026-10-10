# Bridgeway website walkthrough report

Reviewed October 9, 2026. Review only: no website HTML, CSS, or JavaScript changed.

## Overall assessment

Keep the current visual direction. The shared company-style layout, light default, compact listings, clear primary buttons, and supervisor evaluation viewer provide a good foundation. The most important work is making the website tell one consistent story across its five roles. Another broad visual redesign would not fix the main problems found here.

The highest-priority defects are the wrong student opening from a report action, conflicting student/placement/evaluation records, and an incomplete company-acceptance-to-college-placement handoff. These can all be improved with fixed data and basic JavaScript before a backend exists.

## Method and limits

- Installed and used [Vercel Web Design Guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines). Read the current [interface review checklist](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), then checked the site's source and rendered interface.
- Opened all 13 HTML pages. Walked through the student, supervisor, college, company, and platform sections; inspected account and notification menus, selected forms, search states, and dialogs.
- Confirmed all five Quick Fill Demo login routes reach their intended portals.
- Checked all 13 entry pages at an effective 480px browser viewport. No document-wide horizontal overflow was detected there. Reviewed desktop content at the initial 2560px viewport and representative layouts at 1440px; visually inspected mobile evaluations and the dark company dashboard.
- Findings below distinguish browser-reproduced behavior from source findings and recommendations. This is not an exhaustive test of every input combination, a screen-reader certification, a performance benchmark, or a production security audit. Smaller mobile widths and real touch devices remain untested.
- Fixed data, no backend, no sessions, no browser storage, reload resets, and no cross-page synchronization are intentional. They are not counted as defects. However, fixed records should agree, and messages should accurately describe a preview.
- Homepage and login were reviewed without changing their protected designs. Any suggested changes to those pages remain recommendations only.

## Fix first — workflow and data

### 1. Ghaith's report action opens Alice's form — High

**Browser reproduced.** Company dashboard → Manage Applicants → Ghaith → Log Report. The weekly report form says **Report for Alice Johnson** and selects Alice's week. This could cause someone to fill the wrong student's report.

`company-dashboard.html:302` — the action switches tabs without selecting Ghaith. Pass the student identity into the existing report selector before opening the tab. The standalone candidate page already has student-specific URLs; make both entry points behave consistently.

### 2. The same students have contradictory records — High

**Browser and source confirmed.** Examples:

| Record | Contradictory views |
|---|---|
| Ghaith's company | Student profile/progress: Nexus; supervisor roster/reports: Aspire; company/college placement/evaluation viewer: Tech Corp |
| Ghaith's progress | Student: week 4 / 160h; company and supervisor: week 6 / 240h |
| Ghaith's evaluation | Student progress says academically verified with final remarks; supervisor viewer says not submitted |
| Sarah's identity | Supervisor roster: 20220102, Orange Coding Academy; evaluation viewer: 20220019, Nexus |
| Alice's identity | Supervisor: 20220189, GPA 3.60; company: 20220042, GPA 3.50 |
| Omar's state | Company model: applicant awaiting placement; supervisor roster: active Nexus intern in week 5 |

`student-profile.html:119`, `student-dashboard.html:540`, `supervisor-dashboard.html:212`, `supervisor-dashboard.html:277`, `supervisor-evaluations.js:4`, `partnership-data.js` — use one shared fixed dataset with stable student, college, company, supervisor, placement, report, and evaluation IDs. Derive each screen from it. This does not require storage or a database.

### 3. Placement cycle stops before college confirmation — High

**Browser and source confirmed.** Company acceptance produces “Awaiting college placement.” College Students displays Omar as awaiting placement, but Placements shows only confirmed records. There is no corresponding confirmation step in the inspected college interface. The partnership guide also promises completion review without a matching college completion view/action.

`portal-cycle.js:8`, `portal-cycle.js:20`, `portal-cycle.js:40`, `admin-dashboard.html:587` — complete the already-described preview states: Applied → Company accepted → College confirmation/assigned supervisor → Active → Completed. Use explicit fixed examples and local UI transitions. Do not simulate persistence between pages.

### 4. Application behavior conflicts with the stated cycle — High

**Historical finding, corrected October 10, 2026.** The old prototype conflated application submission, acceptance, and placement and incorrectly assigned hiring decisions to supervisors. Current source keeps applications pending, assigns acceptance/rejection to the host company, and separates college placement administration from supervisor training-report review. See `../AGENTS.md`.

`portal.js:285`, `student-dashboard.html:475`, `portal-cycle.js:8` — decide one ownership sequence and use it everywhere. An application submission should remain an application, with the next responsible role clearly named.

### 5. Supervisor roster is not aligned with assignment ownership — High

**Browser/source consistency finding, not a backend authorization claim.** The BAU supervisor lists Alice although the shared model assigns her to Jordan University, and lists Omar as an active intern despite his pending placement. The new evaluation directory contains two sample students while the roster contains four and claims fourteen.

`supervisor-dashboard.html:212`, `supervisor-evaluations.js:4`, `partnership-data.js` — filter the fixed supervisor roster, reports, and evaluations through explicit supervisor assignments and consistent college ownership. Show a pending evaluation entry for every eligible assigned intern, or explain a deliberate subset.

### 6. Text entered into posting requirements is interpreted as HTML — High before backend integration

**Browser reproduced safely.** Entering `<strong>Audit</strong>, CSS` into Technologies & Prerequisites creates an actual `<strong>` element in the preview, rather than displaying literal text.

`company-post-role.html:240` — build tag elements with `textContent`, not interpolated `innerHTML`. The current observed input is local to the preview; do not carry this rendering pattern into backend-provided content. No script payload or external request was used in this check.

## Next — actions, clarity, and accessibility

### 7. Listing-specific applicant links lose their context — Medium

**Browser reproduced.** Clicking the Software Engineering applicant count opens all three applicants, including Alice's Frontend application.

`company-dashboard.html:202`, `company-dashboard.html:213` — retain the chosen listing and show its applicants, with a visible way back to all applicants.

### 8. Edit listing does not identify the listing — Medium

**Source and destination-page confirmed.** Both Edit listing links go to the same new-post page without a listing ID. That page is titled “Post a New Internship Role” and has a fixed Software Engineering example. Editing the Frontend listing cannot reliably edit its details.

`company-dashboard.html:207`, `company-dashboard.html:218`, `company-post-role.html:100` — reuse the form in explicit create/edit modes with the correct fixed record and labels.

### 9. Accepting an applicant leaves the old filter state — Medium

**Browser reproduced.** On the standalone applications page, accept Omar, then choose Under Review (1). Omar remains there with “Awaiting college placement.”

`portal-cycle.js:20`, `company-candidates.html:250` — update the row's filter state and derived counts together; give awaiting placement its consistent place in the existing status model.

### 10. Totals disagree with visible records — Medium

**Browser reproduced.** Student opportunities says 3 in the KPI, 6 in the sidebar, and “6 Found” above three cards. College Posts says 2 in navigation and “6 Total Posts” above two rows. Company profile says four active candidates versus two active interns on the dashboard. Supervisor totals say fourteen students while four rows are displayed without pagination or a sample explanation; the college supervisor list says twelve assigned.

`student-dashboard.html:157`, `portal-cycle.js:45`, `portal-cycle.js:77`, `company-profile.html:122`, `supervisor-dashboard.html:105` — derive all counts and ratios from the same fixed records. If showing a subset, label it explicitly.

### 11. Success messages overstate what happened — Medium

**Source confirmed.** Profile handlers claim updates, password settings claim a changed password, revision requests claim dispatch, and recovery claims verification was dispatched. These are frontend-only handlers.

`student-profile.html:232`, `company-profile.html:213`, `account-settings.html:220`, `portal.js:484`, `login.js:770` — consistently say “Validated in this preview” or “Preview updated; resets on reload” where appropriate. The posting form already provides an honest backend-pending response. Password changes were inspected in source, not executed.

### 12. Two applicant/posting entry points behave differently — Medium

**Browser/source confirmed.** Dashboard applicants offer meeting actions; standalone applicants offer CV/report links. Post Internship opens a modal in the dashboard, while New listing opens a separate page. The forms and context can drift.

`company-dashboard.html:194`, `company-candidates.html:130`, `company-post-role.html:100` — choose one primary flow or share the same rendering/handlers between existing entry points. Retain the approved layout and avoid adding unrelated features.

### 13. College directories will become difficult to use at scale — Medium

**Browser observed; design recommendation.** Student, user, supervisor, and placement tables lack the search and bounded navigation already available in newer company/platform views. The supervisor weekly-report selector is a row of individual student buttons.

`admin-dashboard.html:301`, `supervisor-dashboard.html:358` — reuse the existing searchable roster pattern for large collections; add pagination when real data volume requires it. Keep the primary row action visible on narrow screens instead of relying entirely on sideways table scrolling. No large-data performance benchmark was run.

### 14. Some college controls lack accessible names — Medium

**Browser reproduced.** Ghaith/Sarah supervisor selectors are announced as unnamed comboboxes, and their adjacent unassign icon buttons have no meaningful name. The registration dialog close control is named only “×”.

`admin-dashboard.html:347`, `admin-dashboard.html:372`, `portal-refinement.js:37` — add names such as “Assigned supervisor for Ghaith Amourah”, “Unassign Ghaith's supervisor”, and “Close student registration”. Do not rely on icon appearance or table position.

### 15. Custom dialogs do not isolate the background — Medium

**Browser/source observed.** The college registration dialog has `aria-modal="true"` and keyboard handling, but the surrounding sidebar and page remain exposed in the accessibility tree. Platform Admin's native dialog correctly isolated its content and returned focus after Escape.

`portal-refinement.js:52`, `admin-dashboard.html:657` — use native modal dialogs consistently or correctly make background content inert while custom dialogs are open. Verify with an actual screen reader in addition to the browser tree.

### 16. Tab clicks do not update the URL — Medium

**Browser/source confirmed.** Changing company or college sections leaves the original page URL/hash. Copying a link, refreshing, or using browser history can therefore open a different section from the one the user was viewing.

`portal.js:87` — synchronize the active section with the existing hash links and browser history. This uses normal URL state and does not require local/session storage.

### 17. Account settings keep student wording for other roles — Medium

**Browser reproduced for Platform Admin.** Identity and dashboard links change correctly, but the navigation landmark remains “Student navigation”, and notification settings still describe student opportunities and report approvals.

`account-settings.html:78`, `account-settings.html:180`, `portal-unified.js` — make labels and existing preference descriptions role-appropriate. Remove irrelevant options instead of introducing more settings.

## Polish and maintainability

- `student-dashboard.html:552`, `student-dashboard.html:742` — remove developer filenames “Report.cs” and “Evaluation.cs” from user-facing headings. Standardize “Evaluations”, “Placements”, “Applicants”, and “College Admin”; remove leftover “View Degree Audit” wording where it now opens Evaluations.
- `admin-register-student.html:96` — Spring 2026 conflicts with the Fall 2026 portals. Use one demo term and a coherent timeline. Future-dated submitted examples should be clearly identified as scenario data.
- `supervisor-evaluations.js:12` — a zero-result search leaves the previously selected student's detail visible. This is not necessarily wrong, but label it as the current selection or clear the detail so the empty result does not look contradictory.
- `company-post-role.html:100` and nearby form controls — add stable `name` and appropriate `autocomplete` attributes. Preserve existing associated labels and native required/type validation; use inline errors for additional constraints.
- `portal.css:206` and repeated rules — replace broad `transition: all` with the actual animated properties. Consolidate overlapping portal/unified/cycle/refinement overrides gradually; do not rewrite every stylesheet merely for cleanup.
- Dark company layout was readable in the inspected screenshot, but computed `color-scheme` remained `normal`. Declare the corresponding native color scheme so system controls and scrollbars follow the selected theme.
- `handover.md` — archive or clearly separate obsolete architecture sections. It still describes removed persistence and old supervisor rubric editing below current notes; this can mislead the backend handoff.

## Homepage and login — protected pages, recommendations only

- **Login:** all five demo routes passed. “Remember this device” suggests persistence that intentionally does not exist. Recovery and security wording should eventually distinguish the demo from implemented services. Preserve the design; these are content/behavior recommendations, not authorization to edit it.
- **Homepage content:** its role section describes the earlier four-role model; align its content with Platform Admin if permission to update this protected page is given later. Its one-active-application policy also needs reconciliation with portal fixtures.
- **Homepage navigation observation requiring follow-up:** clicking Platform Roles and FAQ changed the hash, but the hero remained the active milestone and the destination section stayed hidden in the background audit browser, including at 1440px. Reproduce this in a normal foreground browser before assigning a root cause: background animation throttling may affect the scroll-driven experience. Do not remove the bridge design based on this observation. Verify keyboard/direct-link navigation and a reliable static fallback independently of animation timing.

## Page coverage

| Page | Reviewed areas | Main follow-up |
|---|---|---|
| index.html | Landing content, navigation links, source sections, narrow layout | Four/five-role copy; milestone navigation observation |
| login.html | Five roles, demo sign-ins, recovery source, narrow layout | Honest preview/persistence wording |
| student-dashboard.html | All three tabs, opportunities, application explanation, progress/evaluation | Shared fixtures, counts, cycle ownership |
| student-profile.html | Identity, placement, fields, save handler | Placement consistency and truthful save feedback |
| supervisor-dashboard.html | Roster, reports, submitted/pending evaluations, empty search | Assigned scope, fixture consistency, scalable selector |
| company-dashboard.html | Listings, applicant route, report selection, evaluations, header menus, dark layout | Wrong report student, lost listing context, edit flow |
| company-candidates.html | Scoped list, links, acceptance and review filter | Status/filter synchronization |
| company-post-role.html | Fields, live preview, text handling, submit source | Safe text rendering, create/edit distinction |
| company-profile.html | Profile fields, metrics, save handler | Counts and preview feedback |
| admin-dashboard.html | Seven sections, registration dialog, assignment controls, placements | Placement handoff, accessibility, scalable directories |
| admin-register-student.html | Enrollment fields and choices, narrow layout | Term and supervisor options consistent with college records |
| account-settings.html | Student and Platform Admin context, password handler, preferences | Role-specific wording and honest feedback |
| platform-admin.html | Five sections, creation dialog, partner cycle and issues | Consistent shared fixtures; retain native dialog behavior |

## Recommended implementation order

1. Normalize the static dataset and role/assignment ownership. This resolves many contradictions without a backend.
2. Fix wrong-target actions, applicant status filters, and listing edit context.
3. Finish the already-described placement and completion preview states and unify lifecycle wording.
4. Derive totals from records, standardize honest preview messages, and fix unsafe text rendering.
5. Address accessible names/modal isolation, URL navigation, and scalable existing directories.
6. Clean up terminology, role-specific settings, dates, and conflicting documentation. Keep the approved visual direction.

Backend authentication, server-enforced ownership, durable submissions, email delivery, and concurrent seat allocation remain future integration work. No persistence layer is recommended for this frontend phase.
