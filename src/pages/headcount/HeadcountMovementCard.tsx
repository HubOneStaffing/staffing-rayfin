
import { CardTitle } from "../../components/ui/CardTitle";
import { getDemoMTDValue, getHeadcountMonth, HC_DEMO_YTD_EXITS } from "../../lib/headcountDemo";

type Period = "MTD" | "YTD";

interface HeadcountMovementCardProps {
    period: Period;
    onPeriodChange: (period: Period) => void;
    selectedMonth?: string | null;
    selectedWeek?: string | null;
}

// DỮ LIỆU MINH HỌA - CHƯA KẾT NỐI FABRIC
const demoData = {
    joinMTD: 94,
    joinYTD: 1044,
    exitMTD: 50,
    exitYTD: HC_DEMO_YTD_EXITS,
};

export function HeadcountMovementCard({
    period,
    onPeriodChange,
    selectedMonth = null,
    selectedWeek = null,
}: HeadcountMovementCardProps) {
    const month = getHeadcountMonth(selectedMonth);
    const mtd = getDemoMTDValue(selectedMonth, selectedWeek);
    const joinMTD = mtd.hires;
    const joinYTD = selectedMonth ? month?.hires ?? 0 : demoData.joinYTD;

    const exitMTD = mtd.exits;
    const exitYTD = selectedMonth ? month?.exits ?? 0 : demoData.exitYTD;
    const selectedIsMissing = selectedMonth !== null && month === null;

    const netMTD = joinMTD - exitMTD;
    const netYTD = joinYTD - exitYTD;

    const isYTD = period === "YTD";

    const formatNumber = (value: number) =>
        value.toLocaleString("en-US");

    const formatNet = (value: number) =>
        `${value > 0 ? "+" : ""}${formatNumber(value)}`;

    const netColor = (value: number) => {
        if (value > 0) return "#159447";
        if (value < 0) return "#DC2626";
        return "#001F82";
    };

    const periodStyle = (active: boolean) => ({
        fontSize: active ? 12 : 11,
        fontWeight: 700,
        color: active ? "#001F82" : "#667085",
        opacity: active ? 1 : 0.68,
    });

    const valueStyle = (active: boolean) => ({
        fontSize: active ? 16 : 14,
        fontWeight: 700,
        color: "#001F82",
        opacity: active ? 1 : 0.68,
    });

    return (
        <div
            style={{
                width: 300,
                background: "#FFFFFF",
                border: "1px solid #D9DEE8",
                borderRadius: 12,
                padding: "16px 14px 18px",
                boxSizing: "border-box",
                fontFamily: "Segoe UI, sans-serif",
            }}
        >
            {/* TITLE - DÙNG COMPONENT CHUNG */}
            <div
                style={{
                    marginBottom: 14,
                }}
            >
                <CardTitle>
                    BIẾN ĐỘNG NHÂN SỰ
                </CardTitle>
            </div>

            {/* HEADER */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "42px repeat(3, 1fr)",
                    textAlign: "center",
                    alignItems: "center",
                }}
            >
                <div />

                <div
                    style={{
                        fontSize: 13,
                        color: "#001F82",
                    }}
                >
                    NS mới
                </div>

                <div
                    style={{
                        fontSize: 13,
                        color: "#001F82",
                        borderLeft:
                            "1px solid rgba(0,31,130,0.15)",
                    }}
                >
                    NS nghỉ việc
                </div>

                <div
                    style={{
                        fontSize: 13,
                        lineHeight: 1.15,
                        color: "#001F82",
                        borderLeft:
                            "1px solid rgba(0,31,130,0.15)",
                    }}
                >
                    Biến động
                    <br />
                    vào - nghỉ
                </div>
            </div>

            {/* MTD */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "42px repeat(3, 1fr)",
                    textAlign: "center",
                    alignItems: "center",
                    marginTop: 12,
                }}
            >
                <button
                    type="button"
                    onClick={() => onPeriodChange("MTD")}
                    aria-pressed={!isYTD}
                    style={{
                        ...periodStyle(!isYTD),
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                    }}
                >
                    MTD
                </button>

                <div style={valueStyle(!isYTD)}>
                    {formatNumber(joinMTD)}
                </div>

                <div
                    style={{
                        ...valueStyle(!isYTD),
                        borderLeft:
                            "1px solid rgba(0,31,130,0.15)",
                    }}
                >
                    {formatNumber(exitMTD)}
                </div>

                <div
                    style={{
                        ...valueStyle(!isYTD),
                        color: netColor(netMTD),
                        borderLeft:
                            "1px solid rgba(0,31,130,0.15)",
                    }}
                >
                    {formatNet(netMTD)}
                </div>
            </div>

            {/* YTD */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "42px repeat(3, 1fr)",
                    textAlign: "center",
                    alignItems: "center",
                    marginTop: 12,
                }}
            >
                <button
                    type="button"
                    onClick={() => onPeriodChange("YTD")}
                    aria-pressed={isYTD}
                    style={{
                        ...periodStyle(isYTD),
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                    }}
                >
                    {selectedMonth ? `T${selectedMonth.slice(0, 2)}` : "YTD"}
                </button>

                <div style={valueStyle(isYTD)}>
                    {selectedIsMissing ? "—" : formatNumber(joinYTD)}
                </div>

                <div
                    style={{
                        ...valueStyle(isYTD),
                        borderLeft:
                            "1px solid rgba(0,31,130,0.15)",
                    }}
                >
                    {selectedIsMissing ? "—" : formatNumber(exitYTD)}
                </div>

                <div
                    style={{
                        ...valueStyle(isYTD),
                        color: netColor(netYTD),
                        borderLeft:
                            "1px solid rgba(0,31,130,0.15)",
                    }}
                >
                    {selectedIsMissing ? "—" : formatNet(netYTD)}
                </div>
            </div>

            {/* FOOTER */}
            <div
                style={{
                    marginTop: 12,
                    textAlign: "right",
                    fontSize: 9,
                    color: "#98A2B3",
                }}
            >
                {selectedMonth ? `Tháng ${selectedMonth} · Dữ liệu minh họa` : "Dữ liệu minh họa"}
            </div>
        </div>
    );
}
