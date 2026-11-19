
import type { ReactNode } from "react";

interface WorkforceTopGridProps {
    left: ReactNode;
    center: ReactNode;
    right: ReactNode;
}

export function WorkforceTopGrid({
    left,
    center,
    right,
}: WorkforceTopGridProps) {
    return (
        <div
            style={{
                width: "100%",
                display: "grid",

                // BỐ CỤC THEO PPT:
                // Trái: KPI
                // Giữa: Biểu đồ nhân sự
                // Phải: Bảng tổng quan
                gridTemplateColumns:
                    "300px minmax(0, 1.15fr) minmax(0, 1.1fr)",

                gap: 16,
                alignItems: "stretch",

                // Chiều cao chung của hàng trên
                minHeight: 360,

                boxSizing: "border-box",
            }}
        >
            {/* =====================================
                LEFT - KPI HEADCOUNT
               ===================================== */}

            <div
                style={{
                    width: 300,
                    minWidth: 0,
                    minHeight: 360,

                    display: "flex",
                    flexDirection: "column",
                    gap: 12,

                    boxSizing: "border-box",
                }}
            >
                {left}
            </div>

            {/* =====================================
                CENTER - HEADCOUNT TREND
               ===================================== */}

            <div
                style={{
                    width: "100%",
                    minWidth: 0,
                    minHeight: 360,

                    display: "flex",
                    flexDirection: "column",

                    overflow: "hidden",
                    boxSizing: "border-box",
                }}
            >
                {center}
            </div>

            {/* =====================================
                RIGHT - HEADCOUNT OVERVIEW
               ===================================== */}

            <div
                style={{
                    width: "100%",
                    minWidth: 0,
                    minHeight: 360,

                    display: "flex",
                    flexDirection: "column",

                    overflow: "hidden",
                    boxSizing: "border-box",
                }}
            >
                {right}
            </div>
        </div>
    );
}
