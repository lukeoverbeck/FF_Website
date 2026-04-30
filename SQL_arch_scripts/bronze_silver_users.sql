CREATE OR REPLACE TABLE `fantasy-league-data-engine.silver_layer.users` AS
WITH base_data AS (
  SELECT
    season,
    JSON_VALUE(raw_json, "$.user_id") AS user_id,
    JSON_VALUE(raw_json, "$.display_name") AS display_name,
    JSON_VALUE(raw_json, "$.metadata.avatar") AS profile_picture,
    COALESCE(
      NULLIF(JSON_VALUE(raw_json, "$.metadata.team_name"), ""), 
      JSON_VALUE(raw_json, "$.display_name")
    ) AS raw_team_name,
    timestamp AS ingested_at
  FROM
    `fantasy-league-data-engine.bronze_layer.users`
  QUALIFY ROW_NUMBER() OVER(
    PARTITION BY season, JSON_VALUE(raw_json, "$.user_id")
    ORDER BY timestamp DESC
  ) = 1
)

SELECT 
  * EXCEPT(raw_team_name),
  CASE 
    WHEN raw_team_name LIKE '%Jaboo%' THEN 'Team Krieger'
    WHEN raw_team_name = 'GeorgePickenCotton' THEN 'Team Roncace'
    WHEN raw_team_name = 'Burrowdeeznutsinyomouth' THEN 'Team Furlano'
    WHEN raw_team_name = 'Robert Kraft\'s Masseuse' THEN 'Team Overbeck'
    WHEN raw_team_name = 'Age is just a number' THEN 'Team Keating'
    WHEN raw_team_name = 'Ahhh My Balls' THEN 'Team Watson'
    WHEN raw_team_name = 'Najee Germany' THEN 'Team Eife'
    WHEN raw_team_name = 'George Pickens Cotton' THEN 'Team Roncace'
    WHEN raw_team_name = 'Got a Half-Chubb' THEN 'Team Roncace'
    -- You can easily add more overrides here later
    ELSE raw_team_name 
  END AS team_name,
  CASE 
    WHEN display_name = 'lukeoverbeck' THEN 'commissioner'
    ELSE 'member' 
  END AS role,
FROM base_data;