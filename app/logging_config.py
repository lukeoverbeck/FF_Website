import logging
from logging.handlers import RotatingFileHandler
import os

# Create a logs directory if it doesn't exist
if not os.path.exists('logs'):
    os.makedirs('logs')

def setup_logging():
    logger = logging.getLogger("fantasy_api")
    logger.setLevel(logging.INFO)

    # Format: Timestamp | Level | Message
    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Log to a file (max 5MB, keep 3 backup files)
    file_handler = RotatingFileHandler(
        'logs/app.log', maxBytes=5*1024*1024, backupCount=3
    )
    file_handler.setFormatter(formatter)
    
    # Also log to console so you can see it while developing
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

logger = setup_logging()