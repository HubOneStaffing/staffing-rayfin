
import type { ReactNode } from "react";

interface WorkforceBottomGridProps {
    left: ReactNode;
    center: ReactNode;
    right: ReactNode;
}

export function WorkforceBottomGrid({
    left,
    center,
    right,
}: WorkforceBottomGridProps) {
    return (
        <div
            style={{
                width: "100%",

                display: "grid",

                // BỐ CỤC THEO PPT
                // Trái: Tỷ lệ nghỉ việc
                // Giữa: Cơ cấu nghỉ việc
                // Phải: Cơ cấu nhân sự hiện tại
                gridTemplateColumns:
                    "minmax(0, 1.05fr) minmax(0, 1fr) minmax(0, 1fr)",

                gap: 16,

                // Khoảng cách với hàng trên
                marginTop: 16,

                // Chiều cao chung
                minHeight: 380,

                alignItems: "stretch",

                boxSizing: "border-box",
            }}
        >
            {/* =====================================
                LEFT - TURNOVER
               ===================================== */}

            <div
                style={{
                    width: "100%",
                    minWidth: 0,
                    minHeight: 380,

                    display: "flex",
                    flexDirection: "column",

                    boxSizing: "border-box",
                }}
            >
                {left}
            </div>

            {/* =====================================
                CENTER - TURNOVER STRUCTURE
               ===================================== */}

            <div
                style={{
                    width: "100%",
                    minWidth: 0,
                    minHeight: 380,

                    display: "flex",
                    flexDirection: "column",

                    boxSizing: "border-box",
                }}
            >
                {center}
            </div>

            {/* =====================================
                RIGHT - HEADCOUNT STRUCTURE
               ===================================== */}

            <div
                style={{
                    width: "100%",
                    minWidth: 0,
                    minHeight: 380,

                    display: "flex",
                    flexDirection: "column",

                    boxSizing: "border-box",
                }}
            >
                {right}
            </div>
        </div>
    );
}
