from google.cloud import bigquery
from google.cloud import exceptions as gcp_exceptions
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas import HomeDashboard, MatchupComparison, UserDashboard, MatchupEntry, LoginRequest, Managers, ManagerHighlight, Navbar, RosterMapping, FrontendLog
from fastapi.middleware.cors import CORSMiddleware
import bcrypt
from jose import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
import time
from logging_config import logger
import uuid

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

# This endpoint will be hit every time the frontend makes an API call
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Process the request
    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    formatted_process_time = "{0:.2f}ms".format(process_time)

    request_id = str(uuid.uuid4())[:8]
    
    # Logs the request ID, method, URL path, status code, and processing time
    logger.info(
        f"RID: {request_id} | "
        f"{request.method} {request.url.path} | "
        f"Status: {response.status_code} | "
        f"Time: {formatted_process_time}"
    )
    
    return response

def require_auth(auth: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = auth.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        logger.info(f"Authenticated request from user: {payload['sub']}")
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Authentication failed: token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Auth failed: invalid token — {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Auth failed: unexpected error — {e}", exc_info=True)
        raise HTTPException(status_code=401, detail="Not authenticated")

def require_commissioner(auth: HTTPAuthorizationCredentials = Depends(security)):
    payload = require_auth(auth)
    if payload.get("role") != "commissioner":
        raise HTTPException(status_code=403, detail="Forbidden")
    return payload

@app.get("/api/navbar/{roster_id}/{season}", response_model=Navbar)
async def get_navbar(roster_id: int, season: int,  user=Depends(require_auth)):
    logger.info(f"Fetching navbar for roster_id={roster_id}, season={season}, user={user['sub']}")
    
    query = "SELECT display_name, team_name, profile_picture FROM `fantasy-league-data-engine.gold_layer.rich_rosters` WHERE roster_id = @roster_id_val AND season = @season_val"

    # Configure the query job with the parameter
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("roster_id_val", "INT64", roster_id),
            bigquery.ScalarQueryParameter("season_val", "INT64", season)
        ]
    )

    try:
        query_job = client.query(query, job_config=job_config)
        results = list(query_job.result())
        if not results:
            logger.warning(f"No navbar data found for roster_id={roster_id}, season={season}")
            raise HTTPException(status_code=404, detail=f"No navbar data found for roster_id {roster_id} in season {season}")
        
        logger.info(f"Successfully fetched navbar for roster_id={roster_id}, season={season}")
        return results[0]
    except gcp_exceptions.GoogleCloudError as e:
        logger.error(f"BigQuery error for roster_id={roster_id}, season={season} — {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Failed to fetch navbar data")

# Home dashboard endpoint - combines league settings and league winners for a given season
@app.get("/api/home_dashboard/{season}", response_model=HomeDashboard)
async def get_home_dashboard(season: int, user=Depends(require_auth)):
    logger.info(f"Fetching home dashboard for season={season}, user={user['sub']}")

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
    try:
        league_settings_res = client.query(league_settings_query, job_config=job_config).result()
        league_settings = next(league_settings_res, None)
    except gcp_exceptions.GoogleCloudError as e:
        logger.error(f"BigQuery error fetching league settings for season={season} — {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Failed to fetch league settings")
    if not league_settings:
        logger.warning(f"No league settings found for season={season}")
        raise HTTPException(status_code=404, detail=f"No league settings found for season {season}")
    logger.info(f"Fetched league settings for season={season}")

    # Query 2: League Winners (List of Objects)
    league_winners_query = """
        SELECT * FROM `fantasy-league-data-engine.gold_layer.league_winners`
        ORDER BY season DESC
    """
    try:
        league_winners_res = client.query(league_winners_query).result()
        league_winners = [row for row in league_winners_res]
    except gcp_exceptions.GoogleCloudError as e:
        logger.error(f"BigQuery error fetching league winners — {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Failed to fetch league winners")
    if not league_winners:
        logger.warning(f"No league winners found in the database")
        raise HTTPException(status_code=404, detail=f"No league winners found")
    logger.info(f"Fetched league winners: {len(league_winners)} records")

    # Query 3: Manager Highlight (Single Object)
    try:
        highlight_query = "SELECT * FROM `fantasy-league-data-engine.gold_layer.current_highlight`"
        highlight_res = client.query(highlight_query).result()
        highlight = next(iter(highlight_res), None)
    except gcp_exceptions.GoogleCloudError as e:
        logger.error(f"BigQuery error fetching manager highlight — {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Failed to fetch manager highlight")
    if not highlight:
        logger.warning(f"No manager highlight found in the database")
        raise HTTPException(status_code=404, detail=f"No manager highlight found")
    logger.info(f"Fetched manager highlight: {highlight.display_name}")

    return {
        "settings": league_settings,
        "league_winners": league_winners,
        "manager_highlight": highlight
    }

