import os

# Load .env file manually if it exists to avoid external dependency issues
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip("'\""))

class Settings:
    PROJECT_NAME: str = "Interactive Bus Arrival Prediction Prototype"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bus_prediction.db")
    SEOUL_BUS_API_KEY: str = os.getenv("SEOUL_BUS_API_KEY", "")

settings = Settings()
