import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import type { DashboardPage } from "../../components/layout/DashboardSidebar";
import { DashboardShell } from "../../components/layout/DashboardShell";
import { FilterBar } from "../../components/filters/FilterBar";
import type { StaffingFilters } from "../../services/staffingFilters";
import { allocateByWeights, getDemoMTDValue, headcountByMonth, HC_DEMO_MONTHLY_TURNOVER, HC_DEMO_YTD_EXITS, HC_DEMO_YTD_TURNOVER } from "../../lib/headcountDemo";
import { MonthlyTurnoverStructureChart } from "./MonthlyTurnoverStructureChart";

type Period = "MTD" | "YTD";

interface TurnoverDashboardProps {
    onPageChange?: (page: DashboardPage) => void;
    filters?: StaffingFilters;
    onFiltersChange?: (next: StaffingFilters) => void;
}

const BLUE = "#001F82";
const BORDER = "#D9DEE8";
const CARD: CSSProperties = {
    background: "#FFFFFF",
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: "11px 12px",
    boxSizing: "border-box",
    minWidth: 0,
    color: BLUE,
};

const months = headcountByMonth.map((row) => row.month);
// 01–05 là tỷ lệ demo bổ sung; 06–11 dùng đúng tỷ lệ của HC.
const trendMonths = ["01/2026", "02/2026", "03/2026", "04/2026", "05/2026", ...months];
const rateYTD = trendMonths.map((month) => (HC_DEMO_MONTHLY_TURNOVER[month] ?? ({
    "01/2026": 0.022, "02/2026": 0.031, "03/2026": 0.059,
    "04/2026": 0.049, "05/2026": 0.036,
} as Record<string, number>)[month]) * 100);
const fmt = (value: number) => value.toLocaleString("en-US");

function Panel({ title, children, minHeight = 220, action }: { title: string; children: ReactNode; minHeight?: number; action?: ReactNode }) {
    return (
        <section style={{ ...CARD, minHeight, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, lineHeight: "16px", fontWeight: 700 }}>{title}</div>
                {action}
            </div>
            {children}
        </section>
    );
}

type PeriodInteraction = { active: string | null; onHover: (label: string | null) => void; onSelect: (label: string) => void };

