// Module 11, Concept 11 -- End-to-end framework-free implementation.
// "Run the pipeline" lab. Eleven fixed stages, each holding the exact
// node-computed output this concept's own verification script printed
// (verify-11-11.js, re-run this session to reconfirm). Every value below
// is copied from that script's console output -- none are re-derived or
// invented for this widget.

(function () {
  "use strict";

  var STAGE_NAMES_1111 = [
    "Ingest", "Chunk", "Embed", "Store", "Retrieve",
    "Select top-k", "Inject context", "Generate + cite",
    "History: Turn 2", "History: Turn 3", "Budget check"
  ];

  var STAGES_1111 = [
    {
      kind: "text",
      label: "Stage 1 of 11 -- Ingest",
      text:
        "6 documents ingested: doc_cA, doc_cB, doc_cC, doc_cC_dup, doc_cE, doc_grace\n" +
        "  doc_cA: 191 chars\n  doc_cB: 177 chars\n  doc_cC: 167 chars\n" +
        "  doc_cC_dup: 172 chars\n  doc_cE: 201 chars\n  doc_grace: 352 chars",
      note: "doc_cC_dup and doc_grace are the two new documents for this concept -- everything else reuses Concepts 06/07/08/10's own evidence."
    },
    {
      kind: "text",
      label: "Stage 2 of 11 -- Chunk",
      text:
        "chunkText(size=220, overlap=40) on 6 documents -> 7 chunks\n" +
        "  doc_cA_c1 (191 chars)\n  doc_cB_c1 (177 chars)\n  doc_cC_c1 (167 chars)\n" +
        "  doc_cC_dup_c1 (172 chars)\n  doc_cE_c1 (201 chars)\n" +
        "  doc_grace_c1 (220 chars)\n  doc_grace_c2 (172 chars)",
      note: "doc_grace is the only document that actually splits into two chunks at this size/overlap -- a computed fact, not an asserted one."
    },
    {
      kind: "text",
      label: "Stage 3 of 11 -- Embed",
      text:
        "Embedded 7 chunks into 64-dim hashed bag-of-words vectors.\n" +
        "  sample: doc_cA_c1 nonzero dims = 20/64",
      note: "Deterministic hashed bag-of-words, not a trained model -- the one genuinely new mechanic this concept adds (Section 06)."
    },
    {
      kind: "text",
      label: "Stage 4 of 11 -- Store",
      text:
        "Wrote 7 chunk records (id, docId, text, 64-dim vector) to disk:\n" +
        "  <tmpdir>/rag-atlas-m11c11-store.json (6531 bytes)\n" +
        "Reloaded from disk: 7 records. Round-trip integrity check: OK",
      note: "Retrieval below reads from the reloaded copy, not the in-memory array -- proving the query actually hits the persisted store."
    },
    {
      kind: "chips",
      label: "Stage 5 of 11 -- Query embed + retrieve (Turn 1)",
      queryText: '"What is the return window after the grace period?"',
      chips: [
        { id: "doc_grace_c2", score: 0.4951 },
        { id: "doc_cC_dup_c1", score: 0.4943 },
        { id: "doc_grace_c1", score: 0.4931 },
        { id: "doc_cC_c1", score: 0.3606 },
        { id: "doc_cE_c1", score: 0.1710 },
        { id: "doc_cB_c1", score: 0.1348 },
        { id: "doc_cA_c1", score: 0.0844 }
      ],
      note: "The chunk that actually contains “14 days” (doc_grace_c1) ranks THIRD -- doc_grace_c2, its own other half with no number in it at all, out-scores it by 0.0020 cosine."
    },
    {
      kind: "text",
      label: "Stage 6 of 11 -- Select top-k",
      text:
        "cutoff=0.35, k=4, dedup threshold=0.75\n" +
        "Candidates passing cutoff: 4/7\n" +
        "Duplicate detected: doc_cC_c1 dupOf doc_cC_dup_c1 (cosine=0.8098)\n" +
        "Raw top-4 (pre-dedup): doc_grace_c2, doc_cC_dup_c1, doc_grace_c1, doc_cC_c1\n" +
        "FINAL EVIDENCE SET: doc_grace_c2, doc_cC_dup_c1, doc_grace_c1",
      note: "A hashed bag-of-words embedding scores this genuine paraphrase at only 0.8098, well under the 0.90 cutoff first tried -- a real finding about the substitute embedding (Section 20 on the page)."
    },
    {
      kind: "budget",
      label: "Stage 7 of 11 -- Inject context",
      segments: [
        { text: "sys 27", tokens: 27, color: "#d7ff53" },
        { text: "doc_grace_c2 32", tokens: 32, color: "#5ee6c3" },
        { text: "doc_cC_dup_c1 42", tokens: 42, color: "#a7e6ff" },
        { text: "doc_grace_c1 44", tokens: 44, color: "#ff7957" },
        { text: "query 12", tokens: 12, color: "#b3543a" }
      ],
      total: 157,
      budget: 3584,
      metaExtra: "Fits, with 3,427 tokens of headroom.",
      note: "Assembled with Concept 07's own assemble() and [SOURCE n] tag, unmodified."
    },
    {
      kind: "citation",
      label: "Stage 8-9 of 11 -- Generate + cite (Turn 1)",
      claim: 'Based on [SOURCE 3], the window is 14 days.',
      citedId: "doc_grace_c1 ([SOURCE 3])",
      citedText:
        "Orders qualify for a grace period of 14 days after purchase during which a cancellation carries no fee. " +
        "The order-cancellation grace period lasts 14 days from the ship date, and once it ends the standard return process d",
      highlight: "14",
      ok: true,
      verdictText: "Citation check: cited=doc_grace_c1, ok=true (claim number found in cited chunk text).",
      robustnessText: "Robustness self-test: same claim reattributed to doc_grace_c2 instead -> checker says ok=false (expected) -- CHECKER CAUGHT THE BAD CITATION.",
      note: "The chunk text itself ends mid-word (“...process d”) -- a real char-stride cut, the same boundary artifact Concept 03 already flagged."
    },
    {
      kind: "mask",
      label: "Stage 10 of 11 -- Incorporate history (Turn 2)",
      raw: "does that still apply if it's a gift",
      rewritten: "does the order-cancellation return window and grace period still apply if the order is a gift order",
      rawTop: { id: "doc_cC_dup_c1", score: 0.3305 },
      rewrittenTop: { id: "doc_grace_c1", score: 0.5565 },
      note: "Rewriting changed the top retrieved chunk: doc_cC_dup_c1 (raw) -> doc_grace_c1 (rewritten). Turn 2's evidence set from the rewritten query: doc_grace_c1, doc_cC_dup_c1, doc_grace_c2, doc_cB_c1. Turn 2 answer: “Based on [SOURCE 1], the window is 14 days.”"
    },
    {
      kind: "mask",
      label: "Stage 11a of 11 -- Incorporate history (Turn 3)",
      raw: "what about if I already opened the package",
      rewritten: "does the return refund window still apply if the customer has already opened the package",
      rawTop: { id: "doc_cB_c1", score: 0.1807 },
      rewrittenTop: { id: "doc_cC_dup_c1", score: 0.3882 },
      note: "Only doc_cC_dup_c1 clears the 0.35 cutoff on the rewritten query (all others score 0.24-0.33) -- generation correctly refuses: “The evidence provided does not state a specific number of days.”"
    },
    {
      kind: "budget",
      label: "Stage 11b of 11 -- History vs. evidence, same budget",
      segments: [
        { text: "sys 27", tokens: 27, color: "#d7ff53" },
        { text: "history 39", tokens: 39, color: "#ff7957" },
        { text: "evidence 42", tokens: 42, color: "#5ee6c3" },
        { text: "query 17", tokens: 17, color: "#a7e6ff" }
      ],
      total: 125,
      budget: 3584,
      metaExtra: "Fits, with 3,459 tokens of headroom. History's share: 31.2% -- evidence's share: 33.6%.",
      note: "History carried into Turn 3 (Turn 1 + Turn 2, user+assistant) costs 39 tokens against the same fixed budget evidence competes for (Concept 10's own arithmetic pattern)."
    }
  ];

  var lab_1111 = document.getElementById("lab_1111");
  var stepLabel_1111 = document.getElementById("stepLabel_1111");
  var stageStrip_1111 = document.getElementById("stageStrip_1111");
  var stageOutput_1111 = document.getElementById("stageOutput_1111");
  var stageChips_1111 = document.getElementById("stageChips_1111");
  var stageMaskPanels_1111 = document.getElementById("stageMaskPanels_1111");
  var stageRawQuery_1111 = document.getElementById("stageRawQuery_1111");
  var stageRewrittenQuery_1111 = document.getElementById("stageRewrittenQuery_1111");
  var stageRawChips_1111 = document.getElementById("stageRawChips_1111");
  var stageRewrittenChips_1111 = document.getElementById("stageRewrittenChips_1111");
  var stageCitationCheck_1111 = document.getElementById("stageCitationCheck_1111");
  var citationClaimText_1111 = document.getElementById("citationClaimText_1111");
  var citationChunkText_1111 = document.getElementById("citationChunkText_1111");
  var citationVerdict_1111 = document.getElementById("citationVerdict_1111");
  var stageBudgetBar_1111 = document.getElementById("stageBudgetBar_1111");
  var stageBudgetMeta_1111 = document.getElementById("stageBudgetMeta_1111");
  var stageNote_1111 = document.getElementById("stageNote_1111");
  var stepBtn_1111 = document.getElementById("stepBtn_1111");
  var resetBtn_1111 = document.getElementById("resetBtn_1111");

  if (!lab_1111 || !stepBtn_1111 || !stageStrip_1111) return;

  var idx_1111 = 0;

  function buildStrip_1111() {
    stageStrip_1111.innerHTML = STAGE_NAMES_1111
      .map(function (name, i) {
        return (
          '<div class="diagram-node" id="stageNode_1111_' + i + '">' +
          "<b>" + (i + 1) + ". " + name + "</b>" +
          "<small>Stage " + (i + 1) + " of 11</small>" +
          "</div>"
        );
      })
      .join("");
  }

  function highlightStrip_1111() {
    for (var i = 0; i < STAGE_NAMES_1111.length; i++) {
      var node = document.getElementById("stageNode_1111_" + i);
      if (!node) continue;
      if (i === idx_1111) node.classList.add("active");
      else node.classList.remove("active");
    }
  }

  function hide_1111(el) {
    if (el) el.style.display = "none";
  }
  function show_1111(el, display) {
    if (el) el.style.display = display || "block";
  }

  function renderChipRow_1111(container, chips) {
    var sorted = chips.slice().sort(function (a, b) { return b.score - a.score; });
    container.innerHTML = sorted
      .map(function (c, i) {
        var classes = ["rank-chip", "sorted-in"];
        if (i === 0) classes.push("match");
        return (
          '<div class="' + classes.join(" ") + '">' +
          "<b>" + c.id + "</b>" +
          "<span>" + c.score.toFixed(4) + "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderBudget_1111(container, metaEl, stage) {
    container.innerHTML = stage.segments
      .map(function (seg) {
        var pct = Math.max(2, Math.round((seg.tokens / stage.total) * 100));
        return (
          '<div class="budget-segment" style="width:' + pct + "%;background:" + seg.color + '">' +
          seg.text +
          "</div>"
        );
      })
      .join("");
    metaEl.textContent =
      "Assembled total: " + stage.total + " / " + stage.budget + " token budget. " + stage.metaExtra;
  }

  function highlightClaim_1111(text, needle) {
    var parts = text.split(needle);
    return parts
      .map(function (p, i) {
        return i < parts.length - 1
          ? p + '<span class="claim-word hit">' + needle + "</span>"
          : p;
      })
      .join("");
  }

  function render_1111() {
    var stage = STAGES_1111[idx_1111];

    stepLabel_1111.textContent = stage.label;
    highlightStrip_1111();

    hide_1111(stageOutput_1111);
    hide_1111(stageChips_1111);
    hide_1111(stageMaskPanels_1111);
    hide_1111(stageCitationCheck_1111);
    hide_1111(citationVerdict_1111);
    hide_1111(stageBudgetBar_1111);
    hide_1111(stageBudgetMeta_1111);

    if (stage.kind === "text") {
      show_1111(stageOutput_1111);
      stageOutput_1111.textContent = stage.text;
    } else if (stage.kind === "chips") {
      show_1111(stageOutput_1111);
      stageOutput_1111.textContent = "query: " + stage.queryText;
      show_1111(stageChips_1111, "flex");
      renderChipRow_1111(stageChips_1111, stage.chips);
    } else if (stage.kind === "mask") {
      show_1111(stageMaskPanels_1111, "grid");
      stageRawQuery_1111.textContent = '"' + stage.raw + '"';
      stageRewrittenQuery_1111.textContent = '"' + stage.rewritten + '"';
      renderChipRow_1111(stageRawChips_1111, [stage.rawTop]);
      renderChipRow_1111(stageRewrittenChips_1111, [stage.rewrittenTop]);
    } else if (stage.kind === "citation") {
      show_1111(stageCitationCheck_1111, "grid");
      citationClaimText_1111.innerHTML = highlightClaim_1111(stage.claim, stage.highlight);
      citationChunkText_1111.innerHTML =
        "<b>" + stage.citedId + ":</b> " + highlightClaim_1111(stage.citedText, stage.highlight);
      show_1111(citationVerdict_1111);
      citationVerdict_1111.className = "citation-verdict" + (stage.ok ? "" : " fail");
      citationVerdict_1111.innerHTML = stage.verdictText + "<br>" + stage.robustnessText;
    } else if (stage.kind === "budget") {
      show_1111(stageBudgetBar_1111, "flex");
      show_1111(stageBudgetMeta_1111);
      renderBudget_1111(stageBudgetBar_1111, stageBudgetMeta_1111, stage);
    }

    stageNote_1111.textContent = stage.note || "";

    stepBtn_1111.disabled = idx_1111 >= STAGES_1111.length - 1;
    stepBtn_1111.textContent = stepBtn_1111.disabled ? "All 11 stages shown" : "Advance to next stage";
  }

  function step_1111() {
    if (idx_1111 >= STAGES_1111.length - 1) return;
    idx_1111 += 1;
    render_1111();
  }

  function reset_1111() {
    idx_1111 = 0;
    render_1111();
  }

  buildStrip_1111();
  stepBtn_1111.addEventListener("click", step_1111);
  resetBtn_1111.addEventListener("click", reset_1111);

  render_1111();
})();
