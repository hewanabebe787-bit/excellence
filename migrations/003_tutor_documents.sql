CREATE TABLE IF NOT EXISTS tutor_documents (
  id BIGSERIAL PRIMARY KEY,
  tutor_user_id BIGINT NOT NULL
    REFERENCES tutor_profiles(user_id) ON DELETE CASCADE,
  document_type TEXT NOT NULL
    CHECK (document_type IN ('cv', 'fayda')),
  storage_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL
    CHECK (size_bytes > 0 AND size_bytes <= 5242880),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tutor_user_id, document_type)
);