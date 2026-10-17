// Exercise the local CV preview without uploading documents or calling AI.
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const storage = new Map();
const node = () => ({hidden:false, textContent:'', value:'', files:[], handlers:{}, addEventListener(event, handler) {this.handlers[event] = handler;}});
const input = node(), status = node(), remove = node(), notice = node();
const scores = [98, 91, 89].map(value => ({...node(), dataset:{cvScore:String(value)}, parentElement:{querySelector:() => node()}}));
const scope = {
  crypto:webcrypto,
  window:{addEventListener() {}},
  sessionStorage:{getItem:key => storage.get(key) || null, setItem:(key, value) => storage.set(key, value), removeItem:key => storage.delete(key)},
  document:{getElementById:id => ({studentCvFile:input, studentCvStatus:status, removeStudentCv:remove, cvMatchPreviewNote:notice})[id], querySelectorAll:() => scores}
};
runInNewContext(read('shared/js/portal.js').split('/* Shared sample relationships.')[0], scope);
scope.root={querySelector:selector=>scope.document.getElementById(selector.slice(1))};
scope.buildProfile=()=>{};
runInNewContext('// Select a local file' + read('pages/student-profile/student-profile.js').split('// Select a local file')[1].split('// End local CV selection.')[0], scope);
const refresh = () => runInNewContext('function updateCvMatches() {' + read('pages/student-dashboard/student-dashboard.js').split('function updateCvMatches() {')[1].split('window.addEventListener(\'pageshow\', updateCvMatches);')[0], scope);
const select = file => {input.files = [file]; input.handlers.change();};
refresh();
assert(scores.every(score => score.hidden) && notice.hidden, 'No CV: do not display a percentage.');
assert(remove.hidden);
select({name:'sample-cv.pdf', size:2048});
assert.equal(scope.window.BridgewayCV.read().name, 'sample-cv.pdf');
assert(status.textContent.includes('not uploaded or analyzed'));
assert.deepEqual(Object.keys(JSON.parse([...storage.values()][0])).sort(), ['name', 'size']);
refresh();
assert(scores.every(score => score.hidden) && notice.hidden, 'Selecting a CV must not reveal fabricated AI scores.');
for (const file of [{name:'bad.txt', size:20}, {name:'empty.pdf', size:0}, {name:'large.docx', size:6 * 1024 * 1024}]) {
  select(file);
  assert.equal(scope.window.BridgewayCV.read().name, 'sample-cv.pdf', 'Invalid files preserve the previous selection.');
}
select({name:'replacement.docx', size:4096});
assert.equal(scope.window.BridgewayCV.read().name, 'replacement.docx');
remove.handlers.click();
refresh();
assert.equal(scope.window.BridgewayCV.read(), null);
assert(scores.every(score => score.hidden) && notice.hidden && remove.hidden);
storage.set(scope.window.BridgewayCV.key, '{bad json');
assert.equal(scope.window.BridgewayCV.read(), null);
scope.sessionStorage.setItem = () => {throw Error('Storage unavailable');};
select({name:'local-only.pdf', size:100});
assert(status.textContent.includes('cannot carry over to listings'));
console.log('PASS: CV selection, replacement/removal, validation, metadata-only storage, and no synthetic match scores.');
