const advancedLesson0709=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0709(){if(advancedLesson0709)advancedLesson0709.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0709)
syncAdvancedTarget0709()

// Section 14's lab: The Filter-or-Prepend Console. Two modes over the same
// 4-chip candidate row (Solstice Cloud / Cobalt Systems, Refunds / Billing
// sections) -- Mode A gates chips by metadata, scores never change; Mode B
// toggles a contextual header on S1 only, changing only its score. Every
// number below was computed once via an executed Node.js script (cross-
// checked against an independent Python run) and hardcoded here.

const CHIPS_0709=[
  {id:'S1',doc:'solstice-cloud-tos',docLabel:'Solstice Cloud',section:'Refunds',text:'Refunds are processed within 30 days of the request.',baseCos:0.6644,headerCos:0.9759},
  {id:'B1',doc:'cobalt-systems-tos',docLabel:'Cobalt Systems',section:'Refunds',text:'Refunds are processed within 45 days of the request.',baseCos:0.6644,headerCos:0.6644},
  {id:'S2',doc:'solstice-cloud-tos',docLabel:'Solstice Cloud',section:'Billing',text:'Invoices are issued on the first day of each billing cycle.',baseCos:0.0000,headerCos:0.0000},
  {id:'B2',doc:'cobalt-systems-tos',docLabel:'Cobalt Systems',section:'Billing',text:'Invoices are generated automatically at the end of each month.',baseCos:0.0000,headerCos:0.0000},
]
const QUERY_0709='How long does Solstice Cloud take to process a refund?'

const modeButtons0709=[...document.querySelectorAll('#s14 .lab-actions [data-mode]')]
const controlsWrap0709=document.querySelector('#filterHeaderControls_0709')
const chipsWrap0709=document.querySelector('#filterHeaderChips_0709')
const verdict0709=document.querySelector('#filterHeaderVerdict_0709')

let currentMode0709='filter'
let sourceFilter0709='any'
let sectionFilter0709='any'
let headerOn0709=false

function syncModeButtons0709(){
  modeButtons0709.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===currentMode0709))
}

function renderChips0709(){
  if(!chipsWrap0709)return
  const included=CHIPS_0709.filter(c=>{
    if(currentMode0709==='filter'){
      const sourceOk=sourceFilter0709==='any'||c.doc===sourceFilter0709
      const sectionOk=sectionFilter0709==='any'||c.section===sectionFilter0709
      return sourceOk&&sectionOk
    }
    return true
  })
  const topScore=included.length?Math.max(...included.map(c=>currentMode0709==='header'&&c.id==='S1'&&headerOn0709?c.headerCos:c.baseCos)):0

  chipsWrap0709.innerHTML=CHIPS_0709.map(c=>{
    const isExcluded=currentMode0709==='filter'&&!included.includes(c)
    const score=(currentMode0709==='header'&&c.id==='S1'&&headerOn0709)?c.headerCos:c.baseCos
    const isTop=!isExcluded&&score===topScore&&topScore>0
    const cls=['rank-chip']
    if(isExcluded)cls.push('excluded')
    if(isTop)cls.push('match')
    const headerNote=(currentMode0709==='header'&&c.id==='S1'&&headerOn0709)?'<small style="display:block;color:var(--green)">+ header: "Solstice Cloud — Terms of Service, Refunds section."</small>':''
    return `<div class="${cls.join(' ')}">
      <b>${c.id} — ${c.docLabel} / ${c.section}</b>
      <span>${c.text}</span>
      ${headerNote}
      <small>cosine to query: ${score.toFixed(4)}</small>
    </div>`
  }).join('')
}

