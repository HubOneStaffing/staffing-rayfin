import { useLayoutEffect, useRef, useState } from "react";
import { allocateByWeights, getDemoMTDValue, headcountByMonth } from "../../lib/headcountDemo";

type Breakdown = "tenure" | "gender" | "age" | "contract";

const breakdowns: Record<Breakdown, { name: string; color: string; weight: number }[]> = {
    tenure: [
        { name: "Probation", color: "#3157C7", weight: 5 },
        { name: "< 3 tháng", color: "#4A9BF2", weight: 10 },
        { name: "3 - 6 tháng", color: "#82C7F0", weight: 16 },
        { name: "6 tháng - 1 năm", color: "#B6E1F5", weight: 8 },
        { name: "1 - 2 năm", color: "#FFF58A", weight: 16 },
        { name: "2 - 5 năm", color: "#FFE09A", weight: 21 },
        { name: "> 5 năm", color: "#FF86B0", weight: 24 },
    ],
    gender: [
        { name: "Nam", color: "#4A9BF2", weight: 45 },
        { name: "Nữ", color: "#FF86B0", weight: 55 },
    ],
    age: [
        { name: "< 25 tuổi", color: "#3157C7", weight: 18 },
        { name: "25 - 34 tuổi", color: "#82C7F0", weight: 43 },
        { name: "35 - 44 tuổi", color: "#FFE09A", weight: 29 },
        { name: "≥ 45 tuổi", color: "#FF86B0", weight: 10 },
    ],
    contract: [
        { name: "Thử việc", color: "#4A9BF2", weight: 19 },
        { name: "Xác định thời hạn", color: "#FFE09A", weight: 46 },
        { name: "Không xác định thời hạn", color: "#FF86B0", weight: 35 },
    ],
};

