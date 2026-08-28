// Module 11, Concept 05 -- Query embedding, retrieval and candidate search.
// "Rank the candidates" lab. A fixed query vector, four candidate chunks,
// one shared data model -- clicking a top-k pick re-sorts the rank-chip
// row and rewrites the candidate-set callout, all from the same cosine
// scores computed and verified in Section 12.

(function () {
  "use strict";

  var CANDIDATES_1105 = [
    { id: "c007", label: "c007 · grace period", score: 0.9405, tag: "match" },
    { id: "c_billing", label: "billing cycle", score: 0.2261, tag: "" },
    { id: "c_latefee", label: "late fee", score: 0.1234, tag: "" },
    { id: "c_refund", label: "refund policy", score: 0.0210, tag: "" },
  ];

  var K_FACTS_1105 = {
    1: {
      calloutClass: "",
      calloutText: "top_k = 1 returns only c007 -- the single closest match, cosine 0.9405. Everything else is discarded before generation ever sees it.",
    },
    2: {
      calloutClass: "",
      calloutText: "top_k = 2 keeps c007 and billing cycle (0.2261) -- the second-best score is still real, but nowhere near as close as the first.",
    },
    4: {
      calloutClass: "warning",
      calloutText: "top_k = 4 returns the entire 4-chunk corpus, including refund policy at cosine 0.0210 -- barely related to the query at all. Raising k without a cutoff lets weak candidates through.",
    },
  };

  var buttons_1105 = Array.from(document.querySelectorAll("#kPicker_1105 button"));
  var chipRow_1105 = document.getElementById("candidateChips_1105");
  var callout_1105 = document.getElementById("candidateCallout_1105");

  if (!chipRow_1105 || !callout_1105 || buttons_1105.length === 0) return;

  function renderCandidates_1105(k) {
    var facts = K_FACTS_1105[k];
    if (!facts) return;

    buttons_1105.forEach(function (btn) {
      var isActive = Number(btn.dataset.k) === k;
      btn.classList.toggle("active", isActive);
      btn.classList.toggle("secondary", !isActive);
    });

    chipRow_1105.innerHTML = CANDIDATES_1105.map(function (c, i) {
      var kept = i < k;
      var cls = kept ? "rank-chip sorted-in " + (c.tag === "match" ? "match" : "") : "rank-chip excluded";
      return (
        '<span class="' + cls.trim() + '">' +
        "<b>#" + (i + 1) + " " + c.label + "</b>" +
        "<span>cosine " + c.score.toFixed(4) + (kept ? "" : " -- excluded") + "</span>" +
        "</span>"
      );
    }).join("");

    callout_1105.className = "callout" + (facts.calloutClass ? " " + facts.calloutClass : "");
    callout_1105.textContent = facts.calloutText;
  }

  buttons_1105.forEach(function (btn) {
    btn.addEventListener("click", function () {
      renderCandidates_1105(Number(btn.dataset.k));
    });
  });

  renderCandidates_1105(1);
})();
