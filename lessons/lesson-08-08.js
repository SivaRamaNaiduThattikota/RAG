const advancedLesson0808=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0808(){if(advancedLesson0808)advancedLesson0808.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0808)
syncAdvancedTarget0808()

// Section 14's lab: The Prefix Share Slider. Reuses the worked example's
// toy pooled vectors -- Q_content plus u_q ("query: " prefix's own pooled
// contribution) and u_p ("passage: " prefix's own pooled contribution,
// applied here as the wrong-side mistake). Mean pooling with a k-token
// prefix: pooled = (k*prefix + N*content) / (k+N), exactly Concept 06's
// weighted-average formula. Every readout recomputes live from the
// content-length slider and the prefix-condition toggle.

const Q_CONTENT_0808=[0.70,0.10]
const U_CORRECT_0808=[-0.20,0.50]
const U_WRONG_0808=[0.45,-0.35]
const PREFIX_TOKENS_0808=2
const ORIGIN_X_0808=160, ORIGIN_Y_0808=220, PLANE_SCALE_0808=150

function pooledWithPrefix0808(N,condition){
  if(condition==='none')return [Q_CONTENT_0808[0],Q_CONTENT_0808[1]]
  const u=condition==='correct'?U_CORRECT_0808:U_WRONG_0808
  const total=PREFIX_TOKENS_0808+N
  return [
    (PREFIX_TOKENS_0808*u[0]+N*Q_CONTENT_0808[0])/total,
    (PREFIX_TOKENS_0808*u[1]+N*Q_CONTENT_0808[1])/total
  ]
}

function share0808(N){return PREFIX_TOKENS_0808/(PREFIX_TOKENS_0808+N)}
function dist0808(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1])}
function toPoint0808(v){return [ORIGIN_X_0808+PLANE_SCALE_0808*v[0], ORIGIN_Y_0808-PLANE_SCALE_0808*v[1]]}

const slider0808=document.querySelector('#wgContentLen_0808')
const sliderOut0808=document.querySelector('#wgContentLenOut_0808')
const prefixButtons0808=[...document.querySelectorAll('#s14 [data-prefix]')]
const readout0808=document.querySelector('#wgPrefixReadout_0808')
const verdict0808=document.querySelector('#wgPrefixVerdict_0808')
const arrowContentOnly0808=document.querySelector('#arrowContentOnly_0808')
const dotContentOnly0808=document.querySelector('#dotContentOnly_0808')
const arrowWithPrefix0808=document.querySelector('#arrowWithPrefix_0808')
const dotWithPrefix0808=document.querySelector('#dotWithPrefix_0808')
const displacementLine0808=document.querySelector('#displacementLine_0808')

let currentCondition0808='correct'

function syncPrefixButtons0808(){
  prefixButtons0808.forEach(btn=>btn.classList.toggle('active',btn.dataset.prefix===currentCondition0808))
}

function render0808(){
  const N=Number(slider0808.value)
  if(sliderOut0808)sliderOut0808.textContent=String(N)

  const contentPoint=toPoint0808(Q_CONTENT_0808)
  const withPrefix=pooledWithPrefix0808(N,currentCondition0808)
  const withPoint=toPoint0808(withPrefix)

  if(arrowContentOnly0808){arrowContentOnly0808.setAttribute('x2',contentPoint[0]);arrowContentOnly0808.setAttribute('y2',contentPoint[1])}
  if(dotContentOnly0808){dotContentOnly0808.setAttribute('cx',contentPoint[0]);dotContentOnly0808.setAttribute('cy',contentPoint[1])}
  if(arrowWithPrefix0808){arrowWithPrefix0808.setAttribute('x2',withPoint[0]);arrowWithPrefix0808.setAttribute('y2',withPoint[1])}
  if(dotWithPrefix0808){dotWithPrefix0808.setAttribute('cx',withPoint[0]);dotWithPrefix0808.setAttribute('cy',withPoint[1])}
  if(displacementLine0808){
    displacementLine0808.setAttribute('x1',contentPoint[0]);displacementLine0808.setAttribute('y1',contentPoint[1])
    displacementLine0808.setAttribute('x2',withPoint[0]);displacementLine0808.setAttribute('y2',withPoint[1])
  }

  const sharePct=share0808(N)*100
  const displacement=dist0808(withPrefix,Q_CONTENT_0808)

  if(readout0808){
    readout0808.innerHTML=`
      <div><span>CONTENT TOKENS (N)</span><b>${N}</b></div>
      <div><span>PREFIX TOKEN SHARE</span><b>${sharePct.toFixed(4)}%</b></div>
      <div><span>CONDITION</span><b>${currentCondition0808==='none'?'no prefix':currentCondition0808==='correct'?'correct prefix':'wrong-side prefix'}</b></div>
      <div><span>DISPLACEMENT</span><b>${displacement.toFixed(6)}</b></div>
    `
  }

  if(verdict0808){
    let text
    if(currentCondition0808==='none'){
      text=`No prefix applied -- the with-prefix marker sits exactly on the content-only marker, displacement 0.`
    }else if(N>=40){
      text=`At this length, the prefix's share has dropped below 5% (${sharePct.toFixed(2)}%) -- barely visible.`
    }else if(N<=6){
      text=`At this length, the prefix is nearly a third of everything being pooled (${sharePct.toFixed(2)}%).`
    }else{
      text=`At this length, the prefix is ${sharePct.toFixed(2)}% of everything being pooled -- between the two extremes.`
    }
    verdict0808.innerHTML=`<b>${currentCondition0808==='wrong'?'WRONG-SIDE PREFIX':currentCondition0808==='correct'?'CORRECT PREFIX':'NO PREFIX'}</b> ${text}`
  }
}

prefixButtons0808.forEach(btn=>btn.addEventListener('click',()=>{
  currentCondition0808=btn.dataset.prefix
  syncPrefixButtons0808()
  render0808()
}))
slider0808?.addEventListener('input',render0808)

syncPrefixButtons0808()
render0808()
