import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import Base, get_db
from app.models import Route, Station

# Create a test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_bus.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    # Seed data
    r1 = Route(id="R001", name="65번", interval_mins=10)
    r2 = Route(id="R002", name="241번", interval_mins=12)
    db.add_all([r1, r2])
    
    stations = [
        Station(id="S001", name="경희대후문", sequence=1, route_id="R001"),
        Station(id="S002", name="한국외대 후문", sequence=2, route_id="R001"),
        Station(id="S003", name="한국외대 정문", sequence=3, route_id="R001"),
        Station(id="S004", name="돌곶이역 2번 출구", sequence=4, route_id="R001"),
        Station(id="S005", name="석관동주민센터", sequence=5, route_id="R001"),
        Station(id="S006", name="신이문역", sequence=6, route_id="R001"),
        
        Station(id="S101", name="경희대후문", sequence=1, route_id="R002"),
        Station(id="S102", name="한국외대 후문", sequence=2, route_id="R002"),
        Station(id="S103", name="한국외대 정문", sequence=3, route_id="R002"),
        Station(id="S104", name="돌곶이역 2번 출구", sequence=4, route_id="R002"),
        Station(id="S105", name="석관동주민센터", sequence=5, route_id="R002"),
        Station(id="S106", name="신이문역", sequence=6, route_id="R002")
    ]
    db.add_all(stations)
    db.commit()
    db.close()
    
    yield
    
    # Clean up test database file
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_bus.db"):
        os.remove("./test_bus.db")

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Interactive Bus Arrival Prediction API"}

def test_bus_timeline_success():
    # S003 is '한국외대 정문'
    response = client.get("/api/v1/bus-timeline?target_station_id=S003&target_time=2026-06-15T18:30:00Z")
    assert response.status_code == 200
    data = response.json()
    
    # Check search context
    assert "searchContext" in data
    assert data["searchContext"]["targetTime"] == "2026-06-15T18:30:00Z"
    assert data["searchContext"]["isMocked"] is True
    
    # Check timeline windowing (should return 3 stations centered around S003: S002, S003, S004)
    assert "timeline" in data
    stations = data["timeline"]["stations"]
    assert len(stations) == 3
    assert stations[0]["id"] == "S002"
    assert stations[1]["id"] == "S003"
    assert stations[2]["id"] == "S004"
    
    # Check active buses
    assert "activeBuses" in data
    for bus in data["activeBuses"]:
        assert "busId" in bus
        assert bus["busName"] == "65번"
        assert bus["fromStationId"] in ["S002", "S003"]
        assert bus["toStationId"] in ["S003", "S004"]
        assert 0.0 <= bus["progressRate"] <= 1.0
        assert bus["estimatedMinutesLeft"] >= 1
        assert bus["status"] in ["NORMAL", "CROWDED"]

def test_bus_timeline_edge_stations():
    # S001 is the first station (경희대후문)
    response = client.get("/api/v1/bus-timeline?target_station_id=S001&target_time=2026-06-15T18:30:00Z")
    assert response.status_code == 200
    stations = response.json()["timeline"]["stations"]
    assert len(stations) == 3
    assert stations[0]["id"] == "S001"
    assert stations[1]["id"] == "S002"
    assert stations[2]["id"] == "S003"

    # S006 is the last station (신이문역)
    response = client.get("/api/v1/bus-timeline?target_station_id=S006&target_time=2026-06-15T18:30:00Z")
    assert response.status_code == 200
    stations = response.json()["timeline"]["stations"]
    assert len(stations) == 3
    assert stations[0]["id"] == "S004"
    assert stations[1]["id"] == "S005"
    assert stations[2]["id"] == "S006"

def test_bus_timeline_not_found():
    response = client.get("/api/v1/bus-timeline?target_station_id=S999&target_time=2026-06-15T18:30:00Z")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

def test_bus_timeline_invalid_time():
    response = client.get("/api/v1/bus-timeline?target_station_id=S003&target_time=invalid-time")
    assert response.status_code == 400
    assert "Invalid ISO 8601" in response.json()["detail"]

def test_bus_timeline_determinism():
    # Requesting twice with the exact same parameters should yield the exact same output
    response1 = client.get("/api/v1/bus-timeline?target_station_id=S003&target_time=2026-06-15T18:30:00Z")
    response2 = client.get("/api/v1/bus-timeline?target_station_id=S003&target_time=2026-06-15T18:30:00Z")
    
    assert response1.status_code == 200
    assert response2.status_code == 200
    assert response1.json() == response2.json()
