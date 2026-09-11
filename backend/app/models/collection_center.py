from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class CollectionCenter(Base):
    __tablename__ = "collection_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(String(500))
    city = Column(String(255))
    district = Column(String(255))
    state = Column(String(255))
    pincode = Column(String(10))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Float)  # in tons
    manager_name = Column(String(255))
    manager_phone = Column(String(20))
    description = Column(Text)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    procurement_slots = relationship("ProcurementSlot", back_populates="collection_center")
