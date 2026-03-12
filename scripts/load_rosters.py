"""
load_rosters.py
Fetches league rosters and loads them into bronze_layer.rosters.
"""

from datetime import datetime
from helpers.utils import fetch_sleeper_league, load_to_bronze

TABLE_NAME = "rosters"
SEASON = 2022


def main():
    try:
        raw = fetch_sleeper_league("rosters", SEASON)

        rows = [
            {
                "timestamp": str(datetime.now()),
                "raw_json": record,
                "season": SEASON
            }
            for record in raw
        ]

        print(f"Loading {len(rows)} record(s) to BigQuery...")
        load_to_bronze(rows, TABLE_NAME)
        print(f"{TABLE_NAME} loaded successfully!")

    except Exception as e:
        print(f"Error loading {TABLE_NAME}: {e}")


if __name__ == "__main__":
    main()