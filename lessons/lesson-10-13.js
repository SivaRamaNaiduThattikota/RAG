const advancedLesson1013=document.querySelector('#advanced-lesson')
function syncAdvancedTarget1013(){if(advancedLesson1013)advancedLesson1013.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget1013)
syncAdvancedTarget1013()

// Section 14's lab: The Decision Matrix. Reuses Section 06's own six-by-four
// score table and Section 10-11's own three profiles verbatim -- picking a
// profile applies that profile's own hard constraint (removing ineligible
// systems from the pool) and then computes the weighted total live, the
// same arithmetic as the node script in Section 12, not a pre-written
// per-profile answer.

const SCORES_1013={
  workload:  {Oracle:2, pgvector:1, Pinecone:1, Qdrant:1, Weaviate:1, Milvus:1},
  governance:{Oracle:2, pgvector:2, Pinecone:1, Qdrant:0, Weaviate:1, Milvus:0},
  scale:     {Oracle:1, pgvector:1, Pinecone:1, Qdrant:1, Weaviate:1, Milvus:2},
  cost:      {Oracle:0, pgvector:1, Pinecone:2, Qdrant:1, Weaviate:1, Milvus:1}
}
const SYSTEMS_1013=['Oracle','pgvector','Pinecone','Qdrant','Weaviate','Milvus']
const MANAGED_OPTION_CITED_1013={Oracle:false, pgvector:false, Pinecone:true, Qdrant:true, Weaviate:true, Milvus:true}
const OPEN_SOURCE_CITED_1013={Oracle:false, pgvector:true, Pinecone:false, Qdrant:true, Weaviate:true, Milvus:true}

const PROFILES_1013={
  a:{
    label:'Profile A — regulated Oracle shop',
    weights:{workload:2, governance:3, scale:1, cost:1},
    constraint:null,
    constraintLabel:'No hard constraint -- every system is technically eligible to run this workload.'
  },
  b:{
    label:'Profile B — multi-tenant SaaS, no ops team',
    weights:{workload:1, governance:2, scale:1, cost:3},
    constraint:MANAGED_OPTION_CITED_1013,
    constraintLabel:'Hard constraint: a hands-off managed option must be cited in this course -- removes Oracle and pgvector.'
  },
  c:{
    label:'Profile C — open-source mandate, billion-scale',
    weights:{workload:1, governance:1, scale:3, cost:2},
    constraint:OPEN_SOURCE_CITED_1013,
    constraintLabel:'Hard constraint: the system must be open-source per Concept 12\'s own citations -- removes Oracle and Pinecone.'
  }
}

const buttons_1013=[...document.querySelectorAll('#profileButtons_1013 [data-profile]')]
const poolRow_1013=document.querySelector('#poolRow_1013')
const race_1013=document.querySelector('#matrixRace_1013')
const verdict_1013=document.querySelector('#matrixVerdict_1013')

function computeTotal_1013(system,weights){
  return SCORES_1013.workload[system]*weights.workload
    +SCORES_1013.governance[system]*weights.governance
    +SCORES_1013.scale[system]*weights.scale
    +SCORES_1013.cost[system]*weights.cost
}

function render_1013(key){
  const profile=PROFILES_1013[key]
  if(!profile) return

  buttons_1013.forEach(b=>b.classList.toggle('active',b.dataset.profile===key))

  const eligible=profile.constraint?SYSTEMS_1013.filter(s=>profile.constraint[s]):SYSTEMS_1013.slice()
  const excluded=SYSTEMS_1013.filter(s=>!eligible.includes(s))

  if(poolRow_1013){
    poolRow_1013.innerHTML=''
    SYSTEMS_1013.forEach(s=>{
      const chip=document.createElement('div')
      chip.className='rank-chip'+(excluded.includes(s)?' excluded':'')
      const b=document.createElement('b')
      b.textContent=s
      const span=document.createElement('span')
      span.textContent=excluded.includes(s)?'Excluded':'Eligible'
      chip.appendChild(b)
      chip.appendChild(span)
      poolRow_1013.appendChild(chip)
    })
  }

  const totals=eligible
    .map(s=>({system:s,total:computeTotal_1013(s,profile.weights)}))
    .sort((a,b)=>b.total-a.total)
  const maxTotal=totals.length?totals[0].total:0
  const winners=totals.filter(t=>t.total===maxTotal).map(t=>t.system)
  const maxPossible=2*(profile.weights.workload+profile.weights.governance+profile.weights.scale+profile.weights.cost)

  if(race_1013){
    race_1013.innerHTML=''
    totals.forEach(({system,total})=>{
      const row=document.createElement('div')
      row.className='metric-race-row'
      const label=document.createElement('span')
      label.textContent=system
      const track=document.createElement('div')
      track.className='metric-bar-track'
      const fill=document.createElement('div')
      fill.className='metric-bar-fill'
      fill.style.width=Math.round(100*total/maxPossible)+'%'
      track.appendChild(fill)
      const val=document.createElement('b')
      val.textContent=total
      row.appendChild(label)
      row.appendChild(track)
      row.appendChild(val)
      race_1013.appendChild(row)
    })
  }

  if(verdict_1013){
    const winnerText=winners.length>1
      ? 'a tie between '+winners.join(' and ')+' at '+maxTotal
      : winners[0]+', '+maxTotal
    verdict_1013.textContent=profile.constraintLabel+' Among the '+eligible.length+' eligible system'+(eligible.length===1?'':'s')+', the weighted winner is '+winnerText+'.'
  }
}

buttons_1013.forEach(btn=>btn.addEventListener('click',()=>render_1013(btn.dataset.profile)))

render_1013('a')
