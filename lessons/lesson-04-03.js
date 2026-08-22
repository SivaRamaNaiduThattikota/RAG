const advancedLesson0403=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0403(){if(advancedLesson0403)advancedLesson0403.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0403)
syncAdvancedTarget0403()

// Section 14's lab: The Similarity Calculator -- unlike Concept 02's Norm
// Calculator (one vector, variable dimension), this one carries two
// independent vectors, v and w, and reduces them to a dot product, both
// L2 norms, a cosine similarity, and (when it exists) the angle between
// them. The plane below only draws two arrows and an angle arc when the
// shared dimension is 2, since higher dimensions have no honest 2D picture.

const MAX_DIM_0403=3
const DEFAULT_V_0403=[3,4,0]
const DEFAULT_W_0403=[4,3,0]
const state0403={dim:2,v:DEFAULT_V_0403.slice(),w:DEFAULT_W_0403.slice()}

const dimToggle0403=document.querySelector('#simDimToggle0403')
const slidersV0403=document.querySelector('#simSlidersV0403')
const slidersW0403=document.querySelector('#simSlidersW0403')
const dotBox0403=document.querySelector('#simDot0403')
const normVBox0403=document.querySelector('#simNormV0403')
const normWBox0403=document.querySelector('#simNormW0403')
const cosBox0403=document.querySelector('#simCos0403')
const angleBox0403=document.querySelector('#simAngle0403')
const visualWrap0403=document.querySelector('#simVisualWrap0403')
const lineV0403=document.querySelector('#simLineV0403')
const lineW0403=document.querySelector('#simLineW0403')
const labelV0403=document.querySelector('#simLabelV0403')
const labelW0403=document.querySelector('#simLabelW0403')
const arcEl0403=document.querySelector('#simArc0403')
const angleLabelEl0403=document.querySelector('#simAngleLabel0403')
const captionEl0403=document.querySelector('#simCaption0403')
const resetButton0403=document.querySelector('#simReset0403')

const vSliderEls0403=[]
const vOutputEls0403=[]
const wSliderEls0403=[]
const wOutputEls0403=[]
for(let i=1;i<=MAX_DIM_0403;i++){
  vSliderEls0403.push(document.querySelector(`#simV${i}_0403`))
  vOutputEls0403.push(document.querySelector(`#simV${i}Out_0403`))
  wSliderEls0403.push(document.querySelector(`#simW${i}_0403`))
  wOutputEls0403.push(document.querySelector(`#simW${i}Out_0403`))
}

function dot0403(a,b){return a.reduce((sum,x,i)=>sum+x*b[i],0)}
function norm0403(a){return Math.sqrt(a.reduce((sum,x)=>sum+x*x,0))}

function currentVectors0403(){
  return [state0403.v.slice(0,state0403.dim),state0403.w.slice(0,state0403.dim)]
}

function renderSliderVisibility0403(){
  [slidersV0403,slidersW0403].forEach(box=>{
    if(!box)return
    box.querySelectorAll('.control').forEach(control=>{
      const slot=Number(control.dataset.slot)
      control.style.display=slot<=state0403.dim?'':'none'
    })
  })
}

