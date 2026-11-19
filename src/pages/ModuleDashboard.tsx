import { useState } from "react";
import { DashboardShell } from "../components/layout/DashboardShell";
import { FilterBar } from "../components/filters/FilterBar";
import type { DashboardPage } from "../components/layout/DashboardSidebar";
import type { StaffingFilters } from "../services/staffingFilters";

type ModulePage = Exclude<DashboardPage, "headcount" | "turnover">;

const modules: Record<ModulePage, { title: string; description: string; metrics: string[]; panels: string[] }> = {
    overview: {
        title: "TỔNG QUAN NHÂN SỰ",
        description: "Một góc nhìn tổng hợp từ HC, nghỉ việc, tuyển dụng, chấm công và tiền lương.",
        metrics: ["Nhân sự hiện tại", "Nhân sự kế hoạch", "Nhân sự mới", "Nhân sự nghỉ", "Tỷ lệ nghỉ việc"],
        panels: ["Xu hướng nhân sự theo tháng", "Cơ cấu nhân sự theo miền", "Tổng hợp hiệu quả vận hành"],
    },
    recruitment: {
        title: "QUẢN LÝ TUYỂN DỤNG",
        description: "Theo dõi nhu cầu và tiến độ xử lý tuyển dụng theo dự án, khu vực và vị trí.",
        metrics: ["Tổng yêu cầu", "Đang xử lý", "Đã hoàn thành", "Đúng hạn", "Trễ hạn"],
        panels: ["Phễu tuyển dụng", "Hiệu quả tuyển dụng", "Chi tiết yêu cầu theo dự án"],
    },
    attendance: {
        title: "QUẢN LÝ CHẤM CÔNG",
        description: "Đối chiếu nhân sự chấm công thực tế với kế hoạch theo kỳ.",
        metrics: ["Lượt chấm công thực tế", "Lượt chấm công kế hoạch", "Tỷ lệ hoàn thành", "Thiếu chấm công"],
        panels: ["Xu hướng chấm công", "Hiệu suất theo miền", "Danh sách cần kiểm tra"],
    },
    payroll: {
        title: "TỔNG QUAN QUỸ LƯƠNG VÀ CHI PHÍ",
        description: "Theo dõi quỹ lương và chi phí nhân sự theo kỳ, dự án và vùng.",
        metrics: ["Tổng quỹ lương", "Lương Gross", "Lương Net", "Chi phí công ty", "Chi phí / nhân sự"],
        panels: ["Xu hướng chi phí theo tháng", "Cơ cấu lương và phụ cấp", "Chi phí theo dự án"],
    },
};

const panelStyle = {
    background: "#FFFFFF",
    border: "1px solid #D7E4F4",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 2px 6px rgba(0,31,130,0.04)",
};

interface Props {
    page: ModulePage;
    onPageChange: (page: DashboardPage) => void;
    filters: StaffingFilters;
    onFiltersChange: (next: StaffingFilters) => void;
}

export function ModuleDashboard({ page, onPageChange, filters, onFiltersChange }: Props) {
    const [period, setPeriod] = useState<"MTD" | "YTD">("YTD");
    const module = modules[page];

    return (
        <DashboardShell
            activePage={page}
            onPageChange={onPageChange}
            filters={<FilterBar period={period} onPeriodChange={setPeriod} filters={filters} onFiltersChange={onFiltersChange} />}
        >
            <div style={{ display: "grid", gap: 15 }}>
                <div style={panelStyle}>
                    <div style={{ color: "#001F82", fontSize: 15, fontWeight: 800 }}>{module.title}</div>
                    <p style={{ color: "#60718A", fontSize: 12, marginBottom: 0 }}>{module.description}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 12 }}>
                    {module.metrics.map((metric) => (
                        <div key={metric} style={panelStyle}>
                            <div style={{ color: "#50617C", fontSize: 11, fontWeight: 600 }}>{metric}</div>
                            <div style={{ color: "#001F82", fontSize: 28, fontWeight: 800, marginTop: 12 }}>—</div>
                            <div style={{ color: "#8090A6", fontSize: 10 }}>Chờ dữ liệu từ Semantic Model</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
                    {module.panels.map((panel) => (
                        <section key={panel} style={{ ...panelStyle, minHeight: 210 }}>
                            <div style={{ color: "#001F82", fontSize: 12, fontWeight: 800 }}>{panel}</div>
                            <div style={{ minHeight: 150, display: "grid", placeItems: "center", textAlign: "center", color: "#8292A9", fontSize: 12 }}>
                                Chưa có dữ liệu kết nối. Không hiển thị số liệu giả.
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </DashboardShell>
    );
}
