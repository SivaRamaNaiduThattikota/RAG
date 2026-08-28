const advancedLesson1012=document.querySelector('#advanced-lesson')
function syncAdvancedTarget1012(){if(advancedLesson1012)advancedLesson1012.open=location.hash==='#advanced-lesson'||/^#s(?:0[1-9]|1[0-9]|2[0-4])$/.test(location.hash)}
addEventListener('hashchange',syncAdvancedTarget1012)
syncAdvancedTarget1012()

// Section 14's lab: The API Shape Swap. Reuses Section 12's own four real
// code blocks verbatim -- this course's own chunk (chunk_id "c007",
// tenant_id "acme", a 384-dim embedding) written and queried in each
// vendor's own live-verified SDK syntax. Checking/unchecking a vendor only
// ever shows or hides that vendor's own panel -- none of the four panels'
// own text ever changes, because the point is the real code itself, not a
// computed result.

const VENDORS_1012=[
  {
    key:'pinecone',
    label:'PINECONE',
    setup:'from pinecone import Pinecone, ServerlessSpec\n\npc = Pinecone(api_key="...")\npc.indexes.create(\n    name="rag-atlas-chunks",\n    dimension=384,\n    metric="cosine",\n    spec=ServerlessSpec(cloud="aws", region="us-east-1"),\n)\nindex = pc.index("rag-atlas-chunks")',
    write:'index.upsert(\n    vectors=[{"id": "c007", "values": embedding}],\n    namespace="acme",\n)',
    query:'results = index.query(\n    vector=query_embedding,\n    top_k=5,\n    namespace="acme",\n    include_metadata=True,\n)',
    tenant:'Namespace argument -- "acme" is passed on both the write and the query, not filtered for.'
  },
  {
    key:'qdrant',
    label:'QDRANT',
    setup:'from qdrant_client import QdrantClient, models\n\nclient = QdrantClient(url="http://localhost:6333")\nclient.create_collection(\n    collection_name="rag_atlas_chunks",\n    vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),\n)',
    write:'client.upsert(\n    collection_name="rag_atlas_chunks",\n    points=[\n        models.PointStruct(id="c007", vector=embedding, payload={"tenant_id": "acme"})\n    ],\n)',
    query:'hits = client.query_points(\n    collection_name="rag_atlas_chunks",\n    query=query_embedding,\n    query_filter=models.Filter(\n        must=[models.FieldCondition(key="tenant_id", match=models.MatchValue(value="acme"))]\n    ),\n    limit=5,\n)',
    tenant:'Payload pre-filter -- tenant_id is a stored field, checked with a FieldCondition/MatchValue at query time.'
  },
  {
    key:'weaviate',
    label:'WEAVIATE',
    setup:'from weaviate.classes.config import Configure, Property, DataType\nfrom weaviate.classes.query import MetadataQuery\n\nclient.collections.create(\n    "RagAtlasChunk",\n    vector_config=Configure.Vectors.self_provided(),\n    properties=[Property(name="chunk_id", data_type=DataType.TEXT)],\n    multi_tenancy_config=Configure.multi_tenancy(enabled=True),\n)\nchunks = client.collections.use("RagAtlasChunk")\nacme_chunks = chunks.with_tenant("acme")',
    write:'acme_chunks.data.insert({"chunk_id": "c007"}, vector=embedding)',
    query:'response = acme_chunks.query.near_vector(\n    near_vector=query_embedding,\n    limit=5,\n    return_metadata=MetadataQuery(distance=True),\n)',
    tenant:'Native tenant object -- multi_tenancy_config is set at creation; with_tenant("acme") scopes every call after, no filter clause.'
  },
  {
    key:'milvus',
    label:'MILVUS',
    setup:'from pymilvus import MilvusClient\n\nclient = MilvusClient(uri="./rag_atlas.db")\nclient.create_collection(collection_name="rag_atlas_chunks", dimension=384)',
    write:'client.insert(\n    collection_name="rag_atlas_chunks",\n    data=[{"id": "c007", "vector": embedding, "tenant_id": "acme"}],\n)',
    query:'res = client.search(\n    collection_name="rag_atlas_chunks",\n    data=[query_embedding],\n    filter="tenant_id == \'acme\'",\n    limit=5,\n)',
    tenant:'Filter-expression string -- tenant_id is a plain scalar field, checked with a boolean expression the caller must remember to pass.'
  },
]

const panelsHost_1012=document.querySelector('#vendorPanels_1012')
const verdict_1012=document.querySelector('#vendorVerdict_1012')
const toggles_1012=[...document.querySelectorAll('#s14 [data-vendor]')]

function buildPanel_1012(v){
  const wrap=document.createElement('div')
  wrap.className='core-block'
  wrap.id='vendorPanel_1012_'+v.key
  const h=document.createElement('h4')
  h.textContent=v.label
  wrap.appendChild(h)
  ;[['SETUP',v.setup],['WRITE',v.write],['QUERY',v.query]].forEach(([tag,code])=>{
    const block=document.createElement('div')
    block.className='code-block'
    const span=document.createElement('span')
    span.className='code-label'
    span.textContent=v.label+' — '+tag
    const pre=document.createElement('pre')
    const codeEl=document.createElement('code')
    codeEl.textContent=code
    pre.appendChild(codeEl)
    block.appendChild(span)
    block.appendChild(pre)
    wrap.appendChild(block)
  })
  const p=document.createElement('p')
  p.className='fine-print'
  p.textContent='TENANT MECHANISM — '+v.tenant
  wrap.appendChild(p)
  return wrap
}

function render_1012(){
  if(!panelsHost_1012) return
  panelsHost_1012.innerHTML=''
  const shown=[]
  VENDORS_1012.forEach(v=>{
    const toggle=toggles_1012.find(t=>t.dataset.vendor===v.key)
    if(toggle && toggle.checked){
      panelsHost_1012.appendChild(buildPanel_1012(v))
      shown.push(v.label)
    }
  })
  if(verdict_1012){
    if(shown.length===4){
      verdict_1012.textContent='All four vendors are showing. Uncheck one above to hide its panel and compare the rest.'
    } else if(shown.length===0){
      verdict_1012.textContent='Every vendor is hidden. Check at least one above to see its real setup/write/query code.'
    } else {
      verdict_1012.textContent='Showing: '+shown.join(', ')+'. The write call, the query call, and the tenant mechanism are all different real syntax in each -- only the underlying operation (write chunk "c007" for tenant "acme", then query it back) is the same.'
    }
  }
}

toggles_1012.forEach(t=>t.addEventListener('change',render_1012))

render_1012()