function renderFilterControls0709(){
  controlsWrap0709.innerHTML=`
    <p style="font:11px 'DM Mono',monospace;color:var(--muted);margin-bottom:8px">Query: "${QUERY_0709}"</p>
    <div class="dim-toggle" role="group" aria-label="Filter by source document">
      <button type="button" class="secondary${sourceFilter0709==='any'?' active':''}" data-source="any">Any document</button>
      <button type="button" class="secondary${sourceFilter0709==='solstice-cloud-tos'?' active':''}" data-source="solstice-cloud-tos">Solstice Cloud</button>
      <button type="button" class="secondary${sourceFilter0709==='cobalt-systems-tos'?' active':''}" data-source="cobalt-systems-tos">Cobalt Systems</button>
    </div>
    <div class="dim-toggle" role="group" aria-label="Filter by section" style="margin-top:8px">
      <button type="button" class="secondary${sectionFilter0709==='any'?' active':''}" data-section="any">Any section</button>
      <button type="button" class="secondary${sectionFilter0709==='Refunds'?' active':''}" data-section="Refunds">Refunds</button>
      <button type="button" class="secondary${sectionFilter0709==='Billing'?' active':''}" data-section="Billing">Billing</button>
    </div>
  `
  controlsWrap0709.querySelectorAll('[data-source]').forEach(btn=>btn.addEventListener('click',()=>{
    sourceFilter0709=btn.dataset.source
    renderFilterControls0709()
    renderFilter0709()
  }))
  controlsWrap0709.querySelectorAll('[data-section]').forEach(btn=>btn.addEventListener('click',()=>{
    sectionFilter0709=btn.dataset.section
    renderFilterControls0709()
    renderFilter0709()
  }))
}

function renderFilter0709(){
  renderChips0709()
  if(!verdict0709)return
  verdict0709.className='callout'
  if(sourceFilter0709==='any'&&sectionFilter0709==='any'){
    verdict0709.innerHTML=`<b>S1 and B1 are tied at 0.6644 -- a plain top-1 vector search cannot tell them apart.</b> Their raw vectors are byte-for-byte identical: "30 days" and "45 days" share every content word this toy model tracks except the numeral, which carries no vocabulary vector at all.`
  }else if(sourceFilter0709==='solstice-cloud-tos'){
    verdict0709.innerHTML=`<b>B1 is now excluded regardless of its score.</b> S1 wins by elimination, not by ranking -- its cosine score (0.6644) hasn't changed at all, and neither has B1's. The tie was never broken; one side of it was just removed from consideration.`
  }else{
    verdict0709.innerHTML=`<b>Scores never move under any filter combination.</b> Metadata narrows the candidate SET before ranking runs -- it is never an input to the embedding, so it can only include or exclude, never re-score.`
  }
}

function renderHeaderControls0709(){
  controlsWrap0709.innerHTML=`
    <p style="font:11px 'DM Mono',monospace;color:var(--muted);margin-bottom:8px">Query: "${QUERY_0709}"</p>
    <div class="dim-toggle" role="group" aria-label="Toggle contextual header on S1">
      <button type="button" class="secondary${!headerOn0709?' active':''}" data-header="off">Header off</button>
      <button type="button" class="secondary${headerOn0709?' active':''}" data-header="on">Header on</button>
    </div>
  `
  controlsWrap0709.querySelectorAll('[data-header]').forEach(btn=>btn.addEventListener('click',()=>{
    headerOn0709=btn.dataset.header==='on'
    renderHeaderControls0709()
    renderHeader0709()
  }))
}

function renderHeader0709(){
  renderChips0709()
  if(!verdict0709)return
  verdict0709.className='callout'
  if(!headerOn0709){
    verdict0709.innerHTML=`<b>Header off: S1 and B1 still tied at 0.6644.</b> No metadata filter is active in this mode -- both chips remain candidates, and neither is excluded.`
  }else{
    verdict0709.innerHTML=`<b>Header on: S1 rises to 0.9759 (+0.3115 absolute, +46.89% relative). B1 is untouched, still 0.6644.</b> This time nothing was excluded -- S1's own embedding changed because new text ("Solstice Cloud — Terms of Service, Refunds section.") was prepended before it was embedded. A header is a strictly per-chunk decision: adding it to S1 alone can never move B1's score.`
  }
}

function render0709(){
  if(currentMode0709==='filter'){renderFilterControls0709();renderFilter0709()}
  else{renderHeaderControls0709();renderHeader0709()}
}

modeButtons0709.forEach(btn=>btn.addEventListener('click',()=>{
  currentMode0709=btn.dataset.mode
  syncModeButtons0709()
  render0709()
}))

syncModeButtons0709()
render0709()
