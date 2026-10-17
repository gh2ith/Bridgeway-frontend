import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../shared/js/portal-theme-init.js', import.meta.url), 'utf8');
for (const [stored, expected] of [[null, 'light'], ['dark', 'dark'], ['light', 'light'], ['invalid', 'light']]) {
  const document = { documentElement: { dataset: {} } };
  vm.runInNewContext(source, { document, localStorage: { getItem: () => stored } });
  assert.equal(document.documentElement.dataset.theme, expected);
}
const document = { documentElement: { dataset: {} } };
vm.runInNewContext(source, { document, localStorage: { getItem() { throw new Error('Storage blocked'); } } });
assert.equal(document.documentElement.dataset.theme, 'light');
for (const page of ['home/index', 'login/login']) {
  const html = fs.readFileSync(new URL(`../pages/${page}.html`, import.meta.url), 'utf8');
  assert.ok(!html.includes('portal-theme-init.js'), `${page} must remain independent of portal preferences`);
}
console.log('PASS: Portal theme defaults, persistence initialization, blocked storage fallback, and home/login isolation.');