function Trend({ period, selectedMonth, active, onHover, onSelect }: { period: Period; selectedMonth: string | null } & PeriodInteraction) {
    const weeks = getDemoMTDValue(selectedMonth, null).weeks;
    const values = period === "YTD" ? rateYTD : weeks.map((week) => week.turnover * 100);
    const labels = period === "YTD" ? trendMonths : weeks.map((week) => week.label);
    const average = period === "YTD" ? 4 : values.reduce((sum, rate) => sum + rate, 0) / Math.max(values.length, 1);
    const x = (index: number) => 75 + (index / Math.max(1, values.length - 1)) * 750;
    const y = (value: number) => 166 - (value / 7) * 132;
    const ABOVE = "#F3344D";
    const BELOW = "#092D95";
    const coloredSegments = values.slice(1).flatMap((value, offset) => {
        const start = values[offset];
        const end = value;
        const x1 = x(offset);
        const x2 = x(offset + 1);
        if ((start >= average) === (end >= average)) {
            return [{ x1, x2, y1: y(start), y2: y(end), color: start > average || end > average ? ABOVE : BELOW }];
        }
        const ratio = (average - start) / (end - start);
        const crossingX = x1 + ratio * (x2 - x1);
        return [
            { x1, x2: crossingX, y1: y(start), y2: y(average), color: start > average ? ABOVE : BELOW },
            { x1: crossingX, x2, y1: y(average), y2: y(end), color: end > average ? ABOVE : BELOW },
        ];
    });

    return (
        <svg viewBox="0 0 900 200" preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: 188, display: "block" }}
            aria-label="Xu hướng tỷ lệ nghỉ việc">
            {[0, 2, 4, 6].map((tick) => (
                <g key={tick}>
                    <line x1="75" x2="825" y1={y(tick)} y2={y(tick)} stroke="#EBF0F8" strokeDasharray="3 4" />
                </g>
            ))}
            {labels.map((label, index) => <line key={label} x1={x(index)} x2={x(index)} y1={34} y2={166} stroke="#F0F4FA" strokeDasharray="3 4" />)}
            {active && labels.includes(active) && <rect x={Math.max(48, x(labels.indexOf(active)) - 30)} y="34" width="60" height="133" rx="6" fill="#F9E6B9" opacity="0.55" pointerEvents="none" />}
            <line x1="75" x2="825" y1={y(average)} y2={y(average)} stroke="#F28B2D" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x="18" y={y(average) - 11} fontSize="12" fontWeight="700" fill="#DB761A">TB {average.toFixed(1)}%</text>
            {coloredSegments.map((segment, index) => <line key={index} x1={segment.x1} y1={segment.y1} x2={segment.x2} y2={segment.y2} stroke={segment.color} strokeWidth="2.5" />)}
            {values.map((value, index) => (
                <g key={labels[index]} onMouseEnter={() => onHover(labels[index])} onMouseLeave={() => onHover(null)} onClick={() => onSelect(labels[index])}
                    role="button" tabIndex={0} aria-label={`Chọn ${labels[index]}, tỷ lệ nghỉ việc ${value.toFixed(1)}%`}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(labels[index]); }}
                    style={{ cursor: "pointer", outline: "none" }}>
                    <rect x={x(index) - 22} y="25" width="44" height="170" fill="transparent" />
                    <circle cx={x(index)} cy={y(value)} r={active === labels[index] ? 5 : 3.5} fill={value > average ? ABOVE : BELOW} stroke="white" strokeWidth="1" />
                    <text x={x(index)} y={y(value) - 12} textAnchor="middle" fill={value > average ? ABOVE : BELOW} fontSize="13" fontWeight="700">{value.toFixed(1)}%</text>
                    <text x={x(index)} y="193" textAnchor="middle" fill="#667085" fontSize="11">{period === "YTD" ? labels[index].replace("/2026", "/26") : labels[index]}</text>
                    <title>{labels[index]}: Tỷ lệ nghỉ việc {value.toFixed(1)}%</title>
                </g>
            ))}
            {active && labels.includes(active) && (() => {
                const index = labels.indexOf(active);
                const rate = values[index];
                const boxX = Math.min(730, Math.max(8, index < labels.length / 2 ? x(index) + 16 : x(index) - 171));
                const boxY = Math.min(136, Math.max(4, y(rate) - 20));
                return <g pointerEvents="none">
                    <rect x={boxX} y={boxY} width="155" height="56" rx="7" fill="white" stroke="#BBD0F4" />
                    <text x={boxX + 9} y={boxY + 16} fill={BLUE} fontSize="11" fontWeight="700">{active}</text>
                    <text x={boxX + 9} y={boxY + 31} fill={BLUE} fontSize="11">Tỷ lệ nghỉ: {rate.toFixed(1)}%</text>
                    <text x={boxX + 9} y={boxY + 46} fill={rate > average ? "#F3344D" : "#159447"} fontSize="10">Chênh lệch: {rate > average ? "+" : ""}{(rate - average).toFixed(1)}%</text>
                </g>;
            })()}
        </svg>
    );
}

