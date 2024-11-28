UPDATE embeddings
SET tags = json_extract_path(CAST(raw_data AS json), 'value', 'tags')::json
WHERE tags IS NULL
  AND raw_data IS NOT NULL
  AND raw_data != '';
