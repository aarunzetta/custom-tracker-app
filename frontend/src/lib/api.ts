import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let getTokenFn: (() => Promise<string | null>) | null = null;

export function registerGetToken(fn: () => Promise<string | null>) {
  getTokenFn = fn;
}

// runs before every single request
api.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    const token = await getTokenFn();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
