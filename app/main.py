from google.cloud import bigquery
from fastapi import FastAPI
from schemas import RichRoster, HomeDashboard, MatchupComparison, UserDashboard, MatchupEntry
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
client = bigquery.Client()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/api/rich_roster/{season}", response_model=list[RichRoster])
async def get_rich_roster(season: int):
    # SQL query with placeholder for season (@)
    query = "SELECT * FROM `fantasy-league-data-engine.gold_layer.rich_rosters` WHERE season = @season_val"

    # Configure the query job with the parameter
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("season_val", "INT64", season)
        ]
    )

    # Execute the query
    query_job = client.query(query, job_config=job_config)

    # Wait for the query to finish and get the results. Returns an interator of Row objects, which can be converted to dicts
    results = query_job.result()

    return [row for row in results]

# Home dashboard endpoint - combines league settings and league winners for a given season
@app.get("/api/home_dashboard/{season}", response_model=HomeDashboard)
async def get_home_dashboard(season: int):

    # Configure the query job with the parameter
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("season_val", "INT64", season)
        ]
    )

    # Query 1: League Settings (Single Object)
    league_settings_query = """
        SELECT * FROM `fantasy-league-data-engine.gold_layer.league_settings`
        WHERE season = @season_val
    """
    league_settings_res = client.query(league_settings_query, job_config=job_config).result()
    league_settings = next(league_settings_res, None)
    if league_settings is None:
        raise ValueError(f"No league settings found for season {season}")

    # Query 2: League Winners (List of Objects)
    league_winners_query = """
        SELECT * FROM `fantasy-league-data-engine.gold_layer.league_winners`
    """
    league_winners_res = client.query(league_winners_query, job_config=job_config).result()
    league_winners = [row for row in league_winners_res]

    return {
        "settings": league_settings,
        "league_winners": league_winners
    }

# Need to do:
# reformat queries to match models
# reformat models to account for combining matchup dropdown with matchup bar
# write logic to combine dropdown with bar
@app.get("/api/user_dashboard/{season}/{roster_id}", response_model=UserDashboard)
async def get_user_dashboard(season: int, roster_id: int):

    # Configure the query job with the parameter
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("season_val", "INT64", season),
            bigquery.ScalarQueryParameter("roster_id_val", "INT64", roster_id)
        ]
    )

    # Query 1: Rich Roster (Single Object)
    rich_roster_query = """
        SELECT *
        FROM `fantasy-league-data-engine.gold_layer.rich_rosters`
        WHERE season = @season_val
        AND roster_id = @roster_id_val
    """
    rich_roster_res = client.query(rich_roster_query, job_config=job_config).result()
    rich_roster = next(rich_roster_res, None)
    if rich_roster is None:
        raise ValueError(f"No roster found for season {season} and roster_id {roster_id}")

    # Query 2: Matchup Bar (List of Objects)
    matchup_bar_query = """
        SELECT
            season,
            week,
            team_a_id as user_id,
            team_b_id as opponent_id,
            team_a_name AS user_team_name,
            team_b_name AS opponent_team_name,
            score_a AS user_score,
            score_b AS opponent_score,
            CASE
                WHEN winner_id = @roster_id_val THEN TRUE
                ELSE FALSE
            END AS user_won
        FROM `fantasy-league-data-engine.gold_layer.matchup_bar`
        WHERE season = @season_val AND team_a_id = @roster_id_val
    """
    matchup_bar_res = client.query(matchup_bar_query, job_config=job_config).result()
    all_matchup_bars = [row for row in matchup_bar_res]

    # Grab all the opponent ids from the matchup bars to use in the next query to get the matchup dropdown details for both the user and opponent teams. We need to get all the players for the week of the matchup, then we will split them into user vs opponent teams in Python logic. We use a set to avoid duplicates, then convert back to a list for the query parameter
    all_involved_ids = {roster_id}
    for bar in all_matchup_bars:
        all_involved_ids.add(bar.opponent_id)
    involved_ids_list = list(all_involved_ids)

    new_job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("season_val", "INT64", season),
            bigquery.ArrayQueryParameter("involved_ids", "INT64", involved_ids_list)
        ]
    )

    # Query 3: Matchup Dropdown (List of Objects). Filter on roster_id using the involved_ids list we created to get the players for both the user and opponent teams for the matchups we pulled in the matchup bar query
    matchup_dropdown_query = """
        SELECT *
        FROM `fantasy-league-data-engine.gold_layer.matchup_dropdown`
        WHERE season = @season_val
        AND roster_id IN UNNEST(@involved_ids)
    """
    matchup_dropdown_res = client.query(matchup_dropdown_query, job_config=new_job_config).result()
    all_matchup_dropdowns = [row for row in matchup_dropdown_res]
    
    combined_matchups = []
    for bar in all_matchup_bars:
        # Filter players by week of the matchup bar
        week_players = [p for p in all_matchup_dropdowns if p.week == bar.week]

        # Split the players into user team vs opponent team based on roster_id
        comparison = MatchupComparison(
            user_team = [p for p in week_players if p.roster_id == roster_id],
            opponent_team = [p for p in week_players if p.roster_id == bar.opponent_id]
        )

        # Combine the players with the matchup bar info into a single object for the frontend to consume
        combined_matchups.append(MatchupEntry(summary=bar, details=comparison))

    return {
        "roster_info": rich_roster,
        "matchups": combined_matchups
    }