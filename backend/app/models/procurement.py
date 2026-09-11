from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Procurement(Base):
    __tablename__ = "procurements"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    required_quantity = Column(Float, nullable=False)
    required_by_date = Column(Date)
    min_grade = Column(String(5), default="B")
    price_per_unit = Column(Float)
    status = Column(String(20), default="active")  # active, fulfilled, cancelled, closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    product = relationship("Product", back_populates="procurements")
    slots = relationship("ProcurementSlot", back_populates="procurement")


class ProcurementSlot(Base):
    __tablename__ = "procurement_slots"

    id = Column(Integer, primary_key=True, index=True)
    procurement_id = Column(Integer, ForeignKey("procurements.id", ondelete="CASCADE"), nullable=False, index=True)
    collection_center_id = Column(Integer, ForeignKey("collection_centers.id"), nullable=False)
    slot_date = Column(Date, nullable=False)
    start_time = Column(String(10))  # HH:MM
    end_time = Column(String(10))    # HH:MM
    capacity = Column(Float, nullable=False)  # max quantity in kg
    allocated_quantity = Column(Float, default=0)
    status = Column(String(20), default="open")  # open, full, closed, cancelled
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    procurement = relationship("Procurement", back_populates="slots")
    collection_center = relationship("CollectionCenter", back_populates="procurement_slots")
    allocations = relationship("SlotAllocation", back_populates="slot")


class SlotAllocation(Base):
    __tablename__ = "slot_allocations"

    id = Column(Integer, primary_key=True, index=True)
    slot_id = Column(Integer, ForeignKey("procurement_slots.id", ondelete="CASCADE"), nullable=False, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False, index=True)
    allocated_quantity = Column(Float, nullable=False)
    allocation_score = Column(Float)
    distance_km = Column(Float)
    status = Column(String(20), default="pending")  # pending, approved, rejected, confirmed, cancelled
    admin_notes = Column(Text)
    farmer_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    slot = relationship("ProcurementSlot", back_populates="allocations")
    farmer = relationship("Farmer", back_populates="slot_allocations")