@app.get("/api/user_dashboard/{season}/{roster_id}", response_model=UserDashboard)
async def get_user_dashboard(season: int, roster_id: int, user=Depends(require_auth)):
    logger.info(f"Fetching user dashboard for roster_id={roster_id}, season={season}, user={user['sub']}")

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
    try:
        rich_roster_res = client.query(rich_roster_query, job_config=job_config).result()
        rich_roster = next(rich_roster_res, None)
    except gcp_exceptions.GoogleCloudError as e:
        logger.error(f"BigQuery error fetching rich roster for roster_id={roster_id}, season={season} — {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Failed to fetch roster data")
    if rich_roster is None:
        logger.warning(f"No roster found for roster_id={roster_id}, season={season}")
        raise HTTPException(status_code=404, detail=f"No roster found for roster_id {roster_id} in season {season}")
    logger.info(f"Fetched rich roster for roster_id={roster_id}, season={season}")

    # Query 2: Matchup Bar (List of Objects). Sometimes the user is team_a and sometimes team_b, so we use CASE statements to flip the teams/scores/winner logic based on whether team_a_id or team_b_id matches the roster_id parameter
    matchup_bar_query = """
        SELECT
            season,
            week,
            CASE WHEN team_a_id = @roster_id_val THEN team_a_id ELSE team_b_id END AS user_id,
            CASE WHEN team_a_id = @roster_id_val THEN team_b_id ELSE team_a_id END AS opponent_id,
            CASE WHEN team_a_id = @roster_id_val THEN team_a_name ELSE team_b_name END AS user_team_name,
            CASE WHEN team_a_id = @roster_id_val THEN team_b_name ELSE team_a_name END AS opponent_team_name,
            CASE WHEN team_a_id = @roster_id_val THEN score_a ELSE score_b END AS user_score,
            CASE WHEN team_a_id = @roster_id_val THEN score_b ELSE score_a END AS opponent_score,
            CASE WHEN winner_id = @roster_id_val THEN TRUE ELSE FALSE END AS user_won
        FROM `fantasy-league-data-engine.gold_layer.matchup_bar`
        WHERE season = @season_val 
        AND (team_a_id = @roster_id_val OR team_b_id = @roster_id_val)
    """
    try:
        matchup_bar_res = client.query(matchup_bar_query, job_config=job_config).result()
        all_matchup_bars = [row for row in matchup_bar_res]
    except gcp_exceptions.GoogleCloudError as e:
        logger.error(f"BigQuery error fetching matchup bars for roster_id={roster_id}, season={season} — {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Failed to fetch matchup bars")
    if not all_matchup_bars:
        logger.warning(f"No matchups found for roster_id={roster_id}, season={season}")
        raise HTTPException(status_code=404, detail=f"No matchups found for roster_id {roster_id} in season {season}")
    logger.info(f"Fetched matchup bars for roster_id={roster_id}, season={season}: {len(all_matchup_bars)} records")

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
    try:
        matchup_dropdown_res = client.query(matchup_dropdown_query, job_config=new_job_config).result()
        all_matchup_dropdowns = [row for row in matchup_dropdown_res]
    except gcp_exceptions.GoogleCloudError as e:
        logger.error(f"BigQuery error fetching matchup dropdown details for roster_id={roster_id}, season={season} — {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Failed to fetch matchup dropdown details")
    if not all_matchup_dropdowns:
        logger.warning(f"No matchup dropdown details found for roster_id={roster_id}, season={season}")
        raise HTTPException(status_code=404, detail=f"No matchup dropdown details found for roster_id {roster_id} in season {season}")
    logger.info(f"Fetched matchup dropdown details for roster_id={roster_id}, season={season}: {len(all_matchup_dropdowns)} records")
    
    try:
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
    except Exception as e:
        logger.error(f"Error combining matchup data for roster_id={roster_id}, season={season} — {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to combine matchup data")
    logger.info(f"Successfully combined matchup data for roster_id={roster_id}, season={season}")

    return {
        "roster_info": rich_roster,
        "matchups": combined_matchups
    }

