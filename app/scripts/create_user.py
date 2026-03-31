from google.cloud import bigquery
import bcrypt
from datetime import datetime

client = bigquery.Client()
TABLE_ID = "fantasy-league-data-engine.gold_layer.users"

def create_user(username: str, plain_text_password: str):
    check_query = f"""
        SELECT COUNT(*) as count
        FROM `{TABLE_ID}`
        WHERE username = @username
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("username", "STRING", username)
        ]
    )

    results = client.query(check_query, job_config=job_config).result()
    row = list(results)[0]

    if row["count"] > 0:
        print(f"User {username} already exists, skipping insert")
        return

    hashed = bcrypt.hashpw(plain_text_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    errors = client.insert_rows_json(
        TABLE_ID,
        [{ "username": username, "password_hash": hashed, "created_at": datetime.now().isoformat() }]
    )

    if errors:
        print("Error inserting user:", errors)
    else:
        print(f"User {username} created successfully")

create_user("testuser", "testpassword")