type OverviewGroup = "region" | "province" | "role" | "manager1" | "manager2";
const overviewGroups: { key: OverviewGroup; label: string }[] = [
    { key: "region", label: "Miền" },
    { key: "province", label: "Tỉnh" },
    { key: "role", label: "Vị trí" },
    { key: "manager1", label: "QL cấp 1" },
    { key: "manager2", label: "QL cấp 2" },
];
type TurnoverDetail = Record<OverviewGroup, string> & { resign: number; actual: number };
// Các dòng chi tiết đồng nhất cơ cấu của bảng TỔNG QUAN NHÂN SỰ (HC).
const turnoverDetails: TurnoverDetail[] = [
    { region: "Miền Bắc", province: "Hà Nội", role: "FC", manager1: "QL 01", manager2: "QL 05", resign: 166, actual: 1180 },
    { region: "Miền Trung", province: "Đà Nẵng", role: "FC", manager1: "QL 03", manager2: "QL 06", resign: 122, actual: 830 },
    { region: "Miền Nam", province: "TP. Hồ Chí Minh", role: "FC", manager1: "QL 04", manager2: "QL 07", resign: 201, actual: 1430 },
    { region: "Miền Nam", province: "Đồng Nai", role: "Manager", manager1: "QL 04", manager2: "QL 08", resign: 142, actual: 980 },
    { region: "Miền Bắc", province: "Hải Phòng", role: "Supervisor", manager1: "QL 02", manager2: "QL 05", resign: 107, actual: 620 },
];

function Overview({ period, exits, rate, groups: selectedGroups }: { period: Period; exits: number; rate: number; groups: OverviewGroup[] }) {
    const allocation = allocateByWeights(exits, turnoverDetails.map((row) => row.resign));
    const details = turnoverDetails.map((row, index) => ({ ...row, resign: allocation[index] }));
    const data = Object.values(details.reduce<Record<string, TurnoverDetail>>((acc, row) => {
        const key = overviewGroups.filter((item) => selectedGroups.includes(item.key)).map((item) => row[item.key]).join("||");
        if (!acc[key]) acc[key] = { ...row, resign: 0, actual: 0 };
        acc[key].resign += row.resign;
        acc[key].actual += row.actual;
        return acc;
    }, {}));
    const visibleGroups = overviewGroups.filter((item) => selectedGroups.includes(item.key));
    const total = data.reduce((sum, row) => sum + row.resign, 0);
    const totalActual = data.reduce((sum, row) => sum + row.actual, 0);
    const totalRate = rate;

    return (
        <div style={{ overflowX: "auto", maxHeight: 255, overflowY: "auto" }}>
            <table style={{ width: "100%", minWidth: visibleGroups.length >= 4 ? 680 : undefined, borderCollapse: "collapse", fontSize: 10, tableLayout: "fixed" }}>
                <thead>
                    <tr>{[...visibleGroups.map((item) => item.label), "NS nghỉ", "NS thực tế", "Tỷ lệ nghỉ việc*", "Tỷ trọng NS nghỉ"].map((name) => (
                        <th key={name} style={{ position: "sticky", top: 0, zIndex: 1, padding: "7px 6px", background: "#EDF3FF", textAlign: "left" }}>{name}</th>
                    ))}</tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={visibleGroups.map((item) => row[item.key]).join("||")}
                            title={`${visibleGroups.map((item) => row[item.key]).join(" · ")}: ${fmt(row.resign)} NS nghỉ, ${fmt(row.actual)} NS thực tế`}>
                            {visibleGroups.map((item) => <td key={item.key} style={{ padding: "7px 6px", borderBottom: "1px solid #E8EDF6" }}>{row[item.key]}</td>)}
                            <td style={{ borderBottom: "1px solid #E8EDF6" }}>{fmt(row.resign)}</td>
                            <td style={{ borderBottom: "1px solid #E8EDF6" }}>{fmt(row.actual)}</td>
                            <td style={{ color: "#DC2626", borderBottom: "1px solid #E8EDF6" }}>{(total ? 100 * totalRate * (row.resign / row.actual) / (total / totalActual) : 0).toFixed(1)}%</td>
                            <td style={{ borderBottom: "1px solid #E8EDF6" }}>{(total ? 100 * row.resign / total : 0).toFixed(1)}%</td>
                        </tr>
                    ))}
                    <tr style={{ background: "#E8F0FF", fontWeight: 700 }}>
                        <td style={{ padding: "10px 6px" }}>Tổng</td>
                        {visibleGroups.slice(1).map((item) => <td key={item.key} />)}
                        <td>{fmt(total)}</td><td>{fmt(totalActual)}</td><td>{(100 * totalRate).toFixed(1)}%</td><td>100.0%</td>
                    </tr>
                </tbody>
            </table>
            <div style={{ fontSize: 9, color: "#98A2B3", marginTop: 5 }}>* Tỷ lệ demo theo HC ({period}); các phân nhóm khác miền là số mô phỏng theo cùng tổng.</div>
        </div>
    );
}

