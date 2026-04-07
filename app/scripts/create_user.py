from google.cloud import bigquery
import bcrypt
from datetime import datetime

client = bigquery.Client()
PASSWORD_TABLE_ID = "fantasy-league-data-engine.gold_layer.users"
GOLD_TABLE_ID = "fantasy-league-data-engine.gold_layer.rich_rosters"

def create_user(username: str, plain_text_password: str):
    password_check_query = f"""
        SELECT COUNT(*) as count
        FROM `{PASSWORD_TABLE_ID}`
        WHERE username = @username
    """
    gold_check_query = f"""
        SELECT COUNT(*) as count
        FROM `{GOLD_TABLE_ID}`
        WHERE display_name = @username
        AND season = 2025
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("username", "STRING", username)
        ]
    )

    password_results = client.query(password_check_query, job_config=job_config).result()
    password_row = list(password_results)[0]
    gold_results = client.query(gold_check_query, job_config=job_config).result()
    gold_row = list(gold_results)[0]

    # To make sure I don't add in users that I already added in
    if password_row["count"] > 0:
        print(f"User {username} already exists, skipping insert")
        return
    
    # To make sure I don't add in users that don't exist in Sleeper
    if gold_row["count"] <= 0:
        print(f"User {username} does not exist in Sleeper, skipping insert")
        return
    
    # These checks above are largely unnecessary for my purposes, but I added them anyway

    hashed = bcrypt.hashpw(plain_text_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    errors = client.insert_rows_json(
        PASSWORD_TABLE_ID,
        [{ "username": username, "password_hash": hashed, "created_at": datetime.now().isoformat() }]
    )

    if errors:
        print("Error inserting user:", errors)
    else:
        print(f"User {username} created successfully")

user_list = [
    ("AdamRobinson", "testpassword1"),
    ("Danmwat", "testpassword2"),
    ("JakeRogers17", "testpassword3"),
    ("Mdkeating", "testpassword4"),
    ("MichaelEife", "testpassword5"),
    ("brianfurlano", "testpassword6"),
    ("ethanroncace", "testpassword7"),
    ("jh27", "testpassword8"),
    ("lukeoverbeck", "testpassword9"),
    ("mkrieger", "testpassword10"),
    ("ngriese4", "testpasswor11"),
    ("timshe", "testpassword12"),
]

for username, password in user_list:
    create_user(username, password)