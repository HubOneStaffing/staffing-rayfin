
import type { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import type { DashboardPage } from "./DashboardSidebar";

interface DashboardShellProps {
    header?: ReactNode;
    filters?: ReactNode;
    children: ReactNode;
    activePage?: DashboardPage;
    onPageChange?: (page: DashboardPage) => void;
}

const TEXT_BLUE = "#001F82";

const HEADER_GRADIENT =
    "linear-gradient(110deg, #123D91 0%, #1749AC 45%, #2563EB 100%)";

const menus: { label: string; page: DashboardPage }[] = [
    { label: "Tổng quan", page: "overview" },
    { label: "Quản trị nhân sự", page: "headcount" },
    { label: "Tuyển dụng", page: "recruitment" },
    { label: "Chấm công", page: "attendance" },
    { label: "Tiền lương", page: "payroll" },
];

const pageHeadings: Record<DashboardPage, { title: string; subtitle: string }> = {
    overview: { title: "STAFFING OVERVIEW", subtitle: "Tổng quan nguồn nhân lực" },
    headcount: { title: "HEADCOUNT MANAGEMENT", subtitle: "Nhân sự hiện tại & Cơ cấu nhân sự" },
    turnover: { title: "TURNOVER MANAGEMENT", subtitle: "Biến động và tỷ lệ nghỉ việc" },
    recruitment: { title: "RECRUITMENT MANAGEMENT", subtitle: "Hiệu quả và tiến độ tuyển dụng" },
    attendance: { title: "ATTENDANCE MANAGEMENT", subtitle: "Theo dõi chấm công và hiện diện" },
    payroll: { title: "PAYROLL MANAGEMENT", subtitle: "Tổng quan quỹ lương và chi phí" },
};

export function DashboardShell({
    header,
    filters,
    children,
    activePage = "headcount",
    onPageChange,
}: DashboardShellProps) {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#EEF7FF",
                fontFamily: "Segoe UI, sans-serif",
            }}
        >
            {/* =====================================
                VÙNG CỐ ĐỊNH
                HEADER + STATUS + FILTER
               ===================================== */}

            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                    width: "100%",
                    background: "#FFFFFF",
                    boxShadow:
                        "0 2px 8px rgba(0,31,130,0.08)",
                }}
            >
                {/* =====================================
                    HEADER CHÍNH
                   ===================================== */}

                <header
                    style={{
                        minHeight: 48,
                        background: HEADER_GRADIENT,
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        padding: "7px 16px",
                        boxSizing: "border-box",
                    }}
                >
                    {/* LOGO + TÊN */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            minWidth: 250,
                        }}
                    >
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 7,
                                background:
                                    "rgba(255,255,255,0.22)",
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                            }}
                        >
                            <svg
                                width="21"
                                height="21"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="8"
                                    cy="8"
                                    r="3"
                                    fill="#FFFFFF"
                                />

                                <circle
                                    cx="17"
                                    cy="9"
                                    r="2.5"
                                    fill="#FFFFFF"
                                    opacity="0.85"
                                />

                                <path
                                    d="M2.5 19c0-4 2.2-6 5.5-6s5.5 2 5.5 6"
                                    fill="#FFFFFF"
                                />

                                <path
                                    d="M13 18c.3-3 1.8-4.5 4-4.5 2.5 0 4 1.7 4 4.5"
                                    fill="#FFFFFF"
                                    opacity="0.8"
                                />
                            </svg>
                        </div>

                        <div>
                            <div
                                style={{
                                    fontSize: 15,
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                    whiteSpace: "nowrap",
                                    letterSpacing: 0.2,
                                }}
                            >
                                    {pageHeadings[activePage].title}
                            </div>

                            <div
                                style={{
                                    marginTop: 3,
                                    fontSize: 9,
                                    color: "#DCE8FF",
                                }}
                            >
                                {pageHeadings[activePage].subtitle}
                            </div>
                        </div>
                    </div>

                    {/* MENU ĐIỀU HƯỚNG */}

                    <nav
                        aria-label="Điều hướng chính"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 5,
                            flexWrap: "wrap",
                        }}
                    >
                        {menus.map((menu) => {
                            const active =
    activePage === menu.page ||
    (activePage === "turnover" && menu.page === "headcount");

                            return (
                                <button
                                    type="button"
                                    key={menu.page}
                                    onClick={() => onPageChange?.(menu.page)}
                                    title={menu.label}
                                    aria-current={
                                        active ? "page" : undefined
                                    }
                                    style={{
                                        padding: "7px 11px",
                                        borderRadius: 18,
                                        background: active
                                            ? "#FFFFFF"
                                            : "transparent",
                                        color: active
                                            ? TEXT_BLUE
                                            : "#E6EEFF",
                                        fontSize: 10,
                                        fontWeight: active
                                            ? 700
                                            : 500,
                                        whiteSpace: "nowrap",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    {menu.label}
                                </button>
                            );
                        })}

                        {/* USER HR */}

                        <div
                            title="Tài khoản HR (demo)"
                            style={{
                                width: 27,
                                height: 27,
                                borderRadius: "50%",
                                background:
                                    "rgba(255,255,255,0.22)",
                                display: "grid",
                                placeItems: "center",
                                fontSize: 10,
                                fontWeight: 700,
                                marginLeft: 5,
                            }}
                        >
                            HR
                        </div>
                    </nav>
                </header>

                {/* =====================================
                    TRẠNG THÁI DỮ LIỆU
                   ===================================== */}

                <div
                    style={{
                        minHeight: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                        padding: "6px 16px",
                        background: "#FFFFFF",
                        borderBottom:
                            "1px solid #D9E2EC",
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 9,
                        }}
                    >
                        <span
                            style={{
                                color: "#E8A018",
                                fontSize: 11,
                            }}
                        >
                            ●
                        </span>

                        <span
                            style={{
                                fontSize: 10,
                                fontWeight: 800,
                                color: "#344054",
                            }}
                        >
                            TRẠNG THÁI DỮ LIỆU
                        </span>

                        {/* DEMO BADGE */}

                        <span
                            style={{
                                padding: "3px 7px",
                                borderRadius: 5,
                                background: "#E8EEFF",
                                color: TEXT_BLUE,
                                fontSize: 9,
                                fontWeight: 700,
                            }}
                        >
                            DEMO
                        </span>

                        {/* KỲ DỮ LIỆU */}

                        <span
                            style={{
                                color: "#667085",
                                fontSize: 10,
                            }}
                        >
                            Dữ liệu gần nhất:{" "}
                            <strong
                                style={{
                                    color: TEXT_BLUE,
                                }}
                            >
                                T10/2026
                            </strong>
                        </span>

                        {/* REFRESH STATUS */}

                        <span
                            style={{
                                color: "#667085",
                                fontSize: 10,
                            }}
                        >
                            Refreshed at:{" "}
                            <strong
                                style={{
                                    color: TEXT_BLUE,
                                }}
                            >
                                Chưa refresh
                            </strong>
                        </span>

                        {/* THÔNG BÁO */}

                        <span
                            style={{
                                color: "#98A2B3",
                                fontSize: 9,
                            }}
                        >
                            Bản preview tĩnh để duyệt UI —
                            chưa kết nối Microsoft Fabric.
                        </span>
                    </div>

                    {/* REFRESH BUTTON */}

                    <button
                        type="button"
                        disabled
                        title="Chức năng refresh sẽ hoạt động sau khi kết nối dữ liệu"
                        style={{
                            background:
                                "linear-gradient(110deg, #1749AC 0%, #2563EB 100%)",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: 6,
                            padding: "7px 12px",
                            fontSize: 10,
                            fontWeight: 700,
                            opacity: 0.65,
                            cursor: "not-allowed",
                            boxShadow:
                                "0 2px 5px rgba(0,31,130,0.12)",
                        }}
                    >
                        Refresh Data (demo)
                    </button>
                </div>

                {/* HEADER MỞ RỘNG */}
                {header}

                {/* =====================================
                    BỘ LỌC CỐ ĐỊNH
                   ===================================== */}

                {filters && (
                    <div
                        style={{
                            width: "100%",
                            padding: 0,
                            margin: 0,
                            boxSizing: "border-box",
                        }}
                    >
                        {filters}
                    </div>
                )}
            </div>

            {/* =====================================
                MAIN LAYOUT: SIDEBAR + DASHBOARD
               ===================================== */}

            <div
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 12,
                    padding: "12px 16px 24px",
                    boxSizing: "border-box",
                    width: "100%",
                }}
            >
                {/* SIDEBAR */}
                <DashboardSidebar
                    activePage={activePage}
                    onPageChange={onPageChange}
                />

                {/* DASHBOARD CONTENT */}
                <main
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}






