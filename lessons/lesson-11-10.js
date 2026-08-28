// Module 11, Concept 10 -- Conversation history.
// "Rewrite the follow-up" lab. Three fixed turns, each holding the exact
// node-computed lexical-overlap retrieval scores and per-turn token counts
// from this concept's own verification script (Sections 07-09 on the page).
// Turn 1 just seeds history; Turn 2 and Turn 3 each compare a raw follow-up's
// retrieval ranking against its history-rewritten form, while a running
// budget bar tracks cumulative lean-history cost against the fixed
// 2,624-token allowance (Section 08).

(function () {
  "use strict";

  var CHUNK_ORDER_1110 = ["cA", "c007_child", "cB", "cC", "cE"];
  var CHUNK_LABEL_1110 = {
    cA: "cA (30-day return policy)",
    c007_child: "c007's child (grace period)",
    cB: "cB (shipping / tracking)",
    cC: "cC (order-status values)",
    cE: "cE (pre-shipment cancellation)"
  };

  var HISTORY_ALLOWANCE_1110 = 2624; // Section 08, node-verified

  var TURNS_1110 = [
    {
      label: "Turn 1 -- history seeded, nothing to rewrite yet",
      raw: null,
      rewritten: "what's the return window after the grace period",
      rawScores: null,
      rewrittenScores: null,
      turnTokens: 29
    },
    {
      label: "Turn 2 -- raw follow-up vs. history-rewritten form",
      raw: "does that still apply if it's a gift",
      rewritten: "does the order-cancellation return window and grace period still apply if the order is a gift order",
      rawScores: { cA: 0.000, c007_child: 0.000, cB: 0.000, cC: 0.000, cE: 0.000 },
      rewrittenScores: { c007_child: 1.000, cC: 0.235, cE: 0.136, cB: 0.045, cA: 0.000 },
      turnTokens: 37
    },
    {
      label: "Turn 3 -- rewriting helps, but doesn't land the ideal chunk",
      raw: "what about if I already opened the package",
      rewritten: "does the return refund window still apply if the customer has already opened the package",
      rawScores: { cB: 0.045, cA: 0.000, c007_child: 0.000, cC: 0.000, cE: 0.000 },
      rewrittenScores: { cC: 0.176, cB: 0.091, cE: 0.091, cA: 0.050, c007_child: 0.000 },
      turnTokens: 8
    }
  ];

  var lab_1110 = document.getElementById("lab_1110");
  var stepLabel_1110 = document.getElementById("stepLabel_1110");
  var rawQueryEl_1110 = document.getElementById("rawQuery_1110");
  var rewrittenQueryEl_1110 = document.getElementById("rewrittenQuery_1110");
  var rawChips_1110 = document.getElementById("rawChips_1110");
  var rewrittenChips_1110 = document.getElementById("rewrittenChips_1110");
  var historyBar_1110 = document.getElementById("historyBar_1110");
  var historyMeta_1110 = document.getElementById("historyMeta_1110");
  var stepBtn_1110 = document.getElementById("stepBtn_1110");
  var resetBtn_1110 = document.getElementById("resetBtn_1110");

  if (!lab_1110 || !stepBtn_1110 || !rawChips_1110) return;

  var idx_1110 = 0;

  var SEGMENT_COLORS_1110 = ["#d7ff53", "#5ee6c3", "#a7e6ff"];

  function sortedEntries_1110(scores) {
    if (!scores) return [];
    return CHUNK_ORDER_1110
      .map(function (id) { return { id: id, score: scores[id] }; })
      .sort(function (a, b) { return b.score - a.score; });
  }

  function renderChipRow_1110(container, scores) {
    var entries = sortedEntries_1110(scores);
    if (entries.length === 0) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = entries
      .map(function (entry, i) {
        var classes = ["rank-chip", "sorted-in"];
        if (i === 0 && entry.score > 0) classes.push("match");
        return (
          '<div class="' + classes.join(" ") + '">' +
          "<b>" + entry.id + "</b>" +
          "<span>" + entry.score.toFixed(3) + "</span>" +
          "<small>" + CHUNK_LABEL_1110[entry.id] + "</small>" +
          "</div>"
        );
      })
      .join("");
  }

  function render_1110() {
    var turn = TURNS_1110[idx_1110];

    stepLabel_1110.textContent = turn.label;
    rawQueryEl_1110.textContent = turn.raw
      ? '"' + turn.raw + '"'
      : "(Turn 1 has no prior turn to rewrite against.)";
    rewrittenQueryEl_1110.textContent = '"' + turn.rewritten + '"';

    renderChipRow_1110(rawChips_1110, turn.rawScores);
    renderChipRow_1110(rewrittenChips_1110, turn.rewrittenScores);

    // Running lean-history cost through the current step, against the
    // fixed 2,624-token allowance computed on the page (Section 08).
    var cumulative = 0;
    historyBar_1110.innerHTML = TURNS_1110.slice(0, idx_1110 + 1)
      .map(function (t, i) {
        cumulative += t.turnTokens;
        var color = SEGMENT_COLORS_1110[i % SEGMENT_COLORS_1110.length];
        var widthPct = Math.max(2, Math.round((t.turnTokens / HISTORY_ALLOWANCE_1110) * 100));
        return (
          '<div class="budget-segment" style="width:' + widthPct + "%;background:" + color + '">' +
          "turn " + (i + 1) +
          "</div>"
        );
      })
      .join("");

    var pct = ((cumulative / HISTORY_ALLOWANCE_1110) * 100).toFixed(1);
    historyMeta_1110.textContent =
      "Lean history so far: " + cumulative + " / " + HISTORY_ALLOWANCE_1110 +
      " tokens (" + pct + "% of the allowance) -- unbounded growth at this " +
      "conversation's own average turn size would exceed this allowance by turn 107.";

    stepBtn_1110.disabled = idx_1110 >= TURNS_1110.length - 1;
    stepBtn_1110.textContent = stepBtn_1110.disabled ? "All turns shown" : "Advance to next turn";
  }

  function step_1110() {
    if (idx_1110 >= TURNS_1110.length - 1) return;
    idx_1110 += 1;
    render_1110();
  }

  function reset_1110() {
    idx_1110 = 0;
    render_1110();
  }

  stepBtn_1110.addEventListener("click", step_1110);
  resetBtn_1110.addEventListener("click", reset_1110);

  render_1110();
})();
