import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Station, Route
from app.seoul_bus_client import SeoulBusClient

def parse_iso_datetime(dt_str: str) -> datetime:
    """
    Parses ISO 8601 datetime string. Handles the 'Z' suffix for UTC.
    """
    if dt_str.endswith("Z"):
        dt_str = dt_str[:-1] + "+00:00"
    return datetime.fromisoformat(dt_str)

class BusTimelineService:
    @staticmethod
    def get_bus_timeline(db: Session, target_station_id: str, target_time_str: str):
        # 1. Parse target time
        try:
            target_time = parse_iso_datetime(target_time_str)
        except ValueError as e:
            raise ValueError(f"Invalid ISO 8601 datetime format: {e}")

        # 2. Retrieve target station from DB
        target_station = db.query(Station).filter(Station.id == target_station_id).first()
        
        # If not in local DB, we check if it's a dynamically loaded station
        if not target_station:
            # Let's see if we can find the route and stations dynamically
            # Target station ID format for dynamic stations: S_ROUTEID_SEQ
            if target_station_id.startswith("S_"):
                parts = target_station_id.split("_")
                if len(parts) >= 3:
                    route_id = "_".join(parts[1:-1])
                    seq = int(parts[-1])
                    
                    # Ensure route exists in DB, if not load it
                    route = db.query(Route).filter(Route.id == route_id).first()
                    if not route:
                        # Load route and stations dynamically
                        routes_found = SeoulBusClient.search_routes(route_id)
                        route_data = next((r for r in routes_found if r["id"] == route_id), None)
                        if not route_data:
                            route_data = {"id": route_id, "name": f"버스 {route_id}", "interval_mins": 10}
                        
                        route = Route(id=route_data["id"], name=route_data["name"], interval_mins=route_data["interval_mins"])
                        db.add(route)
                        db.commit()
                        
                        stations_data = SeoulBusClient.get_stations_for_route(route_id, route.name)
                        for s in stations_data:
                            station = Station(id=s["id"], name=s["name"], sequence=s["sequence"], route_id=route_id)
                            db.add(station)
                        db.commit()
                        
                        target_station = db.query(Station).filter(Station.id == target_station_id).first()

        if not target_station:
            return None

        # 3. Retrieve route and all stations on the route
        route = db.query(Route).filter(Route.id == target_station.route_id).first()
        if not route:
            return None

        all_stations = (
            db.query(Station)
            .filter(Station.route_id == route.id)
            .order_by(Station.sequence.asc())
            .all()
        )

        # 4. Find index of target station
        try:
            target_idx = next(i for i, s in enumerate(all_stations) if s.id == target_station_id)
        except StopIteration:
            return None

        # 5. Filter timeline stations (window of size 3 centered on target station)
        N = len(all_stations)
        W = 3
        if N <= W:
            filtered_stations = all_stations
        else:
            if target_idx == 0:
                start = 0
            elif target_idx == N - 1:
                start = N - W
            else:
                start = target_idx - 1
            filtered_stations = all_stations[start:start+W]

        filtered_ids = {s.id for s in filtered_stations}

        # 6. Generate virtual bus dispatches from S1 (first station)
        # Dispatches from 2 hours before target_time to 1 hour after target_time
        start_dt = target_time - timedelta(hours=2)
        aligned_start = start_dt.replace(minute=0, second=0, microsecond=0)
        end_dt = target_time + timedelta(hours=1)

        dispatches = []
        current_dispatch = aligned_start
        while current_dispatch <= end_dt:
            if current_dispatch >= start_dt:
                dispatches.append(current_dispatch)
            current_dispatch += timedelta(minutes=route.interval_mins)

        active_buses = []

        # 7. Simulate journey for each dispatch
        for dispatch_time in dispatches:
            # Calculate arrival times at each station along the route
            arrival_times = {}
            current_time = dispatch_time
            arrival_times[all_stations[0].id] = current_time

            for k in range(1, N):
                prev_station = all_stations[k-1]
                curr_station = all_stations[k]
                departure_time = arrival_times[prev_station.id]

                # Check if departure is in rush hour (07-09, 18-20)
                hour = departure_time.hour
                is_rush = (7 <= hour < 9) or (18 <= hour < 20)

                # Deterministic noise seeded by route, dispatch time, and segment index
                seed_str = f"{route.id}_{dispatch_time.isoformat()}_{k}"
                rng = random.Random(seed_str)

                if is_rush:
                    # Add 2 to 5 minutes delay (120 to 300 seconds)
                    noise = rng.uniform(120, 300)
                else:
                    # Add minor noise of -30 to 30 seconds
                    noise = rng.uniform(-30, 30)

                segment_travel_time = 180 + noise  # Base 3 mins (180s) + noise
                current_time = departure_time + timedelta(seconds=segment_travel_time)
                arrival_times[curr_station.id] = current_time

            # 8. Check if this bus is active in our filtered timeline at target_time
            for k in range(1, N):
                prev_station = all_stations[k-1]
                curr_station = all_stations[k]
                t_prev = arrival_times[prev_station.id]
                t_curr = arrival_times[curr_station.id]

                if t_prev <= target_time < t_curr:
                    # Bus is currently in transit between prev_station and curr_station
                    # Check if both stations are in the filtered timeline
                    if prev_station.id in filtered_ids and curr_station.id in filtered_ids:
                        total_seconds = (t_curr - t_prev).total_seconds()
                        elapsed_seconds = (target_time - t_prev).total_seconds()
                        progress_rate = round(elapsed_seconds / total_seconds, 2)
                        
                        estimated_seconds_left = (t_curr - target_time).total_seconds()
                        estimated_minutes_left = int(round(estimated_seconds_left / 60.0))
                        if estimated_minutes_left < 1:
                            estimated_minutes_left = 1

                        # Determine status based on rush hour of the segment
                        hour = t_prev.hour
                        is_rush = (7 <= hour < 9) or (18 <= hour < 20)
                        status = "CROWDED" if is_rush else "NORMAL"

                        # Generate unique busId based on dispatch time
                        prefix = "M" if route.id == "R001" else "B"
                        bus_id = f"{prefix}{dispatch_time.strftime('%H%M')}"

                        active_buses.append({
                            "busId": bus_id,
                            "busName": route.name,
                            "fromStationId": prev_station.id,
                            "toStationId": curr_station.id,
                            "progressRate": progress_rate,
                            "estimatedMinutesLeft": estimated_minutes_left,
                            "status": status
                        })
                    break  # A bus can only be in one segment at target_time

        # 9. Format response
        return {
            "searchContext": {
                "targetTime": target_time_str,
                "isMocked": True
            },
            "timeline": {
                "stations": [
                    {"id": s.id, "name": s.name, "sequence": s.sequence}
                    for s in filtered_stations
                ]
            },
            "activeBuses": active_buses
        }
