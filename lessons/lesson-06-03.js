const advancedLesson0603=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0603(){if(advancedLesson0603)advancedLesson0603.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0603)
syncAdvancedTarget0603()

// Section 14's lab: the Join Fan-Out Simulator. Four sliders set an order
// count for four customers, a select toggles INNER vs LEFT JOIN, and the
// readout recomputes live -- rows returned, customers silently dropped, and
// customers duplicated across rows. Unlike Concept 01's Authority Arbiter
// (pick a winning source among conflicting claims) and Concept 02's Format
// Extraction Bench (pick an approach, then reveal), this lab has no pick/reveal
// step at all: every control changes the computed output immediately, the
// same way changing a join's inputs changes what a real query returns.

const orderSliders0603=[
  {input:document.querySelector('#wgOrdersA_0603'),out:document.querySelector('#wgOrdersAOut_0603'),name:'Customer A'},
  {input:document.querySelector('#wgOrdersB_0603'),out:document.querySelector('#wgOrdersBOut_0603'),name:'Customer B'},
  {input:document.querySelector('#wgOrdersC_0603'),out:document.querySelector('#wgOrdersCOut_0603'),name:'Customer C'},
  {input:document.querySelector('#wgOrdersD_0603'),out:document.querySelector('#wgOrdersDOut_0603'),name:'Customer D'}
]
const joinTypeSelect0603=document.querySelector('#wgJoinType_0603')
const rowsOut0603=document.querySelector('#wgRowsOut_0603')
const droppedOut0603=document.querySelector('#wgDroppedOut_0603')
const dupOut0603=document.querySelector('#wgDupOut_0603')
const verdictBox0603=document.querySelector('#wgJoinVerdict_0603')

function joinStats0603(counts,joinType){
  const rowsPer=counts.map(m=>joinType==='inner'?m:Math.max(m,1))
  const rows=rowsPer.reduce((a,b)=>a+b,0)
  const dropped=joinType==='inner'?counts.filter(m=>m===0).length:0
  const duplicated=counts.filter(m=>m>1).length
  return {rows,dropped,duplicated}
}

function recomputeJoin0603(){
  if(!orderSliders0603[0].input)return
  const counts=orderSliders0603.map(s=>{
    const v=Number(s.input.value)
    if(s.out)s.out.textContent=String(v)
    return v
  })
  const joinType=joinTypeSelect0603?.value||'inner'
  const {rows,dropped,duplicated}=joinStats0603(counts,joinType)
  if(rowsOut0603)rowsOut0603.textContent=String(rows)
  if(droppedOut0603)droppedOut0603.textContent=String(dropped)
  if(dupOut0603)dupOut0603.textContent=String(duplicated)
  if(!verdictBox0603)return
  const zeroCustomers=orderSliders0603.filter((s,i)=>counts[i]===0).map(s=>s.name)
  const dupCustomers=orderSliders0603.filter((s,i)=>counts[i]>1).map(s=>s.name)
  if(dropped===0&&duplicated===0){
    verdictBox0603.textContent='Every customer here has exactly one order (or, under LEFT JOIN, at least one placeholder row) -- this join produces a clean one-to-one result with no fan-out and no silent loss at all.'
  }else{
    const parts=[]
    if(dropped>0){
      parts.push(`${zeroCustomers.join(', ')} ${zeroCustomers.length>1?'have':'has'} zero orders and would vanish entirely from an INNER JOIN result -- "one row = one document" means ${zeroCustomers.length>1?'they':'that customer'} never enters the RAG corpus at all, despite existing in the source of truth.`)
    }
    if(duplicated>0){
      parts.push(`${dupCustomers.join(', ')} ${dupCustomers.length>1?'appear':'appears'} more than once across separate rows, so ${dupCustomers.length>1?'their':'its'} own profile fields get repeated across near-duplicate documents instead of being aggregated once.`)
    }
    if(joinType==='left'&&zeroCustomers.length>0){
      parts.push(`Switching to LEFT JOIN keeps ${zeroCustomers.join(', ')} in the result (as a row with NULL order fields) -- nothing is silently dropped, but it still isn't "one clean document per customer" without an extra aggregation step.`)
    }
    verdictBox0603.textContent=parts.join(' ')
  }
}

orderSliders0603.forEach(s=>s.input?.addEventListener('input',recomputeJoin0603))
joinTypeSelect0603?.addEventListener('change',recomputeJoin0603)
recomputeJoin0603()
