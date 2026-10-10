# Bridgeway portal design system

## Scope
All eleven portal pages. Homepage and login files, assets, and styling are protected.
Vanilla HTML, CSS and JavaScript; no new runtime dependencies or persistent state.

## Skill selection and adaptation
UI/UX Pro Max search: `enterprise operations dashboard minimal`.
Matched style: Minimalism & Swiss Style; Inter typography and functional enterprise layout.
The initial education query returned child-oriented typography, so it was rejected.
The follow-up's marketing hero pattern is also unsuitable for task-based portals.
Preserve Bridgeway blue and established sidebar instead of replacing them with suggested black/gold.
Focused UX query: `keyboard focus modal` supports visible focus and unobscured controls.

## Tokens and components
- Blue #245bdb, text #17243b, secondary #43536b, muted #596b82.
- Background #f5f7fb, white surfaces, border #dce4ef.
- Inter, 14px working text, 12px minimum secondary text, 25-32px page headings.
- 4/8px spacing rhythm, 24px panel padding, 12px panel corners, 8px controls.
- 44px primary controls; compact desktop table actions 36px, 44px on mobile.
- Tables retain visible headers and scroll inside their own region.
- Navigation defaults collapsed on small screens, with a named toggle.
- Light default; dark tokens; reduced motion; keyboard focus; skip link; modal focus containment.

## Implementation
`portal-refinement.css` and `portal-refinement.js` are loaded only by portal pages.
Existing actions and role scope remain unchanged. The public pages never load these files.
