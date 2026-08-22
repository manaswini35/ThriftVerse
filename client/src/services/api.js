import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Runs before every request
api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// A 401 means the token is gone, expired or forged — there is nothing to
// retry, so drop it and let AuthContext reset the UI to logged-out. Without
// this an expired token sits in localStorage failing every request forever.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && localStorage.getItem("token")) {
            localStorage.removeItem("token");
            window.dispatchEvent(new Event("auth:logout"));
        }

        return Promise.reject(error);
    }
);

export function errorText(err, fallback) {
    return err?.response?.data?.message || fallback;
}

export default api;
