const advancedLesson0704=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0704(){if(advancedLesson0704)advancedLesson0704.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0704)
syncAdvancedTarget0704()

// Section 14's lab: The Topic-Shift Detector. A draggable similarity threshold
// decides, live, where the 5-sentence Acme passage gets cut into semantic
// chunks -- reusing the same 4 precomputed cosine-similarity edges from the
// worked example. A separate proposition-mode toggle expands S3's chip into
// its two atomic propositions without touching the threshold logic at all --
// propositions here are a textual decomposition, not separately embedded.

const SENTENCES_0704=[
  'Acme Corp was founded in 2015 in Austin, Texas.',
  'The company builds industrial sensors for factories.',
  'Acme raised $10M in 2023 after its Series A round.',
  "Acme's customer support team is available Monday through Friday, 9 a.m. to 6 p.m. Central.",
  'Support tickets are typically answered within four business hours.',
]
const PROPOSITIONS_FOR_S3_0704=[
  'Acme raised $10M in 2023.',
  "Acme's 2023 raise came after its Series A round.",
]
// Precomputed from the toy 3-dimensional sentence embeddings in the worked
// example (S1..S5), verified via an executed Node.js script.
const EDGE_SIMILARITIES_0704=[0.9960,0.9955,0.4374,0.9963]

function groupsForThreshold_0704(threshold){
  const groups=[[0]]
  for(let i=0;i<EDGE_SIMILARITIES_0704.length;i++){
    if(EDGE_SIMILARITIES_0704[i]<threshold){
      groups.push([i+1])
    }else{
      groups[groups.length-1].push(i+1)
    }
  }
  return groups
}

const thresholdSlider0704=document.querySelector('#tsThreshold_0704')
const thresholdOut0704=document.querySelector('#tsThresholdOut_0704')
const propToggle0704=document.querySelector('#tsPropToggle_0704')
const stripWrap0704=document.querySelector('#tsStripWrap_0704')
const readout0704=document.querySelector('#tsReadout_0704')
const verdict0704=document.querySelector('#tsVerdict_0704')

function renderTopicShift0704(){
  const threshold=thresholdSlider0704?Number(thresholdSlider0704.value):0.70
  if(thresholdOut0704)thresholdOut0704.textContent=threshold.toFixed(2)
  const propositionMode=!!propToggle0704?.checked

  const groups=groupsForThreshold_0704(threshold)
  const cutCount=groups.length-1

  if(stripWrap0704){
    let html=''
    groups.forEach((group,groupIndex)=>{
      group.forEach((sentenceIndex,posInGroup)=>{
        const isS3=sentenceIndex===2
        const classes=['boundary-chunk',groupIndex%2===0?'shade-a':'shade-b']
        const isFirstOverall=groupIndex===0&&posInGroup===0
        const edgeBefore=sentenceIndex>0?EDGE_SIMILARITIES_0704[sentenceIndex-1]:null
        if(!isFirstOverall&&edgeBefore!==null&&edgeBefore<threshold)classes.push('cut-left')
        const edgeAfter=sentenceIndex<4?EDGE_SIMILARITIES_0704[sentenceIndex]:null
        if(edgeAfter!==null&&edgeAfter<threshold)classes.push('cut-right')
        if(isS3&&propositionMode){
          html+=PROPOSITIONS_FOR_S3_0704.map(p=>`<div class="${classes.join(' ')}">${p}</div>`).join('')
        }else{
          html+=`<div class="${classes.join(' ')}">${SENTENCES_0704[sentenceIndex]}</div>`
        }
      })
    })
    stripWrap0704.innerHTML=html
  }

  if(readout0704){
    const unitCount=propositionMode?6:5
    const unitLabel=propositionMode?'propositions':'sentences'
    const edgeList=EDGE_SIMILARITIES_0704.map((s,i)=>`edge ${i+1}-${i+2}: ${s.toFixed(4)}${s<threshold?' (CUT)':''}`).join(' · ')
    readout0704.innerHTML=`<div><span>UNITS</span><b>${unitCount} ${unitLabel}${propositionMode?' (+1 atomic fact recovered from S3)':''}</b></div>`
      +`<div><span>SEMANTIC CHUNKS</span><b>${groups.length} (${cutCount} cut${cutCount===1?'':'s'})</b></div>`
      +`<div><span>EDGE SIMILARITIES</span><b style="font-size:12px">${edgeList}</b></div>`
  }

  if(verdict0704){
    verdict0704.className='callout'+(cutCount!==1?' warning':'')
    if(cutCount===0){
      verdict0704.innerHTML=`<b>Under-segmentation.</b> Threshold ${threshold.toFixed(2)} is below the real topic-shift edge (0.4374) -- the company/funding sentences and the support sentences get merged into one chunk, missing the shift entirely.`
    }else if(cutCount===1){
      verdict0704.innerHTML=`<b>Correct split.</b> Exactly 1 cut, at the real topic shift (edge 3-4, similarity 0.4374) -- 2 chunks matching the passage's real 2-topic structure.`
    }else{
      verdict0704.innerHTML=`<b>Over-segmentation.</b> Threshold ${threshold.toFixed(2)} is high enough to cut even within the same topic -- every sentence pair whose similarity falls short of it gets split, producing ${groups.length} chunks from what is really 2 topics.`
    }
  }
}

thresholdSlider0704?.addEventListener('input',renderTopicShift0704)
propToggle0704?.addEventListener('change',renderTopicShift0704)
renderTopicShift0704()
