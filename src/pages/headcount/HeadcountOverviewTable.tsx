import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { allocateByWeights, getDemoMTDValue, getHeadcountMonth } from "../../lib/headcountDemo";

type Period = "MTD" | "YTD";

type GroupKey =
    | "region"
    | "province"
    | "position"
    | "manager1"
    | "manager2";

interface HeadcountRow {
    region: string;
    province: string;
    position: string;
    manager1: string;
    manager2: string;
    actual: number;
    plan: number;
    newJoin: number;
    resigned: number;
}

interface HeadcountOverviewTableProps {
    className?: string;
    period?: Period;
    selectedMonth?: string | null;
    selectedWeek?: string | null;
}

const GROUP_COLUMNS: {
    key: GroupKey;
    label: string;
    weight: number;
}[] = [
    { key: "region", label: "Miền", weight: 1.1 },
    { key: "province", label: "Tỉnh", weight: 1.4 },
    { key: "position", label: "Vị trí", weight: 1 },
    { key: "manager1", label: "QL cấp 1", weight: 1 },
    { key: "manager2", label: "QL cấp 2", weight: 1 },
];

const METRIC_COLUMNS = [
    { key: "actual", label: "NS thực tế", weight: 1.05 },
    { key: "plan", label: "NS kế hoạch", weight: 1.05 },
    { key: "rate", label: "% thực đạt", weight: 1 },
    { key: "gap", label: "Chênh lệch", weight: 1 },
    { key: "join", label: "NS mới", weight: 0.9 },
    { key: "resign", label: "NS nghỉ", weight: 0.9 },
    { key: "movement", label: "Biến động", weight: 1 },
];

// =======================================
// DỮ LIỆU MINH HỌA - CHƯA KẾT NỐI FABRIC
// =======================================

const demoDataYTD: HeadcountRow[] = [
    {
        region: "Miền Bắc",
        province: "Hà Nội",
        position: "FC",
        manager1: "QL 01",
        manager2: "QL 05",
        actual: 1180,
        plan: 1250,
        newJoin: 277,
        resigned: 166,
    },
    {
        region: "Miền Trung",
        province: "Đà Nẵng",
        position: "FC",
        manager1: "QL 03",
        manager2: "QL 06",
        actual: 830,
        plan: 900,
        newJoin: 144,
        resigned: 122,
    },
    {
        region: "Miền Nam",
        province: "TP. Hồ Chí Minh",
        position: "FC",
        manager1: "QL 04",
        manager2: "QL 07",
        actual: 1430,
        plan: 1500,
        newJoin: 300,
        resigned: 201,
    },
    {
        region: "Miền Nam",
        province: "Đồng Nai",
        position: "Manager",
        manager1: "QL 04",
        manager2: "QL 08",
        actual: 980,
        plan: 1050,
        newJoin: 199,
        resigned: 142,
    },
    {
        region: "Miền Bắc",
        province: "Hải Phòng",
        position: "Supervisor",
        manager1: "QL 02",
        manager2: "QL 05",
        actual: 620,
        plan: 650,
        newJoin: 124,
        resigned: 107,
    },
];

const formatNumber = (value: number) =>
    value.toLocaleString("en-US");

const formatSigned = (value: number) =>
    `${value > 0 ? "+" : ""}${formatNumber(value)}`;

const getRate = (actual: number, plan: number) =>
    plan > 0 ? (actual / plan) * 100 : 0;

const baseHeaderStyle: CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 2,
    padding: "10px 4px",
    fontSize: 9,
    fontWeight: 700,
    lineHeight: 1.3,
    color: "#001F82",
    background: "#EDF3FF",
    textAlign: "center",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    verticalAlign: "middle",
    boxSizing: "border-box",
};

const baseCellStyle: CSSProperties = {
    padding: "10px 4px",
    fontSize: 9,
    lineHeight: 1.35,
    color: "#001F82",
    textAlign: "center",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    verticalAlign: "middle",
    borderBottom: "1px solid #E5EAF3",
    boxSizing: "border-box",
};

