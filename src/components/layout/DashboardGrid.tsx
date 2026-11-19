import type { ReactNode } from "react";

interface DashboardGridProps {
    children: ReactNode;
}

export function DashboardGrid({
    children,
}: DashboardGridProps) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns:
                    "300px minmax(0, 1fr)",
                gap: 16,
                alignItems: "start",
            }}
        >
            {children}
        </div>
    );
}