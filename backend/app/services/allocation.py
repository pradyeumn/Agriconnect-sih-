"""
Smart Allocation Engine for AgriConnect
Rule-based farmer allocation with weighted scoring:
  - Distance to collection center: 40%
  - Available Quantity: 30%
  - Slot Availability: 20%
  - Reliability Score: 10%
"""
import math
from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class AllocationCandidate:
    farmer_id: int
    farmer_name: str
    farmer_phone: str
    farmer_village: str
    available_quantity: float
    distance_km: float
    reliability_score: float
    crops: str
    allocation_score: float = 0.0
    recommended_quantity: float = 0.0


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance in kilometers between two coordinates."""
    R = 6371.0  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def normalize_distance_score(distance_km: float, max_distance: float = 100.0) -> float:
    """Convert distance to score: closer = higher score (0-100)."""
    if distance_km <= 0:
        return 100.0
    if distance_km >= max_distance:
        return 0.0
    return max(0.0, 100.0 * (1 - distance_km / max_distance))


def normalize_quantity_score(quantity: float, max_quantity: float) -> float:
    """Higher available quantity = higher score (0-100)."""
    if max_quantity <= 0:
        return 0.0
    return min(100.0, (quantity / max_quantity) * 100)


def calculate_slot_availability_score(
    slot_capacity: float,
    already_allocated: float,
    required_quantity: float
) -> float:
    """Score based on how much of the slot is still available (0-100)."""
    remaining = slot_capacity - already_allocated
    if remaining <= 0:
        return 0.0
    if remaining >= required_quantity:
        return 100.0
    return (remaining / required_quantity) * 100


def calculate_allocation_scores(
    candidates: List[dict],
    slot: dict,
    collection_center: dict,
    required_crop: str,
    required_quantity: float,
) -> List[AllocationCandidate]:
    """
    Main allocation scoring function.
    
    Args:
        candidates: List of farmer dicts with inventory info
        slot: Procurement slot dict (capacity, allocated_quantity)
        collection_center: Dict with lat, lng of the center
        required_crop: Name of the required crop
        required_quantity: Total quantity needed
    
    Returns:
        Ranked list of AllocationCandidate with scores
    """
    if not candidates:
        return []

    center_lat = collection_center.get("latitude", 0)
    center_lng = collection_center.get("longitude", 0)
    slot_capacity = slot.get("capacity", 0)
    slot_allocated = slot.get("allocated_quantity", 0)

    # Build candidate objects
    allocation_candidates = []
    for c in candidates:
        farmer_lat = c.get("latitude") or 0
        farmer_lng = c.get("longitude") or 0
        distance = haversine_distance(farmer_lat, farmer_lng, center_lat, center_lng)

        candidate = AllocationCandidate(
            farmer_id=c["farmer_id"],
            farmer_name=c["name"],
            farmer_phone=c.get("phone", ""),
            farmer_village=c.get("village", ""),
            available_quantity=c.get("available_quantity", 0),
            distance_km=distance,
            reliability_score=c.get("reliability_score", 75.0),
            crops=c.get("crops", ""),
        )
        allocation_candidates.append(candidate)

    # Find max quantity for normalization
    max_quantity = max((c.available_quantity for c in allocation_candidates), default=1)

    # Calculate weighted scores for each candidate
    for candidate in allocation_candidates:
        distance_score = normalize_distance_score(candidate.distance_km)
        quantity_score = normalize_quantity_score(candidate.available_quantity, max_quantity)
        availability_score = calculate_slot_availability_score(
            slot_capacity, slot_allocated, candidate.available_quantity
        )
        reliability_score = min(100.0, candidate.reliability_score)

        # Weighted sum: 40% distance + 30% quantity + 20% availability + 10% reliability
        candidate.allocation_score = (
            distance_score * 0.40
            + quantity_score * 0.30
            + availability_score * 0.20
            + reliability_score * 0.10
        )

        # Recommended quantity: proportional to available, capped at slot remaining and farmer available
        remaining_slot = slot_capacity - slot_allocated
        candidate.recommended_quantity = min(
            candidate.available_quantity,
            remaining_slot,
            required_quantity,
        )

    # Sort by score descending
    allocation_candidates.sort(key=lambda c: c.allocation_score, reverse=True)
    return allocation_candidates


def format_allocation_results(candidates: List[AllocationCandidate]) -> List[dict]:
    """Format results for API response."""
    return [
        {
            "farmer_id": c.farmer_id,
            "farmer_name": c.farmer_name,
            "farmer_phone": c.farmer_phone,
            "farmer_village": c.farmer_village,
            "available_quantity": c.available_quantity,
            "distance_km": round(c.distance_km, 2),
            "reliability_score": c.reliability_score,
            "farmer_reliability": c.reliability_score,
            "allocation_score": round(c.allocation_score, 1),
            "score": round(c.allocation_score, 1),
            "recommended_quantity": round(c.recommended_quantity, 2),
            "recommended_allocation": round(c.recommended_quantity, 2),
            "rank": idx + 1,
        }
        for idx, c in enumerate(candidates)
    ]
