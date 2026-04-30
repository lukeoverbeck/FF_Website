CREATE OR REPLACE TABLE `fantasy-league-data-engine.gold_layer.rich_rosters` AS
WITH flattened_scores AS (
  -- One row per score to calculate league median per season/week
  SELECT season, week, team_a_id as roster_id, score_a as score FROM `fantasy-league-data-engine.gold_layer.matchup_bar`
  UNION ALL
  SELECT season, week, team_b_id as roster_id, score_b as score FROM `fantasy-league-data-engine.gold_layer.matchup_bar`
),

weekly_medians AS (
  -- Calculate median score partitioned by season and week
  SELECT 
    season, 
    week, 
    PERCENTILE_CONT(score, 0.5) OVER(PARTITION BY season, week) as median_score
  FROM flattened_scores
),

median_stats AS (
  -- Aggregate median wins/losses per roster per season
  SELECT
    f.season, 
    f.roster_id,
    SUM(CASE WHEN f.score > m.median_score THEN 1 ELSE 0 END) as median_wins,
    SUM(CASE WHEN f.score < m.median_score THEN 1 ELSE 0 END) as median_losses
  FROM flattened_scores f
  JOIN (SELECT DISTINCT season, week, median_score FROM weekly_medians) m 
    ON f.season = m.season AND f.week = m.week
  WHERE f.season NOT IN (2022, 2023)
  GROUP BY 1, 2
)

SELECT
  rr.season,
  SAFE_CAST(rr.roster_id as INT64) as roster_id,
  rr.display_name,
  rr.user_provided_team_name as team_name,
  rr.role,
  -- Calculate isolated H2H records
  (rr.wins - ms.median_wins) as h2h_wins,
  (rr.losses - ms.median_losses) as h2h_losses,
  COALESCE(ms.median_wins, 0) as median_wins,
  COALESCE(ms.median_losses, 0) as median_losses,
  rr.wins as total_wins,
  rr.losses as total_losses,
  -- RANK logic now resets every season
  RANK() OVER (
    PARTITION BY rr.season 
    ORDER BY rr.wins DESC, rr.fpts DESC
  ) as regular_season_rank,
  SAFE_CAST((rr.fpts + rr.fpts_decimal) as FLOAT64) as points_for,
  SAFE_CAST((rr.fpts_against + rr.fpts_against_decimal) as FLOAT64) as points_against,
  -- Player details aggregation
  ARRAY_AGG(
    STRUCT(p.full_name, pn.nickname) 
    IGNORE NULLS
  ) as player_details,
  rr.profile_picture,
  -- Logic updated to check both ID and Season
  CASE
    WHEN SAFE_CAST(rr.roster_id as INT64) = ls.winner_id AND rr.season = ls.season THEN true
    ELSE false
  END as is_winner
FROM `fantasy-league-data-engine.silver_layer.rich_rosters` rr
LEFT JOIN median_stats ms 
  ON SAFE_CAST(rr.roster_id as INT64) = ms.roster_id 
  AND rr.season = ms.season
LEFT JOIN `fantasy-league-data-engine.silver_layer.player_nicknames` pn 
  ON rr.roster_id = pn.roster_id
LEFT JOIN `fantasy-league-data-engine.silver_layer.players` p 
  ON pn.player_id = p.player_id
-- Added season join condition here
LEFT JOIN `fantasy-league-data-engine.silver_layer.league_settings` ls
  ON ls.winner_id = SAFE_CAST(rr.roster_id as INT64)
  AND ls.season = rr.season
GROUP BY 
  rr.season, 
  rr.roster_id, 
  rr.display_name, 
  rr.user_provided_team_name,
  rr.role, 
  rr.wins, 
  rr.losses, 
  rr.fpts, 
  ms.median_wins, 
  ms.median_losses,
  rr.fpts_decimal,
  rr.fpts_against,
  rr.fpts_against_decimal,
  rr.profile_picture,
  ls.winner_id,
  ls.season
ORDER BY 
  rr.season DESC, 
  regular_season_rank ASC