
import { useState } from "react";
import { CardTitle } from "../../components/ui/CardTitle";
import { getDemoMTDWeeks, headcountByMonth } from "../../lib/headcountDemo";

type Period = "MTD" | "YTD";

interface HeadcountTrendChartProps {
    period: Period;
    onPeriodChange: (period: Period) => void;
    selectedMonth?: string | null;
    selectedWeek?: string | null;
    onMonthSelect?: (month: string) => void;
    onWeekSelect?: (week: string) => void;
}

type TrendPoint = {
    label: string;
    plan: number;
    actual: number;
    hires: number;
    exits: number;
};

// YTD - DỮ LIỆU DEMO THEO THÁNG
const monthlyData: TrendPoint[] = headcountByMonth.map(({ month, ...values }) => ({
    label: month,
    ...values,
}));

const COLORS = {
    actual: "#0038C7",
    plan: "#7EA6ED",
    green: "#159447",
    red: "#E63D4D",
    navy: "#001F82",
    label: "#667085",
};

const formatNumber = (value: number) =>
    value.toLocaleString("en-US");

const formatSigned = (value: number) =>
    `${value > 0 ? "+" : ""}${value}`;

// LEGEND - CHỮ XÁM ĐẬM, KÝ HIỆU GIỮ MÀU
function LegendItem({
    symbol,
    symbolColor,
    label,
}: {
    symbol: string;
    symbolColor: string;
    label: string;
}) {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                whiteSpace: "nowrap",
                color: COLORS.label,
                fontSize: 9,
                fontWeight: 400,
            }}
        >
            <span
                style={{
                    color: symbolColor,
                    fontSize: 11,
                    fontWeight: 700,
                    lineHeight: 1,
                }}
            >
                {symbol}
            </span>

            <span>{label}</span>
        </span>
    );
}

