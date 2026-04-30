CREATE OR REPLACE TABLE `fantasy-league-data-engine.gold_layer.league_winners` AS
SELECT
  ls.season as season,
  rr.display_name as display_name,
  rr.team_name as team_name,
  rr.total_wins as wins,
  rr.total_losses as losses
FROM `fantasy-league-data-engine.silver_layer.league_settings` ls
JOIN `fantasy-league-data-engine.gold_layer.rich_rosters` rr
ON ls.winner_id = rr.roster_id and ls.season = rr.season