// Module 11, Concept 06 -- Top-k evidence selection.
// "Move the cutoff line" lab. Eight candidates arrive already ranked, as if
// handed off from Concept 05's over-fetched search. Four independent gates
// -- k, score cutoff, a redundancy filter, and a token budget -- decide
// what actually becomes the evidence set. This is a *separate*, purely
// synthetic dataset from the worked example's nine c007/cA-cG candidates
// in Sections 09-14 of the page -- none of the numbers below are sourced
// facts, they exist only so the sliders land on clean, round values.

(function () {
  "use strict";

  var CANDIDATES_1106 = [
    { id: "c1", score: 0.91, tokens: 220, isDup: false },
    { id: "c2", score: 0.88, tokens: 240, isDup: false },
    { id: "c3", score: 0.86, tokens: 210, isDup: true }, // near-dup of c2
    { id: "c4", score: 0.84, tokens: 260, isDup: false },
    { id: "c5", score: 0.79, tokens: 230, isDup: false },
    { id: "c6", score: 0.71, tokens: 250, isDup: false },
    { id: "c7", score: 0.63, tokens: 270, isDup: false },
    { id: "c8", score: 0.52, tokens: 190, isDup: false }
  ];

  var kSlider_1106 = document.getElementById("kSlider_1106");
  var cutoffSlider_1106 = document.getElementById("cutoffSlider_1106");
  var dedupToggle_1106 = document.getElementById("dedupToggle_1106");
  var budgetSlider_1106 = document.getElementById("budgetSlider_1106");
  var kVal_1106 = document.getElementById("kVal_1106");
  var cutoffVal_1106 = document.getElementById("cutoffVal_1106");
  var dedupVal_1106 = document.getElementById("dedupVal_1106");
  var budgetVal_1106 = document.getElementById("budgetVal_1106");
  var chipRow_1106 = document.getElementById("chipRow_1106");
  var evidenceFill_1106 = document.getElementById("evidenceFill_1106");
  var evidenceCount_1106 = document.getElementById("evidenceCount_1106");
  var coverageFill_1106 = document.getElementById("coverageFill_1106");
  var coverageVal_1106 = document.getElementById("coverageVal_1106");
  var budgetBar_1106 = document.getElementById("budgetBar_1106");
  var budgetUsed_1106 = document.getElementById("budgetUsed_1106");
  var budgetFlag_1106 = document.getElementById("budgetFlag_1106");
  var presetNaive_1106 = document.getElementById("presetNaive_1106");
  var presetDedup_1106 = document.getElementById("presetDedup_1106");
  var presetBudget_1106 = document.getElementById("presetBudget_1106");
  var resetBtn_1106 = document.getElementById("resetBtn_1106");

  if (!kSlider_1106 || !cutoffSlider_1106 || !chipRow_1106) return;

  // Segment colors, cycled, purely for the multi-candidate budget bar --
  // no meaning beyond telling adjacent segments apart.
  var SEGMENT_COLORS_1106 = ["#d7ff53", "#5ee6c3", "#a7e6ff", "#ffcf7c"];

  function render_1106() {
    var k = parseInt(kSlider_1106.value, 10);
    var cutoff = parseInt(cutoffSlider_1106.value, 10) / 100;
    var dedup = dedupToggle_1106.checked;
    var budget = parseInt(budgetSlider_1106.value, 10);

    kVal_1106.textContent = String(k);
    cutoffVal_1106.textContent = cutoff.toFixed(2);
    dedupVal_1106.textContent = dedup ? "on" : "off";
    budgetVal_1106.textContent = String(budget);

    // Four gates, applied in rank order: score cutoff, k cap, redundancy
    // filter, token budget. Whatever survives all four becomes evidence.
    var selected = [];
    var usedTokens = 0;
    for (var i = 0; i < CANDIDATES_1106.length; i += 1) {
      var cand = CANDIDATES_1106[i];
      if (cand.score < cutoff) continue;
      if (selected.length >= k) break;
      if (dedup && cand.isDup) continue;
      if (usedTokens + cand.tokens > budget) continue;
      selected.push(cand);
      usedTokens += cand.tokens;
    }
    var selectedIds = {};
    selected.forEach(function (c) { selectedIds[c.id] = true; });

    // Rank-chip row -- one chip per candidate, in fixed rank order.
    chipRow_1106.innerHTML = CANDIDATES_1106
      .map(function (cand, idx) {
        var classes = ["rank-chip", "sorted-in"];
        if (idx === k - 1) classes.push("cutoff-edge");
        if (selectedIds[cand.id]) {
          classes.push("match");
        } else {
          classes.push("excluded");
        }
        if (dedup && cand.isDup) classes.push("mover");
        var dupTag = cand.isDup ? " &middot; dup" : "";
        return (
          '<div class="' + classes.join(" ") + '">' +
          "<b>" + cand.id + "</b>" +
          "<span>score " + cand.score.toFixed(2) + "</span>" +
          "<small>" + cand.tokens + " tok" + dupTag + "</small>" +
          "</div>"
        );
      })
      .join("");

    // Metric race: evidence-set size, and a coverage proxy (selected score
    // total over the raw top-k score total, i.e. how much of the raw top-k
    // slice's own quality survived every gate).
    var evidencePct = Math.round((selected.length / CANDIDATES_1106.length) * 100);
    evidenceFill_1106.style.width = evidencePct + "%";
    evidenceCount_1106.textContent = selected.length + " / " + CANDIDATES_1106.length;

    var rawTopKScore = CANDIDATES_1106.slice(0, k).reduce(function (s, c) { return s + c.score; }, 0);
    var selectedScore = selected.reduce(function (s, c) { return s + c.score; }, 0);
    var coverage = rawTopKScore > 0 ? Math.round((selectedScore / rawTopKScore) * 100) : 0;
    coverageFill_1106.style.width = Math.min(100, coverage) + "%";
    coverageVal_1106.textContent = coverage + "%";

    // Budget bar -- one segment per selected candidate, sized by token cost.
    budgetBar_1106.innerHTML = selected
      .map(function (cand, idx) {
        var color = SEGMENT_COLORS_1106[idx % SEGMENT_COLORS_1106.length];
        var widthPct = Math.max(2, Math.round((cand.tokens / budget) * 100));
        return (
          '<div class="budget-segment" style="width:' + widthPct + "%;background:" + color + '">' +
          cand.id +
          "</div>"
        );
      })
      .join("");
    budgetUsed_1106.textContent = usedTokens + " / " + budget + " tokens";
    budgetFlag_1106.innerHTML =
      usedTokens >= budget * 0.9
        ? '<span class="budget-overflow">near budget limit -- later candidates dropped</span>'
        : "";
  }

  function applyPreset_1106(k, cutoff, dedup, budget) {
    kSlider_1106.value = String(k);
    cutoffSlider_1106.value = String(cutoff);
    dedupToggle_1106.checked = dedup;
    budgetSlider_1106.value = String(budget);
    render_1106();
  }

  [kSlider_1106, cutoffSlider_1106, dedupToggle_1106, budgetSlider_1106].forEach(function (el) {
    el.addEventListener("input", render_1106);
  });

  if (presetNaive_1106) presetNaive_1106.addEventListener("click", function () { applyPreset_1106(4, 0, false, 1600); });
  if (presetDedup_1106) presetDedup_1106.addEventListener("click", function () { applyPreset_1106(4, 0, true, 1600); });
  if (presetBudget_1106) presetBudget_1106.addEventListener("click", function () { applyPreset_1106(6, 0, false, 700); });
  if (resetBtn_1106) resetBtn_1106.addEventListener("click", function () { applyPreset_1106(4, 0, false, 1600); });

  render_1106();
})();
