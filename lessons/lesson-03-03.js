const advancedLesson0303=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0303(){if(advancedLesson0303)advancedLesson0303.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0303);syncAdvancedTarget0303()

// "The Three Clocks" lab.
// Different mechanic again from concept 01's sort-into-bins chip lab, concept 02's repeated-
// prompt-rewording-attempts lab, and module 02 concept 09's coverage-select-then-stream lab: this
// one is a continuous time-stepping simulation. The learner advances simulated weeks and watches
// three independent facts drift on their own clocks -- a cutoff fact, a private fact, and a
// frequently-changing fact -- then compares "retrain the model" against "wire in retrieval instead."
// The private track is built to never move no matter how many retrains happen; that's the whole point.
//
// Expected markup hooks (owned by the HTML for this lesson, not this file):
//   #clockWeekReadout0303                          -- simulated week / last retrain / retrain count
//   #trackCutoff0303 / #trackPrivate0303 / #trackChanging0303 -- the three status lines
//   #advanceWeekButton0303 / #retrainNowButton0303 / #wireRetrievalButton0303 / #resetClocksButton0303
//   #clocksLog0303 / #clocksInsight0303            -- append-only log, and the post-retrieval summary

let currentWeek0303=0
let lastRetrainWeek0303=0
let retrainCount0303=0
let retrievalWired0303=false

const readoutEl0303=document.querySelector('#clockWeekReadout0303')
const trackCutoffEl0303=document.querySelector('#trackCutoff0303')
const trackPrivateEl0303=document.querySelector('#trackPrivate0303')
const trackChangingEl0303=document.querySelector('#trackChanging0303')
const advanceButton0303=document.querySelector('#advanceWeekButton0303')
const retrainButton0303=document.querySelector('#retrainNowButton0303')
const retrievalButton0303=document.querySelector('#wireRetrievalButton0303')
const resetButton0303=document.querySelector('#resetClocksButton0303')
const logEl0303=document.querySelector('#clocksLog0303')
const insightEl0303=document.querySelector('#clocksInsight0303')

function plural0303(n,singular,plural){return n===1?singular:plural}

function bakedVersion0303(){return Math.floor(lastRetrainWeek0303/3)}
function realVersion0303(){return Math.floor(currentWeek0303/3)}

function cutoffText0303(){
  if(retrievalWired0303)return `Fresh — read at query time, no cutoff line applies anymore.`
  if(currentWeek0303<=lastRetrainWeek0303)return `Known — this week's data was captured at the last retrain (week ${lastRetrainWeek0303}).`
  const weeksPast=currentWeek0303-lastRetrainWeek0303
  return `Unknown — ${weeksPast} ${plural0303(weeksPast,'week','weeks')} past the last retrain. Anything from this week onward was never in training data.`
}

function privateText0303(){
  if(retrievalWired0303)return `Fresh — retrieved directly from the internal source, same as any other week.`
  return `Unknown — never public, so no amount of retraining reaches it. (Retrains so far: ${retrainCount0303}, and it hasn't moved this number even once.)`
}

function changingText0303(){
  const real=realVersion0303()
  if(retrievalWired0303)return `Fresh — reads the live current value (version ${real}) every query.`
  const baked=bakedVersion0303()
  if(baked===real)return `Correct for now — model's baked-in value (version ${baked}) still matches reality. Won't last.`
  return `Stale — model still answers with version ${baked}, reality has moved to version ${real}.`
}

function renderReadout0303(){
  if(!readoutEl0303)return
  readoutEl0303.textContent=`Simulated week: ${currentWeek0303} - Last retrained: week ${lastRetrainWeek0303} - Retrains so far: ${retrainCount0303}.`
}

function renderTracks0303(){
  if(trackCutoffEl0303)trackCutoffEl0303.textContent=cutoffText0303()
  if(trackPrivateEl0303)trackPrivateEl0303.textContent=privateText0303()
  if(trackChangingEl0303)trackChangingEl0303.textContent=changingText0303()
}

function renderAll0303(){
  renderReadout0303()
  renderTracks0303()
}

function appendLog0303(html){
  if(!logEl0303)return
  logEl0303.insertAdjacentHTML('beforeend',`<p>${html}</p>`)
}

function advanceWeek0303(){
  const wasCorrectForNow=!retrievalWired0303&&bakedVersion0303()===realVersion0303()
  currentWeek0303+=1
  const nowStale=!retrievalWired0303&&bakedVersion0303()!==realVersion0303()
  renderAll0303()
  let line=`Advanced time to week ${currentWeek0303}.`
  if(wasCorrectForNow&&nowStale){
    line+=` The frequently-changing fact just flipped from "correct for now" to stale — reality moved on to version ${realVersion0303()} while the model is still answering with version ${bakedVersion0303()}.`
  }else if(retrievalWired0303){
    line+=` All three tracks stay Fresh — retrieval reads live, so the passage of time doesn't touch it.`
  }else{
    line+=` The cutoff and private tracks don't move on their own — only retraining or retrieval changes those.`
  }
  appendLog0303(line)
}

function retrainNow0303(){
  lastRetrainWeek0303=currentWeek0303
  retrainCount0303+=1
  renderAll0303()
  appendLog0303(`Retrained the model at week ${currentWeek0303} (retrain #${retrainCount0303}, costly). Cutoff is "Known" again and the frequently-changing fact is briefly correct again — but the private track did not change at all; it's still Unknown.`)
}

function wireRetrieval0303(){
  retrievalWired0303=true
  renderAll0303()
  appendLog0303(`Wired in retrieval instead of retraining. All three tracks read live now — cutoff, private, and frequently-changing are all Fresh.`)
  renderInsight0303()
}

function renderInsight0303(){
  if(!insightEl0303)return
  const retrainWord=plural0303(retrainCount0303,'retrain','retrains')
  insightEl0303.textContent=`Keeping this model current by retraining took ${retrainCount0303} ${retrainWord} by week ${currentWeek0303} — and every one of those retrains still left the private fact exactly where it started: Unknown, because it was never public in the first place. One retrieval wiring, done a single time, made the cutoff fact, the private fact, and the frequently-changing fact all Fresh at once — for the cost of one change instead of a running bill of retrains that could never have reached the private fact anyway.`
}

function resetClocks0303(){
  currentWeek0303=0
  lastRetrainWeek0303=0
  retrainCount0303=0
  retrievalWired0303=false
  if(logEl0303)logEl0303.innerHTML=''
  if(insightEl0303)insightEl0303.textContent=''
  renderAll0303()
  appendLog0303(`Reset to week 0, freshly trained. Advance a few weeks, then compare retraining against wiring in retrieval.`)
}

advanceButton0303?.addEventListener('click',advanceWeek0303)
retrainButton0303?.addEventListener('click',retrainNow0303)
retrievalButton0303?.addEventListener('click',wireRetrieval0303)
resetButton0303?.addEventListener('click',resetClocks0303)

renderAll0303()
appendLog0303(`Starting at week 0, freshly trained. Advance time, then try retraining versus wiring in retrieval.`)
