import axios from "axios";
import type { AxiosResponse, AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
	baseURL: process.env.API_BASE_URL || "http://localhost:8082",
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

// 클라이언트 사이드
export const fetchModels = (): Promise<AxiosResponse<unknown>> => api.get(`/model`);
