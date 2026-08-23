const advancedLesson0703=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0703(){if(advancedLesson0703)advancedLesson0703.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0703)
syncAdvancedTarget0703()

// Section 14's lab: The Segmentation Lens. Same 259-character Markdown-headed
// refund passage read through three lenses -- sentence, paragraph, structural --
// with no chunk-size slider anywhere. Sentence-lens additionally toggles
// abbreviation awareness, reproducing the "Contact Dr" false split live the
// moment the checkbox is unchecked.

const ABBREVIATIONS_0703=new Set(['Dr','Mr','Mrs','Ms','Prof','Sr','Jr'])

const S1_0703='Refund requests must be submitted within 45 days of purchase.'
const S2_0703='Contact Dr. Smith in the billing department if your claim is denied.'
const S3_0703='Employees on the premium plan receive an extended 90 day window for filing a claim.'
const HEADING1_0703='# Refund Policy'
const HEADING2_0703='## Premium Plan Exception'
const PARA1_0703=S1_0703+' '+S2_0703
const PARA2_0703=S3_0703
const TEXT2_0703=[HEADING1_0703,PARA1_0703,HEADING2_0703,PARA2_0703].join('\n\n')

// Sentence lane: walk every candidate period, look back to the immediately
// preceding contiguous word, and skip the boundary if that word is a listed
// abbreviation. Heading blocks are passed straight through -- they carry no
// sentence-ending punctuation of their own, so they're never split here.
function splitSentences0703(text,abbrevAware){
  const sentences=[]
  let start=0
  for(let i=0;i<text.length;i++){
    if(text[i]!=='.')continue
    let j=i-1
    while(j>=0&&/[A-Za-z]/.test(text[j]))j--
    const word=text.slice(j+1,i)
    const isAbbrev=abbrevAware&&ABBREVIATIONS_0703.has(word)
    if(!isAbbrev){
      sentences.push(text.slice(start,i+1).trim())
      start=i+1
    }
  }
  const rest=text.slice(start).trim()
  if(rest)sentences.push(rest)
  return sentences
}

