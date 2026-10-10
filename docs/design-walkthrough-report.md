# Design walkthrough — October 9, 2026

## Scope and result

The approved frontend corrections are implemented. This second walkthrough identifies remaining presentation improvements; it does not count missing backend/database functionality as a defect. Save, send, publish, approval, and account operations may remain previews. No persistence or backend was added.

Homepage and login were inspected but not edited. Their six protected HTML/CSS/JS files match the recorded hashes.

## Completed corrections

- Aligned the principal student fixtures, IDs, placements, hours, term, evaluation states, and directory counts. Ghaith is at Tech Corp, week 6, 240 hours; Sarah is at Nexus, week 8, 320 hours. Company reports/evaluations show confirmed company interns; supervisor views show assigned students.
- Listing applicant links now filter to that role. Ghaith's report action opens Ghaith. Existing edit links prefill the appropriate listing preview.
- Added search and empty results to college directories and a compact selector for supervisor report review. Evaluation empty searches no longer leave an unrelated assessment visible.
- Made account-setting descriptions role-specific, clarified preview feedback, and removed implementation-file terminology from student progress.
- Named relevant controls and isolated open modal dialogs from background keyboard/accessibility navigation.
- Fixed a table-display regression found during verification and aligned the verified week-5 visual state with its label.

## Original design findings — portal items now fixed

### 1. Company evaluation roster truncates student identity — high priority

At 1440px, the narrow roster column and native multi-row select cut off IDs and portions of the labels. The large native scrollbar also competes with the content.

Location: `company-workspace.css:31` and `company-dashboard.html:473`.

Recommended edit: give the identity column enough room, or render the existing selectable roster with a name and ID on separate lines. Preserve search and bounded scrolling. This is a presentation change, not a new workflow.

### 2. Dark evaluation details need stronger contrast — high priority

The blue cumulative score/grade badge and green student badge are hard to read against their dark backgrounds. Selected rating buttons also have a stronger glow than the rest of the portal. Observed visually; a complete numeric contrast audit was not performed.

Recommended edit: use lighter dark-theme text tokens, quieter selected backgrounds, and a visible border/focus treatment. Keep rating states distinguishable without color alone.

Evidence: [Dark evaluation capture](design-dark-evaluations-crop.png). This capture precedes the final correction to Alice's progress label; it is evidence for styling only.

### 3. Mobile header consumes too much vertical space — medium priority

At 480px, the collapsed navigation/logo occupies one full row, followed by a separate mostly empty account/notification row. This repeats across the portal and delays the page heading and main task.

Location: `portal-refinement.css:23`, responsive rules around lines 82–100.

Recommended edit: compact the mobile header, align the existing controls, and reduce unused vertical spacing while preserving the sidebar and desktop layout.

### 4. Dashboard metrics push the active task below the fold — medium priority

College Admin has six summary tiles before the selected directory. On mobile, the first screen shows summary content while the table is below it. Student/supervisor views and company evaluations have a similar, smaller issue.

Recommended edit: keep full summary tiles on overview pages and use a smaller contextual summary on task tabs. This would make the selected page easier to recognize and start using.

### 5. Mobile tables hide important columns and actions — medium priority

Tables stay inside their scroll containers, so there is no document overflow, but names and actions cannot always be seen together. The college student table measured about 757px inside a 386px container at 480px. It fits at the tested 1024px tablet width.

Recommended edit: retain readable row spacing, keep the identity column visible during horizontal scrolling, and provide a clear scroll cue. Consider hiding low-priority columns at narrow widths. Do not replace the entire table system unnecessarily.

### 6. Posting form gives the preview too much space — medium priority

The desktop posting layout leaves the editable form comparatively narrow while the preview occupies the larger column. Paired fields inside the form become cramped.

Location: `company-post-role.html`, form layout and paired grids around lines 103 and 134.

Recommended edit: prioritize the input column, balance the two columns, and stack paired fields before they become too narrow. Preserve the existing preview behavior.

## Protected-page observations — no changes made

- **Homepage:** the 480px capture shows the hero title and description clipped at the right edge. A lack of document overflow does not rule out clipping inside a constrained container. Review text wrapping if homepage editing is authorized later.
- **Login:** the large decorative panel precedes the form on mobile, making users scroll before reaching the complete sign-in controls. Treat this as a layout improvement, not a broken authentication feature.

## Verification and limits

- Inspected all 13 HTML entry pages at effective 1440px desktop and 480px mobile widths. Examined six additional report/evaluation/progress/directory views at mobile width and the company evaluation form in dark mode.
- Checked the college student directory at 1024px; no document overflow.
- Confirmed listing-specific applicants, Ghaith report selection, directory searching, evaluation empty results, modal background isolation, role-specific settings, and frontend listing-edit prefill.
- 19 external/inline JavaScript syntax checks passed. Local references and duplicate HTML IDs passed across 13 pages. Six protected-file hashes matched. No browser console errors were captured in the walkthrough.
- This is not exhaustive testing of every interaction, browser, accessibility requirement, or dark-theme page. Widths below 480px remain untested in this browser environment.
- Screenshot contact sheets are review evidence captured during the pass; some precede the last label/count cleanups. The current dashboard preview below reflects the final implementation.

## Original suggested order

Fix evaluation roster readability and dark contrast first, then mobile header/metrics, then table presentation and posting-form proportions. Keep homepage/login unchanged unless separately authorized.

[Current dashboard](frontend-fixes-preview.png) · [Mobile comparison](design-mobile-contact.png)


## Resolution — portal design fixes completed
- Fixed sidebar badge containment with shrinkable, wrapping labels and stable count widths; verified all six College Admin badges in desktop and expanded mobile navigation.
- Replaced the clipped evaluation select presentation with a bounded searchable roster showing full names and IDs on separate lines. Existing selection behavior is preserved; empty results hide the assessment.
- Improved dark score/grade/student badge colors and removed rating-button glow.
- Combined mobile navigation, notifications, and account controls into a compact header.
- Removed overview metrics from task tabs while retaining them on overview screens.
- Added conditional horizontal-scroll hints and sticky, readable identity columns to mobile tables.
- Balanced posting form/preview columns in favor of the form; paired fields stack on mobile.
- Verified all 11 portal entry pages at 1440px and 480px: no document overflow or out-of-row visible badges; no captured console errors. Checked roster selection/search, expanded mobile navigation, and posting column proportions.
- JavaScript syntax passed and all six protected homepage/login hashes matched. No backend, persistence, sessions, or new business workflows. Protected-page observations remain intentionally unchanged.

[Sidebar fix](design-fixed-sidebar-preview.png) · [Mobile directory](design-fixed-mobile-preview.png) · [Dark evaluations](design-fixed-evaluations-preview.png)
