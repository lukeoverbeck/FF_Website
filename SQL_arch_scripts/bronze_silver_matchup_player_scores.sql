CREATE OR REPLACE TABLE `fantasy-league-data-engine.silver_layer.matchup_player_scores` AS
WITH deduplicated_matchups AS (
  -- Step 1: Get the latest version of each matchup
  SELECT 
    week, 
    season, 
    raw_json,
    timestamp
  FROM `fantasy-league-data-engine.bronze_layer.matchups`
  QUALIFY ROW_NUMBER() OVER(
    PARTITION BY
      season,
      week,
      JSON_VALUE(raw_json, "$.matchup_id"),
      JSON_VALUE(raw_json, "$.roster_id")
    ORDER BY timestamp DESC
  ) = 1
),

starter_positions AS (
  -- Step 2: Extract starters with their array index (offset)
  SELECT
    season,
    week,
    JSON_VALUE(raw_json, "$.matchup_id") AS matchup_id,
    JSON_VALUE(raw_json, "$.roster_id") AS roster_id,
    starter_id,
    offset AS starter_index
  FROM deduplicated_matchups,
  UNNEST(JSON_VALUE_ARRAY(raw_json, "$.starters")) AS starter_id WITH OFFSET offset
)

SELECT
  m.season,
  m.week,
  JSON_VALUE(m.raw_json, "$.matchup_id") AS matchup_id,
  JSON_VALUE(m.raw_json, "$.roster_id") AS roster_id,
  player_id,
  LAX_FLOAT64(m.raw_json.players_points[player_id]) AS points,
  
  -- Step 3: Assign position based on the index from the starters array
  CASE 
    WHEN s.starter_index = 0 THEN 'QB'
    WHEN s.starter_index BETWEEN 1 AND 2 THEN 'RB'
    WHEN s.starter_index BETWEEN 3 AND 4 THEN 'WR'
    WHEN s.starter_index = 5 THEN 'TE'
    WHEN s.starter_index BETWEEN 6 AND 7 THEN 'FLEX'
    WHEN s.starter_index = 8 THEN 'DST'
    ELSE 'BENCH' 
  END AS fantasy_position,

  IF(s.starter_id IS NOT NULL, TRUE, FALSE) AS is_starter,
  m.timestamp AS ingested_at
FROM
  deduplicated_matchups m
CROSS JOIN 
  UNNEST(JSON_KEYS(m.raw_json.players_points)) AS player_id
LEFT JOIN 
  starter_positions s 
  ON m.season = s.season 
  AND m.week = s.week 
  AND JSON_VALUE(m.raw_json, "$.matchup_id") = s.matchup_id
  AND JSON_VALUE(m.raw_json, "$.roster_id") = s.roster_id
  AND player_id = s.starter_id