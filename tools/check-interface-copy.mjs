import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.isDirectory()?files(path.join(dir,item.name)):/\.(html|js)$/.test(item.name)?[path.join(dir,item.name)]:[]);}
const forbidden=[
  /\bpreview only\b/i,/\bsample workspace\b/i,/\bdemo options\b/i,
  /\bcreate preview ticket\b/i,/\bpreview profile changes\b/i,
  /\bCV match\s*·\s*Sample\b/i,/\bticket created\s*·\s*Sample\b/i,
  /\bfixed sample data\b/i,/\bfrontend preview\b/i,/\bbeta\b/i
];
for(const file of [...files(path.join(root,'pages')),...files(path.join(root,'shared/js'))]){
  const source=fs.readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  // The migration intentionally recognizes exact old system copy, without displaying it.
  const displaySource=source.replace(/^\s*state\.(?:listings|histories|audit)\.forEach\(.*$/gm,'');
  for(const expression of forbidden)assert(!expression.test(displaySource),path.relative(root,file)+': '+expression);
}
const studio=fs.readFileSync(path.join(root,'shared/js/student-studio.js'),'utf8');
assert(!studio.includes("samples={'listing-tech'"),'Do not relabel synthetic scores as genuine matches.');
const workspace=fs.readFileSync(path.join(root,'shared/js/workspace-cycle.js'),'utf8');
assert(!workspace.includes("E('div',null,'cycle-preview')"),'Do not restore the simulation footer.');
const company=fs.readFileSync(path.join(root,'pages/company-dashboard/company-dashboard.html'),'utf8');
assert(!company.includes('class="assessment-demo"'),'Do not restore evaluation autofill controls.');
console.log('PASS: No pre-release interface branding, simulation footer, demo menu, or synthetic AI match percentages.');
