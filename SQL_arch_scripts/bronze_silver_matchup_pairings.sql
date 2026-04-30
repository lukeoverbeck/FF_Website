CREATE OR REPLACE TABLE `fantasy-league-data-engine.silver_layer.matchup_pairings` AS
WITH base_matchups AS (
  SELECT 
    season,
    week,
    JSON_VALUE(raw_json, "$.matchup_id") AS matchup_id,
    JSON_VALUE(raw_json, "$.roster_id") AS roster_id,
    timestamp as ingested_at
  FROM `fantasy-league-data-engine.bronze_layer.matchups`
  QUALIFY ROW_NUMBER() OVER(
    PARTITION BY
      season,
      week,
      roster_id 
    ORDER BY timestamp DESC
  ) = 1
)

SELECT
  a.season,
  a.week,
  a.matchup_id,
  a.roster_id AS roster_id_a,
  b.roster_id AS roster_id_b
FROM base_matchups a
JOIN base_matchups b 
  ON a.matchup_id = b.matchup_id 
  AND a.week = b.week
  AND a.season = b.season
WHERE a.roster_id < b.roster_id -- Ensures we only get one row per game (1 vs 2, not 2 vs 1)