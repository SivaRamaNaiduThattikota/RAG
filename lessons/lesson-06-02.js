const advancedLesson0602=document.querySelector('#advanced-lesson')
function syncAdvancedTarget0602(){if(advancedLesson0602)advancedLesson0602.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget0602)
syncAdvancedTarget0602()

// Section 14's lab: the Format Extraction Bench. Five formats, each with a
// short "naive read" snippet and three candidate extraction approaches -- one
// of them the lesson's standard tool, two of them a plausible-sounding wrong
// move (reading raw bytes as text, reaching for OCR too early, flattening a
// grid, or regex-stripping syntax). The learner picks an approach, then
// reveals whether it matches the standard fix and why the other two fail.
// Unlike Concept 01's Authority Arbiter (pick a winning source among
// conflicting claims), this lab is a diagnose-the-right-tool exercise: same
// underlying shape, a genuinely different question and a different mechanic.

const FORMATS_0602={
  pdf:{
    label:'A born-digital PDF page of policy text',
    snippet:'Raw bytes, decoded as text: "%PDF-1.4 1 0 obj<< /Type /Catalog ... BT /F1 12 Tf 72 700 Td (Refund) Tj ... ET" -- drawing operators and positioned glyph commands, not a sentence.',
    approaches:[
      {id:'utf8',name:'Read the raw file bytes as UTF-8 text',correct:false,note:'A PDF is not stored as characters in reading order -- the file encodes drawing instructions and positioned glyphs, so decoding raw bytes as text returns operators and binary noise, not "Refund window is 45 days."'},
      {id:'ocr',name:'Run OCR on a screenshot of the rendered page',correct:false,note:'This PDF already has an embedded, extractable text layer. OCR is the right tool only when no text layer exists at all (Concept 04, scanned pages) -- using it here is unnecessary and typically less accurate than the text already sitting in the file.'},
      {id:'pdftext',name:'Use a PDF text-extraction library that reads the content stream and glyph positions',correct:true,note:'Libraries such as pypdf, pdfplumber, or PDFMiner.six parse the content stream directly and use each glyph\'s recorded position to reconstruct words, lines, and reading order -- the standard fix for a born-digital PDF.'}
    ],
    winner:'pdftext'
  },
  html:{
    label:'A wiki page with navigation and an ad banner',
    snippet:'<nav><a href="/">Home</a></nav><div class="ad">Buy now!</div><article><h1>Refund policy</h1><p>Refunds accepted within 45 days.</p></article><footer>&copy; Acme</footer>',
    approaches:[
      {id:'regex',name:'Strip everything between < and > with a single regex',correct:false,note:'Naive tag-stripping breaks on nested or malformed markup, leaves script/style content behind as if it were text, and gives no way to tell the real article from the nav bar, the ad, and the footer.'},
      {id:'rawindex',name:'Index the raw HTML file exactly as downloaded',correct:false,note:'This still buries "Refunds accepted within 45 days" inside tags, an ad banner, and a footer -- every retrieved chunk stays polluted with markup and boilerplate that nothing downstream is responsible for removing.'},
      {id:'dom',name:'Parse into a DOM tree with an HTML parser (e.g. BeautifulSoup or lxml) and select the real content nodes',correct:true,note:'DOM parsing separates structural markup from text nodes and lets you target the actual content element (here, the <article> tag) -- the standard fix for text buried in presentation and boilerplate markup.'}
    ],
    winner:'dom'
  },
  docx:{
    label:'A Word onboarding guide, saved as .docx',
    snippet:'Raw bytes, decoded as text: "PK\\x03\\x04\\x14\\x00\\x00\\x00\\x08\\x00...[word/document.xml]" -- a zip archive\'s header and compressed data, not a single word of the guide.',
    approaches:[
      {id:'plaintext',name:'Open the .docx file directly as plain text',correct:false,note:'.docx is a zip archive of XML parts (OOXML) -- opening it as text returns the zip header and compressed noise, never the document\'s actual paragraphs.'},
      {id:'rename',name:'Rename the file to .txt and read it',correct:false,note:'Renaming a file changes only its extension, not the bytes inside it -- the underlying zip/XML structure is exactly the same, so this fails for the same reason reading it as .docx does.'},
      {id:'ooxml',name:'Use an OOXML-aware library (e.g. python-docx) to read document.xml and reassemble the text runs',correct:true,note:'python-docx (or Apache POI) unzips the package, parses document.xml, and reassembles paragraphs and runs into readable text -- the standard fix for a structured but versioned OOXML file.'}
    ],
    winner:'ooxml'
  },
  xlsx:{
    label:'An Excel benefits table, saved as .xlsx',
    snippet:'Flattened cell-by-cell, left to right, top to bottom: "PlanMonthly costCoverageBasic$120IndividualFamily$340Household" -- every value is present, with zero row/column relationship left.',
    approaches:[
      {id:'flatten',name:'Flatten every cell into one long string in reading order',correct:false,note:'This keeps every value but destroys which price belongs to which plan -- a "bag of values" with no row/column structure is not usable as a retrievable fact.'},
      {id:'csv',name:'Treat the file like a CSV and split on commas',correct:false,note:'.xlsx is a zipped OOXML workbook, not a delimited text file -- commas inside cell values would also be misread, and formulas or merged cells have no comma-splitting equivalent at all.'},
      {id:'sheetlib',name:'Use a spreadsheet library (e.g. openpyxl or pandas) to read cells by row and column and represent each row as a record',correct:true,note:'Reading the grid row-aware -- e.g. "Family plan: $340/month, household coverage" -- is the standard fix for tabular content: no sentence exists until rows and columns are read together.'}
    ],
    winner:'sheetlib'
  },
  md:{
    label:'A repository README.md',
    snippet:'"# Refund policy\\n\\nRefunds are accepted within **45 days**.\\n\\n- Keep your receipt\\n- Contact support"',
    approaches:[
      {id:'asis',name:'Index the raw file exactly as written',correct:false,note:'The literal #, **, and - characters stay in the retrieved text as visible noise, and a heading becomes indistinguishable from an ordinary sentence to anything reading it as flat text.'},
      {id:'strip',name:'Delete every #, *, and - character with a find-and-replace',correct:false,note:'Blind character deletion also mangles legitimate uses of those characters inside code blocks or ordinary prose, and throws away heading and list structure instead of preserving it as usable information.'},
      {id:'mdparser',name:'Use a Markdown parser (e.g. Python-Markdown, markdown-it, or mistune) to parse the syntax into a tree, then extract text with structure intact',correct:true,note:'Markdown is close to clean text, but the standard fix is still a real parser -- it reliably tells a heading from a sentence and a code fence from prose, which naive string surgery cannot guarantee.'}
    ],
    winner:'mdparser'
  }
}

