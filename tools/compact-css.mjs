// One rule per line; preserve declaration order, strings, and nested media rules.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname,'..');
function delimiters(text) {
  const result = [];
  let quote = '', comment = false, parentheses = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (comment) { if (char === '*' && text[i+1] === '/') { comment = false; i++; } continue; }
    if (quote) { if (char === '\\') i++; else if (char === quote) quote = ''; continue; }
    if (char === '/' && text[i+1] === '*') { comment = true; i++; continue; }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === '(') parentheses++;
    if (char === ')') parentheses--;
    if (!parentheses && '{};'.includes(char)) result.push({index:i,char});
  }
  return result;
}
function flat(text) {
  return text.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\*[\s\S]*?\*\/|\s+/g, token => /^\s+$/.test(token) ? ' ' : token).trim();
}
function format(text, depth = 0) {
  const tokens = delimiters(text), lines = [], indent = '  '.repeat(depth);
  let start = 0;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.char === ';') { lines.push(indent + flat(text.slice(start,token.index+1))); start = token.index+1; continue; }
    if (token.char !== '{') throw new Error('Unbalanced stylesheet');
    let nesting = 1, end = i+1;
    for (; end < tokens.length && nesting; end++) { if (tokens[end].char === '{') nesting++; if (tokens[end].char === '}') nesting--; }
    if (nesting) throw new Error('Unclosed stylesheet block');
    const closing = tokens[end-1], header = flat(text.slice(start,token.index)), body = text.slice(token.index+1,closing.index);
    const nested = tokens.slice(i+1,end-1).some(item => item.char === '{');
    if (nested) lines.push(`${indent}${header} {`,format(body,depth+1),`${indent}}`);
    else lines.push(`${indent}${header} { ${flat(body)} }`);
    start = closing.index+1;
    i = end-1;
  }
  if (text.slice(start).trim()) lines.push(indent + flat(text.slice(start)));
  return lines.join('\n');
}
let before = 0, after = 0;
function walk(folder) {
  for (const entry of fs.readdirSync(folder,{withFileTypes:true})) {
    const file = path.join(folder,entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!file.endsWith('.css')) continue;
    const original = fs.readFileSync(file,'utf8'), compact = format(original) + '\n';
    // Only whitespace outside strings changes, never rules/declarations.
    const signature = text => text.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\s+/g, token => /^\s+$/.test(token) ? '' : token);
    if (signature(original) !== signature(compact)) throw new Error(`Unexpected content change: ${file}`);
    before += original.split('\n').length;
    after += compact.split('\n').length;
    fs.writeFileSync(file,compact);
  }
}
walk(path.join(root,'pages'));
walk(path.join(root,'shared','css'));
console.log(`CSS formatted: ${before} → ${after} lines; all non-whitespace content preserved.`);
