// Module 11, Concept 02 -- Document ingestion and index construction workflow.
// "The Ingestion Run" lab. Six fixed stages, one document (POLICY-REFUND-001
// v2), stepped through in order via a single "Run next stage" button.

(function () {
  "use strict";

  var chips_1102 = Array.from(document.querySelectorAll("#ingestChips_1102 .rank-chip"));
  var narration_1102 = document.getElementById("ingestNarration_1102");
  var nextBtn_1102 = document.getElementById("ingestNextBtn_1102");
  var resetBtn_1102 = document.getElementById("ingestResetBtn_1102");

  if (!narration_1102 || !nextBtn_1102 || !resetBtn_1102 || chips_1102.length === 0) return;

  var TEXT_1102 = [
    "Stage 1 of 6 — the workflow computes a SHA-256 hash of the incoming file and compares it to the stored doc_id row. New hash → proceed; unchanged hash → skip re-ingestion entirely.",
    "Stage 2 of 6 — the document is split by the recursive chunker, with overlap sized so no fact spanning a boundary is lost.",
    "Stage 3 of 6 — each chunk is embedded with the passage-side prefix (documents are embedded once, offline — queries are embedded live, per request).",
    "Stage 4 of 6 — chunk rows are inserted, then their embeddings, through bound VECTOR parameters; nothing commits until the whole batch succeeds.",
    "Stage 5 of 6 — the vector index is rebuilt or refreshed so the new rows are actually reachable by a similarity search, not just present in the table.",
    "Stage 6 of 6 — the document is fully ingested: hashed, chunked, embedded, written, indexed. The next query can retrieve from it.",
  ];

  var current_1102 = 0;

  function render_1102() {
    chips_1102.forEach(function (chip, i) {
      chip.classList.remove("match", "excluded", "sorted-in");
      if (i < current_1102) chip.classList.add("sorted-in");
      else if (i === current_1102) chip.classList.add("match");
      else chip.classList.add("excluded");
    });
    narration_1102.textContent = TEXT_1102[current_1102];
    var atEnd = current_1102 >= chips_1102.length - 1;
    nextBtn_1102.classList.toggle("sorted", atEnd);
    nextBtn_1102.disabled = atEnd;
  }

  nextBtn_1102.addEventListener("click", function () {
    if (current_1102 < chips_1102.length - 1) {
      current_1102 += 1;
      render_1102();
    }
  });

  resetBtn_1102.addEventListener("click", function () {
    current_1102 = 0;
    render_1102();
  });

  render_1102();
})();
