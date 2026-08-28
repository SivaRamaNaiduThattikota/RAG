// Module 11, Concept 06 -- Top-k evidence selection.
// "Move the cutoff line" lab. One candidate list (already tenant-filtered,
// already over-fetched per Module 09 Concept 07), two sliders -- score
// cutoff and k -- and one small pure function that reproduces exactly what
// the node verification script computed: cutoff filter, top-k slice,
// redundancy backfill, token-budget sum.

(function () {
  "use strict";

  // Same nine candidates verified in the node script cited in Section 12.
  // c007_child/c007_parent carry the grace-period cosine figures from
  // Module 07 Concepts 06/07 and Module 08 Concept 06 -- every other score
  // and token count here is illustrative lab data, not a sourced fact.
  var CANDIDATES_1106 = [
    { id: "cA", label: "cA — refund window, general", score: 0.91, tokens: 150 },
    { id: "c007_child", label: "c007 (child) — grace-period sentence", score: 0.8944, tokens: 180 },
    { id: "cB", label: "cB — shipping confirmation copy", score: 0.88, tokens: 200 },
    { id: "cC", label: "cC — order status definitions", score: 0.85, tokens: 190 },
    { id: "cD", label: "cD — order status definitions (near-dup of cC)", score: 0.83, tokens: 170, dupOf: "cC" },
    { id: "cE", label: "cE — cancellation policy", score: 0.79, tokens: 160 },
    { id: "cF", label: "cF — loyalty program terms", score: 0.72, tokens: 140 },
    { id: "cG", label: "cG — warehouse contact page", score: 0.68, tokens: 130 },
    { id: "c007_parent", label: "c007 (parent) — grace-period paragraph", score: 0.6761, tokens: 420 },
  ];

  var BUDGET_1106 = 1200;

  var cutoffSlider_1106 = document.getElementById("cutoffSlider_1106");
  var kSlider_1106 = document.getElementById("kSlider_1106");
  var cutoffValue_1106 = document.getElementById("cutoffValue_1106");
  var kValue_1106 = document.getElementById("kValue_1106");
  var chipRow_1106 = document.getElementById("chipRow_1106");
  var budgetBar_1106 = document.getElementById("budgetBar_1106");
  var budgetMeta_1106 = document.getElementById("budgetMeta_1106");
  var callout_1106 = document.getElementById("selectCallout_1106");

  if (!cutoffSlider_1106 || !kSlider_1106 || !chipRow_1106) return;

  // Pure selection function -- identical logic to the node script: sort,
  // cutoff filter, take k, drop redundant duplicates, backfill from the
  // remaining cutoff-passing pool.
  function selectEvidence_1106(cutoff, k) {
    var sorted = CANDIDATES_1106.slice().sort(function (a, b) { return b.score - a.score; });
    var passCutoff = sorted.filter(function (c) { return c.score >= cutoff; });
    var topk = passCutoff.slice(0, k);
    var evidence = topk.filter(function (c) { return !c.dupOf; });
    var droppedDup = topk.filter(function (c) { return c.dupOf; }).map(function (c) { return c.id; });
    var pool = passCutoff.filter(function (c) {
      return evidence.indexOf(c) === -1 && !c.dupOf;
    });
    while (evidence.length < k && pool.length) {
      evidence.push(pool.shift());
    }
    return { sorted: sorted, passCutoff: passCutoff, evidence: evidence, droppedDup: droppedDup };
  }

  function render_1106() {
    var cutoff = parseFloat(cutoffSlider_1106.value);
    var k = parseInt(kSlider_1106.value, 10);
    cutoffValue_1106.textContent = cutoff.toFixed(2);
    kValue_1106.textContent = String(k);

    var result = selectEvidence_1106(cutoff, k);
    var evidenceIds = result.evidence.map(function (c) { return c.id; });

    chipRow_1106.innerHTML = result.sorted
      .map(function (c) {
        var classes = ["rank-chip"];
        if (c.score < cutoff) {
          classes.push("excluded");
        } else if (evidenceIds.indexOf(c.id) !== -1) {
          classes.push("match");
        } else if (c.dupOf) {
          classes.push("fp");
        } else {
          classes.push("excluded");
        }
        return "<span class=\"" + classes.join(" ") + "\">" + c.id + " · " + c.score.toFixed(4) + "</span>";
      })
      .join("");

    var totalTokens = result.evidence.reduce(function (s, c) { return s + c.tokens; }, 0);
    var pct = Math.min(100, Math.round((totalTokens / BUDGET_1106) * 100));
    budgetBar_1106.innerHTML = "<div class=\"budget-segment\" style=\"width:" + pct + "%\"></div>";
    budgetMeta_1106.textContent =
      totalTokens + " / " + BUDGET_1106 + " tokens (" + (BUDGET_1106 - totalTokens) + " remaining) — evidence set: " +
      result.evidence.map(function (c) { return c.id; }).join(", ");

    if (result.evidence.length < k) {
      callout_1106.className = "callout warning";
      callout_1106.textContent =
        "Only " + result.evidence.length + " of k=" + k + " candidates clear the " + cutoff.toFixed(2) +
        " cutoff -- raising k further can't help; the cutoff is the binding constraint here.";
    } else if (result.droppedDup.length) {
      callout_1106.className = "callout";
      callout_1106.textContent =
        result.droppedDup.join(", ") + " was dropped as a near-duplicate of cC and backfilled with the next candidate below the raw top-k line.";
    } else if (totalTokens > BUDGET_1106) {
      callout_1106.className = "callout critical";
      callout_1106.textContent =
        "Evidence set fits the score cutoff and k, but exceeds the " + BUDGET_1106 + "-token budget by " + (totalTokens - BUDGET_1106) + " tokens.";
    } else {
      callout_1106.className = "callout";
      callout_1106.textContent =
        "Evidence set is clean at this cutoff and k: no redundancy dropped, " + (BUDGET_1106 - totalTokens) + " tokens still free in the budget.";
    }
  }

  cutoffSlider_1106.addEventListener("input", render_1106);
  kSlider_1106.addEventListener("input", render_1106);
  render_1106();
})();
