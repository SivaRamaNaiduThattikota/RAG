const advancedLesson0405=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0405(){if(advancedLesson0405)advancedLesson0405.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0405)
syncAdvancedTarget0405()

// Section 14's lab: The Bayes Calculator -- unlike Concept 04's Distance
// Calculator (vectors and coordinates), this one carries three percentages --
// a prior P(H) and two likelihoods, P(E|H) and P(E|notH) -- and reduces them
// to the total evidence probability P(E) and the posterior P(H|E) via Bayes'
// rule (Section 09), plus the posterior if the evidence had gone the other
// way, P(H|notE). A live bar chart compares the prior to the posterior
// directly. The defaults reproduce this concept's own ticket numbers
// (prior 25%, P(E|H) 80%, P(E|notH) 20%, posterior about 57.1%).

const DEFAULT_PRIOR_0405=25
const DEFAULT_LIKE_H_0405=80
const DEFAULT_LIKE_NOT_H_0405=20
const state0405={prior:DEFAULT_PRIOR_0405,likeH:DEFAULT_LIKE_H_0405,likeNotH:DEFAULT_LIKE_NOT_H_0405}

const priorSlider0405=document.querySelector('#simPriorH_0405')
const priorOut0405=document.querySelector('#simPriorHOut_0405')
const likeHSlider0405=document.querySelector('#simLikeH_0405')
const likeHOut0405=document.querySelector('#simLikeHOut_0405')
const likeNotHSlider0405=document.querySelector('#simLikeNotH_0405')
const likeNotHOut0405=document.querySelector('#simLikeNotHOut_0405')

const notPriorBox0405=document.querySelector('#simNotPriorBox0405')
const evidenceBox0405=document.querySelector('#simEvidenceBox0405')
const posteriorBox0405=document.querySelector('#simPosteriorBox0405')
const posteriorNotBox0405=document.querySelector('#simPosteriorNotBox0405')

const barPrior0405=document.querySelector('#simBarPrior0405')
const barPriorOut0405=document.querySelector('#simBarPriorOut0405')
const barPosterior0405=document.querySelector('#simBarPosterior0405')
const barPosteriorOut0405=document.querySelector('#simBarPosteriorOut0405')
const barPosteriorRow0405=document.querySelector('#simBarPosteriorRow0405')
const verdictBox0405=document.querySelector('#simVerdict0405')
const resetButton0405=document.querySelector('#simReset0405')

function pct0405(x){return Math.round(x*1000)/10}

// Section 09's law of total probability and Bayes' rule, on fractions 0..1
function bayesUpdate0405(priorPct,likeHPct,likeNotHPct){
  const p=priorPct/100
  const lH=likeHPct/100
  const lNotH=likeNotHPct/100
  const notP=1-p
  const evidence=lH*p+lNotH*notP
  const posterior=evidence===0?null:(lH*p)/evidence
  const notEvidence=1-evidence
  const posteriorIfAbsent=notEvidence===0?null:((1-lH)*p)/notEvidence
  return {notP,evidence,posterior,posteriorIfAbsent}
}

function render0405(){
  const {prior,likeH,likeNotH}=state0405
  const {notP,evidence,posterior,posteriorIfAbsent}=bayesUpdate0405(prior,likeH,likeNotH)

  if(notPriorBox0405)notPriorBox0405.textContent=pct0405(notP).toFixed(1)+'%'
  if(evidenceBox0405)evidenceBox0405.textContent=pct0405(evidence).toFixed(1)+'%'
  if(posteriorBox0405)posteriorBox0405.textContent=posterior===null?'undefined':pct0405(posterior).toFixed(1)+'%'
  if(posteriorNotBox0405)posteriorNotBox0405.textContent=posteriorIfAbsent===null?'undefined':pct0405(posteriorIfAbsent).toFixed(1)+'%'

  if(barPrior0405)barPrior0405.style.width=prior+'%'
  if(barPriorOut0405)barPriorOut0405.textContent=prior.toFixed(1)+'%'

  if(posterior===null){
    if(barPosterior0405)barPosterior0405.style.width='0%'
    if(barPosteriorOut0405)barPosteriorOut0405.textContent='undefined'
  }else{
    const posteriorPct=pct0405(posterior)
    if(barPosterior0405)barPosterior0405.style.width=posteriorPct+'%'
    if(barPosteriorOut0405)barPosteriorOut0405.textContent=posteriorPct.toFixed(1)+'%'
  }

  if(barPosteriorRow0405)barPosteriorRow0405.classList.toggle('winner',posterior!==null&&posterior>prior/100)

  if(verdictBox0405){
    if(evidence===0||posterior===null){
      verdictBox0405.textContent=`P(E|H)=${likeH}% and P(E|notH)=${likeNotH}% together make P(E) = 0 -- the posterior is undefined, exactly Section 05's boundary case.`
      verdictBox0405.classList.add('warning')
    }else{
      const priorPct=prior
      const posteriorPct=pct0405(posterior)
      const direction=posteriorPct>priorPct?'increased':posteriorPct<priorPct?'decreased':'left unchanged'
      verdictBox0405.textContent=`Prior ${priorPct.toFixed(1)}% -> posterior ${posteriorPct.toFixed(1)}% after the evidence. The evidence ${direction} the estimate.`
      verdictBox0405.classList.remove('warning')
    }
  }
}

function wireSlider0405(slider,output,key,suffix){
  if(!slider)return
  slider.addEventListener('input',()=>{
    state0405[key]=Number(slider.value)
    if(output)output.textContent=slider.value+(suffix||'%')
    render0405()
  })
}

wireSlider0405(priorSlider0405,priorOut0405,'prior')
wireSlider0405(likeHSlider0405,likeHOut0405,'likeH')
wireSlider0405(likeNotHSlider0405,likeNotHOut0405,'likeNotH')

if(resetButton0405)resetButton0405.addEventListener('click',()=>{
  state0405.prior=DEFAULT_PRIOR_0405
  state0405.likeH=DEFAULT_LIKE_H_0405
  state0405.likeNotH=DEFAULT_LIKE_NOT_H_0405
  if(priorSlider0405)priorSlider0405.value=String(DEFAULT_PRIOR_0405)
  if(priorOut0405)priorOut0405.textContent=DEFAULT_PRIOR_0405+'%'
  if(likeHSlider0405)likeHSlider0405.value=String(DEFAULT_LIKE_H_0405)
  if(likeHOut0405)likeHOut0405.textContent=DEFAULT_LIKE_H_0405+'%'
  if(likeNotHSlider0405)likeNotHSlider0405.value=String(DEFAULT_LIKE_NOT_H_0405)
  if(likeNotHOut0405)likeNotHOut0405.textContent=DEFAULT_LIKE_NOT_H_0405+'%'
  render0405()
})

render0405()