function FormChart({ period, selectedMonth, active, onHover, onSelect }: { period: Period; selectedMonth: string | null } & PeriodInteraction) {
    const [zoom, setZoom] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const plotRef = useRef<HTMLDivElement>(null);
    const weeks = getDemoMTDValue(selectedMonth, null).weeks;
    const labels = period === "YTD" ? months : weeks.map((week) => week.label);
    const exits = period === "YTD" ? headcountByMonth.map((row) => row.exits) : weeks.map((week) => week.exits);
    const voluntary = exits.map((count) => Math.round(count * 0.7));
    const involuntary = exits.map((count, index) => count - voluntary[index]);
    const columnWidths = active && labels.includes(active)
        ? labels.map((label) => label === active ? "2.4fr" : "0.65fr").join(" ")
        : `repeat(${labels.length},minmax(0,1fr))`;
    useLayoutEffect(() => {
        const plot = plotRef.current;
        if (plot) plot.scrollTop = plot.scrollHeight - plot.clientHeight;
    }, [zoom, period, selectedMonth]);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 0 }}>
            <style>{`
                .turnover-form-zoom { appearance: none; -webkit-appearance: none; background: #D9DEE8; border-radius: 10px; }
                .turnover-form-zoom::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 15px; height: 15px; border: 2px solid white; border-radius: 50%; background: #438DF2; box-shadow: 0 0 0 1px #438DF2; }
                .turnover-form-zoom::-moz-range-thumb { width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; background: #438DF2; box-shadow: 0 0 0 1px #438DF2; }
            `}</style>
            <div style={{ display: "flex", gap: 12, fontSize: 9, color: "#667085" }}>
                <span><span style={{ color: "#63ABF0" }}>■</span> Tự nguyện</span>
                <span><span style={{ color: "#FFE09A" }}>■</span> Không tự nguyện</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "20px minmax(0,1fr)", gap: 8, height: 270, flexShrink: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", fontSize: 10 }}>
                    <span>+</span>
                    <input className="turnover-form-zoom" type="range" min={0} max={100} value={zoom} aria-label="Thu phóng hình thức nghỉ việc theo chiều dọc" onChange={(event) => setZoom(Number(event.target.value))}
                        style={{ height: 215, width: 5, writingMode: "vertical-lr", direction: "rtl", cursor: "pointer" }} />
                    <span>−</span>
                </div>
                <div style={{ height: 270, minWidth: 0, overflow: "hidden" }}>
                    <div ref={plotRef} className="turnover-light-scroll" style={{ height: 250, width: "100%", overflowY: "auto", overflowX: "hidden" }}>
                        <div style={{ height: `${250 + zoom / 100 * 250}px`, display: "grid", gridTemplateColumns: columnWidths, gap: 8, padding: "0 24px", boxSizing: "border-box", transition: "grid-template-columns 180ms ease" }}>
                            {labels.map((label, index) => <div key={label} onMouseEnter={() => onHover(label)} onMouseLeave={() => onHover(null)} onClick={() => onSelect(label)}
                                role="button" tabIndex={0} aria-label={`${label}: ${exits[index]} nhân sự nghỉ việc`}
                                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(label); }}
                                style={{ height: "100%", width: active === label ? "100%" : "76%", margin: "0 auto", display: "flex", flexDirection: "column-reverse", minWidth: 0, cursor: "pointer", outline: "none", borderBottom: active === label ? "3px solid #2563EB" : "3px solid transparent", opacity: active && active !== label ? 0.22 : 1, position: "relative", zIndex: active === label ? 2 : 0, transition: "opacity 180ms ease, width 180ms ease" }}>
                                {[
                                    { name: "Tự nguyện", count: voluntary[index], color: "#63ABF0" },
                                    { name: "Không tự nguyện", count: involuntary[index], color: "#FFE09A" },
                                ].map(({ name, count, color }) => <div key={name} title={`${label} · ${name}: ${count} NS (${exits[index] ? (100 * count / exits[index]).toFixed(1) : 0}%)`}
                                    style={{ flexGrow: count, flexBasis: 0, minHeight: count ? 20 : 0, display: count ? "flex" : "none", justifyContent: "center", alignItems: "center", background: color, overflow: "hidden" }}>
                                    <span style={{ fontSize: 10, color: BLUE, whiteSpace: "nowrap" }}>{count} ({exits[index] ? (100 * count / exits[index]).toFixed(1) : 0}%)</span>
                                </div>)}
                                {active === label && <div style={{ position: "absolute", top: 8, ...(index < labels.length / 2 ? { left: "calc(100% + 7px)" } : { right: "calc(100% + 7px)" }), background: "#FFFFFF", border: "1px solid #BBD0F4", borderRadius: 6, padding: "6px 8px", boxShadow: "0 2px 9px #15356B20", color: BLUE, fontSize: 10, whiteSpace: "nowrap", zIndex: 3, pointerEvents: "none" }}>
                                    <strong>{label}</strong> · Nghỉ {exits[index]} NS
                                </div>}
                            </div>)}
                        </div>
                    </div>
                    <div style={{ width: "100%", padding: "0 24px", boxSizing: "border-box", marginTop: 7, display: "grid", gridTemplateColumns: columnWidths, gap: 8, textAlign: "center", fontSize: 9, color: "#667085", transition: "grid-template-columns 180ms ease" }}>
                        {labels.map((label) => <span key={label}>{label}</span>)}
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" aria-expanded={showDetails} onClick={() => setShowDetails((value) => !value)}
                    style={{ padding: "5px 8px", background: "#EDF3FF", color: BLUE, border: "1px solid #B8C9EA", borderRadius: 5, cursor: "pointer", fontSize: 9 }}>
                    Chi tiết số & % {showDetails ? "▲" : "▼"}
                </button>
            </div>
            {showDetails && <div className="turnover-light-scroll" style={{ maxHeight: 220, overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", textAlign: "center", fontSize: 10 }}>
                    <thead><tr style={{ background: "#EDF3FF" }}><th style={{ width: "22%", textAlign: "left", padding: 9 }}>Hình thức</th>{labels.map((label) => <th key={label}>{label}</th>)}</tr></thead>
                    <tbody>{[
                        { name: "Tự nguyện", values: voluntary, color: "#63ABF0" },
                        { name: "Không tự nguyện", values: involuntary, color: "#FFE09A" },
                    ].map((row) => <tr key={row.name}><td style={{ textAlign: "left", padding: 9, borderBottom: "1px solid #E5EAF3" }}><span style={{ color: row.color }}>●</span> {row.name}</td>
                        {row.values.map((value, index) => <td key={labels[index]} style={{ padding: 9, borderBottom: "1px solid #E5EAF3" }}>{value} ({exits[index] ? (100 * value / exits[index]).toFixed(1) : 0}%)</td>)}
                    </tr>)}
                        <tr style={{ background: "#EDF3FF", fontWeight: 700 }}><td style={{ textAlign: "left", padding: 9 }}>Tổng</td>{exits.map((value, index) => <td key={labels[index]}>{value}</td>)}</tr>
                    </tbody>
                </table>
            </div>}
            <div style={{ fontSize: 9, color: "#98A2B3" }}>{period} · Theo {period === "YTD" ? "tháng" : "tuần"} · Zoom {zoom}% · Tổng minh họa: {fmt(exits.reduce((sum, value) => sum + value, 0))} NS · HC demo</div>
        </div>
    );
}

