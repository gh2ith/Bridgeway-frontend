// Build the same offline export as the portal, using its built-in records.
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),output=path.resolve(process.argv[2]||'output/workbooks/bridgeway-source.xlsx');
const read=name=>fs.readFile(new URL(name,root),'utf8');
const element=()=>({setAttribute(){},append(){},addEventListener(){},classList:{add(){}}});
const sandbox={window:{},document:{body:{dataset:{portalRole:'platform_admin'}},addEventListener(){},createElement:element,getElementById(){return null;}},location:{pathname:'/pages/platform-admin/platform-admin.html'},sessionStorage:{getItem(){return null;}},TextEncoder,Uint8Array,Uint32Array,DataView,Blob,Date,console};
vm.createContext(sandbox);
const portal=await read('shared/js/portal.js');
vm.runInContext(portal.slice(portal.indexOf('window.BridgewayPartners ='),portal.indexOf('// URL context')),sandbox);
for(const name of ['report-visibility','workspace-cycle','partnership-review','workbook-download'])vm.runInContext(await read(`shared/js/${name}.js`),sandbox);
const sheets=process.argv.includes('--tickets')?sandbox.window.BridgewayCycle.ticketSheets({view:'received'}):sandbox.window.BridgewayPartnerships.sheets(sandbox.window.BridgewayPartnerships.collect(),{details:process.argv.includes('--details')});
const blob=sandbox.window.BridgewayWorkbook.build(sheets);
await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,new Uint8Array(await blob.arrayBuffer()));
console.log(`Exported ${sheets.length} sheets from built-in project records: ${output}`);
