// API Service Layer for AgriConnect
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("agriconnect_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("agriconnect_token");
      localStorage.removeItem("agriconnect_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function formatErrorMessage(err: any, fallback = "An error occurred"): string {
  if (!err) return fallback;
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => (typeof d === "string" ? d : d.msg || d.message || JSON.stringify(d))).join(", ");
  }
  if (detail && typeof detail === "object") {
    return detail.msg || detail.message || JSON.stringify(detail);
  }
  return err.message || fallback;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  registerFarmer: (payload: Record<string, unknown>) =>
    api.post("/auth/register/farmer", payload).then((r) => r.data),

  registerBuyer: (payload: Record<string, unknown>) =>
    api.post("/auth/register/buyer", payload).then((r) => r.data),

  loginFarmerPost: (user: Record<string, unknown>, farmer: Record<string, unknown>) =>
    api.post("/auth/register/farmer", { ...user, ...farmer }),

  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),

  me: () => api.get("/auth/me").then((r) => r.data),
};

// ── Farmers ───────────────────────────────────────────────────────────────────
export const farmersApi = {
  list: (params?: Record<string, string>) =>
    api.get("/farmers/", { params }).then((r) => r.data),

  getAll: (params?: Record<string, string>) =>
    api.get("/farmers/", { params }),

  me: () => api.get("/farmers/me").then((r) => r.data),

  update: (data: Record<string, unknown>) =>
    api.put("/farmers/me", data).then((r) => r.data),

  updateScore: (id: number, score: number) =>
    api.put("/farmers/me", { reliability_score: score }).then((r) => r.data),

  get: (id: number) => api.get(`/farmers/${id}`).then((r) => r.data),
};

// ── Buyers ────────────────────────────────────────────────────────────────────
export const buyersApi = {
  list: (params?: Record<string, string>) =>
    api.get("/buyers/", { params }).then((r) => r.data),

  getAll: (params?: Record<string, string>) =>
    api.get("/buyers/", { params }),

  me: () => api.get("/buyers/me").then((r) => r.data),

  update: (data: Record<string, unknown>) =>
    api.put("/buyers/me", data).then((r) => r.data),

  get: (id: number) => api.get(`/buyers/${id}`).then((r) => r.data),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  list: () => api.get("/products/").then((r) => r.data),
  getAll: () => api.get("/products/"),
  create: (data: Record<string, unknown>) =>
    api.post("/products/", data).then((r) => r.data),
};

// ── Inventory ─────────────────────────────────────────────────────────────────
export const inventoryApi = {
  list: (params?: Record<string, unknown>) =>
    api.get("/inventory/", { params }).then((r) => r.data),

  getAll: (params?: Record<string, unknown>) =>
    api.get("/inventory/", { params }),

  create: (data: Record<string, unknown>) =>
    api.post("/inventory/", data).then((r) => r.data),

  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/inventory/${id}`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`/inventory/${id}`),

  uploadImage: (id: number, formData: FormData) =>
    api.post(`/inventory/${id}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  list: (params?: Record<string, string>) =>
    api.get("/orders/", { params }).then((r) => r.data),

  getAll: (params?: Record<string, string>) =>
    api.get("/orders/", { params }),

  get: (id: number) => api.get(`/orders/${id}`).then((r) => r.data),

  place: (data: Record<string, unknown>) =>
    api.post("/orders/", data).then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post("/orders/", data).then((r) => r.data),

  updateStatus: (id: number, status: string, notes?: string) =>
    api.patch(`/orders/${id}/status`, { status, notes }).then((r) => r.data),

  farmerAction: (id: number, action: string, notes?: string) =>
    api.patch(`/orders/${id}/farmer-action`, { action, notes }).then((r) => r.data),

  cancel: (id: number) => api.patch(`/orders/${id}/cancel`).then((r) => r.data),
};

