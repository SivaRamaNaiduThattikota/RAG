const advancedLesson0601=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0601(){if(advancedLesson0601)advancedLesson0601.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0601)
syncAdvancedTarget0601()

// Section 14's lab: the Authority Arbiter. Three scenarios, each with three
// sources that disagree about one fact. The learner picks which source they'd
// trust, then reveals the lesson's authority ranking (source type first,
// recency as the tiebreaker) and sees whether their pick matches it. There is
// a defensible right answer here, unlike Module 05 Concept 01's relevance
// lab -- authority ranking is a deliberate policy call, not a matter of taste,
// which is exactly the distinction this concept draws.

const SCENARIOS_0601={
  vacation:{
    label:'How many vacation days does a new hire get?',
    sources:[
      {id:'slack',name:'Slack message from a teammate',type:'Chat message',date:'3 days ago',claim:'"I think it\'s 18 days now?"',rank:3},
      {id:'wiki',name:'Internal wiki page',type:'Wiki page',date:'14 months ago',claim:'"New hires receive 15 vacation days per year."',rank:2},
      {id:'hrpdf',name:'HR policy PDF, v4',type:'Official policy document',date:'2 months ago',claim:'"New hires accrue 18 vacation days per year, effective this version."',rank:1}
    ],
    winner:'hrpdf'
  },
  refund:{
    label:'What is the customer refund window?',
    sources:[
      {id:'oldpdf',name:'Refund policy PDF, v1 (superseded)',type:'Official policy document (outdated version)',date:'2 years ago',claim:'"Refunds accepted within 30 days of purchase."',rank:2},
      {id:'ticket',name:'A closed support ticket',type:'Ticket record',date:'6 months ago',claim:'"Agent approved a refund at day 40 as an exception."',rank:3},
      {id:'currentpdf',name:'Refund policy PDF, v2 (current)',type:'Official policy document (current version)',date:'5 months ago',claim:'"Refunds accepted within 45 days of purchase."',rank:1}
    ],
    winner:'currentpdf'
  },
  oncall:{
    label:'Who is the current on-call engineer for the payments service?',
    sources:[
      {id:'oldwiki',name:'Team wiki "on-call" page',type:'Wiki page',date:'9 months ago, never updated since',claim:'"On-call rotation: Priya, then Sam, then Alex."',rank:3},
      {id:'schedapi',name:'On-call scheduling tool (live API)',type:'System of record (live)',date:'right now',claim:'"Current on-call: Devon."',rank:1},
      {id:'email',name:'An email thread',type:'Email thread',date:'2 weeks ago',claim:'"Reminder: rotation starts with Priya this month."',rank:2}
    ],
    winner:'schedapi'
  }
}

const scenarioSelect0601=document.querySelector('#wgScenario_0601')
const sourceRow0601=document.querySelector('#wgSourceCards_0601')
const checkButton0601=document.querySelector('#wgCheck_0601')
const resetButton0601=document.querySelector('#wgReset_0601')
const readout0601=document.querySelector('#wgReadout_0601')
const pickBox0601=document.querySelector('#wgPick_0601')
const winnerBox0601=document.querySelector('#wgWinner_0601')
const verdictBox0601=document.querySelector('#wgVerdict_0601')

let picked0601=null

function buildSources0601(){
  if(!sourceRow0601)return
  const key=scenarioSelect0601?.value||'vacation'
  const scenario=SCENARIOS_0601[key]
  sourceRow0601.innerHTML=''
  picked0601=null
  scenario.sources.forEach(src=>{
    const btn=document.createElement('button')
    btn.type='button'
    btn.className='secondary'
    btn.dataset.id=src.id
    btn.innerHTML=`<b>${src.name}</b><br><small>${src.type} · ${src.date}</small><br><em>${src.claim}</em>`
    btn.addEventListener('click',()=>{
      picked0601=src.id
      sourceRow0601.querySelectorAll('button').forEach(b=>b.classList.add('secondary'))
      btn.classList.remove('secondary')
    })
    sourceRow0601.appendChild(btn)
  })
  if(readout0601)readout0601.hidden=true
  if(verdictBox0601)verdictBox0601.hidden=true
}

function reveal0601(){
  const key=scenarioSelect0601?.value||'vacation'
  const scenario=SCENARIOS_0601[key]
  const winnerSrc=scenario.sources.find(s=>s.id===scenario.winner)
  const pickedSrc=scenario.sources.find(s=>s.id===picked0601)
  if(pickBox0601)pickBox0601.textContent=pickedSrc?pickedSrc.name:'nothing picked yet'
  if(winnerBox0601)winnerBox0601.textContent=`${winnerSrc.name} (${winnerSrc.type}, ${winnerSrc.date})`
  if(readout0601)readout0601.hidden=false
  if(verdictBox0601){
    verdictBox0601.hidden=false
    const correct=picked0601===scenario.winner
    verdictBox0601.textContent=correct
      ? 'Match. The authoritative source is the highest-ranked source type (official policy document or live system of record beats chat, wiki, ticket or email), and among sources of comparable type, the more recent one wins.'
      : `Not quite. ${winnerSrc.name} outranks your pick because it is the higher-authority source type for this fact, and among sources of that type it is also the current one -- authority is decided by source type first, recency second, never by which claim sounds more confident.`
  }
}

scenarioSelect0601?.addEventListener('change',buildSources0601)
checkButton0601?.addEventListener('click',reveal0601)
resetButton0601?.addEventListener('click',buildSources0601)
buildSources0601()
