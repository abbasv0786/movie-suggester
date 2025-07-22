"""
Constants for Movie Suggestion Engine
Centralizes configuration values and magic numbers for better maintainability
"""

# Suggestion Engine Configuration
DEFAULT_MIN_SUGGESTIONS = 3
DEFAULT_MAX_SUGGESTIONS = 4
MAX_KEYWORD_SCORE = 5.0
GENRE_SCORE_MULTIPLIER = 10
FALLBACK_SCORE = 3.0
EMERGENCY_FALLBACK_SCORE = 2.0

# Recency Scoring
RECENT_MOVIE_THRESHOLD_YEARS = 5
MODERATE_RECENT_THRESHOLD_YEARS = 10
RECENT_MOVIE_BONUS = 1.0
MODERATE_RECENT_BONUS = 0.5

# Response Limits
MAX_PROMPT_LENGTH = 1500
MIN_PROMPT_LENGTH = 1
MAX_LANG_CODE_LENGTH = 5
REASONABLE_YEAR_MIN = 1800
REASONABLE_YEAR_MAX = 2030

# Emergency Fallback Movies - REMOVED: Using AI-based fallbacks instead
# This ensures the system uses AI recommendations even in emergency scenarios
AI_FALLBACK_ENABLED = True
AI_FALLBACK_MIN_SUGGESTIONS = 3
AI_FALLBACK_PROMPT = "Recommend popular, well-known movies or TV series that are widely acclaimed and suitable for general audiences" 