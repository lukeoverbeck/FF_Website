from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

# Write model_config once
class BigQueryModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# General gold layer model
class LeagueSettings(BigQueryModel):
    season: int
    is_keeper: bool
    is_FAAB: bool
    scoring_type: str
    num_teams: int

# General gold layer model
class LeagueWinners(BigQueryModel):
    season: int
    display_name: str
    team_name: str
    wins: int
    losses: int

# General gold layer model
class MatchupBar(BigQueryModel):
    season: int
    week: int
    user_team_name: str
    opponent_team_name: str
    user_score: float
    opponent_score: float
    user_won: bool

# General gold layer model
class MatchupDropdown(BigQueryModel):
    full_name: str
    points: float
    position: str
    team: str
    is_starter: bool

# Helper for RichRoster to get player nickname details
class RichRosterRecord(BigQueryModel):
    full_name: str
    nickname: str

# General gold layer model
class RichRoster(BigQueryModel):
    season: int
    display_name: str
    team_name: str
    h2h_wins: int
    h2h_losses: int
    median_wins: int
    median_losses: int
    h2h_ranking: int
    points_for: float
    points_against: float
    # If the column is empty in BigQuery, the API returns [] instead of null
    player_nickname_details: list[RichRosterRecord] = Field(default_factory=list)

# Home dashboard model
class HomeDashboard(BigQueryModel):
    # Not a list because it is for a singular year
    settings: LeagueSettings
    # List because home page always shows all winners
    league_winners: List[LeagueWinners]

# Helper for UserDashboard to put matchup dropdowns for both teams together
class MatchupComparison(BigQueryModel):
    user_team: List[MatchupDropdown]
    opponent_team: List[MatchupDropdown]

# User dashboard model
class UserDashboard(BigQueryModel):
    roster_info: RichRoster
    matchup_bar: List[MatchupBar]
    matchup_dropdown: MatchupComparison
