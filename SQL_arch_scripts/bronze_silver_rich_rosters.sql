CREATE OR REPLACE TABLE `fantasy-league-data-engine.silver_layer.rich_rosters` AS
SELECT 
  r.season,
  r.roster_id,
  r.owner_id,
  u.display_name,
  CASE 
    WHEN u.team_name LIKE '%Jaboo%' THEN 'Team Krieger'
    WHEN u.team_name = 'GeorgePickenCotton' THEN 'Team Roncace'
    WHEN u.team_name = 'Burrowdeeznutsinyomouth' THEN 'Team Furlano'
    WHEN u.team_name = 'Robert Kraft\'s Masseuse' THEN 'Team Overbeck'
    WHEN u.team_name = 'Age is just a number' THEN 'Team Keating'
    WHEN u.team_name = 'Ahhh My Balls' THEN 'Team Watson'
    WHEN u.team_name = 'Najee Germany' THEN 'Team Eife'
    WHEN u.team_name = 'George Pickens Cotton' THEN 'Team Roncace'
    WHEN u.team_name = 'Got a Half-Chubb' THEN 'Team Roncace'
    ELSE u.team_name 
  END AS user_provided_team_name,
  u.role,
  u.profile_picture,
  r.wins,
  r.losses,
  r.fpts,
  r.fpts_decimal,
  r.fpts_against,
  r.fpts_against_decimal,
  r.ingested_at
FROM `fantasy-league-data-engine.silver_layer.rosters` AS r
LEFT JOIN `fantasy-league-data-engine.silver_layer.users` AS u 
  ON r.owner_id = u.user_id AND r.season = u.season