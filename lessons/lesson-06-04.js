const advancedLesson0604=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0604(){if(advancedLesson0604)advancedLesson0604.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0604)
syncAdvancedTarget0604()

// Section 14's lab: the Reading-Order Reconstructor. Six blocks sit in a
// two-column report, three per column. A raster scan reads row by row across
// the full page width; a layout-aware read finishes column A top-to-bottom
// before starting column B. Like Concept 03's Join Fan-Out Simulator, there is
// no pick/reveal step -- toggling the mode recomputes each block's position
// number and the reconstructed text immediately.

const BLOCKS_0604=[
  {id:'a1',col:'A',row:1,text:'Complaint volume rose 12% quarter-over-quarter, driven primarily by billing disputes and unauthorized-charge reports across the retail banking segment.'},
  {id:'a2',col:'A',row:2,text:'Card issuers with under 500,000 accounts saw the sharpest increase, suggesting smaller institutions are absorbing disproportionate fraud-related complaint growth.'},
  {id:'a3',col:'A',row:3,text:'Regional banks flagged staffing shortages in dispute-resolution teams as the leading internal cause of extended response times this quarter.'},
  {id:'b1',col:'B',row:1,text:'Mortgage servicing complaints held steady, with escrow-account errors remaining the single largest subcategory for the fourth consecutive quarter.'},
  {id:'b2',col:'B',row:2,text:'Debt-collection complaints declined 6%, continuing a two-year downward trend attributed to updated validation-notice requirements.'},
  {id:'b3',col:'B',row:3,text:'Student-loan servicing complaints rose sharply after a servicer transition affected roughly 200,000 borrower accounts mid-quarter.'}
]

const RASTER_ORDER_0604=['a1','b1','a2','b2','a3','b3']
const LAYOUT_ORDER_0604=['a1','a2','a3','b1','b2','b3']

const rasterButton0604=document.querySelector('#wgOrderRaster_0604')
const layoutButton0604=document.querySelector('#wgOrderLayout_0604')
const readoutBox0604=document.querySelector('#wgBlockOrder_0604')
const outputBox0604=document.querySelector('#wgReconstructed_0604')
const verdictBox0604=document.querySelector('#wgOrderVerdict_0604')

let orderMode0604='raster'

function currentOrder0604(){
  return orderMode0604==='raster'?RASTER_ORDER_0604:LAYOUT_ORDER_0604
}

function renderOrder0604(){
  if(!readoutBox0604||!outputBox0604)return
  const order=currentOrder0604()
  const positionById=new Map(order.map((id,i)=>[id,i+1]))
  readoutBox0604.innerHTML=BLOCKS_0604.map(b=>`<div><span>COLUMN ${b.col} · ROW ${b.row}</span><b>#${positionById.get(b.id)}</b></div>`).join('')
  const orderedBlocks=order.map(id=>BLOCKS_0604.find(b=>b.id===id))
  outputBox0604.textContent=orderedBlocks.map(b=>b.text).join(' ')
  if(rasterButton0604)rasterButton0604.classList.toggle('active',orderMode0604==='raster')
  if(layoutButton0604)layoutButton0604.classList.toggle('active',orderMode0604==='layout')
  if(!verdictBox0604)return
  if(orderMode0604==='raster'){
    verdictBox0604.textContent='Raster order interleaves column A and column B sentence by sentence -- "complaint volume rose 12%" is immediately followed by an unrelated mortgage-servicing sentence, then back to card issuers, then debt collection. Every character is correct and the result is still unreadable as two coherent stories.'
  }else{
    verdictBox0604.textContent='Layout-aware order finishes column A top-to-bottom (complaint volume, card issuers, regional banks) before starting column B (mortgage servicing, debt collection, student loans) -- the same six sentences, reordered by position instead of raw row, now read as two separate, coherent paragraphs.'
  }
}

rasterButton0604?.addEventListener('click',()=>{orderMode0604='raster';renderOrder0604()})
layoutButton0604?.addEventListener('click',()=>{orderMode0604='layout';renderOrder0604()})
renderOrder0604()