export function HeadcountTrendChart({
    period,
    onPeriodChange,
    selectedMonth = null,
    selectedWeek = null,
    onMonthSelect,
    onWeekSelect,
}: HeadcountTrendChartProps) {
    const [hovered, setHovered] =
        useState<number | null>(null);

    const [selected, setSelected] =
        useState<number | null>(null);

    const data: TrendPoint[] = period === "MTD"
        ? getDemoMTDWeeks(selectedMonth)
        : monthlyData;

    const width = 780;
    const height = 285;

    const left = 48;
    const right = 738;
    const plotWidth = right - left;

    const baseline = 194;

    const getX = (index: number) =>
        left +
        (data.length <= 1
            ? plotWidth / 2
            : (index / (data.length - 1)) *
              plotWidth);

    const getY = (value: number) =>
        91 - ((value - 1040) / 70) * 49;

    const linePoints = (key: "plan" | "actual") =>
        data
            .map(
                (row, index) =>
                    `${getX(index)},${getY(row[key])}`
            )
            .join(" ");

    const externalIndex = data.findIndex((point) => point.label ===
        (period === "YTD" ? selectedMonth : selectedWeek));
    const activeIndex = hovered ?? (externalIndex >= 0 ? externalIndex : selected);

    const activeRow =
        activeIndex !== null
            ? data[activeIndex]
            : null;

    // Tooltip bám theo tháng đang hover/chọn, tránh cố định ở góc phải.
    const tooltipX = activeIndex !== null ? (getX(activeIndex) / width) * 100 : 0;
    const tooltipOnLeft = tooltipX > 66;

    const changePeriod = (nextPeriod: Period) => {
        onPeriodChange(nextPeriod);
        setHovered(null);
        setSelected(null);
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minHeight: 330,
                background: "#FFFFFF",
                border: "1px solid #C8D6EB",
                borderRadius: 12,
                padding: "16px 14px 8px",
                boxSizing: "border-box",
                fontFamily: "Segoe UI, sans-serif",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            <style>{`@keyframes rayfin-month-focus { from { opacity: 0; } to { opacity: 0.9; } }`}</style>
            {/* HEADER + MTD/YTD */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "0 0 10px",
                }}
            >
                <CardTitle>XU HƯỚNG NHÂN SỰ & BIẾN ĐỘNG</CardTitle>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                    }}
                >
                    {(
                        [
                            ["MTD", "Month to date"],
                            ["YTD", "Year to date"],
                        ] as const
                    ).map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() =>
                                changePeriod(value)
                            }
                            style={{
                                border:
                                    "1px solid #C7D8F4",
                                borderRadius: 7,
                                background:
                                    period === value
                                        ? "#D8E6FF"
                                        : "#FFFFFF",
                                color: COLORS.navy,
                                fontSize: 10,
                                fontWeight:
                                    period === value
                                        ? 700
                                        : 400,
                                padding: "6px 10px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* LEGEND */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px 10px",
                    flexWrap: "wrap",
                    paddingBottom: 9,
                    borderBottom: "1px solid #EDF1F8",
                }}
            >
                <LegendItem
                    symbol="┄"
                    symbolColor={COLORS.plan}
                    label="NS kế hoạch"
                />

                <LegendItem
                    symbol="━"
                    symbolColor={COLORS.actual}
                    label="NS thực tế"
                />

                <LegendItem
                    symbol="%"
                    symbolColor={COLORS.green}
                    label="Thực đạt (%)"
                />

                <LegendItem
                    symbol="±"
                    symbolColor={COLORS.red}
                    label="Chênh lệch"
                />

                <LegendItem
                    symbol="■"
                    symbolColor={COLORS.green}
                    label="NS được tuyển vào"
                />

                <LegendItem
                    symbol="■"
                    symbolColor={COLORS.red}
                    label="NS nghỉ việc"
                />
            </div>

            {/* CHART */}
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    position: "relative",
                }}
            >
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                    }}
                    role="img"
                    aria-label={
                        period === "MTD"
                            ? "Xu hướng nhân sự theo tuần"
                            : "Xu hướng nhân sự theo tháng"
                    }
                >
                    {/* NỀN HOVER Ở LỚP DƯỚI: KHÔNG CHE LINE, ĐIỂM VÀ VALUE */}
                    {activeIndex !== null && (
                        <rect
                            x={getX(activeIndex) - 43}
                            y={15}
                            width={86}
                            height={247}
                            fill="#E8F0FF"
                            rx={6}
                            stroke="none"
                            pointerEvents="none"
                            style={{ animation: "rayfin-month-focus 220ms ease-out" }}
                        />
                    )}
                    {/* BASELINE */}
                    <line
                        x1={left - 25}
                        x2={right + 25}
                        y1={baseline}
                        y2={baseline}
                        stroke="#D4DCE8"
                        strokeWidth={1}
                    />

                    {/* NS KẾ HOẠCH */}
                    <polyline
                        points={linePoints("plan")}
                        fill="none"
                        stroke={COLORS.plan}
                        strokeWidth={2.5}
                        strokeDasharray="6 4"
                        strokeLinejoin="round"
                    />

                    {/* NS THỰC TẾ */}
                    <polyline
                        points={linePoints("actual")}
                        fill="none"
                        stroke={COLORS.actual}
                        strokeWidth={2.8}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />

                    {data.map((row, index) => {
                        const x = getX(index);

                        const gap =
                            row.actual - row.plan;

                        const rate =
                            (row.actual / row.plan) *
                            100;

                        const hireHeight =
                            (row.hires / 80) * 34;

                        const exitHeight =
                            (row.exits / 60) * 23;

                        // HAI CỘT TÁCH TRÁI / PHẢI
                        const barWidth = 12;
                        const barGap = 3;

                        const greenX =
                            x - barGap / 2 - barWidth;

                        const redX =
                            x + barGap / 2;

                        return (
                            <g key={row.label}>
                                {/* PLAN POINT */}
                                <circle
                                    cx={x}
                                    cy={getY(row.plan)}
                                    r={3}
                                    fill={COLORS.plan}
                                    stroke="#FFFFFF"
                                    strokeWidth={1}
                                />

                                {/* ACTUAL POINT */}
                                <circle
                                    cx={x}
                                    cy={getY(row.actual)}
                                    r={3}
                                    fill={COLORS.actual}
                                    stroke="#FFFFFF"
                                    strokeWidth={1}
                                />

                                {/* PLAN VALUE */}
                                <text
                                    x={x}
                                    y={getY(row.plan) - 13}
                                    textAnchor="middle"
                                    fontSize={12}
                                    fontWeight={700}
                                    fill={COLORS.plan}
                                >
                                    {formatNumber(row.plan)}
                                </text>

                                {/* ACTUAL VALUE */}
                                <text
                                    x={x}
                                    y={getY(row.actual) + 20}
                                    textAnchor="middle"
                                    fontSize={11}
                                    fontWeight={700}
                                    fill={COLORS.actual}
                                >
                                    {formatNumber(row.actual)}
                                </text>

                                {/* % THỰC ĐẠT */}
                                <text
                                    x={x}
                                    y={123}
                                    textAnchor="middle"
                                    fontSize={12}
                                    fontWeight={700}
                                    fill={COLORS.green}
                                >
                                    {rate.toFixed(1)}%
                                </text>

                                {/* CHÊNH LỆCH */}
                                <text
                                    x={x}
                                    y={142}
                                    textAnchor="middle"
                                    fontSize={10}
                                    fontWeight={700}
                                    fill={
                                        gap >= 0
                                            ? COLORS.green
                                            : COLORS.red
                                    }
                                >
                                    {formatSigned(gap)} NS
                                </text>

                                {/* CỘT TUYỂN MỚI - TRÁI */}
                                {row.hires > 0 && (
                                    <>
                                        <rect
                                            x={greenX}
                                            y={
                                                baseline -
                                                hireHeight
                                            }
                                            width={barWidth}
                                            height={hireHeight}
                                            fill={COLORS.green}
                                            rx={1}
                                        />

                                        <text
                                            x={
                                                greenX +
                                                barWidth / 2
                                            }
                                            y={
                                                baseline -
                                                hireHeight -
                                                6
                                            }
                                            textAnchor="middle"
                                            fontSize={10}
                                            fontWeight={700}
                                            fill={COLORS.green}
                                        >
                                            +{row.hires}
                                        </text>
                                    </>
                                )}

                                {/* CỘT NGHỈ VIỆC - PHẢI */}
                                {row.exits > 0 && (
                                    <>
                                        <rect
                                            x={redX}
                                            y={baseline + 1}
                                            width={barWidth}
                                            height={exitHeight}
                                            fill={COLORS.red}
                                            rx={1}
                                        />

                                        <text
                                            x={
                                                redX +
                                                barWidth / 2
                                            }
                                            y={
                                                baseline +
                                                exitHeight +
                                                14
                                            }
                                            textAnchor="middle"
                                            fontSize={10}
                                            fontWeight={700}
                                            fill={COLORS.red}
                                        >
                                            -{row.exits}
                                        </text>
                                    </>
                                )}

                                {/* PERIOD */}
                                <text
                                    x={x}
                                    y={265}
                                    textAnchor="middle"
                                    fontSize={11}
                                    fontWeight={400}
                                    fill={COLORS.label}
                                >
                                    {row.label}
                                </text>

                                {/* VÙNG HOVER / CLICK */}
                                <rect
                                    x={
                                        x -
                                        plotWidth /
                                            Math.max(
                                                data.length,
                                                6
                                            ) /
                                            2
                                    }
                                    y={0}
                                    width={
                                        plotWidth /
                                        Math.max(
                                            data.length,
                                            6
                                        )
                                    }
                                    height={274}
                                    fill="transparent"
                                    style={{
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={() =>
                                        setHovered(index)
                                    }
                                    onMouseLeave={() =>
                                        setHovered(null)
                                    }
                                    onClick={() =>
                                        period === "YTD" && onMonthSelect
                                            ? onMonthSelect(row.label)
                                            : period === "MTD" && onWeekSelect
                                              ? onWeekSelect(row.label)
                                              : setSelected(selected === index ? null : index)
                                    }
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* TOOLTIP */}
                {hovered !== null && activeRow && (
                    <div
                        style={{
                            position: "absolute",
                            top: 5,
                            left: `${tooltipX}%`,
                            transform: tooltipOnLeft
                                ? "translateX(calc(-100% - 12px))"
                                : "translateX(12px)",
                            background: "#FFFFFFF5",
                            border: "1px solid #C9D9F0",
                            borderRadius: 8,
                            padding: "8px 11px",
                            fontSize: 10,
                            lineHeight: 1.7,
                            color: "#344054",
                            boxShadow:
                                "0 4px 14px #001F8220",
                            pointerEvents: "none",
                            zIndex: 2,
                            whiteSpace: "nowrap",
                        }}
                    >
                        <strong
                            style={{
                                color: COLORS.navy,
                            }}
                        >
                            {activeRow.label}
                        </strong>

                        <div>
                            NS kế hoạch:{" "}
                            <b>
                                {formatNumber(
                                    activeRow.plan
                                )}
                            </b>
                        </div>

                        <div>
                            NS thực tế:{" "}
                            <b>
                                {formatNumber(
                                    activeRow.actual
                                )}
                            </b>
                        </div>

                        <div>
                            % thực đạt:{" "}
                            <b>
                                {(
                                    (activeRow.actual /
                                        activeRow.plan) *
                                    100
                                ).toFixed(1)}
                                %
                            </b>
                        </div>

                        <div>
                            Chênh lệch:{" "}
                            <b>
                                {formatSigned(
                                    activeRow.actual -
                                        activeRow.plan
                                )}
                            </b>
                        </div>

                        <div>
                            NS tuyển vào:{" "}
                            <b>{activeRow.hires}</b>
                        </div>

                        <div>
                            NS nghỉ việc:{" "}
                            <b>{activeRow.exits}</b>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    fontSize: 9,
                    color: "#98A2B3",
                }}
            >
                <span>
                    Dữ liệu minh họa · Chưa kết nối API
                </span>

                <i>
                    Click từng kỳ để xem chi tiết
                </i>
            </div>
        </div>
    );
}



