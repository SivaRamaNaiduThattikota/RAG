// Module 10, Concept 09 -- Transactions, updates, deletes and index synchronization.
// "The Commit Boundary" lab. Two independent toggle groups (which DML statement,
// which outcome) drive one shared render() over Concept 08's own two-row dataset
// (chk_9f21_2_03, chk_9f21_2_04). Every outcome is traceable to a specific cited
// fact: python-oracledb's own no-autocommit default, Oracle's own ORA-02292
// error-help text, or Oracle's own guidelines-using-vector-indexes DML/accuracy note.

(function () {
  "use strict";

  var stmtButtons_1009 = [
    document.getElementById("stmtUpdate_1009"),
    document.getElementById("stmtDeleteOk_1009"),
    document.getElementById("stmtDeleteBad_1009"),
  ];
  var outcomeButtons_1009 = [
    document.getElementById("outcomeCommit_1009"),
    document.getElementById("outcomeRollback_1009"),
  ];
  var codeEl_1009 = document.getElementById("dmlCode_1009");
  var outcomeEl_1009 = document.getElementById("dmlOutcome_1009");
  var verdictEl_1009 = document.getElementById("dmlVerdict_1009");
  var chipC03_1009 = document.getElementById("chipC03_1009");
  var chipC03Dist_1009 = document.getElementById("chipC03Dist_1009");
  var chipC04_1009 = document.getElementById("chipC04_1009");
  var chipC04Dist_1009 = document.getElementById("chipC04Dist_1009");

  if (!codeEl_1009 || !outcomeEl_1009 || !verdictEl_1009) return;
  if (!chipC03_1009 || !chipC03Dist_1009 || !chipC04_1009 || !chipC04Dist_1009) return;
  if (stmtButtons_1009.some(function (b) { return !b; })) return;
  if (outcomeButtons_1009.some(function (b) { return !b; })) return;

  var STMT_CODE_1009 = {
    update:
      'corrected_vec = array.array("f", [0.0, 1.0, 0.0])\ncursor.execute(\n  "update embeddings set embedding = :1 where chunk_id = :2",\n  [corrected_vec, "chk_9f21_2_03"],\n)',
    "delete-ok":
      'cursor.execute("delete from embeddings where chunk_id = :1", ["chk_9f21_2_04"])  # child first\ncursor.execute("delete from chunks where chunk_id = :1", ["chk_9f21_2_04"])      # parent, now safe',
    "delete-bad":
      'cursor.execute("delete from chunks where chunk_id = :1", ["chk_9f21_2_04"])  # parent first -- fails here\n# ORA-02292: integrity constraint (...) violated - child record found\ncursor.execute("delete from embeddings where chunk_id = :1", ["chk_9f21_2_04"])  # never reached',
  };
  var OUTCOME_LINE_1009 = {
    commit: "connection.commit()",
    rollback: "connection.rollback()",
  };

  function activeValue_1009(buttons, dataKey) {
    var active = buttons.find(function (b) { return b.classList.contains("active"); });
    return active ? active.dataset[dataKey] : buttons[0].dataset[dataKey];
  }

  function setActive_1009(buttons, target) {
    buttons.forEach(function (b) {
      var isTarget = b === target;
      b.classList.toggle("active", isTarget);
      b.classList.toggle("secondary", !isTarget);
    });
  }

  function resetChips_1009() {
    chipC03_1009.className = "rank-chip";
    chipC04_1009.className = "rank-chip";
    chipC03Dist_1009.textContent = "dist 0.04 · rank 1";
    chipC04Dist_1009.textContent = "dist 1.00 · rank 2";
  }

  function render() {
    var stmt = activeValue_1009(stmtButtons_1009, "stmt");
    var outcome = activeValue_1009(outcomeButtons_1009, "outcome");

    codeEl_1009.textContent = STMT_CODE_1009[stmt] + "\n" + OUTCOME_LINE_1009[outcome];

    outcomeEl_1009.classList.remove("hot");
    verdictEl_1009.classList.remove("warning");
    resetChips_1009();

    if (stmt === "delete-bad") {
      outcomeEl_1009.textContent = "FAILS BEFORE COMMIT — ORA-02292";
      verdictEl_1009.classList.add("warning");
      verdictEl_1009.textContent =
        'Per Oracle\'s own error-help page: "attempted to delete a parent key value that had a foreign key dependency." embeddings.chunk_id REFERENCES chunks.chunk_id (Concept 03) is that dependency -- the DELETE against chunks fails at cursor.execute() time. Neither COMMIT nor ROLLBACK is ever reached, so the outcome toggle changes nothing here: both rows are unaffected.';
      return;
    }

    if (stmt === "update" && outcome === "commit") {
      outcomeEl_1009.classList.add("hot");
      outcomeEl_1009.textContent = "COMMIT — embedding corrected, durable";
      verdictEl_1009.textContent =
        'chk_9f21_2_03\'s chunk_text never changed -- only its embedding did. Cosine distance to the query vector goes from 0.04 to 0.40 the moment this commits; still rank 1, ten times less confident. Per Oracle\'s own guidelines-using-vector-indexes page, embeddings_ivf_idx\'s own accuracy "may diminish over time due to DML operations" -- this UPDATE is exactly that. Nothing here rebuilds the index.';
      chipC03_1009.className = "rank-chip mover sorted-in";
      chipC03Dist_1009.textContent = "dist 0.04 → 0.40 · rank 1";
      return;
    }

    if (stmt === "update" && outcome === "rollback") {
      outcomeEl_1009.textContent = "ROLLBACK — discarded, as if it never ran";
      verdictEl_1009.textContent =
        'Per python-oracledb\'s own transaction-management documentation: "By default, python-oracledb does not commit this transaction to the database." rollback() makes that explicit -- chk_9f21_2_03\'s embedding is still [0.6, 0.8, 0.0], distance still 0.04.';
      return;
    }

    if (stmt === "delete-ok" && outcome === "commit") {
      outcomeEl_1009.classList.add("hot");
      outcomeEl_1009.textContent = "COMMIT — chk_9f21_2_04 removed from both tables";
      verdictEl_1009.textContent =
        "Unlike Module 09 Concept 08's own ANN-library tombstones, this row is not flagged-and-kept -- once committed, it is physically gone from embeddings and chunks. embeddings_ivf_idx is still subject to the same accuracy-diminishes-under-DML guidance, per Oracle's own guidelines page.";
      chipC04_1009.className = "rank-chip excluded sorted-in";
      chipC04Dist_1009.textContent = "deleted — no longer in either table";
      return;
    }

    if (stmt === "delete-ok" && outcome === "rollback") {
      outcomeEl_1009.textContent = "ROLLBACK — chk_9f21_2_04 still there";
      verdictEl_1009.textContent =
        "Both DELETE statements are discarded together -- python-oracledb does not commit by default, and rollback() undoes the whole transaction, not just one of its two statements. chk_9f21_2_04 is still present, distance still 1.00.";
      return;
    }
  }

  stmtButtons_1009.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setActive_1009(stmtButtons_1009, btn);
      render();
    });
  });
  outcomeButtons_1009.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setActive_1009(outcomeButtons_1009, btn);
      render();
    });
  });

  render();
})();
