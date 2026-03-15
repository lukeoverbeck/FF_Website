"""
load_players.py
Fetches the full NFL player database from Sleeper and loads it into bronze_layer.players.
Note: this is a large payload (~10 MB). Each player is stored as its own row.
"""

from datetime import datetime
from helpers.utils import fetch_sleeper_players, load_to_bronze

TABLE_NAME = "players"


def main():
    try:
        raw = fetch_sleeper_players()

        rows = [
            {
                "timestamp": str(datetime.now()),
                "raw_json": {player_id: attributes},
            }
            for player_id, attributes in raw.items()
        ]

        print(f"Loading {len(rows)} record(s) to BigQuery...")
        load_to_bronze(rows, TABLE_NAME)
        print(f"{TABLE_NAME} loaded successfully!")

    except Exception as e:
        print(f"Error loading {TABLE_NAME}: {e}")


if __name__ == "__main__":
    main()