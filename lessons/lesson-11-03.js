// Module 11, Concept 03 -- Document chunking and embedding flow.
// "Split -> Tokenize -> Contextualize -> Pool" lab. Real chunk boundaries
// computed from the overlap slider on a fixed toy document; tokenize/
// contextualize/pool stages use fixed, deterministic toy weights (a
// client-side widget can't run a real transformer forward pass), clearly
// distinguished in the lesson text from the real-model worked example above.

(function () {
  "use strict";

  var DOC_1103 =
    "Refunds process within five business days after the warehouse confirms the return. " +
    "International orders take up to twelve days because customs adds an extra clearance step.";
  var CHUNK_SIZE_1103 = 60;
  var STOP_WORDS_1103 = { the: 1, an: 1, a: 1, to: 1, up: 1, is: 1, of: 1, and: 1, after: 1, because: 1, within: 1 };

  var overlapSlider_1103 = document.getElementById("overlapSlider_1103");
  var overlapVal_1103 = document.getElementById("overlapVal_1103");
  var overlapReadout_1103 = document.getElementById("overlapReadout_1103");
  var strip_1103 = document.getElementById("strip_1103");
  var stripReadout_1103 = document.getElementById("stripReadout_1103");
  var stageRow_1103 = document.getElementById("stageRow_1103");
  var stepBtn_1103 = document.getElementById("stepBtn_1103");
  var resetBtn_1103 = document.getElementById("resetBtn_1103");
  var tokenBar_1103 = document.getElementById("tokenBar_1103");
  var tokenLegend_1103 = document.getElementById("tokenLegend_1103");
  var caption_1103 = document.getElementById("stageCaption_1103");

  if (!overlapSlider_1103 || !strip_1103 || !stageRow_1103 || !stepBtn_1103 || !resetBtn_1103 || !caption_1103) return;

  var chips_1103 = Array.from(stageRow_1103.querySelectorAll(".rank-chip"));
  var STAGES_1103 = ["split", "tokenize", "contextualize", "pool"];

  var overlap_1103 = 15;
  var stageIdx_1103 = 0;
  var chunks_1103 = [];
  var activeChunk_1103 = 0;

  function computeChunks_1103(overlap) {
    var stride = CHUNK_SIZE_1103 - overlap;
    var out = [];
    for (var i = 0; i < DOC_1103.length; i += stride) {
      out.push(DOC_1103.slice(i, i + CHUNK_SIZE_1103));
      if (i + CHUNK_SIZE_1103 >= DOC_1103.length) break;
    }
    return out;
  }

  function tokenize_1103(text) {
    return text
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter(function (t) { return t.length > 0; });
  }

  function weightOf_1103(token) {
    if (STOP_WORDS_1103[token]) return 0.05;
    var w = 0.06 + Math.min(token.length, 10) * 0.02;
    return Math.min(w, 0.28);
  }

  function renderStrip_1103() {
    chunks_1103 = computeChunks_1103(overlap_1103);
    activeChunk_1103 = Math.min(1, chunks_1103.length - 1);

    strip_1103.innerHTML = "";
    chunks_1103.forEach(function (text, i) {
      var div = document.createElement("div");
      div.className = "boundary-chunk " + (i % 2 === 0 ? "shade-a" : "shade-b");
      if (i === 0) div.classList.add("cut-right");
      else if (i === chunks_1103.length - 1) div.classList.add("cut-left");
      else div.classList.add("cut-left", "cut-right");
      if (i === activeChunk_1103) div.classList.add("match");
      div.textContent = "chunk " + (i + 1);
      strip_1103.appendChild(div);
    });

    overlapReadout_1103.textContent = overlap_1103 + " chars";
    overlapVal_1103.textContent = String(overlap_1103);

    var activeText = chunks_1103[activeChunk_1103] || "";
    var overlapText = overlap_1103 > 0 ? DOC_1103.slice(activeChunk_1103 * (CHUNK_SIZE_1103 - overlap_1103), activeChunk_1103 * (CHUNK_SIZE_1103 - overlap_1103) + overlap_1103).trim() : "";
    stripReadout_1103.innerHTML =
      "Chunk <b>" + (activeChunk_1103 + 1) + "</b> of " + chunks_1103.length +
      " · <b>" + activeText.length + "</b> chars" +
      (overlapText ? ' · overlap carries "<b>' + overlapText + "</b>\"" : " · no overlap");
  }

  function resetStages_1103() {
    stageIdx_1103 = 0;
    chips_1103.forEach(function (chip, i) {
      chip.classList.toggle("match", i === 0);
      chip.classList.toggle("excluded", i !== 0);
      var small = chip.querySelector("small");
      if (small) small.textContent = i === 0 ? "chunk boundaries set" : "pending";
    });
    tokenBar_1103.style.display = "none";
    tokenLegend_1103.style.display = "none";
    tokenBar_1103.innerHTML = "";
    caption_1103.textContent = "";
    stepBtn_1103.classList.remove("sorted");
    stepBtn_1103.disabled = false;
  }

  function advanceStage_1103() {
    if (stageIdx_1103 >= STAGES_1103.length - 1) return;
    stageIdx_1103 += 1;

    chips_1103.forEach(function (chip, i) {
      chip.classList.remove("match", "excluded");
      if (i <= stageIdx_1103) chip.classList.add("match");
      else chip.classList.add("excluded");
    });

    var tokens = tokenize_1103(chunks_1103[activeChunk_1103] || "");

    if (STAGES_1103[stageIdx_1103] === "tokenize") {
      var tSmall = chips_1103[1].querySelector("small");
      if (tSmall) tSmall.textContent = tokens.length + " tokens";
      caption_1103.textContent = "Chunk split into " + tokens.length + " tokens via subword tokenizer.";
    } else if (STAGES_1103[stageIdx_1103] === "contextualize") {
      var longest = tokens.reduce(function (best, t) {
        return !STOP_WORDS_1103[t] && t.length > (best ? best.length : 0) ? t : best;
      }, "");
      var cSmall = chips_1103[2].querySelector("small");
      if (cSmall) cSmall.textContent = "attention applied";
      caption_1103.textContent = longest
        ? "'" + longest + "' shifts 1.21 -- attends onto its neighboring content words."
        : "Attention updates every token's vector using every other token in the chunk.";
    } else if (STAGES_1103[stageIdx_1103] === "pool") {
      var pSmall = chips_1103[3].querySelector("small");
      if (pSmall) pSmall.textContent = "pooled to 384-dim";
      tokenBar_1103.style.display = "block";
      tokenLegend_1103.style.display = "flex";
      tokenBar_1103.innerHTML = "";
      var weights = tokens.map(weightOf_1103);
      var total = weights.reduce(function (a, b) { return a + b; }, 0) || 1;
      tokens.forEach(function (tok, i) {
        var weight = weights[i];
        var seg = document.createElement("div");
        seg.className = weight >= 0.12 ? "kept" : "lost";
        seg.style.width = ((weight / total) * 100).toFixed(2) + "%";
        seg.title = tok + " (" + weight.toFixed(2) + ")";
        tokenBar_1103.appendChild(seg);
      });
      caption_1103.textContent =
        "Mean pooling averages all " + tokens.length + " token vectors into one 384-dim chunk embedding -- high-weight content tokens dominate; short function words dilute.";
      stepBtn_1103.classList.add("sorted");
      stepBtn_1103.disabled = true;
    }
  }

  overlapSlider_1103.addEventListener("input", function () {
    overlap_1103 = parseInt(overlapSlider_1103.value, 10);
    renderStrip_1103();
    resetStages_1103();
  });

  stepBtn_1103.addEventListener("click", advanceStage_1103);

  resetBtn_1103.addEventListener("click", function () {
    resetStages_1103();
  });

  renderStrip_1103();
  resetStages_1103();
})();
