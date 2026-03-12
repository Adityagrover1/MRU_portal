-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Document chunks table: stores embedded FSSAI regulatory knowledge
CREATE TABLE document_chunks (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content   text        NOT NULL,
  metadata  jsonb       NOT NULL DEFAULT '{}',
  embedding vector(1536)
);

-- IVFFlat index for approximate cosine similarity search
-- lists=20 is appropriate for ~50-100 document chunks
CREATE INDEX ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 20);

-- RLS: regulatory knowledge is public (no personal data here)
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read document chunks"
  ON document_chunks
  FOR SELECT
  USING (true);

-- Similarity search function called by the Node.js RAG server
-- Returns chunks ordered by cosine similarity to the query embedding
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.70,
  match_count     int   DEFAULT 5
)
RETURNS TABLE (id uuid, content text, metadata jsonb, similarity float)
LANGUAGE sql
STABLE
AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
