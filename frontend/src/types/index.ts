export interface User {
  id: number;
  email: string;
  role: "admin" | "farmer" | "buyer";
  is_active: boolean;
  created_at?: string;
}

export interface Farmer {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  farm_size?: number;
  crops?: string;
  latitude?: number;
  longitude?: number;
  reliability_score: number;
  profile_image?: string;
  created_at?: string;
  email?: string;
}

export interface Buyer {
  id: number;
  user_id: number;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  profile_image?: string;
  created_at?: string;
  email?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description?: string;
  unit: string;
  image_url?: string;
  created_at?: string;
}

export interface InventoryItem {
  id: number;
  farmer_id: number;
  product_id: number;
  quantity_available: number;
  quantity_reserved: number;
  quantity_sold: number;
  price_per_unit: number;
  grade: string;
  harvest_date?: string;
  expiry_date?: string;
  status: "available" | "reserved" | "sold" | "expired" | "unavailable";
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  product?: Product;
  farmer?: Farmer;
  farmer_name?: string;
  farmer_location?: string;
  farmer_lat?: number;
  farmer_lng?: number;
  distance_km?: number;
}

export interface OrderItem {
  id: number;
  inventory_id: number;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
  inventory?: InventoryItem;
}

export interface Order {
  id: number;
  buyer_id: number;
  status: string;
  farmer_status: string;
  total_amount: number;
  delivery_address?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items: OrderItem[];
  buyer_name?: string;
  buyer?: Buyer;
}

export interface CollectionCenter {
  id: number;
  name: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  latitude: number;
  longitude: number;
  capacity?: number;
  manager_name?: string;
  manager_phone?: string;
  is_active: number;
}

export interface Procurement {
  id: number;
  product_id: number;
  title: string;
  description?: string;
  required_quantity: number;
  required_by_date?: string;
  min_grade: string;
  price_per_unit?: number;
  status: string;
  created_at?: string;
  product_name?: string;
  product?: Product;
  slots?: ProcurementSlot[];
}

export interface ProcurementSlot {
  id: number;
  procurement_id: number;
  collection_center_id: number;
  slot_date: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  capacity: number;
  allocated_quantity: number;
  status: string;
  notes?: string;
  collection_center_name?: string;
  collection_center?: CollectionCenter;
  procurement_title?: string;
  procurement?: Procurement;
  product_name?: string;
  allocations?: SlotAllocation[];
}

export interface SlotAllocation {
  id: number;
  slot_id: number;
  farmer_id: number;
  allocated_quantity: number;
  allocation_score?: number;
  distance_km?: number;
  status: string;
  admin_notes?: string;
  farmer_notes?: string;
  created_at?: string;
  farmer_name?: string;
  farmer_phone?: string;
  farmer_village?: string;
  farmer?: Farmer;
  slot?: ProcurementSlot;
}

export interface Notification {
  id: number;
  user_id?: number;
  title: string;
  message: string;
  notification_type?: string;
  type?: string;
  is_read: boolean;
  link?: string;
  created_at?: string;
}

export interface CartItem {
  inventory_id: number;
  quantity: number;
  inventory: InventoryItem;
}
