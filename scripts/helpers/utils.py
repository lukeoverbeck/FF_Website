import httpx
from google.cloud import bigquery
from google.api_core.exceptions import NotFound

league_ids = {
    2025: "1223741745737506816",
    2024: "1062893901159206912",
    2023: "956362596284715008",
    2022: "858106224590327808",
}
PROJECT_DATASET = "fantasy-league-data-engine.bronze_layer"

client = bigquery.Client()


# --------------------------------------------------------------------------- #
# Schemas
# --------------------------------------------------------------------------- #

MATCHUP_SCHEMA = [
    bigquery.SchemaField("timestamp", "TIMESTAMP"),
    bigquery.SchemaField("week", "INTEGER"),
    bigquery.SchemaField("season", "INTEGER"),
    bigquery.SchemaField("raw_json", "JSON"),
]

REGULAR_SCHEMA = [
    bigquery.SchemaField("timestamp", "TIMESTAMP"),
    bigquery.SchemaField("raw_json", "JSON"),
    bigquery.SchemaField("season", "INTEGER"),
]

PLAYER_SCHEMA = [
    bigquery.SchemaField("timestamp", "TIMESTAMP"),
    bigquery.SchemaField("raw_json", "JSON"),
]

SCHEMAS = {
    "matchups": MATCHUP_SCHEMA,
    "players": PLAYER_SCHEMA
}


# --------------------------------------------------------------------------- #
# API helpers
# --------------------------------------------------------------------------- #

def fetch_sleeper_league(endpoint: str, year: int | None = None) -> dict | list:
    """GET /v1/league/<league_id>/<endpoint>"""
    url = f"https://api.sleeper.app/v1/league/{league_ids.get(year)}/{endpoint}"
    response = httpx.get(url)
    response.raise_for_status()
    data = response.json()
    if not data:
        raise ValueError(f"No data returned from endpoint: {endpoint}")
    return data


def fetch_sleeper_league_root(year = None) -> dict:
    """GET /v1/league/<league_id>  (league settings)"""
    url = f"https://api.sleeper.app/v1/league/{league_ids.get(year or 2025)}"
    response = httpx.get(url)
    response.raise_for_status()
    data = response.json()
    if not data:
        raise ValueError("No data returned for league settings.")
    return data


def fetch_sleeper_players() -> dict:
    """GET /v1/players/nfl  (full player database — large payload)"""
    url = "https://api.sleeper.app/v1/players/nfl"
    response = httpx.get(url)
    response.raise_for_status()
    data = response.json()
    if not data:
        raise ValueError("No data returned for players.")
    return data


# --------------------------------------------------------------------------- #
# BigQuery loader
# --------------------------------------------------------------------------- #

def load_to_bronze(rows: list[dict], table_name: str) -> None:
    """Load a list of prepared row dicts into the bronze layer table."""
    table_id = f"{PROJECT_DATASET}.{table_name}"
    schema = SCHEMAS.get(table_name, REGULAR_SCHEMA)

    try:
        client.get_table(table_id)
        print(f"Table {table_id} exists — appending data.")
        write_mode = bigquery.WriteDisposition.WRITE_APPEND
    except NotFound:
        print(f"Table {table_id} not found — creating table.")
        write_mode = bigquery.WriteDisposition.WRITE_TRUNCATE

    job_config = bigquery.LoadJobConfig(
        schema=schema,
        write_disposition=write_mode,
        autodetect=False,
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
    )

    job = client.load_table_from_json(rows, table_id, job_config=job_config)
    job.result()
    print(f"Loaded {len(rows)} record(s) into {table_id}.")