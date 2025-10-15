import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    loading: false,
    checkingAuth: false,

    handleUser: (user, isUser, loading = false) => {
        if (isUser) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
        set({ user: isUser ? user : null, loading });
    },

    signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true });

        if (password !== confirmPassword) {
            set({ loading: false });
            return toast.error("Passwords do not match");
        }

        try {
            const res = await axios.post("/auth/signup", { name, email, password });
            get().handleUser(res.data.user, true);
            toast.success(res.data.message || "Signup successful");
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            set({ loading: false });
        }
    },

    login: async ({ email, password }) => {
        set({ loading: true });

        if (!email.trim() || !password.trim()) {
            set({ loading: false });
            return toast.error("Email and password required");
        }

        try {
            const res = await axios.post("/auth/login", { email, password });
            get().handleUser(res.data.user, true);
            toast.success(res.data.message || "Login successful");
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        set({ loading: true });
        try {
            const res = await axios.post("/auth/logout");
            get().handleUser(null, false);
            toast.success(res.data.message || "Logged out");
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        } finally {
            set({ loading: false });
        }
    },

    checkAuth: async () => {
        set({ checkingAuth: true });
        try {
            const res = await axios.get("/auth/profile");
            get().handleUser(res.data, true);
            set({ checkingAuth: false });
        } catch {
            set({ user: null });
        } finally {
            set({ checkingAuth: false });
        }
    },

    refreshToken: async () => {
        if (get().checkingAuth) return;

        set({ checkingAuth: true });
        try {
            const response = await axios.post("/auth/refresh-token");
            set({ checkingAuth: false });
            return response.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            throw error;
        }
    },
}));


// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // If a refresh is already in progress, wait for it to complete
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }

                // Start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login or handle as needed
                useUserStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
