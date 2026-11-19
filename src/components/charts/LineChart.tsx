interface LineSeries {
    key: string;
    label: string;
}

interface LineChartProps {
    data: Record<string, string | number>[];
    xKey: string;
    series: LineSeries[];
    height?: number;
}

export function LineChart({
    data,
    xKey,
    series,
    height = 260,
}: LineChartProps) {
    const width = 760;

    const padding = {
        top: 24,
        right: 24,
        bottom: 42,
        left: 48,
    };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const values = data.flatMap((row) =>
        series.map((s) => Number(row[s.key] ?? 0))
    );

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const range = maxValue - minValue || 1;

    const yMin = Math.max(0, minValue - range * 0.15);
    const yMax = maxValue + range * 0.15;

    const getX = (index: number) => {
        if (data.length <= 1) return padding.left;

        return (
            padding.left +
            (index / (data.length - 1)) * chartWidth
        );
    };

    const getY = (value: number) => {
        return (
            padding.top +
            ((yMax - value) / (yMax - yMin)) *
                chartHeight
        );
    };

    const createPath = (key: string) =>
        data
            .map((row, index) => {
                const x = getX(index);
                const y = getY(Number(row[key] ?? 0));

                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");

    return (
        <div
            style={{
                width: "100%",
                overflowX: "auto",
                fontFamily: "Segoe UI, sans-serif",
            }}
        >
            <svg
                viewBox={`0 0 ${width} ${height}`}
                style={{
                    width: "100%",
                    minWidth: 600,
                    display: "block",
                }}
            >
                {/* GRID */}
                {[0, 1, 2, 3, 4].map((i) => {
                    const y =
                        padding.top +
                        (i / 4) * chartHeight;

                    const value =
                        yMax -
                        (i / 4) * (yMax - yMin);

                    return (
                        <g key={i}>
                            <line
                                x1={padding.left}
                                x2={width - padding.right}
                                y1={y}
                                y2={y}
                                stroke="#E5E7EB"
                            />

                            <text
                                x={padding.left - 8}
                                y={y + 4}
                                textAnchor="end"
                                fontSize="11"
                                fill="#667085"
                            >
                                {Math.round(value)}
                            </text>
                        </g>
                    );
                })}

                {/* LINES */}
                {series.map((s, index) => (
                    <path
                        key={s.key}
                        d={createPath(s.key)}
                        fill="none"
                        stroke={
                            index === 0
                                ? "#001F82"
                                : "#98A2B3"
                        }
                        strokeWidth={
                            index === 0 ? 3 : 2
                        }
                        strokeDasharray={
                            index === 0 ? undefined : "6 5"
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ))}

                {/* POINTS */}
                {series.map((s, seriesIndex) =>
                    data.map((row, index) => {
                        const value = Number(
                            row[s.key] ?? 0
                        );

                        return (
                            <circle
                                key={`${s.key}-${index}`}
                                cx={getX(index)}
                                cy={getY(value)}
                                r={seriesIndex === 0 ? 4 : 3}
                                fill={
                                    seriesIndex === 0
                                        ? "#001F82"
                                        : "#98A2B3"
                                }
                            >
                                <title>
                                    {`${row[xKey]} - ${s.label}: ${value.toLocaleString()}`}
                                </title>
                            </circle>
                        );
                    })
                )}

                {/* X LABELS */}
                {data.map((row, index) => (
                    <text
                        key={index}
                        x={getX(index)}
                        y={height - 14}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#667085"
                    >
                        {String(row[xKey])}
                    </text>
                ))}
            </svg>
        </div>
    );
}