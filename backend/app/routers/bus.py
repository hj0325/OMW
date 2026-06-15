from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import BusTimelineResponseSchema, SearchRouteResponseSchema
from app.services import BusTimelineService
from app.seoul_bus_client import SeoulBusClient
from app.models import Route, Station

router = APIRouter(prefix="/api/v1", tags=["bus"])

@router.get("/bus-timeline", response_model=BusTimelineResponseSchema)
def get_bus_timeline(
    target_station_id: str = Query(..., description="The ID of the target station"),
    target_time: str = Query(..., description="ISO 8601 string of the target time"),
    db: Session = Depends(get_db)
):
    try:
        result = BusTimelineService.get_bus_timeline(db, target_station_id, target_time)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Station with ID '{target_station_id}' not found or has no associated route."
        )

    return result

@router.get("/bus/search-routes", response_model=List[SearchRouteResponseSchema])
def search_routes(
    query: str = Query(..., description="Search query (e.g., '147', '273')"),
    db: Session = Depends(get_db)
):
    """
    Search for bus routes in Seoul. If found, caches them in the local database
    to make them available for timeline simulation.
    """
    routes = SeoulBusClient.search_routes(query)
    
    # Cache found routes in local database so they can be queried
    for r in routes:
        existing = db.query(Route).filter(Route.id == r["id"]).first()
        if not existing:
            route_obj = Route(id=r["id"], name=r["name"], interval_mins=r["interval_mins"])
            db.add(route_obj)
            db.commit()
            
            # Fetch and cache stations for this route
            stations = SeoulBusClient.get_stations_for_route(r["id"], r["name"])
            for s in stations:
                station_obj = Station(
                    id=s["id"],
                    name=s["name"],
                    sequence=s["sequence"],
                    route_id=r["id"]
                )
                db.add(station_obj)
            db.commit()
            
    return routes

@router.get("/realtime/stations-by-pos")
def get_realtime_stations_by_pos(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: int = Query(400, description="Search radius in meters"),
    serviceKey: str = Query("", description="Public Data API Key")
):
    """
    Fetches real-time bus stations around a specific coordinate.
    """
    stations = SeoulBusClient.get_stations_by_pos(lat, lng, radius, serviceKey)
    return {"stations": stations}

@router.get("/realtime/arrivals")
def get_realtime_arrivals(
    stationId: str = Query(..., description="The 9-digit station ID"),
    serviceKey: str = Query("", description="Public Data API Key")
):
    """
    Fetches real-time bus arrival information for a specific station.
    """
    arrivals = SeoulBusClient.get_realtime_arrivals(stationId, serviceKey)
    return {"arrivals": arrivals}

