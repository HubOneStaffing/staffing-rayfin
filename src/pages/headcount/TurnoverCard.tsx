
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getDemoMTDValue, headcountByMonth, HC_DEMO_MONTHLY_TURNOVER, HC_DEMO_YTD_TURNOVER } from "../../lib/headcountDemo";

type Period = "MTD" | "YTD";

interface TurnoverCardProps {
    period: Period;
    onOpenTurnover?: () => void;
    selectedMonth?: string | null;
    selectedWeek?: string | null;
    onMonthSelect?: (month: string) => void;
    onWeekSelect?: (week: string) => void;
}

type TrendPoint = {
    label: string;
    turnover: number;
};

// DỮ LIỆU DEMO - CHƯA KẾT NỐI FABRIC
const demoData = {
    turnoverMTD: 0.032,
    turnoverYTD: HC_DEMO_YTD_TURNOVER,
    previousMTD: -0.005,
    previousYTD: 0.003,
    average: 0.04,
};

// YTD - THEO THÁNG
// Trục tháng lấy từ cùng nguồn với Headcount Trend và Structure.
// Tỷ lệ chỉ là số demo UI, không thay thế DAX trong Power BI.
const monthlyData: TrendPoint[] = headcountByMonth.map(({ month }) => ({
    label: month,
    turnover: HC_DEMO_MONTHLY_TURNOVER[month],
}));

// MÀU CHUẨN HC V19
const colors = {
    blue: "#001F82",
    red: "#E5394F",
    green: "#159447",
    gray: "#667085",
    border: "#D9DEE8",
    average: "#F59E0B",
};

function formatPercent(value: number) {
    return `${(value * 100).toFixed(1)}%`;
}

function formatDelta(value: number) {
    if (value < 0) {
        return `▼ ${(Math.abs(value) * 100).toFixed(1)}%`;
    }

    if (value > 0) {
        return `▲ +${(value * 100).toFixed(1)}%`;
    }

    return "0.0%";
}

function MetricLabel({
    children,
    accent,
}: {
    children: ReactNode;
    accent: string;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: 8,
                borderLeft: `3px solid ${accent}`,
                color: "#344054",
                fontSize: 10,
                fontWeight: 500,
            }}
        >
            {children}
        </div>
    );
}

function PeriodMetric({
    label,
    value,
    active,
}: {
    label: string;
    value: number;
    active: boolean;
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "30px 1fr",
                gap: 7,
                alignItems: "baseline",
                opacity: active ? 1 : 0.58,
            }}
        >
            <span
                style={{
                    color: active
                        ? colors.blue
                        : "#98A2B3",
                    fontSize: active ? 9 : 8,
                    fontWeight: 700,
                }}
            >
                {label}
            </span>

            <span
                style={{
                    color: colors.blue,
                    fontSize: active ? 15 : 12,
                    fontWeight: 700,
                }}
            >
                {formatPercent(value)}
            </span>
        </div>
    );
}

function PreviousMetric({
    label,
    value,
    active,
}: {
    label: string;
    value: number;
    active: boolean;
}) {
    const color =
        value < 0
            ? colors.green
            : value > 0
            ? colors.red
            : colors.gray;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "30px 1fr",
                gap: 7,
                alignItems: "baseline",
                opacity: active ? 1 : 0.58,
            }}
        >
            <span
                style={{
                    color: active
                        ? colors.blue
                        : "#98A2B3",
                    fontSize: active ? 9 : 8,
                    fontWeight: 700,
                }}
            >
                {label}
            </span>

            <span
                style={{
                    color,
                    fontSize: active ? 12 : 10,
                    fontWeight: 700,
                }}
            >
                {formatDelta(value)}
            </span>
        </div>
    );
}

