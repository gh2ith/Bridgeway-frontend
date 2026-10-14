# Bridgeway Project and Login Animation

> Login scene update: the original hanging identity card has been restored locally, including email/name reactions, password flip, lanyard physics, and sign-in feedback. The Orbit source snapshot remains available in [login scene experiments](login-concepts/README.md). No GitHub publishing was performed.

## 1. Project overview

Bridgeway is a role-based academic internship management platform. It brings students, colleges, academic supervisors, partner companies, and the platform administrator into one shared workflow.

The current project is a static frontend prototype built with HTML, CSS, and JavaScript. It demonstrates the complete interface, navigation, role-specific dashboards, responsive layouts, dark mode, and interactive states. It does not yet include a backend, database, real authentication, email delivery, or live synchronization between portals.

Live demo: <https://gh2ith.github.io/Bridgeway-frontend/>

## 2. Main platform roles

### Student

Students can browse internship opportunities, review AI-assisted CV match samples, follow their applications, manage their profile and CV information, and monitor training progress after accepting an internship.

### Partner company

Companies publish internship opportunities, review applications, accept or reject applicants, manage active interns, record weekly training reports, submit final evaluations, and view partner colleges.

### Academic supervisor

Supervisors review the weekly reports and hours of their assigned students, request report revisions when needed, and view company-submitted evaluations. Supervisors do not accept or reject internship applications.

### College administrator

College administrators manage students and supervisors, assign supervisors after company acceptance, view partner companies, monitor student internships, and control whether a partner listing is available to students from their own college.

### Platform administrator

The platform administrator manages college and company accounts, partnerships, and escalated platform issues. The platform administrator can pause or resume any partnership.

## 3. Internship workflow

The intended workflow is:

1. A company publishes an internship opportunity.
2. A student applies to the opportunity.
3. The application remains pending until the company reviews it.
4. The company accepts or rejects the application.
5. After acceptance, the college handles placement administration and assigns an academic supervisor.
6. During training, the company records weekly reports and training hours.
7. The assigned supervisor reviews the reports and may request revisions.
8. The company submits the final evaluation.
9. The college reviews internship completion records.

The company is the only party responsible for the hiring decision. Academic supervisors do not approve, reject, or endorse applications.

## 4. AI matching direction

Bridgeway is designed to compare a student's CV with the requirements of each internship opportunity. The result is a role-fit percentage that helps the student understand how closely their experience and skills match the listing.

This percentage is not an acceptance probability and does not replace the company's decision. Until an AI service and backend are connected, displayed match percentages are frontend samples only. The current prototype does not upload or analyze CV contents; it retains only basic file information in browser session storage.

## 5. Project structure

The project has no build step and does not require a JavaScript framework.

```text
Bridgeway-Front-end-main/
├── assets/                       Reusable images and the Bridgeway logo
├── docs/                         Project documentation and reports
├── pages/
│   ├── home/                     Public landing page
│   ├── login/                    Role selector and animated identity card
│   ├── student-dashboard/        Opportunities and training progress
│   ├── student-profile/          Student details, CV, and applications
│   ├── supervisor-dashboard/     Students, reports, and evaluations
│   ├── admin-dashboard/          College administration portal
│   ├── company-dashboard/        Company listings, applicants, and interns
│   ├── company-profile/          Company account information
│   ├── company-post-role/        Internship creation form
│   └── platform-admin/           Platform-level management
├── shared/
│   ├── css/                      Shared design, portal, and navigation styles
│   ├── js/                       Shared navigation and interaction logic
│   └── data/                     Static reference and demo data
├── tools/                        Structure and workflow validation scripts
├── AGENTS.md                     Authoritative workflow rules
└── README.md                     Setup and editing instructions
```

Each page folder normally contains its own HTML, CSS, and JavaScript files. Common design and behavior are kept in `shared`.

## 6. Current login page

The login page is split into two areas on desktop:

- The left side presents an animated Bridgeway academic identity card.
- The right side contains role selection, email and password fields, theme controls, and the sign-in action.

The available login roles are Student, Supervisor, Partner Company, College Admin, and Platform Admin. Choosing a role updates the form labels, email guidance, button text, badge color, identity, initials, role description, and serial number.

The login is currently a frontend simulation. A valid-looking email and a non-empty password route the user to the selected role's dashboard; no credentials are sent to a server.

## 7. Login card animation

The login visual is designed as a physical identity badge hanging from a blue lanyard. It combines CSS 3D transforms, SVG path updates, pointer input, and a small JavaScript spring simulation.

### Entrance animation

When the page loads on a desktop or laptop, the badge drops into position from above. Its content appears in a short staggered sequence. After landing, the card receives a small impulse and settles naturally like a suspended badge.

