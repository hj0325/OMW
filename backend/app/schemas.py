from pydantic import BaseModel, Field
from typing import List

class SearchContextSchema(BaseModel):
    targetTime: str = Field(..., description="ISO 8601 target time requested")
    isMocked: bool = Field(True, description="Indicates if the response is mocked/simulated")

class TimelineStationSchema(BaseModel):
    id: str = Field(..., description="Station ID")
    name: str = Field(..., description="Station Name")
    sequence: int = Field(..., description="Station sequence number along the route")

class TimelineSchema(BaseModel):
    stations: List[TimelineStationSchema] = Field(..., description="List of stations in the timeline segment")

class ActiveBusSchema(BaseModel):
    busId: str = Field(..., description="Unique ID of the bus")
    busName: str = Field(..., description="Name/Number of the bus route")
    fromStationId: str = Field(..., description="ID of the station the bus recently departed")
    toStationId: str = Field(..., description="ID of the station the bus is heading to")
    progressRate: float = Field(..., description="Relative progress rate between from and to stations (0.0 to 1.0)")
    estimatedMinutesLeft: int = Field(..., description="Estimated minutes left to reach the toStationId")
    status: str = Field(..., description="Traffic status (NORMAL, CROWDED)")

class BusTimelineResponseSchema(BaseModel):
    searchContext: SearchContextSchema
    timeline: TimelineSchema
    activeBuses: List[ActiveBusSchema]

# New schemas for search functionality
class SearchRouteResponseSchema(BaseModel):
    id: str = Field(..., description="Bus route ID")
    name: str = Field(..., description="Bus route name (e.g., 147번)")
    interval_mins: int = Field(..., description="Average dispatch interval")
