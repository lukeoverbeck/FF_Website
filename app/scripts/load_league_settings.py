"""
load_league_settings.py
Fetches top-level league settings and loads them into bronze_layer.league_settings.
"""

from datetime import datetime
from helpers.utils import fetch_sleeper_league_root, load_to_bronze

TABLE_NAME = "league_settings"
SEASON = 2022

def main():
    try:
        raw = fetch_sleeper_league_root(SEASON)
        print(raw)

        rows = [
            {
                "timestamp": str(datetime.now()),
                "season": SEASON,
                "raw_json": raw,
            }
        ]

        print(f"Loading {len(rows)} record(s) to BigQuery...")
        load_to_bronze(rows, TABLE_NAME)
        print(f"{TABLE_NAME} loaded successfully!")

    except Exception as e:
        print(f"Error loading {TABLE_NAME}: {e}")


if __name__ == "__main__":
    main()