export function MonthlyTurnoverStructureChart({ period = "YTD", selectedMonth = null, active = null, onHover, onSelect }: {
    period?: "MTD" | "YTD"; selectedMonth?: string | null;
    active?: string | null; onHover?: (label: string | null) => void; onSelect?: (label: string) => void;
}) {
    const [breakdown, setBreakdown] = useState<Breakdown>("tenure");
    const [zoom, setZoom] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const plotScrollRef = useRef<HTMLDivElement>(null);
    const groups = breakdowns[breakdown];
    const monthRows = period === "MTD"
        ? getDemoMTDValue(selectedMonth, null).weeks.map(({ label, exits }) => ({ month: label, exits }))
        : headcountByMonth.map(({ month, exits }) => ({ month, exits }));
    const columnWidths = active && monthRows.some((row) => row.month === active)
        ? monthRows.map((row) => row.month === active ? "2.4fr" : "0.65fr").join(" ")
        : `repeat(${monthRows.length},minmax(0,1fr))`;
    const valuesByMonth = monthRows.map((month, monthIndex) =>
        allocateByWeights(month.exits, groups.map((group, index) => group.weight * (1 + 0.07 * Math.sin(monthIndex + index))))
    );
    const totalExits = monthRows.reduce((sum, month) => sum + month.exits, 0);

    // Giữ đáy cột (màu xanh) ở sát trục tháng khi zoom và đổi phân nhóm.
    // Những phần màu hồng ở phía trên có thể xem bằng cách cuộn lên.
    useLayoutEffect(() => {
        const plot = plotScrollRef.current;
        if (plot) plot.scrollTop = plot.scrollHeight - plot.clientHeight;
    }, [zoom, breakdown, period, selectedMonth]);

    return (
        <section style={{ background: "#FFFFFF", border: "1px solid #D9DEE8", borderRadius: 12, padding: "12px 14px", minWidth: 0, minHeight: 380, color: "#001F82", display: "flex", flexDirection: "column", gap: 10 }}>
            <style>{`
                .turnover-vertical-zoom { appearance: none; -webkit-appearance: none; background: #D9DEE8; border-radius: 10px; }
                .turnover-vertical-zoom::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 15px; height: 15px; border-radius: 50%; background: #438DF2; border: 2px solid white; box-shadow: 0 0 0 1px #438DF2; }
                .turnover-vertical-zoom::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #438DF2; border: 2px solid white; box-shadow: 0 0 0 1px #438DF2; }
                .turnover-light-scroll { scrollbar-color: #D5DCE9 #F7F9FD; scrollbar-width: thin; }
                .turnover-light-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
                .turnover-light-scroll::-webkit-scrollbar-track { background: #F7F9FD; border-radius: 5px; }
                .turnover-light-scroll::-webkit-scrollbar-thumb { background: #D5DCE9; border-radius: 5px; }
            `}</style>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <strong style={{ fontSize: 12 }}>CƠ CẤU NHÂN SỰ NGHỈ VIỆC</strong>
                <select aria-label="Chọn nhóm phân tích cơ cấu nghỉ việc" value={breakdown} onChange={(event) => setBreakdown(event.target.value as Breakdown)}
                    style={{ border: "1px solid #B8C9EA", borderRadius: 6, padding: "5px 9px", background: "white", color: "#001F82", fontSize: 10 }}>
                    <option value="gender">Giới tính</option>
                    <option value="age">Nhóm độ tuổi</option>
                    <option value="tenure">Nhóm thâm niên</option>
                    <option value="contract">Loại hợp đồng</option>
                </select>
            </div>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", fontSize: 9, color: "#667085" }}>
                {groups.map((group) => <span key={group.name} style={{ whiteSpace: "nowrap" }}><span style={{ color: group.color }}>●</span> {group.name}</span>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "20px minmax(0,1fr)", gap: 8, height: 270, flexShrink: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", color: "#001F82", fontSize: 10 }}>
                    <span>+</span>
                    <input className="turnover-vertical-zoom" type="range" aria-label="Thu phóng biểu đồ theo chiều dọc" min={0} max={100} value={zoom} onChange={(event) => setZoom(Number(event.target.value))}
                        style={{ height: 215, width: 5, writingMode: "vertical-lr", direction: "rtl", cursor: "pointer" }} />
                    <span>−</span>
                </div>
                <div style={{ minWidth: 0, height: 270, overflow: "hidden" }}>
                    <div ref={plotScrollRef} className="turnover-light-scroll" style={{ height: 250, width: "100%", overflowY: "auto", overflowX: "hidden" }}>
                        <div style={{ height: `${250 + zoom / 100 * 250}px`, display: "grid", gridTemplateColumns: columnWidths, gap: 8, padding: "0 24px", boxSizing: "border-box", alignItems: "stretch", transition: "grid-template-columns 180ms ease" }}>
                            {monthRows.map((month, monthIndex) => <div key={month.month}
                                onMouseEnter={() => onHover?.(month.month)} onMouseLeave={() => onHover?.(null)} onClick={() => onSelect?.(month.month)}
                                role="button" tabIndex={0} aria-label={`${month.month}: ${month.exits} nhân sự nghỉ việc`}
                                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect?.(month.month); }}
                                style={{ height: "100%", width: active === month.month ? "100%" : "76%", margin: "0 auto", display: "flex", flexDirection: "column-reverse", minWidth: 0, cursor: "pointer", position: "relative", outline: "none", borderBottom: active === month.month ? "3px solid #2563EB" : "3px solid transparent", opacity: active && active !== month.month ? 0.22 : 1, zIndex: active === month.month ? 2 : 0, transition: "opacity 180ms ease, width 180ms ease" }}>
                                {valuesByMonth[monthIndex].map((value, groupIndex) => <div key={groups[groupIndex].name}
                                    title={`${month.month} · ${groups[groupIndex].name}: ${value} NS (${month.exits ? (100 * value / month.exits).toFixed(1) : "0.0"}%)`}
                                    style={{ flexGrow: value, flexBasis: 0, minHeight: value > 0 ? 18 : 0, background: groups[groupIndex].color, display: value > 0 ? "flex" : "none", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                                    <span style={{ fontSize: 10, fontWeight: 500, whiteSpace: "nowrap", color: "#001F82" }}>{value} ({month.exits ? (100 * value / month.exits).toFixed(1) : "0.0"}%)</span>
                                </div>)}
                                {active === month.month && <div style={{ position: "absolute", top: 8, ...(monthIndex < monthRows.length / 2 ? { left: "calc(100% + 7px)" } : { right: "calc(100% + 7px)" }), background: "#FFFFFF", border: "1px solid #BBD0F4", borderRadius: 6, padding: "6px 8px", boxShadow: "0 2px 9px #15356B20", color: "#001F82", fontSize: 10, whiteSpace: "nowrap", zIndex: 3, pointerEvents: "none" }}>
                                    <strong>{month.month}</strong> · Nghỉ {month.exits} NS
                                </div>}
                            </div>)}
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: columnWidths, gap: 8, width: "100%", padding: "0 24px", boxSizing: "border-box", marginTop: 7, fontSize: 9, color: "#667085", textAlign: "center", transition: "grid-template-columns 180ms ease" }}>
                        {monthRows.map((month) => <span key={month.month}>{month.month}</span>)}
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowDetails((current) => !current)} aria-expanded={showDetails}
                    style={{ background: "#EDF3FF", color: "#001F82", border: "1px solid #B8C9EA", borderRadius: 5, padding: "5px 8px", cursor: "pointer", fontSize: 9 }}>
                    Chi tiết số & % {showDetails ? "▲" : "▼"}
                </button>
            </div>
            {showDetails && <div className="turnover-light-scroll" style={{ maxHeight: 235, overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, textAlign: "center", tableLayout: "fixed" }}>
                    <thead><tr style={{ background: "#EDF3FF" }}>
                        <th style={{ padding: "9px 4px", textAlign: "left", width: "22%" }}>{breakdown === "tenure" ? "Nhóm thâm niên" : breakdown === "gender" ? "Giới tính" : breakdown === "age" ? "Nhóm độ tuổi" : "Loại hợp đồng"}</th>
                        {monthRows.map((month) => <th key={month.month} style={{ padding: "9px 3px" }}>{month.month}</th>)}
                    </tr></thead>
                    <tbody>{groups.map((group, groupIndex) => <tr key={group.name}>
                        <td style={{ padding: "8px 4px", borderBottom: "1px solid #E5EAF3", textAlign: "left" }}><span style={{ color: group.color }}>●</span> {group.name}</td>
                        {monthRows.map((month, monthIndex) => <td key={month.month} style={{ padding: "8px 2px", borderBottom: "1px solid #E5EAF3" }}>
                            {valuesByMonth[monthIndex][groupIndex]} ({month.exits ? (100 * valuesByMonth[monthIndex][groupIndex] / month.exits).toFixed(1) : "0.0"}%)
                        </td>)}
                    </tr>)}
                        <tr style={{ background: "#EDF3FF", fontWeight: 700 }}><td style={{ padding: "9px 4px", textAlign: "left" }}>Tổng</td>
                            {monthRows.map((month) => <td key={month.month}>{month.exits}</td>)}
                        </tr>
                    </tbody>
                </table>
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontSize: 9, color: "#98A2B3" }}>
                <span>{period} · Theo {period === "MTD" ? "tuần" : "tháng"} · Zoom {zoom}% · Tổng hiển thị: {totalExits} NS</span>
                <span>Dữ liệu minh họa · Đồng bộ HC</span>
            </div>
        </section>
    );
}
