CREATE OR REPLACE TABLE `fantasy-league-data-engine.silver_layer.player_nicknames` AS
SELECT
  JSON_VALUE(raw_json, "$.roster_id") AS roster_id,
  -- Get the key (e.g., 'p_nick_5589')
  metadata_key,
  -- Get the value (the actual nickname)
  LAX_STRING(raw_json.metadata[metadata_key]) AS nickname,
  -- Extract just the Player ID from the key (removes 'p_nick_')
  REGEXP_EXTRACT(metadata_key, r'p_nick_(\d+)') AS player_id
FROM
  `fantasy-league-data-engine.bronze_layer.rosters`,
  -- Metadata object -> list of keys
  UNNEST(JSON_KEYS(JSON_QUERY(raw_json, "$.metadata"))) AS metadata_key
WHERE 
  metadata_key LIKE 'p_nick_%'
  AND LAX_STRING(raw_json.metadata[metadata_key]) IS NOT NULL
  AND LAX_STRING(raw_json.metadata[metadata_key]) != ''
QUALIFY ROW_NUMBER() OVER(
  PARTITION BY JSON_VALUE(raw_json, "$.roster_id"), metadata_key 
  ORDER BY timestamp DESC
) = 1