function isHeadingBlock0703(block){return /^#{1,6}\s/.test(block)}

// Paragraph lane: pure blank-line split, blind to heading semantics -- a
// heading block sits in the array exactly like any other block.
function paragraphBlocks0703(text){return text.split('\n\n')}

// Structural lane: a heading opens a new section that absorbs every following
// block until the next heading of equal-or-higher level appears.
function structuralSections0703(text){
  const blocks=text.split('\n\n')
  const sections=[]
  let cur=null
  for(const block of blocks){
    if(isHeadingBlock0703(block)){
      if(cur!==null)sections.push(cur)
      cur=block
    }else{
      cur=cur===null?block:cur+'\n\n'+block
    }
  }
  if(cur!==null)sections.push(cur)
  return sections
}

function renderStrip0703(wrapEl,chunks,cutFlags){
  if(!wrapEl)return
  wrapEl.innerHTML=chunks.map((text,i)=>{
    const classes=['boundary-chunk',i%2===0?'shade-a':'shade-b']
    if(cutFlags&&cutFlags[i-1])classes.push('cut-left')
    if(cutFlags&&cutFlags[i])classes.push('cut-right')
    return `<div class="${classes.join(' ')}">${text.replace(/\n/g,'⏎')}</div>`
  }).join('')
}

const lensRadios0703=document.querySelectorAll('input[name="slLens_0703"]')
const abbrevToggle0703=document.querySelector('#slAbbrevToggle_0703')
const lensLabel0703=document.querySelector('#slLensLabel_0703')
const lensSub0703=document.querySelector('#slLensSub_0703')
const stripWrap0703=document.querySelector('#slStripWrap_0703')
const readout0703=document.querySelector('#slReadout_0703')
const verdict0703=document.querySelector('#slVerdict_0703')

function activeLens0703(){
  for(const radio of lensRadios0703)if(radio.checked)return radio.value
  return 'sentence'
}

function renderSegmentationLens0703(){
  const lens=activeLens0703()
  const abbrevAware=abbrevToggle0703?abbrevToggle0703.checked:true
  if(abbrevToggle0703)abbrevToggle0703.disabled=lens!=='sentence'

  if(lens==='sentence'){
    // Only the two prose blocks carry sentences; headings pass through
    // untouched and are excluded from the sentence count entirely.
    const sentences=splitSentences0703(PARA1_0703,abbrevAware).concat(splitSentences0703(PARA2_0703,abbrevAware))
    const trueCount=splitSentences0703(PARA1_0703,true).length+splitSentences0703(PARA2_0703,true).length
    const falseSplits=sentences.length-trueCount
    // Mark the false-split boundary (around "Contact Dr." / "Smith...") when
    // abbreviation-awareness is off and that extra fragment is present.
    const cutFlags=sentences.map((_,i)=>false)
    if(!abbrevAware&&falseSplits>0){
      const falseIndex=sentences.findIndex(s=>/Dr\.$/.test(s))
      if(falseIndex>=0){cutFlags[falseIndex]=true;cutFlags[falseIndex+1]=true}
    }
    if(lensLabel0703)lensLabel0703.textContent='SENTENCE-LENS'
    if(lensSub0703)lensSub0703.textContent=abbrevAware
      ?`${sentences.length} units — headings excluded, not prose`
      :`${sentences.length} units — 1 false split highlighted`
    renderStrip0703(stripWrap0703,sentences,cutFlags)
    if(readout0703){
      readout0703.innerHTML=`<div><span>UNIT COUNT</span><b>${sentences.length}</b></div>`+
        `<div><span>FALSE SPLITS</span><b>${falseSplits}</b></div>`
    }
    if(verdict0703){
      verdict0703.className='callout'+(falseSplits>0?' warning':'')
      verdict0703.innerHTML=falseSplits>0
        ?`<b>Abbreviation-aware segmentation is off.</b> "Contact Dr." now ends its own fragment, and "Smith in the billing department..." starts a new one -- neither is a real sentence. That's the exact false split "Dr. Smith" causes the moment the exception check is skipped.`
        :`<b>3 real sentences, 0 false splits.</b> The period after "Dr" was checked against the abbreviation set and correctly rejected as a boundary -- the same passage, read as paragraph blocks or structural sections, gives 4 or 2 respectively. Same 259 characters, three different counts, no size parameter anywhere.`
    }
  }else if(lens==='paragraph'){
    const blocks=paragraphBlocks0703(TEXT2_0703)
    if(lensLabel0703)lensLabel0703.textContent='PARAGRAPH-LENS'
    if(lensSub0703)lensSub0703.textContent=`${blocks.length} units — each heading isolated as its own block`
    renderStrip0703(stripWrap0703,blocks,null)
    if(readout0703){
      readout0703.innerHTML=`<div><span>UNIT COUNT</span><b>${blocks.length}</b></div>`+
        `<div><span>BLOCK SIZES</span><b>${blocks.map(b=>b.length).join(' / ')}</b></div>`
    }
    if(verdict0703){
      verdict0703.className='callout'
      verdict0703.innerHTML=`<b>4 blind blank-line blocks.</b> "# Refund Policy" and "## Premium Plan Exception" each land as their own one-line block, disconnected from the content they introduce -- paragraph splitting has no idea either one is a heading.`
    }
  }else{
    const sections=structuralSections0703(TEXT2_0703)
    if(lensLabel0703)lensLabel0703.textContent='STRUCTURAL-LENS'
    if(lensSub0703)lensSub0703.textContent=`${sections.length} units — each heading merged with everything under it`
    renderStrip0703(stripWrap0703,sections,null)
    if(readout0703){
      readout0703.innerHTML=`<div><span>UNIT COUNT</span><b>${sections.length}</b></div>`+
        `<div><span>SECTION SIZES</span><b>${sections.map(s=>s.length).join(' / ')}</b></div>`
    }
    if(verdict0703){
      verdict0703.className='callout'
      verdict0703.innerHTML=`<b>2 heading-scoped sections.</b> The same 4 blocks paragraph-lens split apart collapse into 2 here -- each heading absorbs everything until the next one. Strictly coarser than paragraph-lens, not a stricter version of it.`
    }
  }
}

for(const radio of lensRadios0703)radio.addEventListener('change',renderSegmentationLens0703)
abbrevToggle0703?.addEventListener('change',renderSegmentationLens0703)
renderSegmentationLens0703()
