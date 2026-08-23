const advancedLesson0801=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0801(){if(advancedLesson0801)advancedLesson0801.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0801)
syncAdvancedTarget0801()

// Section 14's lab: The Nearest-Neighbor Flip. A 5-word vocabulary
// (kitten/cat/dog/car/truck), viewed under two representation schemes --
// hand-built one-hot (every distinct pair ties at cosine 0.0000, by
// construction) versus an illustrative learned-style 2D embedding (real,
// verified angles producing a full sensible ranking). Every cosine value
// was computed once via two independently-coded Node.js formulas and
// hardcoded here; the live cosine call below just re-applies Module 04's
// own formula to whichever representation is selected.

const LEARNED_ANGLES_0801={kitten:8,cat:14,dog:36,car:95,truck:103}
const ONEHOT_DIM_0801={kitten:0,cat:1,dog:2,car:3,truck:4}
const WORDS_0801=['kitten','cat','dog','car','truck']

function dot2(u,v){return u[0]*v[0]+u[1]*v[1]}
function norm2(u){return Math.sqrt(dot2(u,u))}
function cosine2(u,v){const nu=norm2(u),nv=norm2(v); if(nu===0||nv===0)return 0; return dot2(u,v)/(nu*nv)}

function learnedVec(word){const r=LEARNED_ANGLES_0801[word]*Math.PI/180; return [Math.cos(r),Math.sin(r)]}
function onehotVec(word){const v=[0,0,0,0,0]; v[ONEHOT_DIM_0801[word]]=1; return v}
function dotN(u,v){return u.reduce((s,x,i)=>s+x*v[i],0)}
function normN(u){return Math.sqrt(dotN(u,u))}
function cosineN(u,v){const nu=normN(u),nv=normN(v); if(nu===0||nv===0)return 0; return dotN(u,v)/(nu*nv)}

function similarity0801(wordA,wordB,rep){
  if(wordA===wordB)return 1
  if(rep==='learned')return cosine2(learnedVec(wordA),learnedVec(wordB))
  return cosineN(onehotVec(wordA),onehotVec(wordB))
}

const wordButtons0801=[...document.querySelectorAll('#s14 .lab-actions [data-word]')]
const repButtons0801=[...document.querySelectorAll('#s14 .dim-toggle [data-rep]')]
const chipsWrap0801=document.querySelector('#nnFlipChips_0801')
const readout0801=document.querySelector('#nnFlipReadout_0801')
const verdict0801=document.querySelector('#nnFlipVerdict_0801')

let currentWord0801='cat'
let currentRep0801='learned'

function syncButtons0801(){
  wordButtons0801.forEach(btn=>btn.classList.toggle('active',btn.dataset.word===currentWord0801))
  repButtons0801.forEach(btn=>btn.classList.toggle('active',btn.dataset.rep===currentRep0801))
}

function render0801(){
  const others=WORDS_0801.filter(w=>w!==currentWord0801)
  const ranked=others.map(w=>({word:w,score:similarity0801(currentWord0801,w,currentRep0801)})).sort((a,b)=>b.score-a.score)
  const allTie=currentRep0801==='onehot'

  if(chipsWrap0801){
    chipsWrap0801.innerHTML=ranked.map((r,i)=>{
      const cls=['rank-chip']
      if(!allTie&&i===0)cls.push('match')
      return `<div class="${cls.join(' ')}"><b>${r.word}</b><small>cosine: ${r.score.toFixed(4)}</small></div>`
    }).join('')
  }

  if(readout0801){
    readout0801.innerHTML=`
      <div><span>SELECTED WORD</span><b>${currentWord0801}</b></div>
      <div><span>REPRESENTATION</span><b>${currentRep0801==='learned'?'Learned (illustrative 2D)':'Hand-built (one-hot)'}</b></div>
      <div><span>NEAREST NEIGHBOR</span><b>${allTie?'undefined -- 4-way tie':ranked[0].word+' ('+ranked[0].score.toFixed(4)+')'}</b></div>
    `
  }

  if(verdict0801){
    verdict0801.className='callout'+(allTie?' warning':'')
    if(allTie){
      verdict0801.innerHTML=`<b>All 4 other words tie at exactly cosine 0.0000.</b> One-hot vectors are orthogonal by construction -- the assignment rule never looked at what the words mean, so there is no signal left to break the tie, however the tie-break rule is written. "Nearest neighbor" is simply undefined here.`
    }else if(currentWord0801==='kitten'&&ranked.some(r=>r.word==='truck')){
      const truckScore=ranked.find(r=>r.word==='truck').score
      verdict0801.innerHTML=`<b>${ranked[0].word} wins (${ranked[0].score.toFixed(4)}) -- the semantically sensible neighbor.</b> Notice kitten-truck is the one negative score in the whole matrix (${truckScore.toFixed(4)}) -- geometric similarity can express dissimilarity, not just weaker similarity, once vectors aren't restricted to hand-built non-negative basis vectors.`
    }else{
      verdict0801.innerHTML=`<b>${ranked[0].word} wins (${ranked[0].score.toFixed(4)}) -- the semantically sensible neighbor.</b> Same words, same cosine formula (Module 04 Concept 03, unchanged) -- only the source of the coordinates differs from the one-hot case.`
    }
  }
}

wordButtons0801.forEach(btn=>btn.addEventListener('click',()=>{
  currentWord0801=btn.dataset.word
  syncButtons0801()
  render0801()
}))
repButtons0801.forEach(btn=>btn.addEventListener('click',()=>{
  currentRep0801=btn.dataset.rep
  syncButtons0801()
  render0801()
}))

syncButtons0801()
render0801()
