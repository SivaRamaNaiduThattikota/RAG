const advancedLesson1014=document.querySelector('#advanced-lesson')
function syncAdvancedTarget1014(){if(advancedLesson1014)advancedLesson1014.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget1014)
syncAdvancedTarget1014()

// Section 14's lab: The Portability Lab. The caller code in the lab's own
// static code-block never changes. Picking an adapter swaps in that
// system's own real upsert/query/delete method bodies (Section 12's own
// three code blocks, reused verbatim) and its own three non-portable setup
// facts (schema DDL, index DDL, tenant mechanism -- Section 06). Nothing
// here is computed or scored; it's the same three-method contract, three
// real ways, exactly like Concept 12's own vendor-swap panel.

const ADAPTERS_1014={
  oracle:{
    label:'ORACLE ADAPTER',
    upsert:'cursor.execute(\n    "insert into embeddings (chunk_id, embedding) values (:1, :2)",\n    [chunk_id, array.array("f", embedding)],\n)\nself.connection.commit()',
    query:'cursor.execute(\n    f"""\n    SELECT c.chunk_id, VECTOR_DISTANCE(e.embedding, :qv, COSINE) AS dist\n    FROM chunks c JOIN embeddings e ON e.chunk_id = c.chunk_id\n    WHERE c.tenant_id = :tenant\n    ORDER BY dist\n    FETCH FIRST {k} ROWS ONLY\n    """,\n    qv=array.array("f", vector), tenant=tenant_id,\n)\nreturn cursor.fetchall()',
    del:'cursor.execute("delete from embeddings where chunk_id = :1", [chunk_id])  # child first\ncursor.execute("delete from chunks where chunk_id = :1", [chunk_id])      # parent second\nself.connection.commit()',
    breaks:{
      schema:'VECTOR(384, FLOAT32) column type -- Concept 05',
      index:'CREATE VECTOR INDEX ... ORGANIZATION INMEMORY NEIGHBOR GRAPH -- Concept 06',
      tenant:'DBMS_RLS.ADD_POLICY VPD package call -- Concept 10'
    }
  },
  pgvector:{
    label:'PGVECTOR ADAPTER',
    upsert:'cur.execute(\n    "INSERT INTO embeddings (chunk_id, embedding) VALUES (%s, %s)",\n    (chunk_id, str(embedding)),\n)\nself.conn.commit()',
    query:'cur.execute(\n    """\n    SELECT chunk_id, embedding <=> %s AS dist\n    FROM embeddings\n    WHERE tenant_id = %s\n    ORDER BY dist\n    LIMIT %s\n    """,\n    (str(vector), tenant_id, k),\n)\nreturn cur.fetchall()',
    del:'cur.execute("DELETE FROM embeddings WHERE chunk_id = %s", (chunk_id,))  # child first\ncur.execute("DELETE FROM chunks WHERE chunk_id = %s", (chunk_id,))      # parent second\nself.conn.commit()',
    breaks:{
      schema:'vector(384) column type -- Concept 11',
      index:'CREATE INDEX ... USING hnsw (m, ef_construction) -- Concept 11',
      tenant:'Native CREATE POLICY DDL -- Concept 11'
    }
  },
  pinecone:{
    label:'PINECONE ADAPTER',
    upsert:'self.index.upsert(\n    vectors=[{"id": chunk_id, "values": embedding}],\n    namespace="acme",\n)',
    query:'results = self.index.query(\n    vector=vector, top_k=k, namespace=tenant_id, include_metadata=True,\n)\nreturn results.matches',
    del:'self.index.delete(ids=[chunk_id], namespace="acme")',
    breaks:{
      schema:'dimension=384 index-creation parameter, not a column -- Concept 12',
      index:'ServerlessSpec(cloud=..., region=...) at index creation, no DDL -- Concept 12',
      tenant:'namespace argument on upsert/query/delete -- Concept 12, plus this concept\'s own delete citation'
    }
  }
}

const buttons_1014=[...document.querySelectorAll('#adapterButtons_1014 [data-adapter]')]
const panel_1014=document.querySelector('#adapterPanel_1014')
const breaksRow_1014=document.querySelector('#breaksRow_1014')
const verdict_1014=document.querySelector('#portabilityVerdict_1014')

function codeBlock_1014(label,code){
  const block=document.createElement('div')
  block.className='code-block'
  const span=document.createElement('span')
  span.className='code-label'
  span.textContent=label
  const pre=document.createElement('pre')
  const codeEl=document.createElement('code')
  codeEl.textContent=code
  pre.appendChild(codeEl)
  block.appendChild(span)
  block.appendChild(pre)
  return block
}

function render_1014(key){
  const adapter=ADAPTERS_1014[key]
  if(!adapter) return

  buttons_1014.forEach(b=>b.classList.toggle('active',b.dataset.adapter===key))

  if(panel_1014){
    panel_1014.innerHTML=''
    panel_1014.appendChild(codeBlock_1014(adapter.label+' — UPSERT',adapter.upsert))
    panel_1014.appendChild(codeBlock_1014(adapter.label+' — QUERY',adapter.query))
    panel_1014.appendChild(codeBlock_1014(adapter.label+' — DELETE',adapter.del))
  }

  if(breaksRow_1014){
    breaksRow_1014.innerHTML=''
    const rows=[['SCHEMA DDL',adapter.breaks.schema],['INDEX DDL',adapter.breaks.index],['TENANT MECHANISM',adapter.breaks.tenant]]
    rows.forEach(([tag,text])=>{
      const chip=document.createElement('div')
      chip.className='rank-chip fn sorted-in'
      const b=document.createElement('b')
      b.textContent=tag
      const span=document.createElement('span')
      span.textContent=text
      chip.appendChild(b)
      chip.appendChild(span)
      breaksRow_1014.appendChild(chip)
    })
  }

  if(verdict_1014){
    verdict_1014.textContent='Showing the '+adapter.label.toLowerCase()+'. The caller code above is unchanged. These three setup facts are not methods on the interface -- they were never portable, and they are redone by hand for every adapter, every time.'
  }
}

buttons_1014.forEach(btn=>btn.addEventListener('click',()=>render_1014(btn.dataset.adapter)))

render_1014('oracle')
