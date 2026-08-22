const advancedLesson0605=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0605(){if(advancedLesson0605)advancedLesson0605.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0605)
syncAdvancedTarget0605()

// Section 14's lab: the Cleaning Toggle Bench. One fixed dirty record carries
// all three defects -- encoding, boilerplate, whitespace/punctuation+residual
// noise -- at once. Three independent checkboxes combine in any of eight
// ways. Like Concept 03's Join Fan-Out Simulator and Concept 04's
// Reading-Order Reconstructor, there is no pick/reveal step -- every toggle
// recomputes the live output immediately.

const NAV_0605='Home | Support | Contact'
const MOJIBAKE_0605='â€™' // the verified "â€™" (a, euro, tm) byte-mis-decode sequence
const APOSTROPHE_0605='’'

const RAW_RECORD_0605=
  NAV_0605+'   We received your ticket about the 0RDER 447l refund status  ,and don'+
  MOJIBAKE_0605+'t know when it will update .   '+NAV_0605

function fixEncoding0605(text){
  return text.split(MOJIBAKE_0605).join(APOSTROPHE_0605)
}

function stripBoilerplate0605(text){
  let out=text
  if(out.startsWith(NAV_0605))out=out.slice(NAV_0605.length)
  out=out.replace(/^\s+/,'')
  if(out.endsWith(NAV_0605))out=out.slice(0,out.length-NAV_0605.length)
  out=out.replace(/\s+$/,'')
  return out
}

function normalizeWhitespace0605(text){
  let out=text.replace(/\s+,and/g,', and')
  out=out.replace(/0RDER 447l/g,'ORDER 4471')
  out=out.replace(/ {2,}/g,' ')
  return out.trim()
}

const encodingBox0605=document.querySelector('#wgFixEncoding_0605')
const boilerplateBox0605=document.querySelector('#wgRemoveBoilerplate_0605')
const whitespaceBox0605=document.querySelector('#wgNormalizeWhitespace_0605')
const readoutBox0605=document.querySelector('#wgCleanReadout_0605')
const outputBox0605=document.querySelector('#wgCleanOutput_0605')
const verdictBox0605=document.querySelector('#wgCleanVerdict_0605')

// One verdict sentence per exact combination class -- keyed by a 3-bit
// string "encoding-boilerplate-whitespace", each bit 1 if that defect is
// fixed. This is the lab's central payoff: partial cleaning is a distinct,
// nameable failure mode, not just "less good than full cleaning."
const VERDICTS_0605={
  '000':'Nothing has been touched yet: encoding artifacts, repeated boilerplate and irregular whitespace/punctuation are all still present. Three defects out of three -- this record is not usable for retrieval in this state.',
  '100':'The mojibake is repaired, but the record still repeats its nav boilerplate on both ends and still carries the raw "0RDER 447l" noise with ragged spacing around it -- two defects out of three still block reliable use.',
  '010':'Boilerplate is stripped, but the apostrophe is still garbled mojibake and the order number still reads "0RDER 447l" with uneven spacing -- two defects out of three still stand.',
  '001':'Spacing is tidy and the order number now reads "ORDER 4471," but the nav boilerplate still repeats on both ends and the apostrophe is still mojibake -- two defects out of three still stand, and boilerplate alone means retrieval keeps wasting context budget on identical chrome.',
  '110':'Encoding and boilerplate are both fixed, but the order number still reads "0RDER 447l" and the spacing around it is still uneven -- one defect, whitespace and residual noise, still blocks an exact match on the order number.',
  '101':'Encoding is fixed and the order number now reads correctly, but the nav boilerplate still repeats at both ends -- retrieval still wastes context budget on it even though the order number now reads correctly.',
  '011':'Boilerplate is gone and the order number reads correctly, but the apostrophe is still garbled mojibake -- one defect, encoding, still sits inside an otherwise-clean record.',
  '111':'All three defects are fixed. This record has stopped being "unclean" -- the only two things it still is are unchunked and not yet deduplicated against other records, and those are Module 07’s and Concept 06’s jobs, not this one’s.'
}

function renderCleaning0605(){
  if(!outputBox0605||!readoutBox0605||!verdictBox0605)return
  const eOn=!!encodingBox0605?.checked
  const bOn=!!boilerplateBox0605?.checked
  const wOn=!!whitespaceBox0605?.checked

  let out=RAW_RECORD_0605
  if(eOn)out=fixEncoding0605(out)
  if(bOn)out=stripBoilerplate0605(out)
  if(wOn)out=normalizeWhitespace0605(out)

  outputBox0605.textContent=out

  const fixedCount=[eOn,bOn,wOn].filter(Boolean).length
  const defectsRemaining=3-fixedCount
  readoutBox0605.innerHTML=
    `<div><span>RAW BASELINE</span><b>${RAW_RECORD_0605.length} chars</b></div>`+
    `<div><span>CURRENT OUTPUT</span><b>${out.length} chars</b></div>`+
    `<div><span>DEFECTS REMAINING</span><b>${defectsRemaining} of 3</b></div>`

  const key=(eOn?'1':'0')+(bOn?'1':'0')+(wOn?'1':'0')
  verdictBox0605.textContent=VERDICTS_0605[key]
}

encodingBox0605?.addEventListener('change',renderCleaning0605)
boilerplateBox0605?.addEventListener('change',renderCleaning0605)
whitespaceBox0605?.addEventListener('change',renderCleaning0605)
renderCleaning0605()
