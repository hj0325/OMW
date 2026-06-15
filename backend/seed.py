import json
import os
import sys

# Add the current directory to the python path to allow importing app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import Route, Station

def seed_db():
    print("Initializing database...")
    # Recreate all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()

    try:
        # Load routes
        routes_path = os.path.join(os.path.dirname(__file__), "app", "data", "routes.json")
        with open(routes_path, "r", encoding="utf-8") as f:
            routes_data = json.load(f)
        
        print(f"Seeding {len(routes_data)} routes...")
        for r in routes_data:
            route = Route(id=r["id"], name=r["name"], interval_mins=r["interval_mins"])
            session.add(route)
        
        # Load stations
        stations_path = os.path.join(os.path.dirname(__file__), "app", "data", "stations.json")
        with open(stations_path, "r", encoding="utf-8") as f:
            stations_data = json.load(f)
            
        print(f"Seeding {len(stations_data)} stations...")
        for s in stations_data:
            station = Station(
                id=s["id"],
                name=s["name"],
                sequence=s["sequence"],
                route_id=s["route_id"]
            )
            session.add(station)
            
        session.commit()
        print("Database seeded successfully!")
    except Exception as e:
        session.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        session.close()

if __name__ == "__main__":
    seed_db()
