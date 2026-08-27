// Module 10, Concept 06 -- Exact search and Oracle vector indexes.
// "The Metric Gatekeeper" lab. Two independent toggle groups (index state,
// distance expression) drive one shared render() that decides among three
// real outcomes: exact search, approximate search, or a silent exact fallback.

(function () {
  "use strict";

  var indexButtons_1006 = [
    document.getElementById("gatekeeperIndexHnsw_1006"),
    document.getElementById("gatekeeperIndexNone_1006"),
  ];
  var exprButtons_1006 = [
    document.getElementById("gatekeeperExprOpEuclidean_1006"),
    document.getElementById("gatekeeperExprOpCosine_1006"),
    document.getElementById("gatekeeperExprVdCosine_1006"),
    document.getElementById("gatekeeperExprVdEuclidean_1006"),
    document.getElementById("gatekeeperExprCosineDistance_1006"),
  ];
  var indexCodeEl_1006 = document.getElementById("gatekeeperIndexCode_1006");
  var slotEl_1006 = document.getElementById("gatekeeperSlot_1006");
  var outcomeEl_1006 = document.getElementById("gatekeeperOutcome_1006");
  var verdictEl_1006 = document.getElementById("gatekeeperVerdict_1006");

  if (!indexCodeEl_1006 || !slotEl_1006 || !outcomeEl_1006 || !verdictEl_1006) return;
  if (indexButtons_1006.some(function (b) { return !b; })) return;
  if (exprButtons_1006.some(function (b) { return !b; })) return;

  var INDEX_SQL_1006 =
    "CREATE VECTOR INDEX embeddings_hnsw_idx ON embeddings (embedding)\n" +
    "  ORGANIZATION INMEMORY NEIGHBOR GRAPH\n" +
    "  DISTANCE COSINE\n" +
    "  WITH TARGET ACCURACY 95;";
  var NO_INDEX_SQL_1006 = "-- no index exists on embeddings.embedding";

  var EXPR_TEXT_1006 = {
    "op-euclidean": "e.embedding <-> :query_embedding",
    "op-cosine": "e.embedding <=> :query_embedding",
    "vd-cosine": "VECTOR_DISTANCE(e.embedding, :query_embedding, COSINE)",
    "vd-euclidean": "VECTOR_DISTANCE(e.embedding, :query_embedding, EUCLIDEAN)",
    "cosine-distance": "COSINE_DISTANCE(e.embedding, :query_embedding)",
  };
  var EXPR_METRIC_1006 = {
    "op-euclidean": "EUCLIDEAN",
    "op-cosine": "COSINE",
    "vd-cosine": "COSINE",
    "vd-euclidean": "EUCLIDEAN",
    "cosine-distance": "COSINE",
  };

  function activeValue_1006(buttons, dataKey) {
    var active = buttons.find(function (b) { return b.classList.contains("active"); });
    return active ? active.dataset[dataKey] : buttons[0].dataset[dataKey];
  }

  function setActive_1006(buttons, target) {
    buttons.forEach(function (b) {
      var isTarget = b === target;
      b.classList.toggle("active", isTarget);
      b.classList.toggle("secondary", !isTarget);
    });
  }

  function render() {
    var indexState = activeValue_1006(indexButtons_1006, "index");
    var expr = activeValue_1006(exprButtons_1006, "expr");
    var metric = EXPR_METRIC_1006[expr];

    indexCodeEl_1006.textContent = indexState === "hnsw" ? INDEX_SQL_1006 : NO_INDEX_SQL_1006;
    slotEl_1006.textContent = EXPR_TEXT_1006[expr];

    outcomeEl_1006.classList.remove("hot");
    verdictEl_1006.classList.remove("warning");

    if (indexState === "none") {
      outcomeEl_1006.textContent = "EXACT SEARCH";
      verdictEl_1006.textContent =
        "No index exists, so every row is checked -- exact search, 100% recall by definition. The distance expression's metric doesn't matter yet.";
    } else if (metric === "COSINE") {
      outcomeEl_1006.classList.add("hot");
      outcomeEl_1006.textContent = "APPROXIMATE SEARCH";
      verdictEl_1006.textContent =
        "Query metric (COSINE) matches the index's build metric -- Oracle uses embeddings_hnsw_idx. Approximate search, recall below 100%, governed by TARGET ACCURACY 95.";
    } else {
      outcomeEl_1006.textContent = "EXACT FALLBACK";
      verdictEl_1006.classList.add("warning");
      verdictEl_1006.textContent =
        'Query metric (EUCLIDEAN) does not match the index\'s build metric (COSINE). Per Oracle\'s own documentation: "If you use a different distance function than the one used to create the index, an exact match is triggered because you cannot use the index in this case." No error, no warning -- just a full scan.';
    }
  }

  indexButtons_1006.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setActive_1006(indexButtons_1006, btn);
      render();
    });
  });
  exprButtons_1006.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setActive_1006(exprButtons_1006, btn);
      render();
    });
  });

  render();
})();
