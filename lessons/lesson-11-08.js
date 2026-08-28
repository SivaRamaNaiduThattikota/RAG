// Module 11, Concept 08 -- LLM generation and the final answer.
// "Generate the next token" lab. Four fixed decode steps, each masking three
// unsupported candidates against one token the retrieved passage actually
// backs -- reusing Module 02 Concept 11's .mask-panels pattern, repurposed
// from "grammar constraint" to "grounded vs. unsupported token choice."
// Winners concatenate to "90-day grace period," a deliberately different
// worked answer from Section 07's "14 days," per the lab's own disclaimer.

(function () {
  "use strict";

  var steps_1108 = [
    {
      word: "90",
      tokens: [
        { label: "90", pct: 72, ok: true, reason: "matches retrieved passage" },
        { label: "30", pct: 12, ok: false, reason: "not stated in evidence" },
        { label: "60", pct: 9, ok: false, reason: "not stated in evidence" },
        { label: "180", pct: 7, ok: false, reason: "not stated in evidence" },
      ],
    },
    {
      word: "-day",
      tokens: [
        { label: "-day", pct: 81, ok: true, reason: "matches retrieved phrasing" },
        { label: " days", pct: 8, ok: false, reason: "wrong tokenization of the number" },
        { label: "-hour", pct: 6, ok: false, reason: "not stated in evidence" },
        { label: "-week", pct: 5, ok: false, reason: "not stated in evidence" },
      ],
    },
    {
      word: " grace",
      tokens: [
        { label: " grace", pct: 88, ok: true, reason: "matches retrieved phrasing" },
        { label: " waiting", pct: 5, ok: false, reason: "not the retrieved term" },
        { label: " trial", pct: 4, ok: false, reason: "not the retrieved term" },
        { label: " notice", pct: 3, ok: false, reason: "not the retrieved term" },
      ],
    },
    {
      word: " period",
      tokens: [
        { label: " period", pct: 91, ok: true, reason: "matches retrieved phrasing" },
        { label: " window", pct: 4, ok: false, reason: "plausible English, not the retrieved term" },
        { label: " term", pct: 3, ok: false, reason: "not the retrieved term" },
        { label: " phase", pct: 2, ok: false, reason: "not the retrieved term" },
      ],
    },
  ];

  var lab_1108 = document.getElementById("lab_1108");
  var stepLabel_1108 = document.getElementById("stepLabel_1108");
  var stepBtn_1108 = document.getElementById("stepBtn_1108");
  var resetBtn_1108 = document.getElementById("resetBtn_1108");
  var answer_1108 = document.getElementById("answer_1108");
  var rows_1108 = [
    document.getElementById("row0_1108"),
    document.getElementById("row1_1108"),
    document.getElementById("row2_1108"),
    document.getElementById("row3_1108"),
  ];

  if (!lab_1108 || !stepBtn_1108 || !rows_1108[0]) return;

  var idx_1108 = 0;

  function renderRow_1108(rowEl, token) {
    var labelEl = rowEl.querySelector(".token-label");
    var fillEl = rowEl.querySelector(".bar-fill");
    var reasonEl = rowEl.querySelector(".token-reason");
    labelEl.textContent = token.label;
    fillEl.style.width = token.pct + "%";
    reasonEl.textContent = token.pct + "% -- " + token.reason;
    rowEl.classList.toggle("winner", token.ok);
    rowEl.classList.toggle("ineligible", !token.ok);
  }

  function render_1108() {
    var atEnd = idx_1108 >= steps_1108.length;
    var stepNum = Math.min(idx_1108 + 1, steps_1108.length);
    stepLabel_1108.textContent = atEnd
      ? "Step " + steps_1108.length + " of " + steps_1108.length + " -- done"
      : "Step " + stepNum + " of " + steps_1108.length;

    var step = steps_1108[atEnd ? steps_1108.length - 1 : idx_1108];
    step.tokens.forEach(function (token, i) {
      renderRow_1108(rows_1108[i], token);
    });

    stepBtn_1108.disabled = atEnd;
    stepBtn_1108.textContent = atEnd ? "Done" : "Generate next token";
  }

  function step_1108() {
    if (idx_1108 >= steps_1108.length) return;
    answer_1108.textContent += steps_1108[idx_1108].word;
    idx_1108 += 1;
    render_1108();
  }

  function reset_1108() {
    idx_1108 = 0;
    answer_1108.textContent = "Answer: ";
    render_1108();
  }

  stepBtn_1108.addEventListener("click", step_1108);
  resetBtn_1108.addEventListener("click", reset_1108);

  render_1108();
})();