const reasons = [
    ["Cắt giảm HC chủ động", 84], ["Bán việc gia đình", 76],
    ["Lý do cá nhân", 74], ["Kết thúc casual", 56],
    ["Không đạt thử việc", 49], ["Thay đổi định hướng", 28],
    ["Chuyển role / Agency", 27], ["Vi phạm kỷ luật", 24],
];

const employees = [
    ["EMP-14588", "LƯƠNG CHÍ THÀNH", "HCM", "SA", "COOP NGUYỄN TRÃI", "16/11/2026", "Probation", "Chuyển role SA"],
    ["EMP-14519", "LƯU THANH PHI", "HCM", "SIP", "COOP NGUYỄN TRÃI", "12/11/2026", "Probation", "Kết thúc HĐLĐ"],
    ["EMP-13977", "VÕ MINH HOÀNG", "HCM", "SIP", "COOP ĐOÀN PHÚ", "11/11/2026", "< 3 tháng", "Không đạt thử việc"],
    ["EMP-13488", "TRẦN THỊ LAN", "CENTRAL", "SA", "GO! TAM KỲ", "09/11/2026", "3 - 6 tháng", "Lý do cá nhân"],
];

export function TurnoverDashboard({ onPageChange, filters, onFiltersChange }: TurnoverDashboardProps) {
    const [period, setPeriod] = useState<Period>("YTD");
    const [hoveredPeriod, setHoveredPeriod] = useState<string | null>(null);
    const [pinnedPeriod, setPinnedPeriod] = useState<string | null>(null);
    const selectPeriod = (label: string) => {
        setPinnedPeriod((current) => current === label ? null : label);
        setHoveredPeriod(null);
    };
    const changePeriod = (next: Period) => { setPeriod(next); setHoveredPeriod(null); setPinnedPeriod(null); };
    const [overviewGroupsSelected, setOverviewGroupsSelected] = useState<OverviewGroup[]>(["region"]);
    const toggleOverviewGroup = (group: OverviewGroup) => {
        setOverviewGroupsSelected((current) => current.includes(group)
            ? current.length === 1 ? current : current.filter((item) => item !== group)
            : [...current, group]);
    };
    const monthLabel = filters?.month ? `${filters.month.padStart(2, "0")}/${filters.year || "2026"}` : null;
    const selectedMonth = headcountByMonth.find((row) => row.month === monthLabel)?.month ?? null;
    const activePeriod = hoveredPeriod ?? pinnedPeriod ?? (period === "YTD" ? selectedMonth : null);
    const mtd = getDemoMTDValue(selectedMonth, period === "MTD" ? pinnedPeriod : null);
    const selectedData = headcountByMonth.find((row) => row.month === selectedMonth);
    const clickedMonth = period === "YTD" && pinnedPeriod?.includes("/") ? pinnedPeriod : null;
    const clickedMonthData = headcountByMonth.find((row) => row.month === clickedMonth);
    // Các tháng 01–05 chưa có record chi tiết ở HC nên chỉ dùng số mô phỏng.
    const extraMonthExits: Record<string, number> = {
        "01/2026": 26, "02/2026": 36, "03/2026": 69, "04/2026": 51, "05/2026": 38,
    };
    const resignTotal = period === "YTD"
        ? clickedMonth ? clickedMonthData?.exits ?? extraMonthExits[clickedMonth] ?? 0 : selectedData?.exits ?? HC_DEMO_YTD_EXITS
        : mtd.exits;
    const turnoverRate = period === "YTD"
        ? clickedMonth ? (rateYTD[trendMonths.indexOf(clickedMonth)] ?? 0) / 100 : selectedMonth ? HC_DEMO_MONTHLY_TURNOVER[selectedMonth] : HC_DEMO_YTD_TURNOVER
        : mtd.week ? mtd.week.turnover : (mtd.actual ? mtd.exits / (mtd.actual - mtd.hires + mtd.exits) : 0);
    const voluntaryTotal = Math.round(resignTotal * 0.7);
    const involuntaryTotal = resignTotal - voluntaryTotal;
    const reasonCounts = allocateByWeights(resignTotal, reasons.map(([, value]) => Number(value)));
    const reasonColors = ["#075B99", "#1177AD", "#208EBD", "#39A2CB", "#53B2D3", "#74C1DD", "#97D1E8", "#B6E0F0"];
    const kpis = [
        ["NHÂN SỰ NGHỈ VIỆC", fmt(resignTotal), BLUE],
        ["TỶ LỆ NGHỈ VIỆC", `${(100 * turnoverRate).toFixed(1)}%`, "#DC2626"],
        ["TỶ TRỌNG NGHỈ TỰ NGUYỆN", `${(resignTotal ? 100 * voluntaryTotal / resignTotal : 0).toFixed(1)}%`, BLUE],
        ["TỶ TRỌNG NGHỈ KHÔNG TỰ NGUYỆN", `${(resignTotal ? 100 * involuntaryTotal / resignTotal : 0).toFixed(1)}%`, "#159447"],
        ["TỶ TRỌNG NGHỈ SỚM ≤ 3 THÁNG", "23.8%", "#D97706"],
        ["TỶ TRỌNG NGHỈ 3 - 6 THÁNG", "10.6%", "#DC2626"],
    ];

    return (
        <DashboardShell
            activePage="turnover"
            onPageChange={onPageChange}
            filters={<FilterBar period={period} onPeriodChange={changePeriod} filters={filters} onFiltersChange={(next) => {
                setPinnedPeriod(null); setHoveredPeriod(null); onFiltersChange?.(next);
            }} />}
        >
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {pinnedPeriod && <button type="button" onClick={() => { setPinnedPeriod(null); setHoveredPeriod(null); }}
                    style={{ fontSize: 10, padding: "5px 9px", border: "1px solid #BBD0F4", borderRadius: 6, background: "#EAF1FF", color: BLUE, cursor: "pointer" }}>
                    Đang lọc: {pinnedPeriod} × Bỏ chọn
                </button>}
                <span style={{ fontSize: 10, color: "#667085" }}>Chế độ xem:</span>
                {(["MTD", "YTD"] as const).map((value) => (
                    <button key={value} type="button" onClick={() => changePeriod(value)}
                        style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", border: `1px solid ${period === value ? "#2563EB" : BORDER}`, background: period === value ? "#E8F0FF" : "white", color: BLUE, fontSize: 10, fontWeight: 700 }}>
                        {value === "MTD" ? "Month to date" : "Year to date"}
                    </button>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
                {kpis.map(([label, value, color]) => (
                    <div key={label} title={`${label}: ${value} · Dữ liệu demo ${period}`} style={{ ...CARD, minHeight: 78, display: "flex", flexDirection: "column", justifyContent: "center", gap: 7 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.35 }}>{label}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Panel title="XU HƯỚNG TỶ LỆ NGHỈ VIỆC" minHeight={235}><Trend period={period} selectedMonth={selectedMonth} active={activePeriod} onHover={setHoveredPeriod} onSelect={selectPeriod} /></Panel>
                <Panel title="TỔNG QUAN NGHỈ VIỆC" minHeight={235} action={
                    <div role="group" aria-label="Phân nhóm tổng quan nghỉ việc" style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 9, color: "#667085", marginRight: 2 }}>Phân nhóm:</span>
                        {overviewGroups.map(({ key, label }) => (
                            <button key={key} type="button" onClick={() => toggleOverviewGroup(key)} aria-pressed={overviewGroupsSelected.includes(key)}
                                style={{ padding: "5px 7px", border: `1px solid ${overviewGroupsSelected.includes(key) ? "#2563EB" : BORDER}`, borderRadius: 5, background: overviewGroupsSelected.includes(key) ? "#E8F0FF" : "white", color: BLUE, cursor: "pointer", fontSize: 9, fontWeight: overviewGroupsSelected.includes(key) ? 700 : 400, whiteSpace: "nowrap" }}>
                                {label}
                            </button>
                        ))}
                    </div>
                }><Overview period={period} exits={resignTotal} rate={turnoverRate} groups={overviewGroupsSelected} /></Panel>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Panel title="HÌNH THỨC NGHỈ VIỆC" minHeight={380}><FormChart period={period} selectedMonth={selectedMonth} active={activePeriod} onHover={setHoveredPeriod} onSelect={selectPeriod} /></Panel>
                <MonthlyTurnoverStructureChart period={period} selectedMonth={selectedMonth} active={activePeriod} onHover={setHoveredPeriod} onSelect={selectPeriod} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.65fr", gap: 12 }}>
                <Panel title="NGUYÊN NHÂN NGHỈ VIỆC" minHeight={240}>
                    <div style={{ display: "grid", gap: 5, padding: "2px 0" }}>
                        {reasons.map(([name], index) => (
                            <div key={name} title={`${name}: ${reasonCounts[index]} nhân sự · ${(100 * reasonCounts[index] / Math.max(1, resignTotal)).toFixed(1)}% tổng NS nghỉ`} style={{ display: "grid", gridTemplateColumns: "155px minmax(0,1fr) 90px", alignItems: "center", gap: 8, fontSize: 10, minHeight: 17 }}>
                                <span>{name}</span>
                                <div style={{ height: 15, background: "#EEF3FF", overflow: "hidden" }}>
                                    <div style={{ width: `${reasonCounts[index] / Math.max(...reasonCounts, 1) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${reasonColors[index]}, ${reasonColors[Math.min(index + 1, reasonColors.length - 1)]})`, transition: "width 200ms ease" }} />
                                </div>
                                <span style={{ whiteSpace: "nowrap", fontWeight: 700, color: BLUE, textAlign: "right" }}>{fmt(reasonCounts[index])} <span style={{ color: "#667085", fontWeight: 400 }}>({(100 * reasonCounts[index] / Math.max(1, resignTotal)).toFixed(1)}%)</span></span>
                            </div>
                        ))}
                    </div>
                </Panel>
                <Panel title="DANH SÁCH NHÂN SỰ NGHỈ VIỆC" minHeight={240}>
                    <div style={{ overflow: "auto", maxHeight: 195 }}>
                        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 650, fontSize: 9 }}>
                            <thead><tr>{["Mã NS", "Tên nhân viên", "Khu vực", "Vị trí", "Cửa hàng", "Ngày nghỉ", "Thâm niên", "Lý do chi tiết"].map((name) => (
                                <th key={name} style={{ position: "sticky", top: 0, background: "#EDF3FF", padding: 9, textAlign: "left", whiteSpace: "nowrap" }}>{name}</th>
                            ))}</tr></thead>
                            <tbody>{employees.map((row) => (
                                <tr key={row[0]} title={`${row[1]} · Nghỉ ngày ${row[5]} · ${row[7]}`}>{row.map((cell, index) => (
                                    <td key={index} style={{ padding: 9, borderBottom: "1px solid #E8EDF6", whiteSpace: "nowrap" }}>{cell}</td>
                                ))}</tr>
                            ))}</tbody>
                        </table>
                    </div>
                </Panel>
            </div>

            <div style={{ textAlign: "right", color: "#98A2B3", fontSize: 9, padding: "10px 2px" }}>
                Dữ liệu demo đồng bộ HC · KPI YTD tổng năm, xu hướng hiển thị 01–11/2026 (01–05 minh họa) · Chưa kết nối Microsoft Fabric
            </div>
        </DashboardShell>
    );
}



