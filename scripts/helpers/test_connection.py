import json
import google.auth
from google.cloud import secretmanager
from google.cloud import bigquery
from google.oauth2 import service_account

# --- UPDATE THESE ---
PROJECT_ID = "fantasy-league-data-engine"
SECRET_ID = "gcp-service-key"

def test_connection():
    print("Step 1: Authenticating with ADC...")
    # This automatically uses the 'gcloud auth application-default login' you did
    adc_creds, _ = google.auth.default()
    
    print("Step 2: Fetching key from Secret Manager...")
    sm_client = secretmanager.SecretManagerServiceClient(credentials=adc_creds)
    secret_path = f"projects/{PROJECT_ID}/secrets/{SECRET_ID}/versions/latest"
    
    try:
        response = sm_client.access_secret_version(request={"name": secret_path})
        sa_key_dict = json.loads(response.payload.data.decode("UTF-8"))
        print("✅ Secret retrieved successfully.")
    except Exception as e:
        print(f"❌ Failed to reach Secret Manager: {e}")
        return

    print("Step 3: Initializing BigQuery Client with Service Account...")
    # We load the JSON dict directly into credentials (no file needed!)
    sa_creds = service_account.Credentials.from_service_account_info(sa_key_dict)
    bq_client = bigquery.Client(credentials=sa_creds, project=PROJECT_ID)

    print("Step 4: Performing Dry Run Query...")
    # This query scans a tiny bit of public data to verify connectivity
    query = "SELECT 1"
    job_config = bigquery.QueryJobConfig(dry_run=True, use_query_cache=False)
    
    try:
        query_job = bq_client.query(query, job_config=job_config)
        print("✅ BigQuery Handshake Successful!")
        print(f"Connection Verified. Dry run estimate: {query_job.total_bytes_processed} bytes.")
    except Exception as e:
        print(f"❌ BigQuery Permission Denied: {e}")

if __name__ == "__main__":
    test_connection()