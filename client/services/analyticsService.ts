import api from "./api";
import type { AnalyticsData, ApiResponse } from "@/lib/types";

export const getAnalytics = (): Promise<ApiResponse<AnalyticsData>> => api.get("/analytics").then((r) => r.data);
