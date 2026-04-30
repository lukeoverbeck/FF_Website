CREATE OR REPLACE TABLE `fantasy-league-data-engine.gold_layer.matchup_dropdown` AS
SELECT
  mps.season,
  mps.week,
  SAFE_CAST(mps.matchup_id as INT64) as matchup_id,
  SAFE_CAST(mps.roster_id as INT64) as roster_id,
  p.full_name,
  mps.points,
  p.position,
  p.team,
  mps.fantasy_position,
  mps.is_starter
FROM `fantasy-league-data-engine.silver_layer.matchup_player_scores` as mps
LEFT JOIN `fantasy-league-data-engine.silver_layer.players` as p
ON mps.player_id = p.player_id
ORDER by season, week, matchup_id, roster_id