// ── Procurement ───────────────────────────────────────────────────────────────
export const procurementApi = {
  list: (params?: Record<string, string>) =>
    api.get("/procurement/", { params }).then((r) => r.data),

  getAllRequirements: (params?: Record<string, string>) =>
    api.get("/procurement/", { params }),

  createRequirement: (data: Record<string, unknown>) =>
    api.post("/procurement/", data).then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post("/procurement/", data).then((r) => r.data),

  get: (id: number) => api.get(`/procurement/${id}`).then((r) => r.data),

  // Slots
  listAllSlots: () => api.get("/procurement/slots/all").then((r) => r.data),

  getAllSlots: () => api.get("/procurement/slots/all"),

  listMySlots: () => api.get("/procurement/slots/my").then((r) => r.data),

  createSlot: (data: Record<string, unknown>) =>
    api.post("/procurement/slots", data).then((r) => r.data),

  runSmartAllocation: (slotId: number) =>
    api.get(`/procurement/slots/${slotId}/recommend`).then((r) => r.data),

  recommendFarmers: (slotId: number) =>
    api.get(`/procurement/slots/${slotId}/recommend`).then((r) => r.data),

  allocateFarmer: (slotId: number, farmerId: number, quantity: number) =>
    api.post(`/procurement/slots/${slotId}/allocate`, null, {
      params: { farmer_id: farmerId, quantity },
    }).then((r) => r.data),

  // Allocations
  listAllocations: (params?: Record<string, unknown>) =>
    api.get("/procurement/allocations/", { params }).then((r) => r.data),

  getAllAllocations: (params?: Record<string, unknown>) =>
    api.get("/procurement/allocations/", { params }),

  getFarmerAllocations: () =>
    api.get("/procurement/allocations/"),

  confirmFarmerAllocation: (id: number, notes?: string) =>
    api.patch(`/procurement/allocations/${id}/farmer-action`, { action: "confirm", notes }).then((r) => r.data),

  approveAllocation: (id: number, quantity?: number, notes?: string) =>
    api.patch(`/procurement/allocations/${id}/admin-action`, { action: "approve", quantity, notes }).then((r) => r.data),

  rejectAllocation: (id: number, notes?: string) =>
    api.patch(`/procurement/allocations/${id}/admin-action`, { action: "reject", notes }).then((r) => r.data),

  adminAllocationAction: (id: number, action: string, notes?: string, quantity?: number) =>
    api.patch(`/procurement/allocations/${id}/admin-action`, {
      action, notes, quantity,
    }).then((r) => r.data),

  farmerAllocationAction: (id: number, action: string, notes?: string) =>
    api.patch(`/procurement/allocations/${id}/farmer-action`, { action, notes }).then((r) => r.data),
};

// ── Collection Centers ────────────────────────────────────────────────────────
export const collectionCentersApi = {
  list: () => api.get("/collection-centers/").then((r) => r.data),

  getAll: () => api.get("/collection-centers/"),

  create: (data: Record<string, unknown>) =>
    api.post("/collection-centers/", data).then((r) => r.data),

  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/collection-centers/${id}`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`/collection-centers/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (unreadOnly = false) =>
    api.get("/notifications/", { params: { unread_only: unreadOnly } }).then((r) => r.data),

  getAll: (unreadOnly = false) =>
    api.get("/notifications/", { params: { unread_only: unreadOnly } }),

  markRead: (id: number) => api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAsRead: (id: number) => api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () => api.patch("/notifications/read-all").then((r) => r.data),

  count: () => api.get("/notifications/count").then((r) => r.data),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboardOverview: () => api.get("/analytics/admin/overview"),
  adminOverview: () => api.get("/analytics/admin/overview").then((r) => r.data),
  getCropAnalytics: () => api.get("/analytics/admin/crop-inventory"),
  cropInventory: () => api.get("/analytics/admin/crop-inventory").then((r) => r.data),
  monthlySales: () => api.get("/analytics/admin/monthly-sales").then((r) => r.data),
  locationSupply: () => api.get("/analytics/admin/location-supply").then((r) => r.data),
  farmerOverview: () => api.get("/analytics/farmer/overview").then((r) => r.data),
  buyerOverview: () => api.get("/analytics/buyer/overview").then((r) => r.data),
};

export default api;
