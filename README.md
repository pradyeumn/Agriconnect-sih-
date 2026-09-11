# AgriConnect – Smart Farmer Procurement & Sales Management System

A full-stack web application designed to connect Indian farmers with government/institutional procurement centers and direct wholesale buyers using spatial GIS mapping, real-time crop inventory tracking, and an automated Smart Allocation Engine.

---

## 🌟 Key Features & Role Portals

### 🛠️ 1. Admin Portal (`/admin`)
- **Dashboard Overview**: Key KPI counters for registered farmers, verified buyers, total quintals available, active procurement requests, and gross trade revenue.
- **Farmers Directory (`/admin/farmers`)**: Searchable list of farmers with crop details, farm sizes, district filters, and interactive reliability score manager.
- **Buyers Directory (`/admin/buyers`)**: Verified wholesale buyer contacts and delivery locations.
- **Global Inventory Monitor (`/admin/inventory`)**: Real-time tracking of crop availability, quality grades (Grade A/B/C), and harvest dates across all farms.
- **Procurement Requirements (`/admin/procurement`)**: Create government or bulk procurement orders with target dates and required crop volumes.
- **Procurement Slots (`/admin/slots`)**: Set up intake dates and capacity quotas at collection depots.
- **Smart Allocation Engine (`/admin/allocations`)**: Interactive multi-factor scoring matrix ranking farmers from 0 to 100 for slot assignment:
  - **Distance Score (40%)**: Haversine formula calculation from farm GPS to depot.
  - **Quantity Match (30%)**: Volume match against slot capacity.
  - **Slot Availability (20%)**: Intake quota status.
  - **Farmer Reliability (10%)**: Historical score rating.
- **Collection Centers (`/admin/collection-centers`)**: CRUD for government procurement depots.
- **Orders Management (`/admin/orders`)**: Monitor buyer orders and update status (Pending, Confirmed, Shipped, Delivered).
- **Analytics & Reports (`/admin/analytics`)**: Recharts visualizations for crop distribution, monthly procurement trends, and district supply capacity.
- **GIS Spatial Map (`/admin/map`)**: Full-screen OpenStreetMap + Leaflet map plotting farmers, collection depots, and buyers.

### 🚜 2. Farmer Portal (`/farmer`)
- **Dashboard Overview (`/farmer`)**: Quick stats on listed crops, allocated intake slots, reliability rating, and total sales.
- **Produce Inventory Manager (`/farmer/inventory`)**: List harvested crop batches with price per quintal, quality grade, harvest/expiry dates, and available quantity.
- **Intake Slot Confirmation (`/farmer/procurement`)**: View slots allocated by the Smart Engine and confirm delivery appointments.
- **Direct Buyer Orders (`/farmer/orders`)**: Purchase orders received directly from buyers.
- **Sales Ledger (`/farmer/sales`)**: Financial revenue breakdown between MSP procurement payouts and direct buyer orders.
- **Notifications (`/farmer/notifications`)**: Real-time alerts on slot allocations and buyer purchases.

### 🛒 3. Buyer Portal (`/buyer`)
- **Dashboard (`/buyer`)**: Quick access to marketplace, active cart, and nearby farms.
- **Fresh Produce Marketplace (`/buyer/marketplace`)**: Searchable product grid with category pills (Vegetables, Grains, Fruits, Pulses, Spices), quality grade filters, and instant add-to-cart.
- **Nearby Farmers Map (`/buyer/map`)**: Interactive spatial map of local farmers to minimize freight distance.
- **Shopping Cart (`/buyer/cart`)**: Real-time quantity adjustments (Quintals) and total pricing calculation.
- **Checkout (`/buyer/checkout`)**: Delivery address confirmation and Escrow Bank Transfer / APMC Mandi Credit payment terms.
- **Order Tracking (`/buyer/orders`)**: Live order status tracker.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 15 (App Router, TypeScript) |
| **Styling & UI** | Tailwind CSS + Custom Design System |
| **Charts** | Recharts |
| **Maps** | Leaflet + OpenStreetMap (React-Leaflet) |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **Backend Framework** | FastAPI (Python 3.11+) |
| **Database** | Async SQLAlchemy (PostgreSQL / SQLite fallback) |
| **Authentication** | JWT (JSON Web Tokens) + Passlib (Bcrypt hashing) |
| **Validation** | Pydantic v2 |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18 or higher
- **Python**: v3.11 or higher

---

### 2. Backend Setup & Startup

```bash
# Move to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run seed data script (Populates Admin, Farmers, Buyers, Products, Depots)
python seed_data.py

# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

---

### 3. Frontend Setup & Startup

```bash
# Move to frontend directory
cd frontend

# Install Node dependencies (if not already installed)
npm install

# Start Next.js development server
npm run dev
```
Frontend web application available at: `http://localhost:3000`

---

## 🔑 Demo Account Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@agriconnect.in` | `admin123` |
| **Farmer 1** | `farmer1@agriconnect.in` | `farmer123` |
| **Farmer 2** | `farmer2@agriconnect.in` | `farmer123` |
| **Wholesale Buyer** | `buyer1@agriconnect.in` | `buyer123` |

---

## 📐 Smart Allocation Formula

The Smart Allocation Engine computes candidate farmer rankings using the following weight matrix:

$$\text{Score} = (W_{\text{dist}} \times S_{\text{dist}}) + (W_{\text{qty}} \times S_{\text{qty}}) + (W_{\text{avail}} \times S_{\text{avail}}) + (W_{\text{rel}} \times S_{\text{rel}})$$

Where:
- $W_{\text{dist}} = 0.40$ (Normalized inverse Haversine distance)
- $W_{\text{qty}} = 0.30$ (Produce quantity match against target slot capacity)
- $W_{\text{avail}} = 0.20$ (Harvest freshness & slot window availability)
- $W_{\text{rel}} = 0.10$ (Farmer historical reliability rating $0-100$)
