const advancedLesson1003=document.querySelector('#advanced-lesson')
function syncAdvancedTarget1003(){if(advancedLesson1003)advancedLesson1003.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget1003)
syncAdvancedTarget1003()

// Section 21's lab: The Paper Trail. A second, simplified dataset from the
// worked doc_9f21 SQL above -- D100/V1/V2/C1-C3/E1-E3/X1 -- built specifically
// so three chunks are on screen at once and only one of them (C3) is ever
// cited. Clicking a chunk chip traces its own row backward to its version
// and document and forward to its embedding and (only sometimes) citation.

const CHUNKS_1003={
  C1:{version:'V1',versionLabel:'SUPERSEDED',embedding:'E1',citation:null},
  C2:{version:'V2',versionLabel:'CURRENT',embedding:'E2',citation:null},
  C3:{version:'V2',versionLabel:'CURRENT',embedding:'E3',citation:'X1'}
}
const ALL_CHUNK_IDS_1003=Object.keys(CHUNKS_1003)
const ALL_VERSION_IDS_1003=['V1','V2']
const ALL_EMBEDDING_IDS_1003=['E1','E2','E3']
const CITATION_ID_1003='X1'
const DOC_ID_1003='D100'

function chip_1003(id){return document.querySelector(`#chip_1003_${id}`)}

const chunkChips_1003=ALL_CHUNK_IDS_1003.map(id=>chip_1003(id))
const readoutRow_1003=document.querySelector('#readoutRow_1003')
const readoutTables_1003=document.querySelector('#readoutTables_1003')
const readoutHops_1003=document.querySelector('#readoutHops_1003')
const readoutCited_1003=document.querySelector('#readoutCited_1003')
const fkCallout_1003=document.querySelector('#fkCallout_1003')
const resetBtn_1003=document.querySelector('#resetBtn_1003')

const DEFAULT_CALLOUT_1003='Click C1, C2 or C3 above to trace its own chain across all five tables.'

function clearClasses_1003(){
  ;[DOC_ID_1003,...ALL_VERSION_IDS_1003,...ALL_CHUNK_IDS_1003,...ALL_EMBEDDING_IDS_1003,CITATION_ID_1003]
    .forEach(id=>{
      const el=chip_1003(id)
      if(!el)return
      el.classList.remove('mover','tp','tn')
    })
  chunkChips_1003.forEach(el=>{ if(el) el.setAttribute('aria-pressed','false') })
}

function resetLab_1003(){
  clearClasses_1003()
  if(readoutRow_1003)readoutRow_1003.textContent='—'
  if(readoutTables_1003)readoutTables_1003.textContent='0 / 5'
  if(readoutHops_1003)readoutHops_1003.textContent='—'
  if(readoutCited_1003)readoutCited_1003.textContent='—'
  if(fkCallout_1003){
    fkCallout_1003.textContent=DEFAULT_CALLOUT_1003
    fkCallout_1003.classList.remove('warning')
  }
}

function selectChunk_1003(chunkId){
  const row=CHUNKS_1003[chunkId]
  if(!row)return
  clearClasses_1003()

  // the clicked chip itself
  const clickedChip=chip_1003(chunkId)
  if(clickedChip){
    clickedChip.classList.add('mover')
    clickedChip.setAttribute('aria-pressed','true')
  }
  // its two sibling chunks did not get selected
  ALL_CHUNK_IDS_1003.filter(id=>id!==chunkId).forEach(id=>{
    const el=chip_1003(id)
    if(el)el.classList.add('tn')
  })

  // backward: version -- matched one is tp, the other is tn
  ALL_VERSION_IDS_1003.forEach(id=>{
    const el=chip_1003(id)
    if(!el)return
    el.classList.add(id===row.version?'tp':'tn')
  })

  // backward: documents -- the single D100 chip is always tp
  const docChip=chip_1003(DOC_ID_1003)
  if(docChip)docChip.classList.add('tp')

  // forward: embeddings -- matched one is tp, the others are tn
  ALL_EMBEDDING_IDS_1003.forEach(id=>{
    const el=chip_1003(id)
    if(!el)return
    el.classList.add(id===row.embedding?'tp':'tn')
  })

  // forward: citations -- tp only if this chunk actually has one, else X1 is tn
  const citeChip=chip_1003(CITATION_ID_1003)
  const cited=Boolean(row.citation)
  if(citeChip)citeChip.classList.add(cited?'tp':'tn')

  const tablesTouched=cited?5:4
  const hopsText=cited
    ? `${chunkId} → ${row.version} → ${DOC_ID_1003} (back) · ${chunkId} → ${row.embedding} → ${row.citation} (forward)`
    : `${chunkId} → ${row.version} → ${DOC_ID_1003} (back) · ${chunkId} → ${row.embedding} (forward)`

  if(readoutRow_1003)readoutRow_1003.textContent=chunkId
  if(readoutTables_1003)readoutTables_1003.textContent=`${tablesTouched} / 5`
  if(readoutHops_1003)readoutHops_1003.textContent=hopsText
  if(readoutCited_1003)readoutCited_1003.textContent=cited
    ? `YES — cited by ${row.citation}`
    : 'NO — retrieved and embedded, never cited'

  if(fkCallout_1003){
    if(cited){
      fkCallout_1003.classList.remove('warning')
      fkCallout_1003.innerHTML=`<b>${chunkId} is cited.</b> ${row.citation} points this exact chunk back as the source for a generated answer -- Module 03 Concept 04's own definition of a citation ("a citation tag pointing a claim back to the passage that backed it"), working exactly as documented.`
    } else {
      fkCallout_1003.classList.add('warning')
      fkCallout_1003.innerHTML=`<b>${chunkId} is not cited.</b> It was retrieved (${row.version}, ${DOC_ID_1003}) and embedded (${row.embedding}), but no generated answer has ever pointed back at it. Being embedded and retrievable does not guarantee a chunk is ever cited (Module 03 Concept 04).`
    }
  }
}

chunkChips_1003.forEach(el=>{
  if(!el)return
  el.addEventListener('click',()=>selectChunk_1003(el.id.replace('chip_1003_','')))
  el.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      e.preventDefault()
      selectChunk_1003(el.id.replace('chip_1003_',''))
    }
  })
})

resetBtn_1003?.addEventListener('click',resetLab_1003)

resetLab_1003()
