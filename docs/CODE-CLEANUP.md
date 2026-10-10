# Code cleanup verification

13 page folders contain exactly one HTML, CSS, and JavaScript file each. Reusable styles and behavior live in `shared`; the original logo stays in `assets`. Screenshots and historical reports were moved, not deleted. The old protected-file hash list is historical and lives in `legacy-protected-hashes.json`.

Authored inline styles and event handlers were extracted from HTML. Repeated presentation declarations are deduplicated per page. CSS is one rule per line, with nested media rules indented; JavaScript remains readable. Application source changed from 18,615 to 11,955 lines, primarily through CSS formatting, inline presentation deduplication, and removal of decorative comments/extra blank lines. No business rules were removed to reduce the count.

`node tools/check-site.mjs` passes: 13 folders, 19 JavaScript files, and 531 local references. All pages loaded in the local browser without broken images or JavaScript errors. Browser checks covered student tab navigation, card clicks, search/empty state, dark mode, account menu, company applicant filters, evaluation quick-fill/reset, the platform arrangement toolbar, role-aware account links, homepage redirect/hash preservation, and sun/moon bridge lighting. These are smoke tests, not a claim that every possible form combination was exercised.

The original flat-file backup was written to a sandbox temporary directory which did not persist. A durable backup of the verified reorganized source is provided at `backups/bridgeway-cleaned-source.zip`. Historical screenshots/specifications remain under `docs`.

Start Live Server from the root `index.html`. Actual pages use `pages/<page>/<original-filename>.html`. All 13 original root page URLs now have small compatibility entry files using the shared redirect script; query parameters and section hashes are preserved. Browser checks passed for every redirect, including the original `student-dashboard.html#tab-progress` URL. The expanded path checker passes 581 local references. The homepage preview was refreshed to replace cached links from the former layout.
