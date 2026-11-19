
import { CardTitle } from "../../components/ui/CardTitle";
import { getDemoMTDValue, getHeadcountMonth } from "../../lib/headcountDemo";

export function HeadcountCurrentCard({ period = "YTD", selectedMonth = null, selectedWeek = null }: {
    period?: "MTD" | "YTD"; selectedMonth?: string | null; selectedWeek?: string | null;
}) {
    // DỮ LIỆU MINH HỌA - CHƯA KẾT NỐI FABRIC
    const month = getHeadcountMonth(selectedMonth);
    const mtd = getDemoMTDValue(selectedMonth, selectedWeek);
    const hcActual = period === "MTD" ? mtd.actual : selectedMonth ? month?.actual ?? 0 : 5304;
    const hcPlan = period === "MTD" ? mtd.plan : selectedMonth ? month?.plan ?? 0 : 5550;
    const hasMonthData = period === "MTD" ? mtd.month !== null : !selectedMonth || month !== null;

    const hcGap = hcActual - hcPlan;

    const fillRate =
        hcPlan > 0 ? hcActual / hcPlan : 0;

    const vacantRate =
        hcPlan > 0
            ? Math.max(hcPlan - hcActual, 0) / hcPlan
            : 0;

    const formatNumber = (value: number) =>
        value.toLocaleString("en-US");

    const formatSigned = (value: number) =>
        `${value > 0 ? "+" : ""}${formatNumber(value)}`;

    return (
        <div
            style={{
                width: 300,
                minHeight: 150,
                display: "grid",
                gridTemplateColumns: "1.2fr 1px 0.8fr",
                gap: 16,
                alignItems: "stretch",

                // PADDING CHUNG CỦA DASHBOARD
                padding: "16px 14px",

                background: "#FFFFFF",
                border: "1px solid #D9DEE8",
                borderRadius: 12,
                fontFamily: "Segoe UI, sans-serif",
                boxSizing: "border-box",
            }}
        >
            {/* LEFT */}
            <div>
                {/* TITLE */}
                <CardTitle>
                    NHÂN SỰ HIỆN TẠI
                </CardTitle>

                {/* HC ACTUAL / PLAN */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        marginTop: 14,
                        color: "#001F82",
                        fontWeight: 700,
                        fontSize: 20,
                    }}
                >
                    <span>{hasMonthData ? formatNumber(hcActual) : "—"}</span>
                    <span>/</span>
                    <span>{hasMonthData ? formatNumber(hcPlan) : "—"}</span>
                </div>

                {/* FILL RATE LABEL */}
                <div
                    style={{
                        marginTop: 10,
                        fontSize: 13,
                        color: "#001F82",
                        textAlign: "center",
                    }}
                >
                    % Thực đạt
                </div>

                {/* FILL RATE VALUE */}
                <div
                    style={{
                        marginTop: 5,
                        fontSize: 16,
                        fontWeight: 700,
                        textAlign: "center",
                        color:
                            fillRate >= 0.98
                                ? "#16A34A"
                                : "#DC2626",
                    }}
                >
                    {hasMonthData ? `${(fillRate * 100).toFixed(1)}%` : "—"}
                </div>
            </div>

            {/* DIVIDER */}
            <div
                style={{
                    width: 1,
                    background: "rgba(0,31,130,0.18)",
                }}
            />

            {/* RIGHT */}
            <div>
                {/* VACANT LABEL */}
                <div
                    style={{
                        fontSize: 13,
                        color: "#001F82",
                        textAlign: "center",
                    }}
                >
                    Vacant
                </div>

                {/* VACANT VALUE */}
                <div
                    style={{
                        marginTop: 14,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "baseline",
                        gap: 6,
                    }}
                >
                    <span
                        style={{
                            fontSize: 17,
                            fontWeight: 700,
                            color:
                                hcGap < 0
                                    ? "#DC2626"
                                    : "#001F82",
                        }}
                    >
                        {hasMonthData ? formatSigned(hcGap) : "—"}
                    </span>

                    <span
                        style={{
                            fontSize: 11,
                            color: "#001F82",
                        }}
                    >
                        NS
                    </span>
                </div>

                {/* VACANT RATE LABEL */}
                <div
                    style={{
                        marginTop: 10,
                        fontSize: 13,
                        color: "#001F82",
                        textAlign: "center",
                    }}
                >
                    % Vacant
                </div>

                {/* VACANT RATE VALUE */}
                <div
                    style={{
                        marginTop: 5,
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#001F82",
                        textAlign: "center",
                    }}
                >
                    {hasMonthData ? `${(vacantRate * 100).toFixed(1)}%` : "—"}
                </div>
            </div>
        </div>
    );
}
