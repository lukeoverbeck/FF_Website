CREATE OR REPLACE TABLE `fantasy-league-data-engine.silver_layer.roster_players` AS
SELECT
  season,
  JSON_VALUE(raw_json, "$.roster_id") AS roster_id,
  JSON_VALUE(raw_json, "$.owner_id") AS owner_id,
  player_id,
  -- Check if this player_id also exists in the starters array
  player_id IN UNNEST(JSON_VALUE_ARRAY(raw_json, "$.starters")) AS is_starter,
  timestamp AS ingested_at
FROM
  `fantasy-league-data-engine.bronze_layer.rosters`,
  -- This explodes the players array into individual rows
  UNNEST(JSON_VALUE_ARRAY(raw_json, "$.players")) AS player_id
QUALIFY ROW_NUMBER() OVER(
  PARTITION BY
    season,
    JSON_VALUE(raw_json, "$.roster_id"), player_id 
  ORDER BY timestamp DESC
) = 1