CREATE OR REPLACE TABLE `fantasy-league-data-engine.gold_layer.matchup_bar` AS
WITH starter_scores AS (
  -- Aggregate points per roster
  SELECT 
    season, week, matchup_id, roster_id,
    ROUND(SUM(points), 2) AS total_roster_score
  FROM `fantasy-league-data-engine.silver_layer.matchup_player_scores`
  WHERE is_starter IS TRUE
  GROUP BY 1, 2, 3, 4
),

team_info AS (
  -- Step 1: Create a single lookup for Team Names
  SELECT
    r.season,
    r.roster_id,
    u.team_name
  FROM `fantasy-league-data-engine.silver_layer.rosters` AS r
  JOIN `fantasy-league-data-engine.silver_layer.users` AS u 
    ON r.owner_id = u.user_id AND r.season = u.season
),

joined_data AS (
  SELECT 
    mp.season,
    mp.week,
    SAFE_CAST(ta.roster_id as INT64) as team_a_id,
    SAFE_CAST(tb.roster_id as INT64) as team_b_id,
    ta.team_name AS team_a_name,
    tb.team_name AS team_b_name,
    ROUND(COALESCE(sa.total_roster_score, 0), 2) AS score_a,
    ROUND(COALESCE(sb.total_roster_score, 0), 2) AS score_b
  FROM `fantasy-league-data-engine.silver_layer.matchup_pairings` AS mp
  LEFT JOIN team_info AS ta ON mp.roster_id_a = ta.roster_id AND mp.season = ta.season
  LEFT JOIN team_info AS tb ON mp.roster_id_b = tb.roster_id AND mp.season = tb.season
  LEFT JOIN starter_scores AS sa 
    ON mp.matchup_id = sa.matchup_id 
    AND mp.roster_id_a = sa.roster_id
    AND mp.season = sa.season
    AND mp.week = sa.week
    
  LEFT JOIN starter_scores AS sb 
    ON mp.matchup_id = sb.matchup_id 
    AND mp.roster_id_b = sb.roster_id
    AND mp.season = sb.season
    AND mp.week = sb.week
)

SELECT 
  *,
  CASE
    WHEN score_a > score_b THEN team_a_id
    WHEN score_a < score_b THEN team_b_id
    ELSE 0
  END as winner_id
FROM joined_data
ORDER BY week, joined_data.team_a_id