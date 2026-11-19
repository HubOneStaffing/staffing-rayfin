interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
}

export function KpiCard({
    title,
    value,
    subtitle,
}: KpiCardProps) {
    return (
        <div
            style={{
                padding: 20,
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                minWidth: 190,
                background: "#FFFFFF",
                fontFamily: "Segoe UI, sans-serif",
            }}
        >
            <div
                style={{
                    fontSize: 13,
                    color: "#667085",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    marginTop: 8,
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#101828",
                }}
            >
                {value}
            </div>

            {subtitle && (
                <div
                    style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#667085",
                    }}
                >
                    {subtitle}
                </div>
            )}
        </div>
    );
}