@app.post("/api/login")
def login(body: LoginRequest):
    password_query = """
        SELECT password_hash, role
        FROM `fantasy-league-data-engine.gold_layer.users`
        WHERE username = @username
        LIMIT 1
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("username", "STRING", body.username)
        ]
    )

    try:
        results = client.query(password_query, job_config=job_config).result()
        rows = list(results)
    except gcp_exceptions.GoogleCloudError as e:
        logger.error(f"BigQuery error during login for username={body.username} — {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Authentication service unavailable")
    if not rows:
        logger.warning(f"Login failed: username {body.username} not found")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    logger.info(f"Login attempt for username={body.username} - user found")

    try:
        password_bytes = body.password.encode("utf-8")
        hash_from_db = rows[0]["password_hash"].encode("utf-8")
        if not bcrypt.checkpw(password_bytes, hash_from_db):
            logger.warning(f"Login failed: incorrect password for username={body.username}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        raise # Raise the 401 up
    except Exception as e:
        logger.error(f"Error verifying credentials for username={body.username} — {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error verifying credentials")
    logger.info(f"Login successful for username={body.username}")

    role_from_db = rows[0]["role"]
    
    try:
        now_utc = datetime.now(timezone.utc)
        to_encode = {
            "sub": body.username,
            "role": role_from_db,
            "iat": now_utc,
            "exp": now_utc + timedelta(hours=8)
        }
        
        token = jwt.encode(
            to_encode,
            SECRET_KEY,
            algorithm="HS256"
        )
    except Exception as e:
        logger.error(f"Error generating token for username={body.username} — {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating authentication token")
    logger.info(f"Token generated for username={body.username}")

    return { "token": token }

# Grab all the managers from 2025
@app.get("/api/managers/2025", response_model=list[Managers])
async def get_managers(user=Depends(require_commissioner)):
    logger.info(f"Fetching managers for season 2025, user={user['sub']}")

    # SQL query with placeholder for season (@)
    query = "SELECT display_name, team_name, total_wins, total_losses FROM `fantasy-league-data-engine.gold_layer.rich_rosters` WHERE season = 2025"

    try:
        query_job = client.query(query)
        results = list(query_job.result())
    except gcp_exceptions.GoogleCloudError as e:
        logger.error(f"BigQuery error fetching managers for season 2025 — {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Failed to fetch managers")
    if not results:
        logger.warning(f"No managers found for season 2025")
        raise HTTPException(status_code=404, detail=f"No managers found for season 2025")
    logger.info(f"Fetched managers for season 2025: {len(results)} records")

    return results

# Update the manager highlight data
@app.post("/api/manager_highlight")
async def post_manager_highlight(body: ManagerHighlight, user=Depends(require_commissioner)):
    logger.info(f"Updating manager highlight for display_name={body.display_name}, user={user['sub']}")

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

    try:
        query_job = client.query(query, job_config=job_config)
        query_job.result()
    except gcp_exceptions.GoogleCloudError as e:
        logger.error(f"BigQuery error updating manager highlight for display_name={body.display_name} — {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Failed to update manager highlight")
    except Exception as e:
        logger.error(f"Unexpected error updating manager highlight for display_name={body.display_name} — {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error updating manager highlight")
    logger.info(f"Manager highlight updated for display_name={body.display_name}")

    return {"status": "success"}

@app.get("/api/roster_mapping/{season}", response_model=RosterMapping)
async def get_roster_id(season: int, user=Depends(require_auth)):
    logger.info(f"Fetching roster mapping for season={season}, user={user['sub']}")

    query = """
        SELECT roster_id
        FROM `fantasy-league-data-engine.gold_layer.rich_rosters`
        WHERE season = @season_val
        AND display_name = @display_name_val
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("season_val", "INT64", season),
            bigquery.ScalarQueryParameter("display_name_val", "STRING", user["sub"])
        ]
    )

    try:
        results = client.query(query, job_config=job_config).result()
        results_list = list(results)
    except gcp_exceptions.GoogleCloudError as e:
        logger.error(f"BigQuery error fetching roster mapping for user={user['sub']}, season={season} — {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Failed to fetch roster mapping")
    if not results_list:
        logger.warning(f"No roster found for user={user['sub']} in season={season}")
        raise HTTPException(status_code=404, detail=f"No roster found for user {user['sub']} in season {season}")
    logger.info(f"Fetched roster mapping for user={user['sub']}, season={season}: roster_id={results_list[0]['roster_id']}")

    return results_list[0]

# Not protected because it is only called from the frontend for logging purposes and doesn't return any sensitive data
@app.post("/api/log")
async def log_frontend(body: FrontendLog):
    if body.level == "error":
        logger.error(f"FRONTEND | {body.message}")
    elif body.level == "warning":
        logger.warning(f"FRONTEND | {body.message}")
    else:
        logger.info(f"FRONTEND | {body.message}")
    return {"status": "ok"}