const advancedLesson0708=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0708(){if(advancedLesson0708)advancedLesson0708.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0708)
syncAdvancedTarget0708()

// Section 14's lab: The Depth & Order Explorer. Two modes for this concept's
// two bundled, independent ideas -- a tree-depth stepper (hierarchical
// chunking, Example A's Oracle Cancellations-and-Refunds tree) and a fixed
// same-text early-vs-late embedding-order comparison (late chunking,
// Example B's Northwind Analytics pair). Every number below was computed
// once via an executed Node.js script and hardcoded here.

const TREE_0708={
  doc:{label:'Full document',chars:616},
  sectionA:{label:'Section A — Cancellation Policy',chars:332},
  sectionB:{label:'Section B — Refund Policy',chars:283},
  paraA1:{label:'Paragraph A1',chars:164,text:'Customers may cancel an order within 14 days of the ship date. After 14 days, the order status locks to CLOSED and no cancellation is possible through self-service.'},
  paraA2:{label:'Paragraph A2',chars:167,text:'Support agents can override a locked cancellation manually if the customer contacts support before the refund window closes. Manual overrides require manager approval.'},
  paraB1:{label:'Paragraph B1',chars:141,text:'Refunds are issued to the original payment method within 5-7 business days of approval. Store credit refunds process within 24 hours instead.'},
  paraB2:{label:'Paragraph B2',chars:141,text:'Digital goods and gift cards are not eligible for refunds under this policy. Physical merchandise must be returned before a refund is issued.'},
  A1a:{label:'Sentence A1a',chars:62,text:'Customers may cancel an order within 14 days of the ship date.'},
  A1b:{label:'Sentence A1b',chars:101,text:'After 14 days, the order status locks to CLOSED and no cancellation is possible through self-service.'},
  A2a:{label:'Sentence A2a',chars:124,text:'Support agents can override a locked cancellation manually if the customer contacts support before the refund window closes.'},
  A2b:{label:'Sentence A2b',chars:42,text:'Manual overrides require manager approval.'},
  B1a:{label:'Sentence B1a',chars:87,text:'Refunds are issued to the original payment method within 5-7 business days of approval.'},
  B1b:{label:'Sentence B1b',chars:53,text:'Store credit refunds process within 24 hours instead.'},
  B2a:{label:'Sentence B2a',chars:76,text:'Digital goods and gift cards are not eligible for refunds under this policy.'},
  B2b:{label:'Sentence B2b',chars:64,text:'Physical merchandise must be returned before a refund is issued.'},
}

const LEAF_CHAINS_0708={
  B1b:{
    query:'How long does a store credit refund take?',
    chain:['B1b','paraB1','sectionB','doc'],
    satisfied:[false,true,true,true],
    note:['"...instead" has no resolvable antecedent alone.','Sibling B1a resolves it: "instead" of the standard 5-7 business day timing.','Adds Paragraph B2\'s refund-eligibility exclusions.','Reintroduces Section A\'s unrelated cancellation policy -- dilution, same as Concept 05.'],
  },
  A2b:{
    query:'Can an order be canceled after the 14-day window?',
    chain:['A2b','paraA2','sectionA','doc'],
    satisfied:[false,true,true,true],
    note:['States an approval requirement with no stated trigger condition.','Sibling A2a supplies the trigger: contacting support before the refund window closes.','Adds Paragraph A1\'s underlying 14-day cancellation rule.','Reintroduces Section B\'s unrelated refund policy -- dilution, same as Concept 05.'],
  },
}

const ORDER_0708={
  early:{label:'Early (split → embed)',sim:0.4657,note:'Chunk 2\'s raw text structurally can never contain "premium" or "plan" -- those words only exist in sentence 1. No amount of re-weighting chunk 2\'s own words can inject that signal, because early chunking embeds it in total isolation.'},
  late:{label:'Late (embed → pool)',sim:0.6354,note:'The gain comes entirely from contextualizing chunk 2\'s tokens against the WHOLE document before any pooling happens -- not from any change to the chunk\'s boundary or text, which is identical in both modes.'},
}
const CHUNK2_TEXT_0708='It renews automatically every 12 months unless canceled.'

const modeButtons0708=[...document.querySelectorAll('#s14 .lab-actions [data-mode]')]
const controlsWrap0708=document.querySelector('#depthOrderControls_0708')
const readout0708=document.querySelector('#depthOrderReadout_0708')
const verdict0708=document.querySelector('#depthOrderVerdict_0708')

let currentMode0708='depth'
let currentLeaf0708='B1b'
let currentDepth0708=0
let currentOrder0708='early'
let expandDownStage0708=0

function syncModeButtons0708(){
  modeButtons0708.forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===currentMode0708))
}

