from app.models.user import User
from app.models.farmer import Farmer
from app.models.buyer import Buyer
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.order import Order, OrderItem
from app.models.collection_center import CollectionCenter
from app.models.procurement import Procurement, ProcurementSlot, SlotAllocation
from app.models.notification import Notification

__all__ = [
    "User", "Farmer", "Buyer", "Product", "Inventory",
    "Order", "OrderItem", "CollectionCenter",
    "Procurement", "ProcurementSlot", "SlotAllocation",
    "Notification",
]

# This module is imported to register all models with SQLAlchemy metadata
all_models = True
