# Bridgeway workflow rules

These rules reflect the user's explicit clarification. Read them before changing workflow text, statuses, or behavior.

- The host company reviews internship applications and accepts or rejects applicants to its own listings.
- Applying creates a pending application, not automatic acceptance or placement.
- Academic supervisors do not approve, reject, or endorse internship applications. Do not add a faculty/college approval stage to the hiring decision.
- The college assigns the academic supervisor and manages placement administration after company acceptance; this is not a second hiring decision.
- Platform Admin can pause or resume any partnership. College admins can pause or resume only partnerships linked to their own college. Companies cannot change partnership status. Resuming requires both organization accounts to be active; existing training and history remain intact when paused.
- College admins view company listing details read-only and may pause/resume a listing only for their own college’s students. They cannot edit/delete or globally pause company listings. Existing applications and training remain intact. Preview toggles reset on reload and do not synchronize other pages.
- The company records weekly training reports and submits the end-of-term evaluation.
- The assigned supervisor reviews training reports, verifies hours, and requests report revisions. These actions must never be described as application approval.
- Supervisor evaluation views are read-only views of company-submitted evaluations.
- This is a static frontend preview. Do not claim that preview actions send applications, save records, notify people, or synchronize pages.
- Planned AI matching compares the student's CV with each internship's requirements. A CV match is role fit, not acceptance probability. Do not add a "Why this match?" feature. Until AI is connected, scores must be labeled as samples; no CV means no percentage. CV selection currently retains only filename and size in browser-session storage, never document contents or real analysis.
- Historical reports, screenshots, and backup archives can contain superseded workflows. They are not a source of authority over these rules.

Run `node tools/check-site.mjs` and `node tools/check-workflow.mjs` after relevant changes.
