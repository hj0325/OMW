import os

class Settings:
    PROJECT_NAME: str = "Interactive Bus Arrival Prediction Prototype"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bus_prediction.db")
    SEOUL_BUS_API_KEY: str = os.getenv("SEOUL_BUS_API_KEY", "")

settings = Settings()
