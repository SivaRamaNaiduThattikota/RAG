const advancedLesson0702=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0702(){if(advancedLesson0702)advancedLesson0702.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0702)
syncAdvancedTarget0702()

// Section 14's lab: The Boundary Cutter. Renders the same 146-character
// refund/premium passage as two chunk strips -- fixed-size on top, recursive
// below -- and re-computes both live as the chunk-size slider moves. Fixed-size
// cuts land purely by arithmetic accident (bounces on/off across the range);
// recursive never cuts mid-word in this passage because its longest single
// word (9 chars) never exceeds the slider's 20-char floor, so the raw-character
// fallback level is never actually invoked.

const PASSAGE_0702='Refund requests must be submitted within 45 days of purchase.\n\nEmployees on the premium plan receive an extended 90 day window for filing a claim.'

function isWordChar0702(ch){return /[A-Za-z0-9]/.test(ch||'')}

function fixedSizeChunks0702(text,size){
  const chunks=[]
  for(let i=0;i<text.length;i+=size)chunks.push(text.slice(i,i+size))
  return chunks
}

function fixedSizeCutFlags0702(text,size){
  // one flag per internal boundary (between chunk i and i+1)
  const flags=[]
  for(let i=size;i<text.length;i+=size)flags.push(isWordChar0702(text[i-1])&&isWordChar0702(text[i]))
  return flags
}

// Simplified LangChain-style recursive splitter: try each separator in order,
// merge pieces back up to `size` (re-inserting the separator for pieces that
// stay inside ONE chunk), and only drop a separator where it falls exactly on
// a chunk BOUNDARY. Recurse into any single piece still too large using the
// next separator down; only the final empty-separator level ever risks a
// mid-word cut, since every other level splits only at the separator itself.
function recursiveChunks0702(text,size,separators){
  if(text.length<=size)return [{text,cut:false}]
  if(!separators.length){
    const out=[]
    for(let i=0;i<text.length;i+=size){
      const piece=text.slice(i,i+size)
      out.push({text:piece,cut:i>0&&isWordChar0702(text[i-1])&&isWordChar0702(text[i])})
    }
    return out
  }
  const [sep,...rest]=separators
  const parts=text.split(sep)
  const merged=[]
  let cur=''
  for(const part of parts){
    if(part.length>size){
      if(cur){merged.push({text:cur,cut:false});cur=''}
      merged.push(...recursiveChunks0702(part,size,rest))
      continue
    }
    const candidate=cur===''?part:cur+sep+part
    if(candidate.length<=size){
      cur=candidate
    }else{
      merged.push({text:cur,cut:false})
      cur=part
    }
  }
  if(cur)merged.push({text:cur,cut:false})
  return merged
}

function renderStrip0702(wrapEl,chunks,cutBefore){
  if(!wrapEl)return
  wrapEl.innerHTML=chunks.map((text,i)=>{
    const classes=['boundary-chunk',i%2===0?'shade-a':'shade-b']
    if(cutBefore[i-1])classes.push('cut-left')
    if(cutBefore[i])classes.push('cut-right')
    return `<div class="${classes.join(' ')}">${text.replace(/\n/g,'⏎')}</div>`
  }).join('')
}

const sizeSlider0702=document.querySelector('#bcSize_0702')
const sizeOut0702=document.querySelector('#bcSizeOut_0702')
const fixedWrap0702=document.querySelector('#bcFixedWrap_0702')
const fixedReadout0702=document.querySelector('#bcFixedReadout_0702')
const recursiveWrap0702=document.querySelector('#bcRecursiveWrap_0702')
const recursiveReadout0702=document.querySelector('#bcRecursiveReadout_0702')
const verdict0702=document.querySelector('#bcVerdict_0702')

function renderBoundaryCutter0702(){
  const size=sizeSlider0702?Number(sizeSlider0702.value):42
  if(sizeOut0702)sizeOut0702.textContent=String(size)

  const fixedChunks=fixedSizeChunks0702(PASSAGE_0702,size)
  const fixedCutFlags=fixedSizeCutFlags0702(PASSAGE_0702,size)
  const fixedCutCount=fixedCutFlags.filter(Boolean).length
  renderStrip0702(fixedWrap0702,fixedChunks,fixedCutFlags)
  if(fixedReadout0702){
    fixedReadout0702.innerHTML=`<b>${fixedChunks.length} chunks</b> · ${fixedCutCount} of ${fixedCutFlags.length} boundaries cut a word or number (${fixedCutFlags.length?((fixedCutCount/fixedCutFlags.length)*100).toFixed(0):0}%)`
  }

  const recursive=recursiveChunks0702(PASSAGE_0702,size,['\n\n','\n',' ',''])
  const recursiveChunkTexts=recursive.map(c=>c.text)
  const recursiveCutFlags=recursive.slice(1).map(c=>c.cut)
  const recursiveCutCount=recursiveCutFlags.filter(Boolean).length
  renderStrip0702(recursiveWrap0702,recursiveChunkTexts,recursiveCutFlags)
  if(recursiveReadout0702){
    recursiveReadout0702.innerHTML=`<b>${recursiveChunkTexts.length} chunks</b> · ${recursiveCutCount} of ${recursiveCutFlags.length} boundaries cut a word or number (${recursiveCutFlags.length?((recursiveCutCount/recursiveCutFlags.length)*100).toFixed(0):0}%)`
  }

  if(verdict0702){
    verdict0702.className='callout'+(fixedCutCount>0?' warning':'')
    verdict0702.innerHTML=fixedCutCount>0
      ? `<b>Fixed-size cuts ${fixedCutCount} word${fixedCutCount===1?'':'s'} or number${fixedCutCount===1?'':'s'} at this size.</b> Pure arithmetic accident -- move the slider a few characters either way and the count can drop straight to zero. Recursive stays at 0 across this entire range: its longest single word is 9 characters, always under the slider's 20-character floor, so it never has to fall back to a raw-character cut.`
      : `<b>Fixed-size happens to land cleanly at this size.</b> That's a coincidence of where chunk_size divides this particular passage -- not a property of the method. Recursive stays at 0 for the same reason it always does here: no word in this passage reaches 20 characters.`
  }
}

sizeSlider0702?.addEventListener('input',renderBoundaryCutter0702)
renderBoundaryCutter0702()
