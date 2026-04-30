CREATE OR REPLACE TABLE `fantasy-league-data-engine.silver_layer.players`
-- Clustering by position first, then team
CLUSTER BY position, team
AS
SELECT
  player_key AS player_id,
  COALESCE(LAX_STRING(raw_json[player_key].full_name), COALESCE(LAX_STRING(raw_json[player_key].team), 'FA')) AS full_name,
  LAX_STRING(raw_json[player_key].position) AS position,
  COALESCE(LAX_STRING(raw_json[player_key].team), 'FA') AS team,
FROM 
  `fantasy-league-data-engine.bronze_layer.players`,
  UNNEST(JSON_KEYS(raw_json)) AS player_key
WHERE (REGEXP_CONTAINS(player_key, r'^[0-9]+$') OR REGEXP_CONTAINS(player_key, r'^[A-Z]{2,3}$'))
AND LAX_BOOL(raw_json[player_key].active)
AND REGEXP_CONTAINS(LAX_STRING(raw_json[player_key].position), r'^(WR|TE|RB|QB|FB|DEF)$')
QUALIFY ROW_NUMBER() OVER(
  PARTITION BY player_id
  ORDER BY timestamp DESC
) = 1