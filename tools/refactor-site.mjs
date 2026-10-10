// One-time, reversible mechanical migration. Run without --apply to validate first.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const originals = new Map(fs.readdirSync(root).filter(name => /\.(html|css|js)$/.test(name)).map(name => [name, fs.readFileSync(path.join(root, name), 'utf8')]));
const pages = [...originals.keys()].filter(name => name.endsWith('.html'));
const slug = name => name === 'index.html' ? 'home' : name.replace(/\.html$/, '');
const route = name => `../${slug(name)}/${name}`;
const outputs = new Map();
const used = new Set();
const decode = text => text.replace(/&quot;/g, '"').replace(/&#(?:39|x27);/gi, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const tidy = text => text.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n').trim() + '\n';
const presentation = [...new Set([...originals.entries()].filter(([name]) => name.endsWith('.css')).flatMap(([,text]) => [...text.matchAll(/\[style\*="([^"]+)"\]/g)].map(match => match[1])))].map(pattern => ({pattern, key:pattern.replace(/[^\w]+/g,'-').replace(/-$/,'')}));
const css = text => tidy(text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\[style\*="([^"]+)"\]/g, (selector, pattern) => `:is(${selector}, [data-presentation~="${presentation.find(item => item.pattern === pattern).key}"])`));
const js = text => tidy(text.replace(/^\s*\/\/\s*[─=\-]{8,}.*$/gm, ''));
function links(text) {
  // Keep filename-based page checks; all migrated pages retain their filenames.
  const checks = [];
  text = text.replace(/\.endsWith\((['"])([^'"]+\.html)\1\)/g, match => { checks.push(match); return `__PAGE_CHECK_${checks.length - 1}__`; });
  text = text.replace(/(?<![\w/.-])([\w-]+\.html)(?![\w-])/g, (match, name) => pages.includes(name) ? route(name) : match);
  text = text.replace(/(?<![\w/.-])assets\//g, '../../assets/');
  return text.replace(/__PAGE_CHECK_(\d+)__/g, (_, index) => checks[index]);
}
function read(name) {
  if (!originals.has(name)) throw new Error(`Missing original source: ${name}`);
  used.add(name);
  return originals.get(name);
}
function bundle(target, names, transform) {
  outputs.set(target, names.map(name => `/* ${name.replace(/\.(css|js)$/, '')} */\n${transform(read(name))}`).join('\n'));
}
bundle('shared/css/base.css', ['styles.css'], css);
bundle('shared/css/portal.css', ['portal.css', 'company-workspace.css'], css);
bundle('shared/css/navigation.css', ['portal-unified.css'], css);
bundle('shared/css/portal-enhancements.css', ['portal-cycle.css', 'portal-refinement.css'], css);
bundle('shared/css/interactions.css', ['bridgeway-interactions.css'], css);
function sharedJS(text) {
  return js(links(text)
    .replace(/\[onclick/g, '[data-onclick')
    .replace(/getAttribute\('onclick'\)\.includes\("'all'"\)/g, "getAttribute('data-onclick').includes('filterCandidates-all-')")
    .replace(/(\w+)\.removeAttribute\('onclick'\)/g, '$1.onclick = null'));
}
bundle('shared/js/portal.js', ['partnership-data.js', 'portal-cycle.js', 'portal.js'], sharedJS);
bundle('shared/js/navigation.js', ['portal-unified.js'], sharedJS);
bundle('shared/js/enhancements.js', ['portal-refinement.js', 'portal-consistency.js'], sharedJS);
bundle('shared/js/interactions.js', ['bridgeway-interactions.js'], sharedJS);
outputs.set('shared/js/theme-init.js', "if (document.documentElement.dataset.page === 'home' && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion');\ndocument.documentElement.setAttribute('data-theme', 'light');\n");

const cssMap = {'styles.css':'base.css','portal.css':'portal.css','company-workspace.css':'portal.css','portal-unified.css':'navigation.css','portal-cycle.css':'portal-enhancements.css','portal-refinement.css':'portal-enhancements.css','bridgeway-interactions.css':'interactions.css'};
const jsMap = {'partnership-data.js':'portal.js','portal-cycle.js':'portal.js','portal.js':'portal.js','portal-unified.js':'navigation.js','portal-refinement.js':'enhancements.js','portal-consistency.js':'enhancements.js','bridgeway-interactions.js':'interactions.js'};

// Scan complete tags, respecting quotes (handlers can contain HTML strings).
function tags(html, convert) {
  let result = '', offset = 0;
  while (offset < html.length) {
    const start = html.indexOf('<', offset);
    if (start < 0) { result += html.slice(offset); break; }
    result += html.slice(offset, start);
    let end = start + 1, quote = null;
    for (; end < html.length; end++) {
      const char = html[end];
      if (quote) { if (char === quote) quote = null; }
      else if (char === '"' || char === "'") quote = char;
      else if (char === '>') break;
    }
    const tag = html.slice(start, end + 1);
    result += /^<[a-z]/i.test(tag) ? convert(tag) : tag;
    offset = end + 1;
  }
  return result;
}
const stats = [];
for (const page of pages) {
  const name = slug(page), folder = `pages/${name}`, bodyId = `page-${name}`;
  let html = read(page).replace(/<!--[\s\S]*?-->/g, '');
  const styles = new Map(), handlers = new Map(), pageScripts = [], pageStyles = [];
  const seenCSS = new Set(), seenJS = new Set();
  let scriptInserted = false, styleInserted = false;
  html = html.replace(/<html\b([^>]*)>/i, `<html$1 data-page="${name}">`).replace(/<body\b([^>]*)>/i, `<body$1 id="${bodyId}">`);
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, content) => { pageStyles.push(css(content)); return ''; });
  html = html.replace(/<link\b[^>]*>/gi, tag => {
    const href = tag.match(/href\s*=\s*["']([^"']+)["']/i)?.[1], source = href?.split('?')[0];
    if (!source || !originals.has(source) || !source.endsWith('.css')) return tag;
    if (cssMap[source]) {
      const target = cssMap[source];
      if (seenCSS.has(target)) return '';
      seenCSS.add(target);
      return `<link rel="stylesheet" href="../../shared/css/${target}">`;
    }
    pageStyles.push(css(read(source)));
    if (styleInserted) return '';
    styleInserted = true;
    return `<link rel="stylesheet" href="${name}.css">`;
  });
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attributes, content) => {
    const src = attributes.match(/src\s*=\s*["']([^"']+)["']/i)?.[1], source = src?.split('?')[0];
    if (src && !originals.has(source)) return tag;
    if (!src && /document\.documentElement/.test(content) && !/document\.getElementById/.test(content)) return '<script src="../../shared/js/theme-init.js"></script>';
    if (source && jsMap[source]) {
      const target = jsMap[source];
      if (seenJS.has(target)) return '';
      seenJS.add(target);
      // Pages without custom logic still get their own script before enhancements.
      let prefix = '';
      if (target === 'enhancements.js' && !scriptInserted) { scriptInserted = true; prefix = `<script src="${name}.js"></script>\n  `; }
      return `${prefix}<script src="../../shared/js/${target}"></script>`;
    }
    pageScripts.push(source ? sharedJS(read(source)) : js(links(content)));
    if (scriptInserted) return '';
    scriptInserted = true;
    return `<script src="${name}.js"${/\bdefer\b/.test(attributes) ? ' defer' : ''}></script>`;
  });
  // All remaining scripts are external. Convert only actual HTML tag attributes.
  html = tags(html, tag => {
    tag = tag.replace(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi, (_, quote, content) => {
      const declarations = decode(content).trim().replace(/\s+/g, ' ');
      if (!styles.has(declarations)) styles.set(declarations, `s${styles.size + 1}`);
      const markers = presentation.filter(item => decode(content).includes(item.pattern)).map(item => item.key);
      return ` data-style="${styles.get(declarations)}"${markers.length ? ` data-presentation="${markers.join(' ')}"` : ''}`;
    });
    return tag.replace(/\son(click|submit|change|input|focus|blur|keydown|keyup|mouseover|mouseout)\s*=\s*(["'])([\s\S]*?)\2/gi, (_, event, quote, source) => {
      const code = decode(source), signature = `${event}:${code}`;
      if (!handlers.has(signature)) {
        const call = code.match(/(\w+)\s*\(/)?.[1] || event;
        const argument = code.match(/'([a-zA-Z][\w-]*)'/)?.[1] || '';
        handlers.set(signature, {event, code, key:`${call}-${argument}-${handlers.size + 1}`});
      }
      return ` data-on${event}="${handlers.get(signature).key}"`;
    });
  });
  if (!styleInserted) html = html.replace(/<\/head>/i, `  <link rel="stylesheet" href="${name}.css">\n</head>`);
  if (!scriptInserted) html = html.replace(/<\/body>/i, `  <script src="${name}.js"></script>\n</body>`);
  // Limit rewrites to attribute values; page script/CSS filenames must stay local.
  html = html.replace(/\b(href|src|action)\s*=\s*(["'])(.*?)\2/gi, (attribute, key, quote, value) => {
    if (/^(https?:|data:|mailto:|tel:|#|\.\.\/)/.test(value)) return attribute;
    const filename = value.split(/[?#]/)[0];
    if (pages.includes(filename)) value = route(filename) + value.slice(filename.length);
    else if (value.startsWith('assets/')) value = '../../' + value;
    return `${key}=${quote}${value}${quote}`;
  });
  // Home's local script is named home.js; its original index filename is not a route here.
  const handlerCode = [...handlers.values()].map(({event, code, key}) => `  document.querySelectorAll('[data-on${event}="${key}"]').forEach(element => {\n    element.on${event} = function(event) { ${links(code)} };\n  });`).join('\n');
  if (handlerCode) pageScripts.push(`// Explicit handlers keep HTML presentation-only and preserve native event semantics.\n(function () {\n${handlerCode}\n})();\n`);
  const rules = [...styles].map(([declarations, key]) => `#${bodyId} [data-style="${key}"] { ${declarations} }`).join('\n');
  if (rules) pageStyles.push(`/* Page presentation, deduplicated from former inline styles. */\n${rules}\n`);
  outputs.set(`${folder}/${page}`, tidy(html));
  outputs.set(`${folder}/${name}.css`, tidy(pageStyles.join('\n') || '/* This page uses shared styles. */'));
  outputs.set(`${folder}/${name}.js`, tidy(pageScripts.join('\n') || '// This page uses the shared portal behavior.'));
  stats.push({page, styles:styles.size, handlers:handlers.size});
}

// A single static-server entry point preserves homepage query parameters and hashes.
outputs.set('index.html', '<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Bridgeway</title><script src="shared/js/entry.js" defer></script></head>\n<body><a href="pages/home/index.html">Open Bridgeway</a></body>\n</html>\n');
outputs.set('shared/js/entry.js', "location.replace('pages/home/index.html' + location.search + location.hash);\n");
for (const [file, content] of outputs) if (file.endsWith('.js')) new vm.Script(content, {filename:file});
for (const [file, content] of outputs) {
  if (!file.endsWith('.html')) continue;
  for (const match of content.matchAll(/\b(?:href|src|action)=["']([^"']+)["']/g)) {
    const url = match[1].split(/[?#]/)[0];
    if (!url || /^(?:https?:|data:|mailto:|tel:)/.test(url)) continue;
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), url));
    if (!outputs.has(target) && !fs.existsSync(path.join(root,target))) throw new Error(`Missing link: ${file} -> ${url}`);
  }
}
if (used.size !== originals.size) throw new Error(`Unmigrated source: ${[...originals.keys()].filter(name => !used.has(name)).join(', ')}`);
const lines = texts => [...texts].reduce((sum, text) => sum + text.split('\n').length, 0);
console.log(JSON.stringify({pages:pages.length, outputFiles:outputs.size, linesBefore:lines(originals.values()), linesAfter:lines(outputs.values()), stats}, null, 2));
if (!process.argv.includes('--apply')) process.exit(0);

fs.mkdirSync(path.join(root,'docs','backups'),{recursive:true});
const backup = fs.mkdtempSync(path.join(root,'docs','backups','original-sources-'));
for (const [name, content] of originals) fs.writeFileSync(path.join(backup, name), content);
console.log(`Original sources backed up to ${backup}`);
function safe(relative) {
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) throw new Error(`Outside workspace: ${target}`);
  return target;
}
for (const [file, content] of outputs) {
  const target = safe(file);
  if (file !== 'index.html' && fs.existsSync(target)) throw new Error(`Refusing to overwrite ${file}`);
  fs.mkdirSync(path.dirname(target), {recursive:true});
  fs.writeFileSync(target, content);
}
// Delete only copied, named source files, never directories or broad path globs.
for (const name of originals.keys()) if (name !== 'index.html') fs.unlinkSync(safe(name));
const moves = [];
for (const name of fs.readdirSync(root)) {
  if (!fs.statSync(safe(name)).isFile()) continue;
  let target;
  if (/\.(png|jpg|jpeg|webp)$/i.test(name)) target = `docs/screenshots/${name}`;
  else if (name.endsWith('.md')) target = `docs/${name}`;
  else if (name.endsWith('.json')) target = `shared/data/${name}`;
  if (!target) continue;
  if (fs.existsSync(safe(target))) throw new Error(`Refusing to overwrite ${target}`);
  fs.mkdirSync(path.dirname(safe(target)), {recursive:true});
  fs.renameSync(safe(name),safe(target));
  moves.push({from:name,to:target});
}
fs.writeFileSync(path.join(backup,'migration.json'), JSON.stringify({root,backup,outputs:[...outputs.keys()],moves},null,2));
console.log(`Migration complete. ${moves.length} documentation/data files organized without deletion.`);
