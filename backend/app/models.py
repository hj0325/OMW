from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Route(Base):
    __tablename__ = "routes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    interval_mins = Column(Integer, nullable=False)

    # One-to-many relationship with Station
    stations = relationship("Station", back_populates="route", cascade="all, delete-orphan")


class Station(Base):
    __tablename__ = "stations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sequence = Column(Integer, nullable=False)
    route_id = Column(String, ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)

    # Many-to-one relationship with Route
    route = relationship("Route", back_populates="stations")
