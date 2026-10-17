// Dependency-free structure, syntax, and local-link checks.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const failures = [];
let pages = 0, scripts = 0, links = 0;
const read = file => fs.readFileSync(file, 'utf8');
function checkLink(file, url) {
  if (!url || /^(?:https?:|data:|mailto:|tel:|#)/.test(url)) return;
  const local = decodeURIComponent(url.split(/[?#]/)[0]);
  if (!local) return;
  links++;
  const target = path.resolve(path.dirname(file), local);
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) failures.push(`${path.relative(root,file)} -> ${url}`);
}
function inspectHTML(file, isPage = true) {
  const html = read(file);
  const redirect = html.match(/\bdata-redirect=["']([^"']+)["']/)?.[1];
  if (redirect) checkLink(file,redirect);
  if (isPage && /\s(?:style|on(?:click|change|submit|input|focus|blur|keydown|keyup|mouseover|mouseout))\s*=/i.test(html)) failures.push(`${file}: inline presentation/event code`);
  for (const match of html.matchAll(/\b(?:href|src|action)\s*=\s*["']([^"']+)["']/g)) checkLink(file,match[1]);
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (match[2].trim()) failures.push(`${file}: embedded script`);
    const source = match[1].match(/\bsrc=["']([^"']+)["']/)?.[1];
    if (!source || /^https?:/.test(source)) continue;
    const script = read(path.resolve(path.dirname(file),source.split('?')[0]));
    // JS hrefs resolve from the document, not the external script's directory.
    const destinations = script.replace(/\.endsWith\((['"])[^'"]*\.html\1\)/g,'');
    for (const route of destinations.matchAll(/(['"`])([\w./-]+\.html(?:[?#][^'"`\s]*)?)\1/g)) checkLink(file,route[2]);
  }
}
function inspectSources(folder) {
  for (const entry of fs.readdirSync(folder,{withFileTypes:true})) {
    const file = path.join(folder,entry.name);
    if (entry.isDirectory()) { inspectSources(file); continue; }
    if (file.endsWith('.js')) { scripts++; try { new vm.Script(read(file),{filename:file}); } catch(error) { failures.push(error.message); } }
    if (file.endsWith('.css')) for (const match of read(file).matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) checkLink(file,match[1]);
  }
}
for (const name of fs.readdirSync(path.join(root,'pages'))) {
  const folder = path.join(root,'pages',name), files = fs.readdirSync(folder);
  if (files.length !== 3 || !['.html','.css','.js'].every(ext => files.filter(file => file.endsWith(ext)).length === 1)) failures.push(`${name}: expected exactly HTML, CSS and JS`);
  for (const file of files.filter(file => file.endsWith('.html'))) { pages++; inspectHTML(path.join(folder,file)); }
}
for (const file of fs.readdirSync(root).filter(file => file.endsWith('.html') && file !== 'exploded-view.html')) inspectHTML(path.join(root,file),false);
inspectSources(path.join(root,'pages'));
inspectSources(path.join(root,'shared'));
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`PASS: ${pages} page folders, ${scripts} valid scripts, ${links} local references. No embedded styles, handlers, or scripts.`);
