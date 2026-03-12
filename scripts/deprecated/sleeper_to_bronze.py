import httpx
from google.cloud import bigquery
from google.api_core.exceptions import NotFound
from datetime import datetime

client = bigquery.Client()
table_name = "specific"
league_id = "1223741745737506816"
table_id = f"fantasy-league-data-engine.bronze_layer.{table_name}"

def fetch_sleeper_data(week=None):
    if week:
        if week == 'specific':
            url = f"https://api.sleeper.app/v1/league/{league_id}"
        elif week == 0:
            url = f"https://api.sleeper.app/v1/players/nfl"
        else:
            url = f"https://api.sleeper.app/v1/league/{league_id}/{table_name}/{week}"
    else:
        url = f"https://api.sleeper.app/v1/league/{league_id}/{table_name}"
    
    response = httpx.get(url)
    response.raise_for_status()
    data = response.json()
    
    if not data:
        raise Exception(f"No data found for Week {week}. Stopping.")
    return data

def load_to_bronze(data, name_table):
    # 1. Define the "Pro" Resilient Schema
    matchup_schema = [
        bigquery.SchemaField("timestamp", "TIMESTAMP"),
        bigquery.SchemaField("week", "INTEGER"),
        bigquery.SchemaField("season", "INTEGER"),
        bigquery.SchemaField("raw_json", "JSON"), # This captures the entire blob
    ]
    regular_schema = [
        bigquery.SchemaField("timestamp", "TIMESTAMP"),
        bigquery.SchemaField("raw_json", "JSON"), # Regular STRING for non-matchup tables
    ]
    specific_schema = [
        bigquery.SchemaField("timestamp", "TIMESTAMP"),
        bigquery.SchemaField("raw_json", "JSON"), # Regular STRING for non-matchup tables
        bigquery.SchemaField("season", "INTEGER")
    ]

    if name_table == "matchups":
        schema = matchup_schema
    elif name_table == "specific":
        schema = specific_schema
    else:
        schema = regular_schema

    try:
        client.get_table(table_id)
        print(f"Table {table_id} exists. Appending data.")
        current_write_mode = bigquery.WriteDisposition.WRITE_APPEND
    except NotFound:
        print(f"Table {table_id} not found. Creating table.")
        current_write_mode = bigquery.WriteDisposition.WRITE_TRUNCATE

    # 2. Configure the job to use our manual schema (Autodetect is now FALSE)
    job_config = bigquery.LoadJobConfig(
        schema=schema,
        write_disposition=current_write_mode,
        autodetect=False, 
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
    )
    
    job = client.load_table_from_json(data, table_id, job_config=job_config)
    job.result()

if __name__ == "__main__":
    
    # League settings logic
    try:
        # Fetch raw data from API
        sleeper_data = fetch_sleeper_data('specific')

        print(sleeper_data)
        
        prepared_rows = []
        prepared_rows.append({
            "timestamp": str(datetime.now()), # Add a timestamp for tracking
            "season": 2025,
            "raw_json": sleeper_data # The entire matchup dictionary goes here
        })
        
        print(f"Loading {len(prepared_rows)} records to BigQuery...")
        load_to_bronze(prepared_rows, table_name)
        print(f"{table_name} loaded successfully!")
        
    except Exception as e:
        print(f"Error for {table_name}: {e}")
    
    # # Players logic
    # try:
    #     # Fetch raw data from API
    #     sleeper_data = fetch_sleeper_data(0)
        
    #     prepared_rows = []
    #     for key, value in sleeper_data.items():
    #         prepared_rows.append({
    #             "timestamp": str(datetime.now()), # Add a timestamp for tracking
    #             "raw_json": {key: value} # The entire matchup dictionary goes here
    #         })
        
    #     print(f"Loading {len(prepared_rows)} records to BigQuery...")
    #     load_to_bronze(prepared_rows, table_name)
    #     print(f"{table_name} loaded successfully!")
        
    # except Exception as e:
    #     print(f"Error for {table_name}: {e}")
    
    # # Rosters, users logic
    # try:
    #     # Fetch raw data from API
    #     sleeper_data = fetch_sleeper_data()
        
    #     prepared_rows = []
    #     for record in sleeper_data:
    #         prepared_rows.append({
    #             "timestamp": str(datetime.now()), # Add a timestamp for tracking
    #             "raw_json": record # The entire matchup dictionary goes here
    #         })
        
    #     print(f"Loading {len(prepared_rows)} records to BigQuery...")
    #     load_to_bronze(prepared_rows, table_name)
    #     print(f"{table_name} loaded successfully!")
        
    # except Exception as e:
    #     print(f"Error for {table_name}: {e}")
    
    # # Matchups logic
    # for week in range(1, 15):
    #     print(f"--- Processing Week {week} ---")
    #     try:
    #         # Fetch raw data from API
    #         sleeper_data = fetch_sleeper_data(week)
            
    #         # 3. WRAP THE DATA: Transform raw list into our 3-column format
    #         prepared_rows = []
    #         for record in sleeper_data:
    #             prepared_rows.append({
    #                 "timestamp": str(datetime.now()), # Add a timestamp for tracking
    #                 "week": week,
    #                 "season": 2025,
    #                 "raw_json": record # The entire matchup dictionary goes here
    #             })
            
    #         print(f"Loading {len(prepared_rows)} records to BigQuery...")
    #         load_to_bronze(prepared_rows, table_name)
    #         print(f"Week {week} loaded successfully!")
            
    #     except Exception as e:
    #         print(f"Error in Week {week}: {e}")
    #         break