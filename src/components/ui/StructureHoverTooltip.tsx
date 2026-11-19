
/**
 * Tooltip dùng chung cho hai chart cơ cấu.
 * Format theo Headcount Trend và Turnover Trend.
 */

export type StructureHover = {
    title: string;
    group: string;
    value: number;
    percentage: number;
    x: number;
    y: number;
};

export function StructureHoverTooltip({
    hover,
    containerWidth,
    containerHeight,
}: {
    hover: StructureHover | null;
    containerWidth: number;
    containerHeight: number;
}) {
    if (!hover) return null;

    const width = 164;
    const height = 82;

    const left = Math.max(
        4,
        Math.min(
            hover.x + 12,
            containerWidth - width - 4
        )
    );

    const top = Math.max(
        4,
        Math.min(
            hover.y - height - 8,
            containerHeight - height - 4
        )
    );

    return (
        <div
            role="tooltip"
            style={{
                position: "absolute",
                left,
                top,
                width,
                padding: "8px 10px",
                background: "#FFFFFF",
                border: "1px solid #BFD1F5",
                borderRadius: 8,
                boxShadow:
                    "0 3px 12px rgba(0,31,130,0.14)",
                zIndex: 20,
                pointerEvents: "none",
                boxSizing: "border-box",
                fontFamily: "Segoe UI, sans-serif",
                fontSize: 10,
                lineHeight: 1.45,
                color: "#344054",
            }}
        >
            <div
                style={{
                    color: "#001F82",
                    fontWeight: 700,
                    marginBottom: 3,
                }}
            >
                {hover.title}
            </div>

            <div style={{ whiteSpace: "normal" }}>
                {hover.group}
            </div>

            <div>
                Nhân sự:{" "}
                <strong style={{ color: "#001F82" }}>
                    {hover.value.toLocaleString("en-US")}
                </strong>
            </div>

            <div>
                Tỷ trọng:{" "}
                <strong>
                    {hover.percentage.toFixed(1)}%
                </strong>
            </div>
        </div>
    );
}
