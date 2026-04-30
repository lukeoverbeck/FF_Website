CREATE OR REPLACE TABLE `fantasy-league-data-engine.gold_layer.league_settings` AS
SELECT season, is_keeper, is_FAAB, scoring_type, num_teams
FROM `fantasy-league-data-engine.silver_layer.league_settings`