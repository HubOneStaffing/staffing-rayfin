/** Contract bộ lọc chung HC/Turnover, độc lập với giao diện và nguồn dữ liệu. */
export type StaffingFilterKey =
    | "project" | "year" | "month" | "channel" | "region"
    | "province" | "role" | "manager1" | "manager2";

export type StaffingFilters = Record<StaffingFilterKey, string>;

export const DEFAULT_STAFFING_FILTERS: StaffingFilters = {
    project: "", year: "2026", month: "", channel: "", region: "",
    province: "", role: "", manager1: "", manager2: "",
};

export const FILTER_COLUMNS: Record<StaffingFilterKey, string> = {
    project: "D_Project[Project Name]",
    year: "D_Date[Year]",
    month: "D_Date[Month]", // Nhãn UI: D_Date[Tháng TV gọn]
    channel: "D_Channel[Channel]",
    region: "D_Region[Region]",
    province: "D_Province[Province]",
    role: "D_Position[Position]",
    manager1: "D_Manager_L1[Manager Name]",
    manager2: "D_Manager_L2[Manager Name]",
};

export type StaffingFilterOptions = Record<StaffingFilterKey, string[]>;
