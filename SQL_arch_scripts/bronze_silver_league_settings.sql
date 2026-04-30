CREATE OR REPLACE TABLE `fantasy-league-data-engine.silver_layer.league_settings` AS
WITH deduplicated_settings AS (
  -- Step 1: Get the latest version of settings
  SELECT 
    timestamp,
    raw_json,
    season
  FROM `fantasy-league-data-engine.bronze_layer.league_settings`
  QUALIFY ROW_NUMBER() OVER(
    PARTITION BY season
    ORDER BY timestamp DESC
  ) = 1
)
SELECT
  season,
  CASE
    WHEN SAFE_CAST(JSON_VALUE(raw_json, "$.settings.max_keepers") as INT64) != 0 THEN TRUE
    ELSE FALSE
  END AS is_keeper,
  CASE
    WHEN SAFE_CAST(JSON_VALUE(raw_json, "$.settings.waiver_budget") as INT64) != 0 THEN TRUE
    ELSE FALSE
  END AS is_FAAB,
  CASE
    WHEN SAFE_CAST(JSON_VALUE(raw_json, "$.scoring_settings.rec") as INT64) = 0 THEN 'Standard'
    WHEN SAFE_CAST(JSON_VALUE(raw_json, "$.scoring_settings.rec") as FLOAT64) = 0.5 THEN 'Half-PPR'
    WHEN SAFE_CAST(JSON_VALUE(raw_json, "$.scoring_settings.rec") as INT64) = 1 THEN 'PPR'
    ELSE 'None'
  END AS scoring_type,
  SAFE_CAST(JSON_VALUE(raw_json, "$.total_rosters") as INT64) as num_teams,
  SAFE_CAST(JSON_VALUE(raw_json, "$.metadata.latest_league_winner_roster_id") as INT64) as winner_id
FROM
  deduplicated_settings