The drop is controlled by the `is-dropping` and `is-landed` classes. The JavaScript function responsible for starting it is `triggerDropIn()`.

### Pendulum physics

The badge behaves like a damped pendulum instead of following a fixed looping animation. Its movement is calculated using:

- angular position and velocity;
- spring stiffness and damping;
- a separate delayed angle for the lanyard;
- clamped movement values to keep the card stable;
- `requestAnimationFrame()` for smooth updates.

The animation loop stops when the badge settles, which avoids running continuously when no movement is visible.

### Pointer movement and 3D tilt

On devices with a mouse or trackpad, moving the pointer across the left panel changes the badge's tilt, parallax, glare, and reflective sheen. Faster horizontal movement also adds a small swing impulse.

These effects make the card react to the user's movement while keeping the actual login form stable and readable.

### Drag interaction

The user can click and drag the hanging badge horizontally. During the drag, its angle follows the pointer. Releasing the badge converts the pointer speed into a pendulum impulse, allowing it to swing and gradually settle.

Touch dragging is disabled because the phone layout removes the visual panel and prioritizes the login form.

### Role change reaction

Selecting another platform role changes the identity shown on the badge. It updates:

- avatar initials and color;
- user or organization name;
- role description;
- badge serial number;
- email label and suggested address;
- sign-in button wording.

A gentle swing is added after each role change to make the update feel connected to the physical card.

### Email typing reaction

Text entered before the `@` symbol is converted into a display name on the badge. Dots and underscores become spaces, and the first letters are used to generate up to two avatar initials.

For example:

```text
alex.student@bau.edu.jo → Alex Student → AS
```

Clearing the email field restores the selected role's default identity.

### Password reaction

Focusing the password field flips the identity card 180 degrees to reveal its secure back side. The back includes a lock graphic, governance label, and barcode-style identity detail.

Using the password visibility button changes the password field between hidden and visible text. When the password is visible, the lock shackle on the back of the badge lifts to represent an unlocked state.

Moving focus away from the password controls returns the card to its front side.

### Validation and sign-in feedback

If the email is invalid or the password is empty, the card receives a sharp swing impulse and a temporary red edge glow.

When the form passes frontend validation:

1. A diagonal light sweep crosses the badge.
2. The button changes to an authenticating state.
3. A confirmation toast appears.
4. The browser routes to the dashboard for the selected role.

This is presentation behavior only and is not real authentication.

### Dark mode

The form, card faces, background, controls, and supporting text have dark-mode styles. The animation behavior stays the same while colors and contrast change.

### Responsive and accessibility behavior

At widths below `768px`, the animated badge panel is hidden and the physics loop does not start. The form becomes the complete phone experience, reducing visual load and avoiding unnecessary motion on small devices.

The login also respects `prefers-reduced-motion`. When reduced motion is enabled, the badge skips its entrance and physics animation and appears directly in its settled state.

Role choices use radio semantics, controls retain visible labels, and important feedback is exposed through standard form validation and status elements.

## 8. Login implementation files

```text
pages/login/login.html  Card structure, role controls, form, and modal
pages/login/login.css   Layout, 3D card faces, lanyard, states, and responsive rules
pages/login/login.js    Role data, physics, input reactions, validation, and routing
```

Important JavaScript functions and states include:

| Item | Purpose |
| --- | --- |
| `triggerDropIn()` | Starts the desktop badge entrance |
| `tickPhysics()` | Advances the spring and lanyard simulation |
| `startPhysicsLoop()` | Starts animation only when movement is needed |
| `updateLanyardVisual()` | Recalculates the SVG lanyard curves and clip position |
| `syncBadgeFlipState()` | Flips the badge when password controls have focus |
| `triggerBadgeErrorShake()` | Adds error movement and red feedback |
| `selectRole()` | Synchronizes the form and identity card with the selected role |
| `is-dropping` | Active during the initial entrance |
| `is-landed` | Reveals badge content after landing |
| `is-flipped` | Shows the secure back face |
| `is-password-revealed` | Lifts the lock shackle |
| `is-error-kick` | Shows temporary error feedback |
| `is-pending` | Shows the sign-in light sweep |

## 9. Running the project locally

From the project root, start any static web server. For example:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8080/
```

The root page redirects to the homepage. The login page is available at:

```text
http://127.0.0.1:8080/pages/login/login.html
```

## 10. Validation

After changing site structure, links, scripts, or workflow text, run:

```powershell
node tools/check-site.mjs
node tools/check-workflow.mjs
```

The first command validates page folders, local paths, and JavaScript syntax. The second checks that the platform workflow still follows the project's authoritative role rules.
