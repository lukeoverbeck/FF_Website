CREATE OR REPLACE TABLE `fantasy-league-data-engine.silver_layer.rosters` AS
SELECT
  season,
  JSON_VALUE(raw_json, "$.roster_id") AS roster_id,
  JSON_VALUE(raw_json, "$.owner_id") AS owner_id,
  -- Flattening the Settings Object
  SAFE_CAST(JSON_VALUE(raw_json, "$.settings.wins") AS INT64) AS wins,
  SAFE_CAST(JSON_VALUE(raw_json, "$.settings.losses") AS INT64) AS losses,
  SAFE_CAST(JSON_VALUE(raw_json, "$.settings.fpts") AS INT64) AS fpts,
  SAFE_CAST(JSON_VALUE(raw_json, "$.settings.fpts_decimal") AS INT64) AS fpts_decimal,
  SAFE_CAST(JSON_VALUE(raw_json, "$.settings.fpts_against") AS INT64) AS fpts_against,
  SAFE_CAST(JSON_VALUE(raw_json, "$.settings.fpts_against_decimal") AS INT64) AS fpts_against_decimal,
  timestamp AS ingested_at
FROM
  `fantasy-league-data-engine.bronze_layer.rosters`
QUALIFY ROW_NUMBER() OVER(
  PARTITION BY
    season,
    JSON_VALUE(raw_json, "$.roster_id") 
  ORDER BY timestamp DESC
) = 1