// Module 10, Concept 07 -- Oracle Text and vector hybrid retrieval.
// "Fusion Bench" lab. One mode toggle (lexical / vector / hybrid) drives one
// shared render() over Acme's own six-chunk dataset, showing which chunks a
// given mode recovers and why hybrid fusion outranks a plain lexical or
// vector-only pass.

(function () {
  "use strict";

  var modeButtons_1007 = [
    document.getElementById("fusionModeLexical_1007"),
    document.getElementById("fusionModeVector_1007"),
    document.getElementById("fusionModeHybrid_1007"),
  ];
  var exprSlotEl_1007 = document.getElementById("fusionExprSlot_1007");
  var chipRowEl_1007 = document.getElementById("fusionChipRow_1007");
  var barFoundEl_1007 = document.getElementById("fusionBarFound_1007");
  var valFoundEl_1007 = document.getElementById("fusionValFound_1007");
  var verdictEl_1007 = document.getElementById("fusionVerdict_1007");

  if (!exprSlotEl_1007 || !chipRowEl_1007 || !barFoundEl_1007 || !valFoundEl_1007 || !verdictEl_1007) return;
  if (modeButtons_1007.some(function (b) { return !b; })) return;

  // Acme's own six relevant chunks, locked in from Concepts 04/05/06 at
  // these global ranks. lexicalHit marks whether CONTAINS/SCORE() would
  // actually match it -- only 4 of 6 do; the other 2 are paraphrases.
  var ACME_1007 = [
    { rank: 3, lexicalHit: true },
    { rank: 7, lexicalHit: true },
    { rank: 9, lexicalHit: true },
    { rank: 14, lexicalHit: false },
    { rank: 17, lexicalHit: true },
    { rank: 20, lexicalHit: false },
  ];

  // The hybrid expression here is illustrative fusion arithmetic invented
  // for this lab -- not a verified Oracle-documented syntax. Kept distinct
  // from the two real, citable expressions either side of it.
  var EXPR_1007 = {
    lexical: "SCORE(1) DESC",
    vector: "VECTOR_DISTANCE(e.embedding, :query_embedding, COSINE) ASC",
    hybrid: "(0.5*(SCORE(1)/100)) + (0.5*(1-VECTOR_DISTANCE(e.embedding,:query_embedding,COSINE))) DESC -- illustrative, not verified Oracle syntax",
  };

  var VERDICT_1007 = {
    lexical:
      "Lexical only: CONTAINS/SCORE() finds 4 of 6. Ranks 14 and 20 are paraphrases with zero literal query-term overlap, so Oracle Text alone never surfaces them -- no error, they simply don't match.",
    vector:
      "Vector only: cosine similarity always surfaces all 6 (unchanged since Concept 05), but there is no exact-match confidence signal -- a paraphrase and a literal keyword hit look the same to this mode alone.",
    hybrid:
      "Hybrid (RSF fusion): all 6 are recovered, and the 4 double-hit chunks (outlined below) -- matched by both signals -- rank highest. This is the only mode that both recovers everything and rewards the exact-match signal where it exists.",
  };

  function activeMode_1007() {
    var active = modeButtons_1007.find(function (b) { return b.classList.contains("active"); });
    return active ? active.dataset.mode : "hybrid";
  }

  function setActive_1007(target) {
    modeButtons_1007.forEach(function (b) {
      var isTarget = b === target;
      b.classList.toggle("active", isTarget);
      b.classList.toggle("secondary", !isTarget);
    });
  }

  function isFound_1007(entry, mode) {
    if (mode === "lexical") return entry.lexicalHit;
    return true; // vector and hybrid always surface all 6, per Concept 05/06's locked invariant
  }

  function isBoosted_1007(entry, mode) {
    // "Boosted" outline is an author-invented visual signal for a double
    // hit, not an official Oracle-side indicator -- flagged in-lesson too.
    return mode === "hybrid" && entry.lexicalHit;
  }

  function render_1007() {
    var mode = activeMode_1007();

    exprSlotEl_1007.textContent = EXPR_1007[mode];

    chipRowEl_1007.innerHTML = "";
    var foundCount = 0;
    ACME_1007.forEach(function (entry) {
      var found = isFound_1007(entry, mode);
      if (found) foundCount += 1;
      var boosted = isBoosted_1007(entry, mode);
      var chip = document.createElement("div");
      chip.className = "rank-chip " + (found ? "match" : "excluded") + (boosted ? " mover" : "") + " sorted-in";
      var rankEl = document.createElement("b");
      rankEl.textContent = String(entry.rank);
      var labelEl = document.createElement("span");
      labelEl.textContent = "Acme";
      chip.appendChild(rankEl);
      chip.appendChild(labelEl);
      chipRowEl_1007.appendChild(chip);
    });

    var pct = Math.round((foundCount / ACME_1007.length) * 100);
    barFoundEl_1007.style.width = pct + "%";
    valFoundEl_1007.textContent = foundCount + " / " + ACME_1007.length;

    verdictEl_1007.textContent = VERDICT_1007[mode];
  }

  modeButtons_1007.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setActive_1007(btn);
      render_1007();
    });
  });

  render_1007();
})();
