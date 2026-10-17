// Prevent the superseded supervisor-hiring workflow from returning to live pages.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
function files(dir) {
  return readdirSync(new URL(dir, root), { withFileTypes:true }).flatMap(entry =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
}
const forbidden = [
  /The Company cannot influence this (?:academic )?decision/i,
  /Supervisor<\/strong>\s+reviews and approves\/rejects your applications/i,
  /pending supervisor approval/i,
  /Supervisor Review in Progress/i,
  /Awaiting Faculty Endorsement/i,
  /Academic Approval \(Status:/i,
  /application[^\n]*through your academic supervisor's official endorsement/i,
  /application[^\n]*sent to the[^\n]*university supervisor/i,
  /Supervisors grade the 8-criteria evaluation rubric/i,
  /Supervisors Monitor Interns, Submit Evaluations/i,
  /(?:faculty|university) advisor notified!/i
];
for (const path of [...files('pages'), ...files('shared/js')].filter(path => /\.(html|js)$/.test(path))) {
  const source = read(path);
  forbidden.forEach(rule => assert(!rule.test(source), `Superseded workflow in ${path}: ${rule}`));
}
const student = read('pages/student-dashboard/student-dashboard.html');
const profile = read('pages/student-profile/student-profile.html');
const supervisor = read('pages/supervisor-dashboard/supervisor-dashboard.html');
const company = read('pages/company-dashboard/company-dashboard.html');
const college = read('pages/admin-dashboard/admin-dashboard.html');
const collegeListings = college.split('id="tab-posts"')[1].split('id="tab-approved"')[0];
assert(!college.includes('Manage Posts'), 'College listings must not imply company listing management.');
assert(!collegeListings.includes('openDeleteModal') && collegeListings.includes('data-college-listing-toggle'), 'Colleges may pause their own listing availability, not delete company listings.');
assert(read('pages/admin-dashboard/admin-dashboard.js').includes("student.hidden=tab!=='tab-overview'"), 'Avoid duplicate creation actions in college directory views.');
assert(read('shared/js/portal.js').includes('Terminate placement for ${student.name}'), 'Every college placement must have a consistently labeled termination action.');
assert(read('shared/js/portal.js').includes("row.dataset.terminated='true'"), 'Preview termination must update the placement, not only show a toast.');
assert(company.includes('id="companyWeeklyDetail" hidden'), 'Company reports must start without a selected student.');
assert(company.includes('class="evaluation-form-area" hidden'), 'Company evaluations must start without a selected student.');
assert(company.includes('id="companyWeeklyPrompt"') && company.includes('id="companyEvaluationPrompt"'));
assert(company.includes('id="companyAcceptedTableBody"'), 'Accepted students must have a separate table.');
assert(!/<button[^>]*class="bw-masar-item"[^>]*data-open-modal="postJobModal"/.test(company), 'Posting belongs in the dashboard, not the sidebar.');
assert(supervisor.includes('id="supervisorReportDetail" hidden'), 'Weekly reports must start without student details.');
assert(supervisor.includes('aria-labelledby="supervisorEvaluationName" hidden'), 'Evaluations must start without student details.');
assert(supervisor.includes('id="supervisorReportPrompt"') && supervisor.includes('id="supervisorEvaluationPrompt"'));
assert(!read('pages/supervisor-dashboard/supervisor-dashboard.js').includes("let selected='sarah'"), 'Do not auto-select an evaluation.');
assert(student.includes('id="tab-applications"') && student.includes('data-tab="tab-applications"'), 'Applications must be a student dashboard sidebar view.');
assert(/<button\b[^>]*data-tab="tab-applications"[^>]*>[\s\S]*?<span>My Applications<\/span>[\s\S]*?<\/button>/.test(student), 'My Applications must remain directly accessible from the sidebar.');
assert(student.includes('id="studentApplicationsTable"') && student.includes('id="my-applications"'));
assert(student.includes('data-application-status="accepted"') && student.includes('data-application-status="pending"'));
assert(student.includes('id="withdrawModal"'), 'Pending withdrawal stays available in Applications.');
assert(profile.includes('href="../student-dashboard/student-dashboard.html"') && profile.includes('<span>Dashboard</span>'), 'Profile navigation must return to the student dashboard.');
assert(!profile.includes('id="my-applications"'), 'Applications no longer belong in Profile.');

assert(profile.includes('id="studentCvFile"') && /no file is uploaded or analyzed/i.test(profile));
assert(!/\d+% Match<\/span>/.test(student), 'Do not display unqualified sample match scores.');
assert(student.includes('cv-upload-link') && !student.includes('data-cv-score='), 'Do not relabel fixed percentages as real AI results.');
assert(!read('shared/js/student-studio.js').includes("samples={'listing-tech'"), 'Synthetic role-fit scores must not be presented as live results.');
assert(!student.includes('Why this match'), 'Do not add match explanations.');
assert(read('shared/js/portal.js').includes('if (viewOnly || !pendingApplyBtn)'), 'Accepted students cannot confirm applications.');
assert(!student.includes('Approval Process'), 'Remove the student academic-approval callout.');
assert(student.includes('host company</strong>'), 'Application confirmation must identify the host company.');
assert(read('pages/home/index.html').includes('Company Review in Progress'));
assert(read('shared/js/portal.js').includes("Reject applicant"));
assert(read('shared/js/enhancements.js').includes("stage==='Rejected'?'rejected'"));
assert(read('shared/js/portal.js').includes('bw-badge-amber"><i class="bi bi-hourglass-split me-1"></i>Pending'));
assert(!read('docs/backupway2_functionality_spec.md').includes('creates Application with `Status = 1`'));
assert(read('shared/js/portal.js').includes("id:'lina',name:'Lina Haddad',college:'college-1',company:null,stage:'Not applied',role:null"), 'Fresh student must not have an application or placement.');
assert(read('pages/student-dashboard/student-dashboard.js').includes("previewStudent.stage === 'Not applied'"), 'Fresh student must start with empty application and training views.');
assert(read('shared/js/portal.js').includes("tr.dataset.applicationStatus = 'pending'"), 'New preview applications must be pending, not accepted.');
console.log('PASS: Company application decisions, pending submission, and supervisor training-only boundaries.');
const cycle=read('shared/js/workspace-cycle.js'),journal=read('shared/js/student-training-journal.js');
assert(!cycle.includes('supervisor-objective-rating'),'Supervisors must not score weekly objectives.');
assert(!cycle.includes('w.ratings[i]'),'Report approval must not depend on supervisor ratings.');
assert(cycle.includes("verify.disabled=w.status!=='submitted'"),'Submitted company reports must be approvable without a new rating cycle.');
assert(cycle.includes('Approve report · ${w.actualHours} h'),'Supervisor action must approve the company report.');
assert(!journal.includes('Supervisor assessment:'),'Students must not see legacy supervisor-created scores.');
console.log('PASS: Supervisor approves company reports without creating or requiring a separate student rating.');
