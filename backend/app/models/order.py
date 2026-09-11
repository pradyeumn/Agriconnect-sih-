from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(30), default="pending")
    # Status flow: pending -> confirmed -> packed -> dispatched -> delivered -> completed
    # Or: pending -> cancelled
    # Farmer actions: pending -> accepted / rejected
    farmer_status = Column(String(20), default="pending")  # pending, accepted, rejected

    total_amount = Column(Float, nullable=False)
    delivery_address = Column(String(500))
    delivery_lat = Column(Float)
    delivery_lng = Column(Float)
    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    buyer = relationship("Buyer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    price_per_unit = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    inventory = relationship("Inventory", back_populates="order_items")
