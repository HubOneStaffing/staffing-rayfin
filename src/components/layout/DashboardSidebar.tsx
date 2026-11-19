import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";

export type DashboardPage = "overview" | "headcount" | "turnover" | "recruitment" | "attendance" | "payroll";

type IconName =
    | "home"
    | "headcount"
    | "turnover"
    | "recruitment"
    | "attendance"
    | "payroll";

type MenuItem = {
    id: IconName;
    label: string;
    tooltip: string;
    available: boolean;
};

interface DashboardSidebarProps {
    activePage?: DashboardPage;
    onPageChange?: (page: DashboardPage) => void;
}

const menuItems: MenuItem[] = [
    {
        id: "home",
        label: "Tổng quan",
        tooltip: "Tổng quan",
        available: true,
    },
    {
        id: "headcount",
        label: "Quản trị nhân sự",
        tooltip: "Nhân sự hiện tại & Cơ cấu nhân sự",
        available: true,
    },
    {
        id: "turnover",
        label: "Nghỉ việc",
        tooltip: "Phân tích và quản lý nghỉ việc",
        available: true,
    },
    {
        id: "recruitment",
        label: "Tuyển dụng",
        tooltip: "Quản lý tuyển dụng",
        available: true,
    },
    {
        id: "attendance",
        label: "Chấm công",
        tooltip: "Quản lý chấm công",
        available: true,
    },
    {
        id: "payroll",
        label: "Tiền lương",
        tooltip: "Quản lý tiền lương",
        available: true,
    },
];

function SidebarIcon({ name }: { name: IconName }) {
    let content: ReactNode;

    switch (name) {
        case "home":
            content = <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9" /><path d="M9 21v-7h6v7" /></>;
            break;
        case "headcount":
            content = <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2" /><path d="M17 5a3 3 0 0 1 0 6" /><path d="M17 14a5 5 0 0 1 4 5v1" /></>;
            break;
        case "turnover":
            content = <><circle cx="10" cy="8" r="3" /><path d="M4 19a6 6 0 0 1 12 0" /><path d="M17 7h5" /><path d="m19 5-2 2 2 2" /><path d="M17 14h5" /><path d="m20 12 2 2-2 2" /></>;
            break;
        case "recruitment":
            content = <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3.5h6" /><path d="M8 9h8" /><path d="M8 13h8" /><path d="M8 17h5" /></>;
            break;
        case "attendance":
            content = <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4" /><path d="M17 3v4" /><path d="M3 10h18" /><path d="m8 16 2 2 5-5" /></>;
            break;
        case "payroll":
            content = <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18" /><circle cx="12" cy="15" r="2" /><path d="M7 3h10" /></>;
            break;
    }

    return (
        <svg width="21" height="21" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {content}
        </svg>
    );
}

type TooltipState = {
    id: IconName;
    text: string;
    x: number;
    y: number;
};

const tooltipStyle: CSSProperties = {
    position: "fixed",
    zIndex: 3000,
    maxWidth: "min(320px, calc(100vw - 24px))",
    padding: "10px 12px",
    border: "1px solid #CBD8EE",
    borderRadius: 8,
    background: "#FFFFFF",
    boxShadow: "0 4px 12px rgba(0,31,130,0.12)",
    color: "#001F82",
    fontFamily: "Segoe UI, sans-serif",
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.5,
    pointerEvents: "none",
    whiteSpace: "normal",
};

export function DashboardSidebar({
    activePage = "headcount",
    onPageChange,
}: DashboardSidebarProps) {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const showTooltip = (item: MenuItem, element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        setTooltip({
            id: item.id,
            text: item.tooltip,
            x: rect.right + 10,
            y: rect.top + rect.height / 2,
        });
    };

    const handlePageChange = (item: MenuItem) => {
        if (!item.available) return;
        if (item.id === "home" || item.id === "headcount" || item.id === "turnover" || item.id === "recruitment" || item.id === "attendance" || item.id === "payroll") {
            setTooltip(null);
            onPageChange?.(item.id === "home" ? "overview" : item.id);
        }
    };

    return (
        <>
            <aside
                aria-label="Menu chức năng"
                style={{
                    width: 52,
                    minWidth: 52,
                    position: "sticky",
                    top: 155,
                    alignSelf: "flex-start",
                    height: "calc(100vh - 170px)",
                    minHeight: 350,
                    maxHeight: 680,
                    background: "#FFFFFF",
                    border: "1px solid #E4EAF3",
                    borderRadius: 14,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 6px",
                    overflowY: "auto",
                    boxShadow: "0 2px 8px rgba(0,31,130,0.04)",
                    zIndex: 20,
                }}
            >
                {menuItems.map((item) => {
                    const selected = activePage === item.id || (activePage === "overview" && item.id === "home");

                    return (
                        <div
                            key={item.id}
                            onMouseEnter={(event) => showTooltip(item, event.currentTarget)}
                            onMouseLeave={() => setTooltip(null)}
                            onFocusCapture={(event) => showTooltip(item, event.currentTarget)}
                            onBlurCapture={() => setTooltip(null)}
                            style={{ flexShrink: 0, width: 38, height: 42 }}
                        >
                            <button
                                type="button"
                                disabled={!item.available}
                                onClick={() => handlePageChange(item)}
                                aria-label={item.tooltip}
                                aria-current={selected ? "page" : undefined}
                                style={{
                                    width: 38,
                                    height: 42,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: selected ? "#E8F0FF" : "transparent",
                                    border: selected ? "1px solid #D6E5FF" : "1px solid transparent",
                                    borderRadius: 10,
                                    color: selected ? "#2563EB" : "#667085",
                                    cursor: item.available ? "pointer" : "not-allowed",
                                    opacity: item.available ? 1 : 0.65,
                                    transition: "background 0.15s ease, color 0.15s ease",
                                }}
                            >
                                <SidebarIcon name={item.id} />
                            </button>
                        </div>
                    );
                })}

                <div style={{ flex: 1 }} />

                <div
                    title="Staffing BI"
                    style={{
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(135deg, #1749AC, #2563EB)",
                        color: "#FFFFFF",
                        borderRadius: 9,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 0.5,
                    }}
                >
                    BI
                </div>
            </aside>

            {tooltip && createPortal(
                <div
                    role="tooltip"
                    data-sidebar-tooltip={tooltip.id}
                    style={{
                        ...tooltipStyle,
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: "translateY(-50%)",
                    }}
                >
                    {tooltip.text}
                </div>,
                document.body
            )}
        </>
    );
}