export function HeadcountOverviewTable({
    className,
    period = "YTD",
    selectedMonth = null,
    selectedWeek = null,
}: HeadcountOverviewTableProps) {
    const [activeGroups, setActiveGroups] = useState<GroupKey[]>([
        "region",
    ]);

    // =======================================
    // CHUYỂN DỮ LIỆU THEO MTD / YTD
    // =======================================

    const sourceData = useMemo<HeadcountRow[]>(() => {
        if (period === "MTD") {
            const summary = getDemoMTDValue(selectedMonth, selectedWeek);
            if (!summary.month) return [];
            const actual = allocateByWeights(summary.actual, demoDataYTD.map((r) => r.actual));
            const plan = allocateByWeights(summary.plan, demoDataYTD.map((r) => r.plan));
            const newJoin = allocateByWeights(summary.hires, demoDataYTD.map((r) => r.newJoin));
            const resigned = allocateByWeights(summary.exits, demoDataYTD.map((r) => r.resigned));
            return demoDataYTD.map((row, index) => ({
                ...row, actual: actual[index], plan: plan[index],
                newJoin: newJoin[index], resigned: resigned[index],
            }));
        }
        if (selectedMonth) {
            const month = getHeadcountMonth(selectedMonth);
            if (!month) return [];
            // Demo: phân bổ tổng tháng theo tỷ trọng từng miền/tỉnh của bảng mẫu.
            const actual = allocateByWeights(month.actual, demoDataYTD.map((r) => r.actual));
            const plan = allocateByWeights(month.plan, demoDataYTD.map((r) => r.plan));
            const newJoin = allocateByWeights(month.hires, demoDataYTD.map((r) => r.newJoin));
            const resigned = allocateByWeights(month.exits, demoDataYTD.map((r) => r.resigned));
            return demoDataYTD.map((row, index) => ({
                ...row,
                actual: actual[index],
                plan: plan[index],
                newJoin: newJoin[index],
                resigned: resigned[index],
            }));
        }
        return demoDataYTD;
    }, [period, selectedMonth, selectedWeek]);

    const toggleGroup = (group: GroupKey) => {
        setActiveGroups((current) => {
            if (current.includes(group)) {
                if (current.length === 1) {
                    return current;
                }

                return current.filter((item) => item !== group);
            }

            return [...current, group];
        });
    };

    const visibleGroups = GROUP_COLUMNS.filter((group) =>
        activeGroups.includes(group.key)
    );

    // =======================================
    // GỘP DỮ LIỆU THEO NHÓM ĐANG CHỌN
    // =======================================

    const groupedData = useMemo(() => {
        return Object.values(
            sourceData.reduce<Record<string, HeadcountRow>>(
                (accumulator, row) => {
                    const key = visibleGroups
                        .map((group) => row[group.key])
                        .join("||");

                    if (!accumulator[key]) {
                        accumulator[key] = {
                            ...row,
                            actual: 0,
                            plan: 0,
                            newJoin: 0,
                            resigned: 0,
                        };
                    }

                    accumulator[key].actual += row.actual;
                    accumulator[key].plan += row.plan;
                    accumulator[key].newJoin += row.newJoin;
                    accumulator[key].resigned += row.resigned;

                    return accumulator;
                },
                {}
            )
        );
    }, [sourceData, activeGroups]);

    // =======================================
    // TỔNG TOÀN BỘ DỮ LIỆU
    // =======================================

    const totals = useMemo(() => {
        return sourceData.reduce(
            (result, row) => ({
                actual: result.actual + row.actual,
                plan: result.plan + row.plan,
                newJoin: result.newJoin + row.newJoin,
                resigned: result.resigned + row.resigned,
            }),
            {
                actual: 0,
                plan: 0,
                newJoin: 0,
                resigned: 0,
            }
        );
    }, [sourceData]);

    // =======================================
    // TỰ CHIA CHIỀU RỘNG CỘT
    // =======================================

    const allWeights = [
        ...visibleGroups.map((group) => group.weight),
        ...METRIC_COLUMNS.map((column) => column.weight),
    ];

    const totalWeight = allWeights.reduce(
        (sum, weight) => sum + weight,
        0
    );

    const getWidth = (weight: number) =>
        `${(weight / totalWeight) * 100}%`;

    // =======================================
    // HIỂN THỊ CÁC CỘT CHỈ SỐ
    // =======================================

    const renderMetricCells = (
        row: {
            actual: number;
            plan: number;
            newJoin: number;
            resigned: number;
        },
        isTotal = false
    ) => {
        const rate = getRate(row.actual, row.plan);
        const gap = row.actual - row.plan;
        const movement = row.newJoin - row.resigned;

        const style: CSSProperties = {
            ...baseCellStyle,
            background: isTotal ? "#E8F0FF" : "#FFFFFF",
            fontWeight: isTotal ? 700 : 400,
        };

        return (
            <>
                <td style={style}>
                    {formatNumber(row.actual)}
                </td>

                <td style={style}>
                    {formatNumber(row.plan)}
                </td>

                <td
                    style={{
                        ...style,
                        color:
                            rate >= 100
                                ? "#159447"
                                : "#DC2626",
                        fontWeight: 700,
                    }}
                >
                    {rate.toFixed(1)}%
                </td>

                <td
                    style={{
                        ...style,
                        color:
                            gap < 0
                                ? "#DC2626"
                                : gap > 0
                                  ? "#159447"
                                  : "#001F82",
                    }}
                >
                    {formatSigned(gap)}
                </td>

                <td
                    style={{
                        ...style,
                        color: "#159447",
                    }}
                >
                    {formatSigned(row.newJoin)}
                </td>

                <td
                    style={{
                        ...style,
                        color: "#DC2626",
                    }}
                >
                    -{formatNumber(row.resigned)}
                </td>

                <td
                    style={{
                        ...style,
                        color:
                            movement > 0
                                ? "#159447"
                                : movement < 0
                                  ? "#DC2626"
                                  : "#001F82",
                        fontWeight: 700,
                    }}
                >
                    {formatSigned(movement)}
                </td>
            </>
        );
    };

    return (
        <div
            className={className}
            style={{
                width: "100%",
                height: "100%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                background: "#FFFFFF",
                border: "1px solid #D9DEE8",
                borderRadius: 12,
                boxSizing: "border-box",
                overflow: "hidden",
                fontFamily: "Segoe UI, sans-serif",
                color: "#001F82",
            }}
        >
            {/* =====================================
                TITLE + GROUP FILTERS
               ===================================== */}
            <div
                style={{
                    width: "100%",
                    height: 52,
                    minHeight: 52,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "16px 12px 0 14px",
                    boxSizing: "border-box",
                    flexShrink: 0,
                }}
            >
                {/* TITLE */}
                <div
                    style={{
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        lineHeight: "18px",
                        color: "#001F82",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}
                >
                    TỔNG QUAN NHÂN SỰ
                </div>

                {/* GROUP FILTERS */}
                <div
                    style={{
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        flexWrap: "nowrap",
                        gap: 5,
                        minWidth: 0,
                    }}
                >
                    <span
                        style={{
                            fontSize: 9,
                            color: "#667085",
                            whiteSpace: "nowrap",
                            marginRight: 2,
                        }}
                    >
                        Phân nhóm:
                    </span>

                    {GROUP_COLUMNS.map((group) => {
                        const active = activeGroups.includes(group.key);

                        return (
                            <button
                                key={group.key}
                                type="button"
                                aria-pressed={active}
                                onClick={() => toggleGroup(group.key)}
                                style={{
                                    padding: "4px 7px",
                                    height: 26,
                                    background: active
                                        ? "#EAF1FF"
                                        : "#FFFFFF",
                                    border: active
                                        ? "1px solid #1746CE"
                                        : "1px solid #D5DEEF",
                                    borderRadius: 5,
                                    color: active
                                        ? "#001F82"
                                        : "#667085",
                                    fontSize: 9,
                                    fontWeight: active ? 700 : 400,
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    boxSizing: "border-box",
                                }}
                            >
                                {group.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* =====================================
                TABLE
               ===================================== */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    minHeight: 0,
                    flex: 1,
                    overflowX: "hidden",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#D9DEE8 transparent",
                    boxSizing: "border-box",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: 0,
                        maxWidth: "100%",
                        tableLayout: "fixed",
                        borderCollapse: "collapse",
                        borderSpacing: 0,
                        fontSize: 9,
                        color: "#001F82",
                        fontFamily: "Segoe UI, sans-serif",
                    }}
                >
                    {/* COLUMN WIDTH */}
                    <colgroup>
                        {visibleGroups.map((group) => (
                            <col
                                key={group.key}
                                style={{
                                    width: getWidth(group.weight),
                                }}
                            />
                        ))}

                        {METRIC_COLUMNS.map((column) => (
                            <col
                                key={column.key}
                                style={{
                                    width: getWidth(column.weight),
                                }}
                            />
                        ))}
                    </colgroup>

                    {/* TABLE HEADER */}
                    <thead>
                        <tr>
                            {visibleGroups.map((group, index) => (
                                <th
                                    key={group.key}
                                    scope="col"
                                    style={{
                                        ...baseHeaderStyle,
                                        textAlign: "left",
                                        padding:
                                            index === 0
                                                ? "10px 4px 10px 12px"
                                                : "10px 4px",
                                    }}
                                >
                                    {group.label}
                                </th>
                            ))}

                            {METRIC_COLUMNS.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    style={baseHeaderStyle}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody>
                        {groupedData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {visibleGroups.map((group, index) => (
                                    <td
                                        key={group.key}
                                        title={row[group.key]}
                                        style={{
                                            ...baseCellStyle,
                                            textAlign: "left",
                                            padding:
                                                index === 0
                                                    ? "10px 4px 10px 12px"
                                                    : "10px 4px",
                                        }}
                                    >
                                        {row[group.key]}
                                    </td>
                                ))}

                                {renderMetricCells(row)}
                            </tr>
                        ))}

                        {/* TOTAL ROW */}
                        <tr>
                            {visibleGroups.map((group, index) => (
                                <td
                                    key={group.key}
                                    style={{
                                        ...baseCellStyle,
                                        textAlign: "left",
                                        padding:
                                            index === 0
                                                ? "10px 4px 10px 12px"
                                                : "10px 4px",
                                        background: "#E8F0FF",
                                        borderBottom: "none",
                                        fontWeight: 700,
                                    }}
                                >
                                    {index === 0 ? "Tổng" : ""}
                                </td>
                            ))}

                            {renderMetricCells(totals, true)}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* FOOTER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 12px",
                    fontSize: 9,
                    color: "#98A2B3",
                    flexShrink: 0,
                }}
            >
                <span>
                    {selectedMonth ? `Tháng ${selectedMonth}` : period} · Chênh lệch tổng:{" "}
                    {formatSigned(
                        totals.actual - totals.plan
                    )}
                    {" · "}
                    Biến động:{" "}
                    {formatSigned(
                        totals.newJoin - totals.resigned
                    )}
                </span>

                <span style={{ textAlign: "right" }}>
                    {selectedMonth
                        ? getHeadcountMonth(selectedMonth)
                            ? "Phân bổ miền/tỉnh minh họa · Chưa kết nối Fabric"
                            : "Chưa có dữ liệu Headcount cho tháng này"
                        : "Dữ liệu minh họa · Chưa kết nối Fabric"}
                </span>
            </div>
        </div>
    );
}



