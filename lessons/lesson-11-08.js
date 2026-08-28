// Module 11, Concept 08 -- LLM generation and the final answer.
// "Decode the next token" lab. One fixed set of logits per scenario --
// child chunk intact vs. cut mid-sentence, per Module 07 Concept 06's own
// overlap-sizing risk -- softmaxed live in the browser with the exact same
// formula the node verification script in Section 12 ran ahead of time.

(function () {
  "use strict";

  // Two decoding scenarios at the same position: right after "The
  // order-cancellation grace period is ". Logits are illustrative --
  // flagged as such in Section 12 -- chosen only to make the mechanic
  // (logit -> softmax -> argmax) concrete and hand-checkable.
  var SCENARIOS_1108 = {
    intact: {
      label: "c007 (child), overlap intact -- number present in context",
      logits: { "14": 5.1, "7": 1.2, "30": 0.8, "an": 0.3 },
      winner: "14",
      answer:
        "The order-cancellation grace period is 14 days from the ship date [SOURCE 2]. " +
        "The retrieved evidence does not state a separate return window after the grace period -- this cannot be answered from the provided sources.",
    },
    cut: {
      label: "c007 (child), cut mid-sentence -- number absent from context",
      logits: { not: 4.8, "14": 1.5, "30": 1.1, "7": 0.9 },
      winner: "not",
      answer:
        "The retrieved evidence names an order-cancellation grace period but does not state its length in the text provided [SOURCE 2]. " +
        "The return window after the grace period is also not stated in the provided sources.",
    },
  };

  var pickButtons_1108 = document.querySelectorAll("#scenarioPicker_1108 button");
  var probBars_1108 = document.getElementById("probBars_1108");
  var sampleOutput_1108 = document.getElementById("sampleOutput_1108");
  var scenarioNote_1108 = document.getElementById("scenarioNote_1108");

  if (!pickButtons_1108.length || !probBars_1108) return;

  function softmax_1108(logits) {
    var keys = Object.keys(logits);
    var vals = keys.map(function (k) { return logits[k]; });
    var max = Math.max.apply(null, vals);
    var exps = keys.map(function (k) { return Math.exp(logits[k] - max); });
    var sum = exps.reduce(function (a, b) { return a + b; }, 0);
    var probs = {};
    keys.forEach(function (k, i) { probs[k] = exps[i] / sum; });
    return probs;
  }

  function render_1108(key) {
    var scenario = SCENARIOS_1108[key];
    var probs = softmax_1108(scenario.logits);
    var entries = Object.keys(probs)
      .map(function (tok) { return { tok: tok, p: probs[tok] }; })
      .sort(function (a, b) { return b.p - a.p; });

    probBars_1108.innerHTML = entries
      .map(function (e) {
        var isWinner = e.tok === scenario.winner;
        var pct = (e.p * 100).toFixed(2);
        return (
          '<div class="prob-row' + (isWinner ? " winner" : "") + '">' +
          '<span class="token-label">' + e.tok + "</span>" +
          '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
          "<span>" + pct + "%</span>" +
          "</div>"
        );
      })
      .join("");

    sampleOutput_1108.textContent = scenario.answer;
    scenarioNote_1108.textContent = scenario.label + " -- argmax token: \"" + scenario.winner + "\"";

    pickButtons_1108.forEach(function (btn) {
      var active = btn.getAttribute("data-scenario") === key;
      btn.classList.toggle("active", active);
      btn.classList.toggle("secondary", !active);
    });
  }

  pickButtons_1108.forEach(function (btn) {
    btn.addEventListener("click", function () {
      render_1108(btn.getAttribute("data-scenario"));
    });
  });

  render_1108("intact");
})();