function TurnoverTrend({
    points,
    average,
    selectedMonth = null,
    onMonthSelect,
}: {
    points: TrendPoint[];
    average: number;
    selectedMonth?: string | null;
    onMonthSelect?: (month: string) => void;
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    useEffect(() => {
        setHoveredIndex(null);
        setSelectedIndex(null);
    }, [points]);

    const externalIndex = points.findIndex((point) => point.label === selectedMonth);
    const activeIndex = hoveredIndex ?? (externalIndex >= 0 ? externalIndex : selectedIndex);
    const activePoint = activeIndex === null ? null : points[activeIndex];
    const toggleSelected = (index: number) => {
        if (onMonthSelect) onMonthSelect(points[index].label);
        else setSelectedIndex((current) => current === index ? null : index);
    };

    const width = 600;
    const height = 210;

    const left = 30;
    const right = 18;
    const top = 28;
    const bottom = 168;
    const labelY = 198;

    const plotWidth = width - left - right;
    const plotHeight = bottom - top;

    // Thang đo theo khoảng giá trị thực tế để khoảng cách MIN/MAX
    // dễ nhìn hơn, không làm thay đổi số liệu hay chiều cao SVG.
    const values = [average, ...points.map((point) => point.turnover)];
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const range = Math.max(dataMax - dataMin, 0.001);
    const axisMin = Math.max(0, dataMin - range * 0.25);
    const axisMax = dataMax + range * 0.25;

    const getX = (index: number) =>
        points.length <= 1
            ? left + plotWidth / 2
            : left +
              (index / (points.length - 1)) *
                  plotWidth;

    const getY = (value: number) =>
        bottom -
        ((value - axisMin) / (axisMax - axisMin)) * plotHeight;

    const avgY = getY(average);
    const bandWidth = plotWidth / Math.max(points.length - 1, 1);
    const activeX = activeIndex === null ? 0 : getX(activeIndex);
    const tipWidth = 131;
    const tipHeight = 79;
    const tipX = Math.max(4, Math.min(width - tipWidth - 4,
        activeX + (activeX > width * 0.64 ? -tipWidth - 12 : 12)));
    const tipY = Math.max(4, Math.min(height - tipHeight - 3,
        activePoint ? getY(activePoint.turnover) - 56 : 8));

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
                width: "100%",
                height: 210,
                display: "block",
            }}
        >
            <style>{`@keyframes rayfin-month-focus { from { opacity: 0; } to { opacity: 0.9; } }`}</style>
            {/* NỀN THÁNG ĐANG HOVER / ĐƯỢC CHỌN */}
            {activeIndex !== null && (
                <rect
                    x={Math.max(0, activeX - bandWidth * 0.40)}
                    y={4}
                    width={Math.min(bandWidth * 0.80, width - Math.max(0, activeX - bandWidth * 0.40))}
                    height={height - 8}
                    rx={6}
                    fill="#FFF1D0"
                    fillOpacity={0.72}
                    stroke="none"
                    style={{ animation: "rayfin-month-focus 220ms ease-out" }}
                    pointerEvents="none"
                />
            )}

            {/* GRID */}
            {[0, 1, 2, 3].map((item) => {
                const y =
                    top + (item / 3) * plotHeight;

                return (
                    <line
                        key={item}
                        x1={left}
                        x2={width - right}
                        y1={y}
                        y2={y}
                        stroke="#EEF2F6"
                        strokeDasharray="4 6"
                    />
                );
            })}

            {/* ĐƯỜNG TRUNG BÌNH - MÀU CAM */}
            <line
                x1={left}
                x2={width - right}
                y1={avgY}
                y2={avgY}
                stroke={colors.average}
                strokeWidth={1.5}
                strokeDasharray="5 4"
            />

            {/* NHÃN TB */}
            <text
                x={left + 5}
                y={avgY - 7}
                fill="#D97706"
                fontFamily="Segoe UI"
                fontSize={9}
                fontWeight={700}
            >
                TB {formatPercent(average)}
            </text>

            {/* ĐƯỜNG XU HƯỚNG CHÍNH */}
            {points.slice(1).map((point, index) => {
                const previous = points[index];

                const x1 = getX(index);
                const x2 = getX(index + 1);

                const y1 = getY(previous.turnover);
                const y2 = getY(point.turnover);

                const prevAbove =
                    previous.turnover > average;

                const currAbove =
                    point.turnover > average;

                if (prevAbove === currAbove) {
                    return (
                        <line
                            key={index}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={
                                prevAbove
                                    ? colors.red
                                    : colors.blue
                            }
                            strokeWidth={1.8}
                            strokeLinecap="round"
                        />
                    );
                }

                const ratio =
                    (average - previous.turnover) /
                    (point.turnover -
                        previous.turnover);

                const crossX =
                    x1 + (x2 - x1) * ratio;

                return (
                    <g key={index}>
                        <line
                            x1={x1}
                            y1={y1}
                            x2={crossX}
                            y2={avgY}
                            stroke={
                                prevAbove
                                    ? colors.red
                                    : colors.blue
                            }
                            strokeWidth={1.8}
                            strokeLinecap="round"
                        />

                        <line
                            x1={crossX}
                            y1={avgY}
                            x2={x2}
                            y2={y2}
                            stroke={
                                currAbove
                                    ? colors.red
                                    : colors.blue
                            }
                            strokeWidth={1.8}
                            strokeLinecap="round"
                        />
                    </g>
                );
            })}

            {/* ĐIỂM DỮ LIỆU */}
            {points.map((point, index) => {
                const x = getX(index);
                const y = getY(point.turnover);

                const color =
                    point.turnover > average
                        ? colors.red
                        : colors.blue;

                return (
                    <g key={`${point.label}-${index}`}>
                        <circle
                            cx={x}
                            cy={y}
                            r={activeIndex === index ? 4 : 3}
                            fill={color}
                            stroke="#FFFFFF"
                            strokeWidth={1.2}
                        />

                        <text
                            x={x}
                            y={y - 9}
                            textAnchor="middle"
                            fontFamily="Segoe UI"
                            fontSize={9}
                            fontWeight={700}
                            fill={color}
                        >
                            {formatPercent(
                                point.turnover
                            )}
                        </text>

                        <text
                            x={x}
                            y={labelY}
                            textAnchor="middle"
                            fontFamily="Segoe UI"
                            fontSize={9}
                            fontWeight={600}
                            fill="#475467"
                        >
                            {point.label}
                        </text>
                    </g>
                );
            })}

            {/* VÙNG BẮT HOVER/CLICK CHO TỪNG KỲ */}
            {points.map((point, index) => {
                const x = getX(index);
                const hitWidth = bandWidth * 0.88;
                return (
                    <rect
                        key={`hit-${point.label}`}
                        x={Math.max(0, x - hitWidth / 2)}
                        y={4}
                        width={Math.min(hitWidth, width - Math.max(0, x - hitWidth / 2))}
                        height={height - 8}
                        fill="transparent"
                        role="button"
                        tabIndex={0}
                        aria-label={`${point.label}: Tỷ lệ nghỉ việc ${formatPercent(point.turnover)}. Nhấn để chọn tháng.`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onFocus={() => setHoveredIndex(index)}
                        onBlur={() => setHoveredIndex(null)}
                        onClick={() => toggleSelected(index)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                toggleSelected(index);
                            }
                        }}
                        style={{ cursor: "pointer", outline: "none" }}
                    />
                );
            })}

            {/* TOOLTIP CÙNG PHONG CÁCH XU HƯỚNG NHÂN SỰ */}
            {hoveredIndex !== null && activePoint && (
                <g transform={`translate(${tipX}, ${tipY})`} pointerEvents="none">
                    <rect x={1} y={2} width={tipWidth} height={tipHeight} rx={7}
                        fill="#001F82" fillOpacity={0.10} />
                    <rect width={tipWidth} height={tipHeight} rx={7}
                        fill="#FFFFFF" stroke="#BFD1F5" strokeWidth={1} />
                    <text x={11} y={15} fill="#001F82" fontSize={10}
                        fontFamily="Segoe UI" fontWeight={700}>{activePoint.label}</text>
                    <text x={11} y={31} fill="#344054" fontSize={9} fontFamily="Segoe UI">
                        Tỷ lệ nghỉ việc: <tspan fontWeight={700}>{formatPercent(activePoint.turnover)}</tspan>
                    </text>
                    <text x={11} y={45} fill="#344054" fontSize={9} fontFamily="Segoe UI">
                        Trung bình: <tspan fontWeight={700}>{formatPercent(average)}</tspan>
                    </text>
                    <text x={11} y={59} fill="#344054" fontSize={9} fontFamily="Segoe UI">
                        Chênh lệch: <tspan fontWeight={700}
                            fill={activePoint.turnover > average ? colors.red : activePoint.turnover < average ? colors.green : colors.gray}>
                            {activePoint.turnover > average ? "+" : ""}{formatPercent(activePoint.turnover - average)}
                        </tspan>
                    </text>
                    <text x={11} y={72} fill="#98A2B3" fontSize={8} fontFamily="Segoe UI">
                        Click để {selectedMonth === activePoint.label || selectedIndex === activeIndex ? "bỏ chọn" : "giữ chọn"}
                    </text>
                </g>
            )}
        </svg>
    );
}

