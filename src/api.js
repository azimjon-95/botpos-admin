import axios from "axios";

const BASE = process.env.REACT_APP_API_BASE || "";

const api = axios.create({ baseURL: `${BASE}/api/admin`, timeout: 20000 });

api.interceptors.request.use(cfg => {
    const token = localStorage.getItem("bp_token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

api.interceptors.response.use(
    r => r,
    async err => {
        const status = err.response?.status;

        // Login sahifasida 401 bo'lsa — chiqib ketma
        if (window.location.pathname === "/login") {
            return Promise.reject(err?.response?.data?.error || err.message);
        }

        if (status === 401) {
            const refreshToken = localStorage.getItem("bp_refresh");
            if (refreshToken) {
                try {
                    const BASE2 = process.env.REACT_APP_API_BASE_URL
                               || process.env.REACT_APP_API_BASE
                               || "http://localhost:6060";
                    const r = await axios.post(`${BASE2}/api/admin/refresh`, { refresh: refreshToken });
                    const t = r.data?.data?.token;
                    if (t) {
                        localStorage.setItem("bp_token", t);
                        err.config.headers.Authorization = `Bearer ${t}`;
                        return axios(err.config);
                    }
                } catch {}
            }
            // Refresh ham ishlamadi — logout
            localStorage.removeItem("bp_token");
            localStorage.removeItem("bp_refresh");
            window.location.href = "/login";
        }
        return Promise.reject(err?.response?.data?.error || err.message);
    }
);

const r = (method, url, data, params) => api({ method, url, data, params }).then(r => r.data?.data ?? r.data);

// Auth
export const login    = (email, password) => api.post("/login", { email, password });
export const refresh  = (token)           => api.post("/refresh", { refresh: token });

// Shops CRUD
export const getShops    = (p)     => r("get",   "/shops", null, p);
export const getShop     = (id)    => r("get",   `/shops/${id}`);
export const createShop  = (data)  => r("post",  "/shops", data);
export const updateShop  = (id, d) => r("put",   `/shops/${id}`, d);
export const deleteShop  = (id)    => r("delete",`/shops/${id}`);
export const toggleShop  = (id)    => r("patch", `/shops/${id}/toggle`);
export const restartBot  = (id)    => r("post",  `/shops/${id}/restart`);

// Stats
export const getStats    = ()      => r("get", "/stats");
export const getAudit    = (p)     => r("get", "/audit", null, p);
export const getBotStatus= ()      => r("get", "/bots/status");

// OpenAI xarajat
export const getOpenAICost = (p)   => r("get", "/openai/cost", null, p);

// Workers CRUD (do'kon ichida)
export const getWorkers   = (shopId) => r("get",   `/shops/${shopId}/workers`);
export const createWorker = (shopId, d) => r("post", `/shops/${shopId}/workers`, d);
export const updateWorker = (shopId, wId, d) => r("put", `/shops/${shopId}/workers/${wId}`, d);
export const deleteWorker = (shopId, wId)    => r("delete", `/shops/${shopId}/workers/${wId}`);

// Customers (do'kon ichida)
export const getCustomers = (shopId, p) => r("get", `/shops/${shopId}/customers`, null, p);
export const blockCustomer= (shopId, cId) => r("patch", `/shops/${shopId}/customers/${cId}/block`);

export default api;
