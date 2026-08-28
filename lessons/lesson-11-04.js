// Module 11, Concept 04 -- Vector database and vector-store persistence.
// "Where does the embedding go?" lab. Three destinations, one shared data
// model -- clicking a destination updates the diagram highlight, the
// comparison table, and the callout, all from one small facts object.

(function () {
  "use strict";

  var STORE_FACTS_1104 = {
    store: {
      label: "In-memory vector store",
      activeNodes: ["node_chunk_1104", "node_hub_1104", "node_ram_1104"],
      rows: [
        ["Durable across restart?", "No — LangChain InMemoryVectorStore default"],
        ["Where the vector lives", "Process RAM only"],
        ["What survives a crash", "Nothing; re-embed from source on restart"],
        ["Byte cost at 10,000 chunks", "10,000 × 384 × 4 bytes = 15.36 MB (RAM)"],
      ],
      calloutClass: "warning",
      calloutText: "A vector store gives you the search API but not durability by default -- the embedding disappears if the process dies before this is upgraded to a database.",
    },
    db: {
      label: "Vector database (Oracle/pgvector)",
      activeNodes: ["node_chunk_1104", "node_hub_1104", "node_disk_1104"],
      rows: [
        ["Durable across restart?", "Yes — write-ahead log + table storage"],
        ["Where the vector lives", "VECTOR(384, FLOAT32) column, embeddings table"],
        ["What survives a crash", "Full row: chunk text, vector, citation link"],
        ["Byte cost at 10,000 chunks", "15.36 MB raw + row/index overhead, on disk"],
      ],
      calloutClass: "",
      calloutText: "This is Module 10 Concept 05's schema in action: the same adapter interface (upsert/query/delete from Concept 14) now writes to a durable table instead of RAM.",
    },
    search: {
      label: "Search engine index",
      activeNodes: ["node_chunk_1104", "node_hub_1104", "node_index_1104"],
      rows: [
        ["Durable across restart?", "Yes — committed segment files on disk"],
        ["Where the vector lives", "Dense-vector field inside the index segment"],
        ["What survives a crash", "Segment files; uncommitted writes may be lost"],
        ["Byte cost at 10,000 chunks", "15.36 MB raw, often reduced via SQ8 (4.00x) or PQ (32.00x)"],
      ],
      calloutClass: "",
      calloutText: "Same underlying vector, different persistence unit: a committed index segment instead of a database row.",
    },
  };

  var buttons_1104 = Array.from(document.querySelectorAll("#storePicker_1104 button"));
  var allNodes_1104 = Array.from(document.querySelectorAll("#persistDiagram_1104 .diagram-node"));
  var colHeader_1104 = document.getElementById("colStore_1104");
  var tableBody_1104 = document.getElementById("persistTableBody_1104");
  var callout_1104 = document.getElementById("persistCallout_1104");

  if (!colHeader_1104 || !tableBody_1104 || !callout_1104 || buttons_1104.length === 0) return;

  function renderPersist_1104(key) {
    var facts = STORE_FACTS_1104[key];
    if (!facts) return;

    buttons_1104.forEach(function (btn) {
      var isActive = btn.dataset.store === key;
      btn.classList.toggle("active", isActive);
      btn.classList.toggle("secondary", !isActive);
    });

    allNodes_1104.forEach(function (node) {
      node.classList.remove("active");
    });
    facts.activeNodes.forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.classList.add("active");
    });

    colHeader_1104.textContent = facts.label;
    tableBody_1104.innerHTML = facts.rows
      .map(function (row) {
        return "<tr><td>" + row[0] + "</td><td>" + row[1] + "</td></tr>";
      })
      .join("");

    callout_1104.className = "callout" + (facts.calloutClass ? " " + facts.calloutClass : "");
    callout_1104.textContent = facts.calloutText;
  }

  buttons_1104.forEach(function (btn) {
    btn.addEventListener("click", function () {
      renderPersist_1104(btn.dataset.store);
    });
  });

  renderPersist_1104("store");
})();