function renderPlane0403(v,w){
  if(!visualWrap0403)return
  if(state0403.dim!==2){
    visualWrap0403.style.display='none'
    return
  }
  visualWrap0403.style.display=''
  const cx=150,cy=130,scale=11
  const [v1,v2]=v
  const [w1,w2]=w
  const xV=cx+v1*scale,yV=cy-v2*scale
  const xW=cx+w1*scale,yW=cy-w2*scale
  if(lineV0403){lineV0403.setAttribute('x2',String(xV));lineV0403.setAttribute('y2',String(yV))}
  if(lineW0403){lineW0403.setAttribute('x2',String(xW));lineW0403.setAttribute('y2',String(yW))}
  if(labelV0403){
    labelV0403.setAttribute('x',String(xV+6))
    labelV0403.setAttribute('y',String(yV-4))
    labelV0403.textContent=`v = (${v1}, ${v2})`
  }
  if(labelW0403){
    labelW0403.setAttribute('x',String(xW+6))
    labelW0403.setAttribute('y',String(yW-4))
    labelW0403.textContent=`w = (${w1}, ${w2})`
  }

  const lenV=norm0403(v)*scale
  const lenW=norm0403(w)*scale
  if(arcEl0403){
    if(lenV<4||lenW<4){
      arcEl0403.setAttribute('d','')
      if(angleLabelEl0403)angleLabelEl0403.textContent=''
    }else{
      const radius=Math.max(6,Math.min(28,lenV*0.85,lenW*0.85))
      const angleV=Math.atan2(yV-cy,xV-cx)
      const angleW=Math.atan2(yW-cy,xW-cx)
      let delta=angleW-angleV
      delta=((delta+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI
      const sweepFlag=delta>=0?1:0
      const startX=cx+radius*Math.cos(angleV)
      const startY=cy+radius*Math.sin(angleV)
      const endX=cx+radius*Math.cos(angleW)
      const endY=cy+radius*Math.sin(angleW)
      arcEl0403.setAttribute('d',`M${startX.toFixed(2)},${startY.toFixed(2)} A${radius.toFixed(2)},${radius.toFixed(2)} 0 0 ${sweepFlag} ${endX.toFixed(2)},${endY.toFixed(2)}`)
      if(angleLabelEl0403){
        const midAngle=angleV+delta/2
        const labelR=radius+14
        angleLabelEl0403.setAttribute('x',String((cx+labelR*Math.cos(midAngle)).toFixed(2)))
        angleLabelEl0403.setAttribute('y',String((cy+labelR*Math.sin(midAngle)).toFixed(2)))
      }
    }
  }
  if(captionEl0403)captionEl0403.textContent=`The green arrow is v = (${v1}, ${v2}), the orange arrow is w = (${w1}, ${w2}) -- drag either vector's sliders to see the dot product, cosine similarity, and angle change together.`
}

function renderReadout0403(){
  const [v,w]=currentVectors0403()
  const dotValue=dot0403(v,w)
  const normV=norm0403(v)
  const normW=norm0403(w)
  if(dotBox0403)dotBox0403.textContent=dotValue.toFixed(3)
  if(normVBox0403)normVBox0403.textContent=normV.toFixed(3)
  if(normWBox0403)normWBox0403.textContent=normW.toFixed(3)

  let cosValue=null
  if(normV>0&&normW>0){
    const raw=dotValue/(normV*normW)
    cosValue=Math.max(-1,Math.min(1,raw))
  }
  if(cosBox0403)cosBox0403.textContent=cosValue===null?'undefined -- zero vector':cosValue.toFixed(3)
  if(angleBox0403){
    if(cosValue===null){
      angleBox0403.textContent='undefined'
    }else{
      const angleDeg=Math.acos(cosValue)*180/Math.PI
      angleBox0403.textContent=`${angleDeg.toFixed(2)}°`
    }
  }
  if(angleLabelEl0403&&cosValue!==null){
    const angleDeg=Math.acos(cosValue)*180/Math.PI
    angleLabelEl0403.textContent=`${angleDeg.toFixed(1)}°`
  }
  renderPlane0403(v,w)
}

function setDimension0403(dim){
  state0403.dim=dim
  if(dimToggle0403)dimToggle0403.querySelectorAll('button').forEach(button=>{
    button.classList.toggle('active',Number(button.dataset.dim)===dim)
  })
  renderSliderVisibility0403()
  renderReadout0403()
}

vSliderEls0403.forEach((slider,index)=>{
  if(!slider)return
  slider.addEventListener('input',()=>{
    state0403.v[index]=Number(slider.value)
    if(vOutputEls0403[index])vOutputEls0403[index].textContent=slider.value
    renderReadout0403()
  })
})

wSliderEls0403.forEach((slider,index)=>{
  if(!slider)return
  slider.addEventListener('input',()=>{
    state0403.w[index]=Number(slider.value)
    if(wOutputEls0403[index])wOutputEls0403[index].textContent=slider.value
    renderReadout0403()
  })
})

if(dimToggle0403)dimToggle0403.querySelectorAll('button').forEach(button=>{
  button.addEventListener('click',()=>setDimension0403(Number(button.dataset.dim)))
})

if(resetButton0403)resetButton0403.addEventListener('click',()=>{
  state0403.v=DEFAULT_V_0403.slice()
  state0403.w=DEFAULT_W_0403.slice()
  vSliderEls0403.forEach((slider,index)=>{
    if(!slider)return
    slider.value=String(state0403.v[index])
    if(vOutputEls0403[index])vOutputEls0403[index].textContent=String(state0403.v[index])
  })
  wSliderEls0403.forEach((slider,index)=>{
    if(!slider)return
    slider.value=String(state0403.w[index])
    if(wOutputEls0403[index])wOutputEls0403[index].textContent=String(state0403.w[index])
  })
  setDimension0403(2)
})

renderSliderVisibility0403()
renderReadout0403()
