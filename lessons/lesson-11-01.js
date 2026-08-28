// Module 11, Concept 01 -- End-to-end basic RAG pipeline and architecture.
// "Trace one query through the pipeline" lab. Six fixed stages, click-through
// or Prev/Next stepping -- no computation, just the same six-stage trace
// from the worked example, made interactive.

(function () {
  "use strict";

  var stages_1101 = [
    {
      label: "Ingest",
      text: '<b>1 / 6 · Ingest —</b> the Order Management document is parsed and versioned as <code>doc_9f21</code>. Nothing is chunked, embedded, or stored yet.',
    },
    {
      label: "Chunk",
      text: '<b>2 / 6 · Chunk —</b> the grace-period passage becomes one chunk with a stable <code>chunk_id</code>: "The order-cancellation grace period is 14 days from the ship date..."',
    },
    {
      label: "Embed",
      text: '<b>3 / 6 · Embed —</b> the chunk is embedded with all-MiniLM-L6-v2 into a 384-dimensional dense vector, this course\'s own standing convention since Module 08 Concept 06.',
    },
    {
      label: "Store",
      text: '<b>4 / 6 · Store —</b> the vector, chunk_id, and tenant_id are persisted via <code>upsert()</code>, Module 10 Concept 14\'s own store-agnostic interface, into the five-table schema.',
    },
    {
      label: "Retrieve",
      text: '<b>5 / 6 · Retrieve —</b> an incoming question is embedded the same way, then <code>query()</code> runs nearest-neighbor search and returns the top-k matching chunks.',
    },
    {
      label: "Generate",
      text: '<b>6 / 6 · Generate —</b> the retrieved chunk would be injected into a prompt and cited. Named here only -- Concepts 07-09 build this stage out.',
    },
  ];

  var nodes_1101 = [
    document.getElementById("node0_1101"),
    document.getElementById("node1_1101"),
    document.getElementById("node2_1101"),
    document.getElementById("node3_1101"),
    document.getElementById("node4_1101"),
    document.getElementById("node5_1101"),
  ];
  var prevBtn_1101 = document.getElementById("prevBtn_1101");
  var nextBtn_1101 = document.getElementById("nextBtn_1101");
  var readout_1101 = document.getElementById("stageReadout_1101");

  if (!readout_1101 || nodes_1101.some(function (n) { return !n; })) return;
  if (!prevBtn_1101 || !nextBtn_1101) return;

  var step_1101 = 0;

  function render_1101() {
    nodes_1101.forEach(function (node, i) {
      node.classList.toggle("active", i === step_1101);
    });
    readout_1101.innerHTML = stages_1101[step_1101].text;
    prevBtn_1101.disabled = step_1101 === 0;
    nextBtn_1101.disabled = step_1101 === stages_1101.length - 1;
    prevBtn_1101.classList.toggle("active", step_1101 > 0);
    nextBtn_1101.classList.toggle("active", step_1101 < stages_1101.length - 1);
  }

  nodes_1101.forEach(function (node) {
    node.addEventListener("click", function () {
      var target = parseInt(node.dataset.step, 10);
      if (!isNaN(target)) {
        step_1101 = target;
        render_1101();
      }
    });
  });

  prevBtn_1101.addEventListener("click", function () {
    if (step_1101 > 0) {
      step_1101 -= 1;
      render_1101();
    }
  });

  nextBtn_1101.addEventListener("click", function () {
    if (step_1101 < stages_1101.length - 1) {
      step_1101 += 1;
      render_1101();
    }
  });

  render_1101();
})();
