const advancedLesson0401=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0401(){if(advancedLesson0401)advancedLesson0401.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0401)
syncAdvancedTarget0401()

// Section 14's lab: The Vector & Matrix Inspector -- a plain editable 3x3
// grid of number inputs, seeded with Section 03's three toy document
// scores. Unlike Concept 12's fixed-scenario gate console, every cell here
// is live and user-owned: typing a new number never resets anything, and
// the two actions (look up M_i,j, extract a row as its own vector) simply
// read whatever numbers are currently sitting in the grid.

const DEFAULT_MATRIX_0401=[
  [0.90, 0.40, 0.70],
  [0.20, 0.95, 0.55],
  [0.60, 0.60, 0.10]
]

const gridBox0401=document.querySelector('#inspectorGrid0401')
const shapeBox0401=document.querySelector('#inspectorShape0401')
const rowInput0401=document.querySelector('#lookupRow0401')
const colInput0401=document.querySelector('#lookupCol0401')
const lookupButton0401=document.querySelector('#lookupButton0401')
const rowButton0401=document.querySelector('#rowButton0401')
const resultBox0401=document.querySelector('#inspectorResult0401')

function buildGrid0401(){
  if(!gridBox0401)return
  gridBox0401.innerHTML=''
  const tbody=document.createElement('tbody')
  DEFAULT_MATRIX_0401.forEach((row,rowIndex)=>{
    const tr=document.createElement('tr')
    row.forEach((value,colIndex)=>{
      const td=document.createElement('td')
      const input=document.createElement('input')
      input.type='number'
      input.step='0.05'
      input.value=String(value)
      input.dataset.row=String(rowIndex)
      input.dataset.col=String(colIndex)
      input.setAttribute('aria-label',`Row ${rowIndex+1}, column ${colIndex+1}`)
      td.appendChild(input)
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  })
  gridBox0401.appendChild(tbody)
  renderShape0401()
}

function readMatrix0401(){
  if(!gridBox0401)return DEFAULT_MATRIX_0401
  const rows=[...gridBox0401.querySelectorAll('tr')]
  if(!rows.length)return DEFAULT_MATRIX_0401
  return rows.map(tr=>[...tr.querySelectorAll('input')].map(input=>Number(input.value)||0))
}

function renderShape0401(){
  const matrix=readMatrix0401()
  const rows=matrix.length
  const cols=rows?matrix[0].length:0
  if(shapeBox0401)shapeBox0401.innerHTML=`<p><b>Current shape: ${rows} × ${cols}.</b> Edit any cell above, then look up an entry or extract a row.</p>`
}

if(gridBox0401)gridBox0401.addEventListener('input',renderShape0401)

if(lookupButton0401)lookupButton0401.addEventListener('click',()=>{
  const matrix=readMatrix0401()
  const row=Math.min(Math.max(1,Math.round(Number(rowInput0401&&rowInput0401.value)||1)),matrix.length)
  const col=Math.min(Math.max(1,Math.round(Number(colInput0401&&colInput0401.value)||1)),matrix[0].length)
  const value=matrix[row-1][col-1]
  if(resultBox0401)resultBox0401.innerHTML=`<p><b>M${row},${col} = ${value}.</b> Row ${row}, column ${col} of the matrix currently in the grid above.</p>`
})

if(rowButton0401)rowButton0401.addEventListener('click',()=>{
  const matrix=readMatrix0401()
  const row=Math.min(Math.max(1,Math.round(Number(rowInput0401&&rowInput0401.value)||1)),matrix.length)
  const vector=matrix[row-1]
  if(resultBox0401)resultBox0401.innerHTML=`<p><b>Row ${row} extracted:</b> (${vector.join(', ')}) — a standalone vector, same numbers, same order.</p>`
})

buildGrid0401()