export function TurnoverCard({
    period,
    onOpenTurnover,
    selectedMonth = null,
    selectedWeek = null,
    onMonthSelect,
    onWeekSelect,
}: TurnoverCardProps) {
    const isYTD = period === "YTD";
    const mtd = getDemoMTDValue(selectedMonth, selectedWeek);
    const weeklyData = useMemo<TrendPoint[]>(
        () => getDemoMTDValue(selectedMonth, null).weeks.map((week) => ({
            label: week.label,
            turnover: week.turnover,
        })),
        [selectedMonth],
    );
    const monthlyOpening = mtd.month
        ? mtd.month.actual - mtd.month.hires + mtd.month.exits
        : 0;
    const mtdRate = mtd.week
        ? mtd.week.turnover
        : monthlyOpening > 0 ? mtd.exits / monthlyOpening : 0;
    const activeWeekIndex = weeklyData.findIndex((week) => week.label === selectedWeek);
    const previousWeekRate = activeWeekIndex > 0
        ? weeklyData[activeWeekIndex - 1].turnover
        : 0;
    const selectedTrendIndex = monthlyData.findIndex((point) => point.label === selectedMonth);
    const selectedRate = selectedTrendIndex >= 0
        ? monthlyData[selectedTrendIndex].turnover : null;
    const selectedPrevDelta = selectedTrendIndex > 0
        ? monthlyData[selectedTrendIndex].turnover - monthlyData[selectedTrendIndex - 1].turnover
        : null;

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                background: "#FFFFFF",
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                boxSizing: "border-box",
                overflow: "hidden",
                fontFamily: "Segoe UI, sans-serif",
            }}
        >
            {/* TITLE */}
            <div
                style={{
                    height: 38,
                    flex: "0 0 38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#001F82",
                    fontSize: 13,
                    fontWeight: 700,
                }}
            >
                TỶ LỆ NGHỈ VIỆC
            </div>

            {/* KPI */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "1.45fr 1fr 1fr",
                    gridTemplateRows: "1fr 1fr",
                    gap: "5px 14px",
                    padding: "0 14px 8px",
                    boxSizing: "border-box",
                    minHeight: 66,
                }}
            >
                <MetricLabel accent={colors.blue}>
                    Tỷ lệ nghỉ việc
                </MetricLabel>

                <PeriodMetric
                    label={selectedWeek ?? "MTD"}
                    value={mtdRate}
                    active={!isYTD}
                />

                <PeriodMetric
                    label={selectedMonth ? `T${selectedMonth.slice(0, 2)}` : "YTD"}
                    value={selectedRate ?? demoData.turnoverYTD}
                    active={isYTD}
                />

                <MetricLabel accent={colors.gray}>
                    So với kỳ trước
                </MetricLabel>

                <PreviousMetric
                    label={selectedWeek ? "Tuần trước" : "LM"}
                    value={selectedWeek ? mtdRate - previousWeekRate : demoData.previousMTD}
                    active={!isYTD}
                />

                <PreviousMetric
                    label={selectedMonth ? "LM" : "LY"}
                    value={selectedPrevDelta ?? demoData.previousYTD}
                    active={isYTD}
                />
            </div>

            {/* TREND HEADER */}
            <div
                style={{
                    height: 34,
                    flex: "0 0 34px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "space-between",
                    padding: "0 14px",
                    borderTop:
                        "1px solid #EEF2F6",
                    boxSizing: "border-box",
                }}
            >
                <div>
                    <div
                        style={{
                            color: "#001F82",
                            fontSize: 10,
                            fontWeight: 700,
                        }}
                    >
                        XU HƯỚNG TỶ LỆ NGHỈ VIỆC
                    </div>

                    <div
                        style={{
                            marginTop: 1,
                            fontSize: 7,
                            color: "#98A2B3",
                        }}
                    >
                        {isYTD
                            ? "YTD · theo tháng"
                            : "MTD · theo tuần"}{" "}
                        · Dữ liệu minh họa
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onOpenTurnover}
                    aria-label="Mở trang phân tích nghỉ việc"
                    style={{
                        color: "#001F82",
                        fontFamily: "inherit",
                        fontSize: 10,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        minHeight: 25,
                        padding: "4px 9px",
                        borderRadius: 6,
                        border: "1px solid #D6E3FF",
                        background: "#F8FBFF",
                        cursor: "pointer",
                        marginLeft: 12,
                    }}
                >
                    Xem phân tích nghỉ việc →
                </button>
            </div>

            {/* CHART */}
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    padding: "2px 10px 8px",
                    boxSizing: "border-box",
                }}
            >
                <TurnoverTrend
                    points={
                        isYTD
                            ? monthlyData
                            : weeklyData
                    }
                    average={isYTD ? demoData.average : monthlyOpening > 0 ? mtd.month!.exits / monthlyOpening / 4 : 0}
                    selectedMonth={isYTD ? selectedMonth : selectedWeek}
                    onMonthSelect={isYTD ? onMonthSelect : onWeekSelect}
                />
            </div>
        </div>
    );
}






