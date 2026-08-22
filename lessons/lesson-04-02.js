const advancedLesson0402=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0402(){if(advancedLesson0402)advancedLesson0402.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0402)
syncAdvancedTarget0402()

// Section 14's lab: The Norm Calculator -- unlike Concept 01's fixed 3x3
// inspector, this one has a variable dimension (2-5, chosen with the
// dim-toggle buttons) driving which sliders are visible. Every slider move
// recomputes dimension, L1 norm, L2 norm and the L2-normalized vector live;
// the plane below only redraws when the current dimension is 2, since a
// higher-dimensional vector has no honest 2D picture to show.

const MAX_DIM_0402=5
const state0402={dim:2,values:[3,4,0,0,0]}

const dimToggle0402=document.querySelector('#normDimToggle0402')
const slidersBox0402=document.querySelector('#normSliders0402')
const dimBox0402=document.querySelector('#normDim0402')
const l1Box0402=document.querySelector('#normL1_0402')
const l2Box0402=document.querySelector('#normL2_0402')
const unitBox0402=document.querySelector('#normUnit0402')
const visualWrap0402=document.querySelector('#normVisualWrap0402')
const lineEl0402=document.querySelector('#normLine0402')
const pointLabel0402=document.querySelector('#normPointLabel0402')
const captionEl0402=document.querySelector('#normCaption0402')
const resetButton0402=document.querySelector('#normReset0402')

const sliderEls0402=[]
const outputEls0402=[]
for(let i=1;i<=MAX_DIM_0402;i++){
  sliderEls0402.push(document.querySelector(`#normV${i}_0402`))
  outputEls0402.push(document.querySelector(`#normV${i}Out_0402`))
}

function l1Norm0402(v){return v.reduce((sum,x)=>sum+Math.abs(x),0)}
function l2Norm0402(v){return Math.sqrt(v.reduce((sum,x)=>sum+x*x,0))}

function currentVector0402(){
  return state0402.values.slice(0,state0402.dim)
}

function renderSliderVisibility0402(){
  if(!slidersBox0402)return
  slidersBox0402.querySelectorAll('.control').forEach(control=>{
    const slot=Number(control.dataset.slot)
    control.style.display=slot<=state0402.dim?'':'none'
  })
}

function renderPlane0402(vector){
  if(!visualWrap0402)return
  if(state0402.dim!==2){
    visualWrap0402.style.display='none'
    return
  }
  visualWrap0402.style.display=''
  const [v1,v2]=vector
  const scale=11
  const x2=150+v1*scale
  const y2=130-v2*scale
  if(lineEl0402){
    lineEl0402.setAttribute('x2',String(x2))
    lineEl0402.setAttribute('y2',String(y2))
  }
  if(pointLabel0402){
    pointLabel0402.setAttribute('x',String(x2+6))
    pointLabel0402.setAttribute('y',String(y2-4))
    pointLabel0402.textContent=`(${v1}, ${v2})`
  }
  if(captionEl0402)captionEl0402.textContent=`The arrow points from the origin to (${v1}, ${v2}); its length on the page is proportional to this vector's L2 norm.`
}

function renderReadout0402(){
  const vector=currentVector0402()
  const l1=l1Norm0402(vector)
  const l2=l2Norm0402(vector)
  if(dimBox0402)dimBox0402.textContent=String(state0402.dim)
  if(l1Box0402)l1Box0402.textContent=l1.toFixed(3)
  if(l2Box0402)l2Box0402.textContent=l2.toFixed(3)
  if(unitBox0402){
    if(l2===0){
      unitBox0402.textContent='undefined -- zero vector'
    }else{
      const normalized=vector.map(x=>(x/l2).toFixed(3))
      unitBox0402.textContent=`(${normalized.join(', ')})`
    }
  }
  renderPlane0402(vector)
}

function setDimension0402(dim){
  state0402.dim=dim
  if(dimToggle0402)dimToggle0402.querySelectorAll('button').forEach(button=>{
    button.classList.toggle('active',Number(button.dataset.dim)===dim)
  })
  renderSliderVisibility0402()
  renderReadout0402()
}

sliderEls0402.forEach((slider,index)=>{
  if(!slider)return
  slider.addEventListener('input',()=>{
    state0402.values[index]=Number(slider.value)
    if(outputEls0402[index])outputEls0402[index].textContent=slider.value
    renderReadout0402()
  })
})

if(dimToggle0402)dimToggle0402.querySelectorAll('button').forEach(button=>{
  button.addEventListener('click',()=>setDimension0402(Number(button.dataset.dim)))
})

if(resetButton0402)resetButton0402.addEventListener('click',()=>{
  state0402.values=[3,4,0,0,0]
  sliderEls0402.forEach((slider,index)=>{
    if(!slider)return
    slider.value=String(state0402.values[index])
    if(outputEls0402[index])outputEls0402[index].textContent=String(state0402.values[index])
  })
  setDimension0402(2)
})

renderSliderVisibility0402()
renderReadout0402()
