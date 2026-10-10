# Backupway2 Functional Specification & Parity Guide

This document defines the exact data models, user roles, workflows, pages, and interactive actions implemented in the reference ASP.NET Core project (`Backupway2`). The user-approved five-role extension below supersedes the original role restriction. Backend schema descriptions remain reference material, not an implemented backend.

---

## 1. Domain Entities & Database Models

### 1.1 `User` (Authentication Account)
- **Properties**:
  - `UserId` (int, Primary Key)
  - `CollegeId` (int, Foreign Key to College)
  - `Email` (string, unique login identifier)
  - `Password` (string, SHA-256 hashed password)
  - `Role` (string, strictly one of: `"Admin"`, `"Student"`, `"Company"`, `"Supervisor"`)
- **Key Relationships**:
  - Shared ID 1:1 mapping with profile tables:
    - If `Role == "Student"`, `UserId == Student.StudentId`
    - If `Role == "Company"`, `UserId == Company.CompanyId`
    - If `Role == "Supervisor"`, `UserId == Supervisor.SupervisorId`

### 1.2 `College`
- **Properties**:
  - `CollegeId` (int, Primary Key)
  - `CollegeName` (string, e.g., "College of IT")
  - `UniName` (string, e.g., "Jordan University" / "Al-Balqa Applied University")

### 1.3 `Student`
- **Properties**:
  - `StudentId` (int, PK, matches `User.UserId`)
  - `SuperId` (int?, FK to assigned Supervisor, nullable)
  - `ReportId` (int?, FK to Report)
  - `CollegeId` (int?, FK to College)
  - `StDepartment` (string, e.g., "Software Engineering", "Computer Science")
  - `FullName` (string)
  - `Gpa` (float?, e.g., 3.5)
  - `Resume` (int?)
- **Editable by Student**: `FullName`
- **Read-only for Student**: `StDepartment`, `Gpa`, `Supervisor`

### 1.4 `Supervisor`
- **Properties**:
  - `SupervisorId` (int, PK, matches `User.UserId`)
  - `FullName` (string, e.g., "Dr. John Smith")
  - `SuperDepartment` (string, e.g., "Computer Science")
  - `CollegeId` (int?, FK to College)

### 1.5 `Company`
- **Properties**:
  - `CompanyId` (int, PK, matches `User.UserId`)
  - `CompanyName` (string, e.g., "Tech Corp Inc.")
  - `ContactInfo` (string, company email matching `User.Email`)
  - `Description` (string)
  - `Location` (string, e.g., "Amman")
- **Editable by Company**: `CompanyName`, `Location`, `Description`
- **Read-only**: `ContactInfo`

### 1.6 `InternshipOpportunity`
- **Properties**:
  - `InternshipId` (int, PK)
  - `CompanyId` (int, FK to Company)
  - `SuperId` (int?, FK to Supervisor)
  - `Title` (string, role name)
  - `Description` (string)
  - `Deadline` (DateTime)
  - `Requirments` (string)
  - `StdId` (int?, assigned student)
  - `IsClosed` (bool, true = post closed, false = accepting applications)
  - `Capacity` (int, number of open intern slots)

### 1.7 `Application`
- **Properties**:
  - `ApplicationId` (int, PK)
  - `StdId` (int, FK to Student)
  - `InternshipId` (int, FK to InternshipOpportunity)
  - `CompId` (int, FK to Company)
  - `SuperId` (int?, FK to Supervisor)
  - `Status` (sbyte: `0 = Pending`, `1 = Accepted/Approved`, `2 = Rejected`, `3 = Terminated`)

### 1.8 `Report` (Weekly Report)
- **Properties**:
  - `ReportId` (int, PK)
  - `StudentId` (int, FK to Student)
  - `CompId` (int, FK to Company)
  - `SuperId` (int?, FK to Supervisor)
  - `WeekNumber` (int, 1 through 8)
  - `NumberOfHours` (int, e.g., 40)
  - `Task` (string, work completed)
  - `Tools` (string, technologies used)

### 1.9 `Evaluation` (Final Student Evaluation)
- **Properties**:
  - `EvalId` (int, PK)
  - `StudentId` (int, FK to Student)
  - `CompId` (int, FK to Company)
  - `SuperId` (int?, FK to Supervisor)
  - `PerformanceLevel` (string: "Poor" | "Average" | "Good" | "Excellent")
  - `Responsibility` (string: "Poor" | "Average" | "Good" | "Excellent")
  - `Punctuality` (string: "Poor" | "Average" | "Good" | "Excellent")
  - `Accuracy` (string: "Poor" | "Average" | "Good" | "Excellent")
  - `Teamwork` (string: "Poor" | "Average" | "Good" | "Excellent")
  - `Adaptability` (string: "Poor" | "Average" | "Good" | "Excellent")
  - `SkillAcquisition` (string: "Poor" | "Average" | "Good" | "Excellent")
  - `OverallCompletion` (string: "Poor" | "Average" | "Good" | "Excellent")
  - `Comments` (string, optional notes)
  - `CreatedAt` (DateTime)

---

## 2. Platform Roles & Default Credentials

