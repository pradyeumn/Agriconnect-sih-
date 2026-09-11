from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Text, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)

    # Quantity tracking (all in base unit)
    quantity_available = Column(Float, nullable=False, default=0)
    quantity_reserved = Column(Float, nullable=False, default=0)
    quantity_sold = Column(Float, nullable=False, default=0)

    price_per_unit = Column(Float, nullable=False)
    grade = Column(String(10), default="A")  # A, B, C
    harvest_date = Column(Date)
    expiry_date = Column(Date)
    status = Column(String(20), default="available")  # available, reserved, sold, expired, unavailable
    description = Column(Text)
    image_url = Column(String(500))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Constraints to prevent negative quantities
    __table_args__ = (
        CheckConstraint("quantity_available >= 0", name="check_qty_available_non_negative"),
        CheckConstraint("quantity_reserved >= 0", name="check_qty_reserved_non_negative"),
        CheckConstraint("quantity_sold >= 0", name="check_qty_sold_non_negative"),
    )

    # Relationships
    farmer = relationship("Farmer", back_populates="inventory")
    product = relationship("Product", back_populates="inventory")
    order_items = relationship("OrderItem", back_populates="inventory")
