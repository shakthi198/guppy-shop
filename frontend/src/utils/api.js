// frontend/src/utils/api.js
import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost/guppy_shop/backend";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // If baseline is http://localhost/guppy_shop/backend, then image is in http://localhost/guppy_shop
  const serverBase = BASE_URL.replace(/\/backend\/?$/, "");
  return `${serverBase}${path.startsWith("/") ? "" : "/"}${path}`;
};

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("guppy_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("guppy_token");
      localStorage.removeItem("guppy_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ---- Auth ----
export const authAPI = {
  login: (data) => api.post("/login", data),
  register: (data) => api.post("/register", data),
  me: () => api.get("/me"),
};

// ---- Fish ----
export const fishAPI = {
  getAll: (params) => api.get("/fish", { params }),
  getOne: (id) => api.get(`/fish/${id}`),
  create: (data) => api.post("/fish", data),
  update: (id, data) => api.put(`/fish/${id}`, data),
  delete: (id) => api.delete(`/fish/${id}`),
};

// ---- Orders ----
export const orderAPI = {
  create: (data) => api.post("/orders", data),
  getAll: () => api.get("/orders"),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}`, data),
};

// ---- Notifications ----
export const notificationAPI = {
  getAll: () => api.get("/notifications"),
  markRead: (ids) => api.post("/notifications/read", { ids }),
  markAllRead: () => api.post("/notifications/read", {}),
};

// ---- Upload ----
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default api;
