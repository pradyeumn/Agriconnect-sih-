from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    village = Column(String(255))
    district = Column(String(255))
    state = Column(String(255))
    pincode = Column(String(10))
    farm_size = Column(Float)  # in acres
    crops = Column(Text)  # comma-separated crop names
    latitude = Column(Float)
    longitude = Column(Float)
    profile_image = Column(String(500))
    reliability_score = Column(Float, default=75.0)  # 0-100
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="farmer_profile")
    inventory = relationship("Inventory", back_populates="farmer")
    slot_allocations = relationship("SlotAllocation", back_populates="farmer")

    @property
    def crops_list(self):
        if self.crops:
            return [c.strip() for c in self.crops.split(",")]
        return []
