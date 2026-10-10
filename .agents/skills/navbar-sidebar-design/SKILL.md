---
name: navbar-sidebar-design
description: >-
  Specialized architectural, UI/UX, and accessibility skill for designing, structuring,
  and implementing modern navigation bars (top navbars) and sidebars (floating cards,
  docked rails, dashboard navigations). Use whenever creating or refactoring navbars,
  sidebars, or dashboard layout structures.
---

# Navbar & Sidebar Architecture Skill

A specialized guide for crafting high-end, responsive, accessible, and clutter-free navigation bars and sidebars for modern web applications and dashboards.

---

## 1. Core Principles

1. **Avoid Duplicate Navigation:**
   - Never duplicate navigation links between a top header and in-page tabs/sidebars.
   - If a page uses a sidebar or tab segmented control for views, the top bar should only hold global items: Brand Logo, Role Badge, Partner Indicator, Theme Switcher, and User Profile.

2. **Floating Card Sidebar vs Full-Height Sidebar:**
   - **Floating Card Sidebar (Recommended for modern SaaS & portals):**
     - Dimensions: `height: fit-content`, bounded by `max-height: calc(100vh - 3.5rem)`.
     - Positioning: `position: sticky; top: 1.5rem;` alongside main content.
     - Styling: Rounded corners (`border-radius: 18px-24px`), subtle card elevation (`box-shadow`), crisp border (`1px solid var(--border)`).
     - **Advantage:** Leaves visual breathing room, avoids the claustrophobic "full-page frame" look, and feels like an elegant floating widget.
   - **Docked Full-Height Sidebar:**
     - `height: 100vh; position: fixed; top: 0; bottom: 0;`
     - Only use when explicitly requested for dense data tools (IDEs, file explorers).

3. **Semantic HTML5 & Accessibility:**
   - Navbars: `<header class="bw-navbar"><nav aria-label="Primary Navigation">...</nav></header>`
   - Sidebars: `<aside class="bw-sidebar" aria-label="Dashboard Sidebar"><nav>...</nav></aside>`
   - Interactive items: Use `<button type="button">` for in-page tab switches; use `<a>` for page navigations.
   - Use `aria-current="page"` or `.is-active` with high-contrast text and icons for active states.

---

## 2. Anatomical Blueprint: Floating Sidebar Card

```html
<div class="dashboard-layout">
  <!-- Clean Floating Sidebar Card (NOT full page height) -->
  <aside class="dashboard-sidebar" aria-label="Portal Navigation">
    <!-- 1. Brand & Role Emblem -->
    <div class="sidebar-header">
      <a href="index.html" class="brand-link">
        <svg class="brand-logo" ...></svg>
        <span class="role-badge">COMPANY</span>
      </a>
      <div class="status-indicator">
        <span class="status-dot"></span>
        <span>Verified Partner</span>
      </div>
    </div>

    <!-- 2. Primary Navigation Tabs -->
    <div class="sidebar-section">
      <div class="sidebar-label">PORTAL VIEWS</div>
      <nav class="sidebar-nav">
        <button type="button" class="sidebar-btn is-active" data-tab="tab-overview">
          <i class="bi bi-grid-fill"></i>
          <span>Overview</span>
          <span class="counter-badge">4</span>
        </button>
        <button type="button" class="sidebar-btn" data-tab="tab-reports">
          <i class="bi bi-journal-text"></i>
          <span>Reports</span>
          <span class="counter-badge">12</span>
        </button>
      </nav>
    </div>

    <!-- 3. Primary Call-to-Action -->
    <div class="sidebar-cta">
      <button type="button" class="btn-primary" data-open-modal="createModal">
        <i class="bi bi-plus-lg"></i> Create New
      </button>
    </div>

    <!-- 4. Secondary Navigation / Utilities -->
    <div class="sidebar-section">
      <div class="sidebar-divider"></div>
      <div class="sidebar-label">MANAGEMENT</div>
      <div class="sidebar-nav">
        <a href="profile.html" class="sidebar-link">
          <i class="bi bi-person"></i>
          <span>Profile</span>
          <i class="bi bi-chevron-right ms-auto arrow"></i>
        </a>
        <a href="settings.html" class="sidebar-link">
          <i class="bi bi-gear"></i>
          <span>Settings</span>
          <i class="bi bi-chevron-right ms-auto arrow"></i>
        </a>
      </div>
    </div>

    <!-- 5. User Profile & Controls Footer -->
    <div class="sidebar-footer">
      <a href="profile.html" class="user-pill">
        <div class="user-avatar">TC</div>
        <div class="user-details">
          <div class="user-name">Entity Name</div>
          <div class="user-role">role@domain.com</div>
        </div>
      </a>
      <div class="sidebar-controls">
        <button class="theme-btn" aria-label="Toggle theme"><i class="bi bi-moon-stars"></i></button>
        <a href="login.html" class="signout-btn" title="Sign out"><i class="bi bi-box-arrow-right"></i></a>
      </div>
    </div>
  </aside>

  <!-- Main Content Workspace -->
  <main class="dashboard-content">
    <!-- Header, KPI metrics, and tab panels live here -->
  </main>
</div>
```

---

## 3. CSS Reference Implementation (Vanilla CSS)

```css
/* Layout Container */
.dashboard-layout {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  max-width: 1560px;
  margin: 0 auto;
  padding: 1.75rem 2rem 3rem;
  min-height: 100vh;
}

/* Floating Sidebar Card */
.dashboard-sidebar {
  width: 290px;
  flex-shrink: 0;
  position: sticky;
  top: 1.75rem;
  height: fit-content;
  max-height: calc(100vh - 3.5rem);
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.5rem 1.25rem;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Interactive Navigation Item */
.sidebar-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.sidebar-btn:hover {
  background: var(--primary-light);
  color: var(--primary);
  transform: translateX(2px);
}

.sidebar-btn.is-active {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #ffffff !important;
  box-shadow: 0 4px 14px var(--primary-glow);
}

.sidebar-btn.is-active .counter-badge {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}
```

---

## 4. Responsive Rules

* **Desktop (`>= 1080px`):** 2-column sidebar + main content grid. Sidebar is sticky and contained.
* **Tablet / Mobile (`< 1080px`):** Collapse sidebar into a compact card or mobile top drawer:
  ```css
  @media (max-width: 1080px) {
    .dashboard-layout {
      flex-direction: column;
      padding: 1.25rem 1rem;
    }
    .dashboard-sidebar {
      width: 100%;
      position: static;
      max-height: none;
    }
    .sidebar-nav {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }
  }
  ```

---

## 5. Quality Checklist

- [ ] Top navbar does not duplicate links present in sidebar.
- [ ] Sidebar is `height: fit-content` with rounded borders (never 100vh unless explicitly asked).
- [ ] Active states use distinct color fills, bold typography, and glowing elevation.
- [ ] Badges show real-time live counters for items needing attention.
- [ ] Dark and light theme variables seamlessly supported with zero illegible contrast.
- [ ] Mobile collapse maintains quick access without horizontal screen clipping.
