import { createAxios } from "@blocklet/js-sdk";

const api = createAxios({});

api.interceptors.request.use(
  (config) => {
    config.timeout = 200000;
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