const formatSelect0602=document.querySelector('#wgFormat_0602')
const snippetBox0602=document.querySelector('#wgSnippetBox_0602')
const approachRow0602=document.querySelector('#wgApproachCards_0602')
const checkButton0602=document.querySelector('#wgCheck_0602')
const resetButton0602=document.querySelector('#wgReset_0602')
const readout0602=document.querySelector('#wgReadout_0602')
const pickBox0602=document.querySelector('#wgPick_0602')
const winnerBox0602=document.querySelector('#wgWinner_0602')
const verdictBox0602=document.querySelector('#wgVerdict_0602')

let picked0602=null

function buildBench0602(){
  if(!approachRow0602)return
  const key=formatSelect0602?.value||'pdf'
  const scenario=FORMATS_0602[key]
  picked0602=null
  if(snippetBox0602){
    snippetBox0602.innerHTML=`<div><span>${scenario.label.toUpperCase()}</span><p>${scenario.snippet}</p></div>`
  }
  approachRow0602.innerHTML=''
  scenario.approaches.forEach(app=>{
    const btn=document.createElement('button')
    btn.type='button'
    btn.className='secondary'
    btn.dataset.id=app.id
    btn.innerHTML=`<b>${app.name}</b>`
    btn.addEventListener('click',()=>{
      picked0602=app.id
      approachRow0602.querySelectorAll('button').forEach(b=>b.classList.add('secondary'))
      btn.classList.remove('secondary')
    })
    approachRow0602.appendChild(btn)
  })
  if(readout0602)readout0602.hidden=true
  if(verdictBox0602)verdictBox0602.hidden=true
}

function revealBench0602(){
  const key=formatSelect0602?.value||'pdf'
  const scenario=FORMATS_0602[key]
  const winnerApp=scenario.approaches.find(a=>a.id===scenario.winner)
  const pickedApp=scenario.approaches.find(a=>a.id===picked0602)
  if(pickBox0602)pickBox0602.textContent=pickedApp?pickedApp.name:'nothing picked yet'
  if(winnerBox0602)winnerBox0602.textContent=winnerApp.name
  if(readout0602)readout0602.hidden=false
  if(verdictBox0602){
    verdictBox0602.hidden=false
    const correct=picked0602===scenario.winner
    verdictBox0602.textContent=correct
      ? `Match. ${winnerApp.note}`
      : `Not quite. ${winnerApp.note} As for your pick: ${pickedApp?pickedApp.note:'no approach was selected yet.'}`
  }
}

formatSelect0602?.addEventListener('change',buildBench0602)
checkButton0602?.addEventListener('click',revealBench0602)
resetButton0602?.addEventListener('click',buildBench0602)
buildBench0602()
