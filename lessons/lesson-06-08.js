const advancedLesson0608=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0608(){if(advancedLesson0608)advancedLesson0608.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0608)
syncAdvancedTarget0608()

// Section 14's lab: the Lineage Latency Ledger. Two additive delay sliders
// chain forward into a live-computed timestamp sequence (source -> ingested
// -> versioned), a checkbox controls whether an OCR stage is even part of
// the chain, and the whole chip chain plus a freshness-budget verdict
// re-render on every change.

const SOURCE_LAST_MODIFIED_MS_0608=Date.UTC(2025,5,10) // 2025-06-10 -- month is 0-indexed, so 5 = June
const FRESHNESS_BUDGET_DAYS_0608=14

function addDays0608(ms,days){return ms+days*86400000}
function fmtDate0608(ms){return new Date(ms).toISOString().slice(0,10)}

const ingestSlider0608=document.querySelector('#wgIngestDelay_0608')
const ingestOut0608=document.querySelector('#wgIngestDelayOut_0608')
const detectSlider0608=document.querySelector('#wgDetectDelay_0608')
const detectOut0608=document.querySelector('#wgDetectDelayOut_0608')
const ocrToggle0608=document.querySelector('#wgOcrToggle_0608')
const chainRow0608=document.querySelector('#wgLedgerChain_0608')
const readout0608=document.querySelector('#wgLedgerReadout_0608')
const verdict0608=document.querySelector('#wgLedgerVerdict_0608')

function chip0608(label,sub,dateMs){
  return `<div class="rank-chip"><b>${label}</b><span>${sub}</span><small>${fmtDate0608(dateMs)}</small></div>`
}

function recomputeLedger0608(){
  const ingestDelay=ingestSlider0608?Number(ingestSlider0608.value):8
  const detectDelay=detectSlider0608?Number(detectSlider0608.value):0
  const ocrOn=!!ocrToggle0608?.checked

  if(ingestOut0608)ingestOut0608.textContent=String(ingestDelay)
  if(detectOut0608)detectOut0608.textContent=String(detectDelay)

  const ingestedAtMs=addDays0608(SOURCE_LAST_MODIFIED_MS_0608,ingestDelay)
  const versionedAtMs=addDays0608(ingestedAtMs,detectDelay)
  const latencyDays=Math.round((versionedAtMs-SOURCE_LAST_MODIFIED_MS_0608)/86400000)

  // Parse completes right at ingestion; Clean/Dedup/Version wait behind the
  // simulated queue backlog and only complete once versionedAtMs arrives --
  // the mechanic labDesign calls out explicitly, not a real production claim.
  const chips=[chip0608('Source','wiki:legal-compliance/refund-policy',SOURCE_LAST_MODIFIED_MS_0608)]
  if(ocrOn)chips.push(chip0608('OCR','Concept 04 (optional)',ingestedAtMs))
  chips.push(chip0608('Parse','Concept 02',ingestedAtMs))
  chips.push(chip0608('Clean','Concept 05',versionedAtMs))
  chips.push(chip0608('Dedup/Canonicalize','Concept 06',versionedAtMs))
  chips.push(chip0608('Version','Concept 07',versionedAtMs))
  if(chainRow0608)chainRow0608.innerHTML=chips.join('')

  if(readout0608){
    readout0608.innerHTML=`
      <div><span>SOURCE LAST MODIFIED</span><b>${fmtDate0608(SOURCE_LAST_MODIFIED_MS_0608)}</b></div>
      <div><span>INGESTED_AT</span><b>${fmtDate0608(ingestedAtMs)}</b></div>
      <div><span>VERSIONED_AT</span><b>${fmtDate0608(versionedAtMs)}</b></div>
      <div><span>SOURCE-TO-SERVED LATENCY</span><b>${latencyDays} day${latencyDays===1?'':'s'}</b></div>
    `
  }

  if(!verdict0608)return
  const stale=latencyDays>FRESHNESS_BUDGET_DAYS_0608
  verdict0608.classList.toggle('warning',stale)
  verdict0608.innerHTML=stale
    ? `<b>STALE</b>Latency of ${latencyDays} days breaches the 14-day freshness budget (Module 19 preview).`
    : `<b>Within freshness budget</b>Latency of ${latencyDays} days stays inside the 14-day freshness budget (Module 19 preview).`
}

ingestSlider0608?.addEventListener('input',recomputeLedger0608)
detectSlider0608?.addEventListener('input',recomputeLedger0608)
ocrToggle0608?.addEventListener('change',recomputeLedger0608)
recomputeLedger0608()
