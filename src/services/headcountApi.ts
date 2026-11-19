import type { StaffingFilters, StaffingFilterOptions } from "./staffingFilters";

/** Hợp đồng API giữa UI và backend; KHÔNG đặt Power BI token trong frontend. */
export interface HeadcountKpis {
    actual: number | null;
    plan: number | null;
    hires: number | null;
    exits: number | null;
    turnoverRate: number | null;
}

export interface HeadcountResponse {
    period: "MTD" | "YTD";
    filters: StaffingFilters;
    kpis: HeadcountKpis;
    source: "powerbi";
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal, credentials: "same-origin" });
    if (!response.ok) throw new Error(`Backend trả HTTP ${response.status}`);
    return response.json() as Promise<T>;
}

/** Chỉ gọi khi backend /api/powerbi đã được cấu hình xác thực. */
export function fetchHeadcountKpis(
    filters: StaffingFilters,
    period: "MTD" | "YTD",
    signal?: AbortSignal,
): Promise<HeadcountResponse> {
    const params = new URLSearchParams({ ...filters, period });
    return getJson<HeadcountResponse>(`/api/powerbi/headcount?${params}`, signal);
}

/** Danh mục phải do semantic model trả về, không suy từ demo. */
export function fetchStaffingFilterOptions(signal?: AbortSignal): Promise<StaffingFilterOptions> {
    return getJson<StaffingFilterOptions>("/api/powerbi/filter-options", signal);
}
