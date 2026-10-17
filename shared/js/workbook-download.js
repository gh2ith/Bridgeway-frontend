/* Small offline XLSX snapshot writer. No network, macros, formulas or external links.
   Text is always an inline string, including values beginning with =, +, - or @. */
(() => {
  'use strict';
  const enc = new TextEncoder();
  const xml = value => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const column = index => { let result = ''; for (index++; index; index = Math.floor((index - 1) / 26)) result = String.fromCharCode(65 + (index - 1) % 26) + result; return result; };
  const crcTable = Uint32Array.from({length:256}, (_, n) => { for (let k=0;k<8;k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
  const crc = bytes => { let n = 0xffffffff; for (const b of bytes) n = crcTable[(n ^ b) & 255] ^ (n >>> 8); return (n ^ 0xffffffff) >>> 0; };
  function zip(files) {
    const local = [], central = []; let offset = 0, directorySize = 0;
    for (const [path, content] of files) {
      const name = enc.encode(path), data = enc.encode(content), hash = crc(data);
      const header = new Uint8Array(30 + name.length), view = new DataView(header.buffer);
      view.setUint32(0,0x04034b50,true); view.setUint16(4,20,true); view.setUint16(6,0x800,true); view.setUint16(12,33,true);
      view.setUint32(14,hash,true); view.setUint32(18,data.length,true); view.setUint32(22,data.length,true); view.setUint16(26,name.length,true); header.set(name,30);
      local.push(header,data);
      const entry = new Uint8Array(46 + name.length), e = new DataView(entry.buffer);
      e.setUint32(0,0x02014b50,true); e.setUint16(4,20,true); e.setUint16(6,20,true); e.setUint16(8,0x800,true); e.setUint16(14,33,true);
      e.setUint32(16,hash,true); e.setUint32(20,data.length,true); e.setUint32(24,data.length,true); e.setUint16(28,name.length,true); e.setUint32(42,offset,true); entry.set(name,46);
      central.push(entry); directorySize += entry.length; offset += header.length + data.length;
    }
    const end = new Uint8Array(22), v = new DataView(end.buffer);
    v.setUint32(0,0x06054b50,true); v.setUint16(8,files.length,true); v.setUint16(10,files.length,true); v.setUint32(12,directorySize,true); v.setUint32(16,offset,true);
    return new Blob([...local,...central,end], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  const ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  function build(sheets) {
    if(!Array.isArray(sheets)||!sheets.length)throw new Error('At least one worksheet is required');
    const names = new Set();
    for (const s of sheets) {
      if (!s.name || s.name.length>31 || /[\\/?*\[\]:]/.test(s.name) || names.has(s.name.toLowerCase())) throw new Error('Invalid worksheet name');
      if(!s.headers?.length||s.rows.some(row=>row.length>s.headers.length)||s.headerLabels&&s.headerLabels.length!==s.headers.length)throw new Error('Invalid worksheet columns');
      names.add(s.name.toLowerCase());
    }
    const files = [];
    const hasTable=s=>s.name!=='Read me'&&s.rows.length>0;
    files.push(['[Content_Types].xml',`<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>${hasTable(s)?`<Override PartName="/xl/tables/table${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>`:''}`).join('')}</Types>`]);
    files.push(['_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>']);
    files.push(['xl/workbook.xml',`<workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>${sheets.map((s,i)=>`<sheet name="${xml(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets><definedNames>${sheets.map((s,i)=>`<definedName name="_xlnm.Print_Titles" localSheetId="${i}">'${xml(s.name.replaceAll("'","''"))}'!$5:$5</definedName>`).join('')}</definedNames></workbook>`]);
    files.push(['xl/_rels/workbook.xml.rels',`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`]);
    // Body styles retain banding for numbers and dates as well as text.
    const bodyStyles=[4,3].flatMap(fill=>[0,3,164,165].map(format=>`<xf numFmtId="${format}" fontId="0" fillId="${fill}" borderId="0" xfId="0" applyFont="1" applyFill="1" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="${format?'right':'left'}" vertical="center" indent="1" wrapText="1"/></xf>`)).join('');
    const statusColors=[['E7F5EF','17664B'],['FFF3DB','885500'],['FCECEC','A52834'],['EDF2FD','2455D6']];
files.push(['xl/styles.xml',`<styleSheet xmlns="${ns}"><numFmts count="3"><numFmt numFmtId="166" formatCode="#,##0.00"/><numFmt numFmtId="164" formatCode="dd mmm yyyy"/><numFmt numFmtId="165" formatCode="0.0%"/></numFmts><fonts count="4"><font><sz val="11"/><color rgb="FF172C48"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font><font><b/><sz val="17"/><color rgb="FF172C48"/><name val="Arial"/></font><font><sz val="11"/><color rgb="FF52647C"/><name val="Arial"/></font></fonts><fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF193654"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3F6FC"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor rgb="FFFFFFFF"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right style="thin"><color rgb="FFFFFFFF"/></right><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="13">${bodyStyles}<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>${[4,3].map(fill=>`<xf numFmtId="166" fontId="0" fillId="${fill}" borderId="0" xfId="0" applyFont="1" applyFill="1" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="right" vertical="center" indent="1" wrapText="1"/></xf>`).join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="6">${statusColors.map(([fill,color])=>`<dxf><font><color rgb="FF${color}"/></font><fill><patternFill patternType="solid"><fgColor rgb="FF${fill}"/><bgColor rgb="FF${fill}"/></patternFill></fill></dxf>`).join('')}<dxf><font><b/><color rgb="FF17664B"/></font></dxf><dxf><font><b/><color rgb="FF59677B"/></font></dxf></dxfs></styleSheet>`]);
    sheets.forEach((s,i) => {
      const headerLabels=s.headerLabels||s.headers;
      const rowData = [[],[s.title || s.name],[s.note || ''],[s.context||''],headerLabels,...s.rows];
      const last = column(s.headers.length-1), end=rowData.length;
      const width=c=>s.widths?.[c]||22;
      const wrapLines=(value,capacity)=>String(value).split('\n').reduce((total,line)=>{
        let lines=1,used=0;for(const word of line.split(/\s+/)){const size=word.length;if(used&&used+size+1>capacity){lines++;used=0;}if(size>capacity){lines+=Math.floor((size-1)/capacity);used=size%capacity||capacity;}else used+=(used?1:0)+size;}return total+lines;
      },0);
      const fittedHeight=row=>Math.min(409,Math.max(30,...row.map((v,c)=>v==null||typeof v==='number'||v instanceof Date?30:wrapLines(v,Math.max(6,width(c)-4))*15+14)));
      const totalWidth=s.headers.reduce((n,_,c)=>n+width(c),0);
      const noteHeight=value=>value?Math.max(24,wrapLines(value,Math.max(20,totalWidth-6))*15+10):12;
      const headerHeight=Math.max(48,...headerLabels.map((value,c)=>wrapLines(value,Math.max(6,width(c)-4))*15+16));
      const rows = rowData.map((row,r)=>`<row r="${r+1}" ht="${r===0?12:r===1?34:r===2?noteHeight(s.note):r===3?noteHeight(s.context):r===4?headerHeight:fittedHeight(row)}" customHeight="1">${row.map((value,c)=>{
        const ref = `${column(c)}${r+1}`, band=r%2===0?4:0;
        let style = r===1?9:r===4?8:r<4?10:band;
        if(value == null) return `<c r="${ref}" s="${style}"/>`;
        if(value instanceof Date){
          style=band+2;value=value.getTime()/86400000+25569;
          if(!Number.isFinite(value))return `<c r="${ref}" s="${style}"/>`;
        } else if(r>4&&typeof value==='number')style=s.percentColumns?.includes(c)?band+3:Number.isInteger(value)?band+1:band===0?11:12;
        if(typeof value==='number'&&Number.isFinite(value))return `<c r="${ref}" s="${style}"><v>${value}</v></c>`;
        return `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(String(value).slice(0,32767))}</t></is></c>`;
      }).join('')}</row>`).join('');
      let priority=1;
      const statusRules=s.headers.flatMap((header,c)=>{
        if(!/status|outcome|company result|student report access/i.test(header)||!s.rows.length)return [];
        const col=column(c), textOnly=s.statusStyle==='text', categories=textOnly?[['Active'],['Inactive']]:[['Active','Completed','Approved','Complete','Resolved','Visible'],['Awaiting review','In progress','Awaiting requester','Changes requested','Incomplete'],['Left','Paused','Inactive','Account suspended','Restricted'],['Open','Not submitted','History only','Not reported']];
        return [`<conditionalFormatting sqref="${col}6:${col}${end}">${categories.map((values,dxf)=>`<cfRule type="expression" dxfId="${textOnly?dxf+4:dxf}" priority="${priority++}"><formula>OR(${values.map(value=>`${col}6="${value}"`).join(',')})</formula></cfRule>`).join('')}</conditionalFormatting>`];
      }).join('');
      const freeze=Math.min(s.freezeColumns??1,s.headers.length-1);
      const pane=`<pane ${freeze?`xSplit="${freeze}" `:''}ySplit="5" topLeftCell="${column(freeze)}6" activePane="${freeze?'bottomRight':'bottomLeft'}" state="frozen"/>`;
      files.push([`xl/worksheets/sheet${i+1}.xml`,`<worksheet xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><tabColor rgb="${i===0?'FF2455D6':'FFA8BCE9'}"/><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:${last}${end}"/><sheetViews><sheetView workbookViewId="0" showGridLines="0" zoomScale="90" zoomScaleNormal="100">${pane}<selection pane="${freeze?'bottomRight':'bottomLeft'}" activeCell="${column(freeze)}6" sqref="${column(freeze)}6"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="24"/><cols>${s.headers.map((h,c)=>`<col min="${c+1}" max="${c+1}" width="${width(c)}" customWidth="1"/>`).join('')}</cols><sheetData>${rows}</sheetData>${hasTable(s)?'':`<autoFilter ref="A5:${last}${end}"/>`}<mergeCells count="3"><mergeCell ref="A2:${last}2"/><mergeCell ref="A3:${last}3"/><mergeCell ref="A4:${last}4"/></mergeCells>${statusRules}<printOptions horizontalCentered="0"/><pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><pageSetup paperSize="${totalWidth>170?8:9}" orientation="landscape" fitToWidth="1" fitToHeight="0"/><headerFooter><oddFooter>&amp;LBridgeway&amp;RPage &amp;P of &amp;N</oddFooter></headerFooter>${hasTable(s)?'<tableParts count="1"><tablePart r:id="table"/></tableParts>':''}</worksheet>`]);
      if(hasTable(s)){
        const ref=`A5:${last}${end}`;
        files.push([`xl/worksheets/_rels/sheet${i+1}.xml.rels`,`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="table" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table${i+1}.xml"/></Relationships>`]);
        files.push([`xl/tables/table${i+1}.xml`,`<table xmlns="${ns}" id="${i+1}" name="Bridgeway_${i+1}" displayName="Bridgeway_${i+1}" ref="${ref}" totalsRowShown="0"><autoFilter ref="${ref}"/><tableColumns count="${headerLabels.length}">${headerLabels.map((h,c)=>`<tableColumn id="${c+1}" name="${xml(h).replaceAll('\n','&#10;')}"/>`).join('')}</tableColumns><tableStyleInfo name="TableStyleLight9" showFirstColumn="0" showLastColumn="0" showRowStripes="0" showColumnStripes="0"/></table>`]);
      }
    });
    return zip(files);
  }
  function download(sheets, filename) {
    const url = URL.createObjectURL(build(sheets)), a = document.createElement('a');
    a.href=url; a.download=filename; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  window.BridgewayWorkbook = {build, download};
})();