There are strictly **4 platform roles**:

| Role | Default Email | Default Name / Title | Dashboard URL |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@uni.edu` | University Administrator | `admin-dashboard.html` |
| **Supervisor** | `dr.smith@uni.edu` | Dr. John Smith | `supervisor-dashboard.html` |
| **Company** | `hr@techcorp.com` | Tech Corp Inc. | `company-dashboard.html` |
| **Student** | `student1@uni.edu` | Alice Johnson | `student-dashboard.html` |

> **Current role extension:** Platform Admin (`platform_admin`) creates company and college accounts, manages their access and administrator contacts, partnerships, aggregate totals, and escalated issues. Existing Admin (`admin`) is College Admin. Company registration/approval and administrative activity logs are excluded.

---

## 3. Page Structure & Interactive Functionality

### 3.1 Public Pages
1. **Landing Page (`index.html`)**:
   - Navigation bar: Logo, Sign In button, theme toggle.
   - Hero section, interactive 3D Bridge canvas, feature highlights, partners, CTA.
2. **Login Page (`login.html`)**:
   - Role selector with 5 roles: Student, Supervisor, Company, College Admin, Platform Admin.
   - Email and Password inputs.
   - Sign in button: redirects authenticated user directly to their respective role dashboard.
   - Forgot Password modal.

### 3.2 Account Settings (`account-settings.html`)
- Displays current user's email (read-only) and current role (read-only).
- **Change Password Form**:
  - Current Password input.
  - New Password input (minimum 6 characters).
  - Confirm New Password input (must match New Password).
  - Save Changes button.

### 3.3 Student Role (`student-dashboard.html` & `student-profile.html`)
- **Student Dashboard (`student-dashboard.html`)**:
  - Header: Welcome message with Full Name, Student ID, Department, GPA, and College.
  - **Tab 1: Available Internships**:
    - List/grid of internship postings showing: Position Title, Company Name, Location, Description, Requirements, Deadline, Capacity (Accepted / Total).
    - Status-dependent Apply action:
      - If Post is Closed (`IsClosed == true`): shows "Post Closed" badge; Apply button is disabled.
      - If Post is Full (`accepted >= capacity`): shows "Full" badge; Apply button is disabled.
      - If Student has active application (`Status == 0 || Status == 1`): Apply button is disabled with "Limit Reached" / "Active Application Exists".
      - Otherwise: "Apply Now" button opens confirmation modal.
    - **Apply Confirmation Modal**:
      - Displays Position Title, Company Name, Deadline.
      - Advisory note: Applications are sent to the host company, which accepts or rejects them. Supervisors do not make application decisions.
      - "Confirm & Apply" button (creates a pending Application with `Status = 0`; acceptance requires a host-company decision).
  - **Tab 2: My Applications**:
    - Table displaying student's applications: Company Name, Position Title, Location, Deadline, Status (`Pending` [0], `Approved` [1], `Rejected` [2], or `Terminated` [3]).
    - No academic-approval callout. Application decisions belong to the host company; supervisor verification applies only to training reports.
- **Student Profile (`student-profile.html`)**:
  - Full Name: editable input field.
  - Department: read-only field.
  - GPA: read-only field.
  - Supervisor: read-only field showing assigned supervisor's name.
  - "Save Changes" button.

### 3.4 Company Role
- **Company Dashboard (`company-dashboard.html`)**:
  - Top Metrics: Active Posts, Total Applicants, Accepted Interns, Weeks Reported.
  - **Tab 1: My Job Posts**:
    - "+ Create New Post" button (links to `company-post-role.html`).
    - Table of internship posts created by this company:
      - Title, Requirements, Deadline, Capacity (Accepted / Total), Status (`Open` / `Closed`).
      - Actions:
        - Toggle Post Status (`Close Post` / `Reopen Post`).
        - `Edit Post` button (links to `company-post-role.html?id=...`).
        - `View Applicants` button (links to `company-candidates.html?id=...`).
        - `Delete Post` button (opens confirmation modal; blocked if post has active accepted students).
    - Delete Post Confirmation Modal.
  - **Tab 2: Manage Applications**:
    - Table of submitted applications: Student Full Name, Applied Role, Applied Date, Status badge.
    - The company accepts or rejects applicants to its own listings. There is no auto-acceptance policy or supervisor application-approval stage.
  - **Tab 3: Weekly Reports**:
    - Form to submit weekly report for an accepted intern:
      - Select Intern (dropdown of accepted students).
      - Select Week (Week 1 through Week 8; disables already submitted weeks for chosen student).
      - Hours Worked (numeric input, e.g. 40).
      - Tasks Completed (textarea).
      - Tools & Technologies (text input).
      - "Submit Weekly Report" button.
    - Table/list of submitted weekly reports: Student name, Week number, Hours, Tasks, Tools, Supervisor approval badge.
  - **Tab 4: Final Evaluation**:
    - Form to submit final evaluation for an intern:
      - Select Intern (dropdown of accepted students).
      - 8 Rubric Criteria (Poor / Average / Good / Excellent radio buttons):
        1. Overall Performance Level
        2. Sense of Responsibility
        3. Punctuality & Attendance
        4. Accuracy of Work
        5. Teamwork & Cooperation
        6. Adaptability to Workplace
        7. Skill Acquisition & Growth
        8. Overall Task Completion
      - Additional Comments (textarea).
      - "Submit Final Evaluation" button.
    - List of submitted evaluations with criterion summaries.
- **Create / Edit Post (`company-post-role.html`)**:
  - Fields: Job Title, Description, Requirements, Capacity (number), Application Deadline (date), Closed toggle (in edit mode).
  - Submit button ("Publish Internship" / "Save Changes").
- **View Applicants (`company-candidates.html`)**:
  - Post header summary (Title, Capacity).
  - Table of applicants: Student Full Name, Department, GPA, Application Status.
- **Company Profile (`company-profile.html`)**:
  - Company Name (editable).
  - Location (editable).
  - Description (editable).
  - Contact Email (read-only).
  - "Save Changes" button.

### 3.5 Supervisor Role (`supervisor-dashboard.html`)
- **Supervisor Profile & Stats Header**:
  - Supervisor Full Name, ID, Department, College.
  - 4 KPI Stat Cards:
    1. Assigned Students Count (toggles Assigned Students view)
    2. Weekly Reports Count (toggles Weekly Reports view)
    3. Total Hours Logged (sum of report hours)
    4. Missing Reports Count (students with 0 reports)
- **Section 1: Assigned Students**:
  - Table: Student Name & Avatar, Department, GPA, College, Report Progress (`X/8 weeks` or `Missing`).
  - Action: "Review Report" action button (navigates to Weekly Reports view). Academic supervisors review, verify, and endorse reports; student supervisor assignment is strictly administered by University Admin.
- **Section 2: Weekly Reports Oversight**:
  - Grouped by student with interactive student selector and 8-week visual timeline progress track.
  - Weekly report cards: Week number badge, hours worked, company name, task description, tools used.
  - Verification Actions: "Approve & Verify Week" and "Request Revision" modal dialog.

### 3.6 Admin Role (`admin-dashboard.html`)
- **Top KPI Stat Cards**:
  1. Total Users (toggles Users panel)
  2. Students (toggles Students panel)
  3. Companies (toggles Companies panel)
  4. Supervisors (toggles Supervisors panel)
  5. Internship Posts (toggles Posts panel)
  6. Approved Applications (toggles Placements panel)
- **Inline Action: "+ Register Student"**:
  - Toggle form or button:
    - Email, Password, Full Name, Department, GPA, College.
    - "Register Student" button.
- **Detail Management Panels / Tables**:
  1. **All Users**: Table of all system users (UserId, Email, Role, College, Delete User button [disabled for admin]).
  2. **Students**: Table of students (StudentId, Full Name, Email, Department, GPA, College, Assigned Supervisor dropdown with Assign button, Unassign button, Delete Student button).
  3. **Companies**: Table of companies (CompanyId, Company Name, Contact Email, Location, Posts count, Delete Company button).
  4. **Supervisors**: Table of supervisors (SupervisorId, Full Name, Email, Department, College, Supervised Students count, Delete Supervisor button).
  5. **Internship Posts**: Table of posts (InternshipId, Title, Company Name, Capacity, Applications count, Deadline, Status, Delete Post button [blocked if active accepted students]).
  6. **Approved Applications**: Table of active placements (ApplicationId, Student Name, Company, Position, Assigned Supervisor, Status, Terminate Internship button).
- **Confirmation Modals**:
  - Delete Entity Modal (dynamic for student, company, supervisor, post, user).
  - Terminate Internship Modal (with student and position name).
  - Unassign Supervisor Modal.

---

## 4. Pruning Checklist: Items to Remove from Bridgeway Frontend

| Item | Reason for Deletion | Action |
| :--- | :--- | :--- |
| `supreme-admin.html` | Non-existent role in Backupway2 | **Delete file** |
| `institution-admin.html` | Non-existent role in Backupway2 | **Delete file** |
| `company-empty.html` | Duplicate static mockup; empty state is handled dynamically in `company-dashboard.html` | **Delete file** |
| `login.html`: `institution_admin` button | Non-existent role | **Remove button & replace with Admin role** |
| `login.html`: `supreme_admin` button | Non-existent role | **Remove button** |
| `login.js`: `institution_admin` & `supreme_admin` configs | Non-existent roles | **Remove role objects & add standard Admin role** |
| `users.json`: roles 14-18 | Non-existent roles | **Clean up users list to 4 standard roles** |
| `student-dashboard.html`: Tab 3 ("Training Progress" / logbooks) | Non-existent feature in Backupway2 (students do not log hours) | **Remove Tab 3 button & Tab 3 panel** |
| `student-dashboard.html`: Link to `student-application.html` | Non-existent separate page; tracked in Tab 2 | **Remove link & redirect to Tab 2** |
| `student-application.html` | Separate tracker page not in Backupway2; all application tracking is in student dashboard Tab 2 | **Delete file or redirect to student-dashboard.html** |
| Navbar references to deleted pages | Broken links | **Clean up all navbars across all remaining pages** |
