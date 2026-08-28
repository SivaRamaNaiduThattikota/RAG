// Module 11, Concept 07 -- Context injection and prompt construction.
// "Fill the context window" lab. One evidence set (the exact five chunks
// from Module 11 Concept 06), one control for the generation reserve and
// one for chunk order -- reproducing exactly what the node verification
// script computed: fixed system/query token counts, boundary overhead,
// prompt-budget math, and truncation-from-the-end when the reserve eats
// too much of the window.

(function () {
  "use strict";

  // Same five chunks as Concept 06's final evidence set, in its native
  // descending-score order. Token counts are the sourced/verified figures
  // from Concept 06's own node script.
  var SCORE_ORDER_1107 = [
    { id: "cA", label: "cA — refund window, general", tokens: 150 },
    { id: "c007_child", label: "c007 (child) — grace-period sentence", tokens: 180 },
    { id: "cB", label: "cB — shipping confirmation copy", tokens: 200 },
    { id: "cC", label: "cC — order status definitions", tokens: 190 },
    { id: "cE", label: "cE — cancellation policy", tokens: 160 },
  ];

  // Same five chunks, c007's child moved to the literal middle position --
  // an illustrative reordering built only to demonstrate lost-in-the-middle
  // risk, not a recommended strategy.
  var BURIED_ORDER_1107 = [
    { id: "cA", label: "cA — refund window, general", tokens: 150 },
    { id: "cB", label: "cB — shipping confirmation copy", tokens: 200 },
    { id: "c007_child", label: "c007 (child) — grace-period sentence", tokens: 180 },
    { id: "cC", label: "cC — order status definitions", tokens: 190 },
    { id: "cE", label: "cE — cancellation policy", tokens: 160 },
  ];

  var SYS_TOKENS_1107 = 35;
  var QUERY_TOKENS_1107 = 9;
  var BOUNDARY_TOKENS_1107 = 6;
  var CONTEXT_WINDOW_1107 = 4096;

  var reserveSlider_1107 = document.getElementById("reserveSlider_1107");
  var orderToggle_1107 = document.getElementById("orderToggle_1107");
  var reserveValue_1107 = document.getElementById("reserveValue_1107");
  var boundaryStrip_1107 = document.getElementById("boundaryStrip_1107");
  var budgetBar_1107 = document.getElementById("assembleBudgetBar_1107");
  var budgetMeta_1107 = document.getElementById("assembleBudgetMeta_1107");
  var callout_1107 = document.getElementById("assembleCallout_1107");

  if (!reserveSlider_1107 || !orderToggle_1107 || !boundaryStrip_1107) return;

  // Pure assembly + accounting function -- identical logic to the node
  // script: pick the order, walk it adding boundary + chunk tokens, and
  // if the running total exceeds the budget, drop chunks from the end
  // (lowest-priority position in the current order) until it fits.
  function assemblePrompt_1107(reserve, orderKey) {
    var order = orderKey === "buried" ? BURIED_ORDER_1107 : SCORE_ORDER_1107;
    var promptBudget = CONTEXT_WINDOW_1107 - reserve;
    var fixedCost = SYS_TOKENS_1107 + QUERY_TOKENS_1107;
    var kept = [];
    var runningTotal = fixedCost;
    var truncated = [];
    for (var i = 0; i < order.length; i++) {
      var cost = order[i].tokens + BOUNDARY_TOKENS_1107;
      if (runningTotal + cost <= promptBudget) {
        kept.push(order[i]);
        runningTotal += cost;
      } else {
        truncated.push(order[i].id);
      }
    }
    return { order: order, kept: kept, truncated: truncated, total: runningTotal, promptBudget: promptBudget };
  }

  function render_1107() {
    var reserve = parseInt(reserveSlider_1107.value, 10);
    var orderKey = orderToggle_1107.value;
    reserveValue_1107.textContent = String(reserve);

    var result = assemblePrompt_1107(reserve, orderKey);
    var keptIds = result.kept.map(function (c) { return c.id; });
    var middleIndex = Math.floor(result.order.length / 2);

    boundaryStrip_1107.innerHTML = result.order
      .map(function (c, i) {
        var kept = keptIds.indexOf(c.id) !== -1;
        var classes = ["boundary-chunk", i % 2 === 0 ? "shade-a" : "shade-b"];
        if (!kept) classes.push("cut-right");
        var flag = c.id === "c007_child" && i === middleIndex && orderKey === "buried"
          ? " ⚠ buried in the middle"
          : "";
        return "<span class=\"" + classes.join(" ") + "\">[" + (i + 1) + "] " + c.id + flag + "</span>";
      })
      .join("");

    var pct = Math.min(100, Math.round((result.total / result.promptBudget) * 100));
    budgetBar_1107.innerHTML = "<div class=\"budget-segment\" style=\"width:" + pct + "%\"></div>";
    budgetMeta_1107.textContent =
      result.total + " / " + result.promptBudget + " tokens (prompt budget = 4096 − " + reserve + ") — kept: " +
      keptIds.join(", ") + (result.truncated.length ? " — dropped: " + result.truncated.join(", ") : "");

    if (result.truncated.length) {
      callout_1107.className = "callout critical";
      callout_1107.textContent =
        "The " + reserve + "-token generation reserve leaves only " + result.promptBudget +
        " tokens for the prompt -- " + result.truncated.join(", ") + " had to be dropped from the end of the current order to fit.";
    } else if (orderKey === "buried") {
      callout_1107.className = "callout warning";
      callout_1107.textContent =
        "Same five chunks, same token totals -- but c007's child, the chunk holding the exact grace-period sentence, now sits in the middle of the block instead of near the front.";
    } else {
      callout_1107.className = "callout";
      callout_1107.textContent =
        "Clean assembly: all five chunks kept in descending-score order, " + (result.promptBudget - result.total) + " tokens still free in the prompt budget.";
    }
  }

  reserveSlider_1107.addEventListener("input", render_1107);
  orderToggle_1107.addEventListener("change", render_1107);
  render_1107();
})();