function renderDepthControls0708(){
  controlsWrap0708.innerHTML=`
    <div class="dim-toggle" role="group" aria-label="Choose a starting leaf sentence">
      <button type="button" class="secondary${currentLeaf0708==='B1b'?' active':''}" data-leaf="B1b">Start at B1b — refund timing</button>
      <button type="button" class="secondary${currentLeaf0708==='A2b'?' active':''}" data-leaf="A2b">Start at A2b — override approval</button>
    </div>
    <div class="control"><label for="depthStepper_0708">Expand up · depth <output id="depthStepperOut_0708">${currentDepth0708}</output> of 3</label>
    <input type="range" id="depthStepper_0708" min="0" max="3" step="1" value="${currentDepth0708}"></div>
    <button type="button" class="secondary" id="expandDownBtn_0708" style="margin-top:8px">Show expand-down from Section B (${expandDownStage0708}/2)</button>
  `
  controlsWrap0708.querySelectorAll('[data-leaf]').forEach(btn=>btn.addEventListener('click',()=>{
    currentLeaf0708=btn.dataset.leaf
    currentDepth0708=0
    renderDepthControls0708()
    renderDepth0708()
  }))
  document.querySelector('#depthStepper_0708')?.addEventListener('input',e=>{
    currentDepth0708=Number(e.target.value)
    renderDepth0708()
  })
  document.querySelector('#expandDownBtn_0708')?.addEventListener('click',()=>{
    expandDownStage0708=(expandDownStage0708+1)%3
    renderDepthControls0708()
    renderDepth0708()
  })
}

function renderDepth0708(){
  const info=LEAF_CHAINS_0708[currentLeaf0708]
  const nodeKey=info.chain[currentDepth0708]
  const node=TREE_0708[nodeKey]
  const satisfied=info.satisfied[currentDepth0708]
  const levelNames=['Sentence (leaf)','Paragraph (+1)','Section (+2)','Document (+3)']

  const downText=expandDownStage0708===0?'':expandDownStage0708===1
    ?`<p style="margin-top:8px"><b>Expand down, step 1:</b> Section B → its 2 child paragraphs: "${TREE_0708.paraB1.text}" and "${TREE_0708.paraB2.text}"</p>`
    :`<p style="margin-top:8px"><b>Expand down, step 2:</b> further down to its 4 child sentences: B1a, B1b, B2a, B2b -- individually, e.g. for per-claim citation granularity.</p>`

  if(readout0708){
    readout0708.innerHTML=`
      <div><span>QUERY</span><b>${info.query}</b></div>
      <div><span>CURRENT NODE</span><b>${node.label} (${node.chars} chars)</b></div>
      <div><span>LEVEL</span><b>${levelNames[currentDepth0708]}</b></div>
      <div><span>ANSWERS THE QUERY?</span><b style="color:${satisfied?'var(--green)':'var(--orange)'}">${satisfied?'YES':'NO -- needs more context'}</b></div>
    `
  }
  if(verdict0708){
    verdict0708.className='callout'+(currentDepth0708===3?' warning':'')
    verdict0708.innerHTML=`<b>${node.text?'"'+node.text+'"':node.label}</b><p style="margin:8px 0 0">${info.note[currentDepth0708]}</p>${downText}`
  }
}

function renderOrderControls0708(){
  controlsWrap0708.innerHTML=`
    <div class="dim-toggle" role="group" aria-label="Choose embedding order">
      <button type="button" class="secondary${currentOrder0708==='early'?' active':''}" data-order="early">Early (split → embed)</button>
      <button type="button" class="secondary${currentOrder0708==='late'?' active':''}" data-order="late">Late (embed → pool)</button>
    </div>
    <p style="margin-top:8px;font:11px 'DM Mono',monospace;color:var(--muted)">Chunk 2, same 10 words, same split boundary, in both modes: "${CHUNK2_TEXT_0708}"</p>
  `
  controlsWrap0708.querySelectorAll('[data-order]').forEach(btn=>btn.addEventListener('click',()=>{
    currentOrder0708=btn.dataset.order
    renderOrderControls0708()
    renderOrder0708()
  }))
}

function renderOrder0708(){
  const cur=ORDER_0708[currentOrder0708]
  const other=ORDER_0708[currentOrder0708==='early'?'late':'early']
  const pct=cur.sim*100

  if(readout0708){
    readout0708.innerHTML=`
      <div class="token-bar" role="img" aria-label="Cosine similarity to query, ${cur.sim.toFixed(4)}">
        <div class="kept" style="width:${pct}%"></div>
        <div class="lost" style="width:${100-pct}%"></div>
      </div>
      <div class="token-bar-legend">
        <span><i class="sw-kept"></i>similarity to query: ${cur.sim.toFixed(4)}</span>
        <span><i class="sw-lost"></i>${other.label.split(' ')[0]} mode: ${other.sim.toFixed(4)}</span>
      </div>
    `
  }
  if(verdict0708){
    verdict0708.className='callout'
    verdict0708.innerHTML=`<b>${cur.label} — cosine ${cur.sim.toFixed(4)}</b><p style="margin:8px 0 0">${cur.note}</p><p style="margin:8px 0 0">Switching modes: ${currentOrder0708==='early'?'+0.1696 absolute, +36.42% relative gain moving to late chunking':'-0.1696 absolute, -36.42% relative loss falling back to early chunking'} -- same text, same query, only the embedding order changed.</p>`
  }
}

function render0708(){
  if(currentMode0708==='depth'){renderDepthControls0708();renderDepth0708()}
  else{renderOrderControls0708();renderOrder0708()}
}

modeButtons0708.forEach(btn=>btn.addEventListener('click',()=>{
  currentMode0708=btn.dataset.mode
  syncModeButtons0708()
  render0708()
}))

syncModeButtons0708()
render0708()
