// Module 11, Concept 09 -- Source identifiers and citations.
// "Trace a citation" lab. Four fixed steps -- one per SOURCE tag in the
// worked answer -- each resolving a chunk/document/locator and re-running
// the exact Section 07 read-back check live, then folding into Section
// 08's merge-by-document render. Numbers are replayed from the node
// script's own output, not recomputed differently here.

(function () {
  "use strict";

  var steps_1109 = [
    {
      source: 2,
      claim: "The order-cancellation grace period is 14 days from the ship date.",
      chunkId: "c007",
      docId: "doc_9f21",
      docTitle: "Order & Account Management Policy",
      version: 2,
      page: 3,
      section: "4.2 Cancellations",
      pct: 100.0,
      missing: [],
      pass: true,
    },
    {
      source: 4,
      claim: "Once that period elapses, the order status locks to CLOSED and refunds stop processing automatically.",
      chunkId: "c008",
      docId: "doc_9f21",
      docTitle: "Order & Account Management Policy",
      version: 2,
      page: 3,
      section: "4.2 Cancellations",
      pct: 100.0,
      missing: [],
      pass: true,
    },
    {
      source: 1,
      claim: "Standard purchases may still be refunded in full within 30 days of the ship date.",
      chunkId: "c_a01",
      docId: "doc_4b12",
      docTitle: "Refund & Returns Policy",
      version: 1,
      page: 1,
      section: "2.1 Standard Refund Window",
      pct: 100.0,
      missing: [],
      pass: true,
    },
    {
      source: 5,
      claim: "Cancellation requests submitted after the grace period are automatically converted into a return with free shipping.",
      chunkId: "c_e01",
      docId: "doc_c390",
      docTitle: "Cancellations FAQ",
      version: 1,
      page: 1,
      section: "3.0 Late Cancellations",
      pct: 50.0,
      missing: ["automatically", "converted", "into", "free", "shipping"],
      pass: false,
    },
  ];

  var lab_1109 = document.getElementById("lab_1109");
  var stepLabel_1109 = document.getElementById("stepLabel_1109");
  var stepBtn_1109 = document.getElementById("stepBtn_1109");
  var resetBtn_1109 = document.getElementById("resetBtn_1109");
  var claimText_1109 = document.getElementById("claimText_1109");
  var chunkResolve_1109 = document.getElementById("chunkResolve_1109");
  var supportRow_1109 = document.getElementById("supportRow_1109");
  var renderRow_1109 = document.getElementById("renderRow_1109");

  if (!lab_1109 || !stepBtn_1109 || !supportRow_1109 || !renderRow_1109) return;

  var idx_1109 = 0;
  var checked_1109 = [];

  function renderSupportRow_1109(step) {
    var labelEl = supportRow_1109.querySelector(".token-label");
    var fillEl = supportRow_1109.querySelector(".bar-fill");
    var reasonEl = supportRow_1109.querySelector(".token-reason");
    labelEl.textContent = step.pct.toFixed(1) + "%";
    fillEl.style.width = step.pct + "%";
    reasonEl.textContent = step.pass
      ? "fully supported -- will render"
      : "missing: " + step.missing.join(", ") + " -- flagged, not rendered";
    supportRow_1109.classList.toggle("winner", step.pass);
    supportRow_1109.classList.toggle("ineligible", !step.pass);
  }

  function rebuildRenderRow_1109() {
    renderRow_1109.innerHTML = "";
    var passingByDoc = {};
    var passingOrder = [];
    var failing = [];

    checked_1109.forEach(function (step) {
      if (step.pass) {
        if (!passingByDoc[step.docId]) {
          passingByDoc[step.docId] = [];
          passingOrder.push(step.docId);
        }
        passingByDoc[step.docId].push(step);
      } else {
        failing.push(step);
      }
    });

    passingOrder.forEach(function (docId, i) {
      var group = passingByDoc[docId];
      var first = group[0];
      var chunkIds = group.map(function (s) { return s.chunkId; }).join(", ");
      var sourceNums = group.map(function (s) { return "SOURCE " + s.source; }).join(", ");

      var chip = document.createElement("div");
      chip.className = "rank-chip tp sorted-in";
      var b = document.createElement("b");
      b.textContent = "[" + (i + 1) + "] " + first.docTitle;
      var span = document.createElement("span");
      span.textContent = "p." + first.page + ", \"" + first.section + "\"";
      var small = document.createElement("small");
      small.textContent = sourceNums + " -> " + chunkIds + (group.length > 1 ? " (merged)" : "");
      chip.appendChild(b);
      chip.appendChild(span);
      chip.appendChild(small);
      renderRow_1109.appendChild(chip);
    });

    failing.forEach(function (step) {
      var chip = document.createElement("div");
      chip.className = "rank-chip fn sorted-in";
      var b = document.createElement("b");
      b.textContent = "flagged";
      var span = document.createElement("span");
      span.textContent = "SOURCE " + step.source + " -- " + step.chunkId;
      var small = document.createElement("small");
      small.textContent = "read-back " + step.pct.toFixed(1) + "% -- not rendered";
      chip.appendChild(b);
      chip.appendChild(span);
      chip.appendChild(small);
      renderRow_1109.appendChild(chip);
    });

    if (checked_1109.length === 0) {
      var empty = document.createElement("p");
      empty.className = "fine-print";
      empty.textContent = "(nothing checked yet)";
      renderRow_1109.appendChild(empty);
    }
  }

  function render_1109() {
    var atEnd = idx_1109 >= steps_1109.length;
    var stepNum = Math.min(idx_1109 + 1, steps_1109.length);
    stepLabel_1109.textContent = atEnd
      ? "Step " + steps_1109.length + " of " + steps_1109.length + " -- done"
      : "Step " + stepNum + " of " + steps_1109.length;

    var step = steps_1109[atEnd ? steps_1109.length - 1 : idx_1109];
    claimText_1109.innerHTML = "“" + step.claim + "” <b>[SOURCE " + step.source + "]</b>";
    chunkResolve_1109.textContent =
      "chunk_id " + step.chunkId + " → " + step.docId + " v." + step.version +
      ", p." + step.page + " (“" + step.section + "”)";
    renderSupportRow_1109(step);

    stepBtn_1109.disabled = atEnd;
    stepBtn_1109.textContent = atEnd ? "Done" : "Check this citation";
  }

  function step_1109() {
    if (idx_1109 >= steps_1109.length) return;
    checked_1109.push(steps_1109[idx_1109]);
    idx_1109 += 1;
    rebuildRenderRow_1109();
    render_1109();
  }

  function reset_1109() {
    idx_1109 = 0;
    checked_1109 = [];
    rebuildRenderRow_1109();
    render_1109();
  }

  stepBtn_1109.addEventListener("click", step_1109);
  resetBtn_1109.addEventListener("click", reset_1109);

  rebuildRenderRow_1109();
  render_1109();
})();
