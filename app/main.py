from google.cloud import bigquery
from fastapi import FastAPI, HTTPException, Depends, Header, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas import RichRoster, HomeDashboard, MatchupComparison, UserDashboard, MatchupEntry, LoginRequest, Managers, ManagerHighlight, Navbar
from fastapi.middleware.cors import CORSMiddleware
import bcrypt
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

app = FastAPI()
client = bigquery.Client()
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
security = HTTPBearer()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def require_auth(auth: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = auth.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Not authenticated")

@app.get("/api/navbar/{roster_id}/{season}", response_model=Navbar)
async def get_navbar(roster_id: int, season: int,  user=Depends(require_auth)):
    
    query = "SELECT display_name, team_name, profile_picture FROM `fantasy-league-data-engine.gold_layer.rich_rosters` WHERE roster_id = @roster_id_val AND season = @season_val"

    # Configure the query job with the parameter
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("roster_id_val", "INT64", roster_id),
            bigquery.ScalarQueryParameter("season_val", "INT64", season)
        ]
    )

    # Execute the query
    query_job = client.query(query, job_config=job_config)

    # Wait for the query to finish and get the results. Returns an interator of Row objects, which can be converted to dicts
    results = list(query_job.result())

    return results[0]

# Home dashboard endpoint - combines league settings and league winners for a given season
@app.get("/api/home_dashboard/{season}", response_model=HomeDashboard)
async def get_home_dashboard(season: int, user=Depends(require_auth)):

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
        ORDER BY season DESC
    """
    league_winners_res = client.query(league_winners_query).result()
    league_winners = [row for row in league_winners_res]

    # Query 3: Manager Highlight (Single Object)
    highlight_query = "SELECT * FROM `fantasy-league-data-engine.gold_layer.current_highlight`"
    highlight_res = client.query(highlight_query).result()

    return {
        "settings": league_settings,
        "league_winners": league_winners,
        "manager_highlight": list(highlight_res)[0]
    }

@app.get("/api/user_dashboard/{season}/{roster_id}", response_model=UserDashboard)
async def get_user_dashboard(season: int, roster_id: int, user=Depends(require_auth)):

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

@app.post("/api/login")
def login(body: LoginRequest):
    query = """
        SELECT password_hash
        FROM `fantasy-league-data-engine.gold_layer.users`
        WHERE username = @username
        LIMIT 1
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("username", "STRING", body.username)
        ]
    )

    results = client.query(query, job_config=job_config).result()
    rows = list(results)

    if not rows:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    password_bytes = body.password.encode("utf-8")
    hash_from_db = rows[0]["password_hash"].encode("utf-8")

    if not bcrypt.checkpw(password_bytes, hash_from_db):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    now_utc = datetime.now(timezone.utc)
    
    token = jwt.encode(
        {"sub": body.username, "iat": now_utc, "exp": now_utc + timedelta(hours=8)},
        SECRET_KEY,
        algorithm="HS256"
    )

    return { "token": token }

# Grab all the managers from 2025
@app.get("/api/managers/2025", response_model=list[Managers])
async def get_managers(user=Depends(require_auth)):
# async def get_managers():
    # SQL query with placeholder for season (@)
    query = "SELECT display_name, team_name, total_wins, total_losses FROM `fantasy-league-data-engine.gold_layer.rich_rosters` WHERE season = 2025"

    # Execute the query
    query_job = client.query(query)

    # Wait for the query to finish and get the results. Returns an interator of Row objects, which can be converted to dicts
    results = query_job.result()

    return [row for row in results]

# Update the manager highlight data
@app.post("/api/manager_highlight")
async def post_manager_highlight(body: ManagerHighlight, user=Depends(require_auth)):
    # SQL query with placeholder for season (@)
    query = """
        TRUNCATE TABLE `fantasy-league-data-engine.gold_layer.current_highlight`;

        INSERT INTO `fantasy-league-data-engine.gold_layer.current_highlight` 
        (display_name, team_name, wins, losses, message) 
        VALUES (@display_name_val, @team_name_val, @wins_val, @losses_val, @message_val);
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("display_name_val", "STRING", body.display_name),
            bigquery.ScalarQueryParameter("team_name_val", "STRING", body.team_name),
            bigquery.ScalarQueryParameter("wins_val", "INT64", body.wins),
            bigquery.ScalarQueryParameter("losses_val", "INT64", body.losses),
            bigquery.ScalarQueryParameter("message_val", "STRING", body.message)
        ]
    )

    # Execute the query
    query_job = client.query(query, job_config=job_config)

    # Wait for the query to finish and get the results. Returns an interator of Row objects, which can be converted to dicts
    results = query_job.result()

    return {"status": "success"}