"""
load_matchups.py
Fetches weekly matchups (weeks 1–14) and loads them into bronze_layer.matchups.
Stops early if a week returns no data (i.e. season hasn't reached that week yet).
"""

from datetime import datetime
from helpers.utils import fetch_sleeper_league, load_to_bronze

TABLE_NAME = "matchups"
SEASON = 2025
WEEKS = range(1, 15)


def main():
    for week in WEEKS:
        print(f"--- Processing Week {week} ---")
        try:
            raw = fetch_sleeper_league(f"matchups/{week}", SEASON)
            print(raw)

            # rows = [
            #     {
            #         "timestamp": str(datetime.now()),
            #         "week": week,
            #         "season": SEASON,
            #         "raw_json": record,
            #     }
            #     for record in raw
            # ]

            # print(f"Loading {len(rows)} record(s) to BigQuery...")
            # load_to_bronze(rows, TABLE_NAME)
            # print(f"Week {week} loaded successfully!")

        except Exception as e:
            print(f"Error in Week {week}: {e}")
            break


if __name__ == "__main__":
    main()