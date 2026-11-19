import { useMemo, useState, type ReactNode } from "react";
import { UsersRound, UserRound, ClipboardList, FilePlus2, Info } from "lucide-react";
import { DashboardShell } from "../../components/layout/DashboardShell";
import type { DashboardPage } from "../../components/layout/DashboardSidebar";
import { FilterBar } from "../../components/filters/FilterBar";
import type { StaffingFilters } from "../../services/staffingFilters";
import "./recruitment.css";

type Period = "MTD" | "YTD";
type Status = "Processing" | "Done" | "Close";
type Request = {
    code: string;
    region: string;
    customer: string;
    role: string;
    requested: string;
    deadline: string;
    status: Status;
    timing: "On time" | "Late" | "—";
    stage: string;
    days: number;
};

interface RecruitmentDashboardProps {
    onPageChange?: (page: DashboardPage) => void;
    filters?: StaffingFilters;
    onFiltersChange?: (next: StaffingFilters) => void;
}

// Dữ liệu dựng giao diện từ PPT tham khảo, KHÔNG phải dữ liệu DAX/Fabric.
const requests: Request[] = [
    { code: "246481", region: "NORTH", customer: "Big C Go Green", role: "SA", requested: "21/10/2026", deadline: "08/11/2026", status: "Processing", timing: "On time", stage: "Đang training", days: 7 },
    { code: "246482", region: "MKD", customer: "Coopmart Sông Trăng", role: "SA", requested: "21/10/2026", deadline: "10/11/2026", status: "Processing", timing: "On time", stage: "Chờ onboard", days: 5 },
    { code: "246483", region: "HCM", customer: "Coopmart HCM", role: "SA", requested: "23/10/2026", deadline: "09/11/2026", status: "Processing", timing: "On time", stage: "Chờ CV ứng viên", days: 12 },
    { code: "246484", region: "EAST", customer: "GO! Đồng Nai", role: "FC", requested: "22/10/2026", deadline: "07/11/2026", status: "Processing", timing: "Late", stage: "Chờ phỏng vấn", days: 19 },
    { code: "246485", region: "CENTRAL", customer: "Coopmart Đà Nẵng", role: "SA", requested: "24/10/2026", deadline: "12/11/2026", status: "Close", timing: "On time", stage: "Hoàn thành", days: 8 },
    { code: "246486", region: "HCM", customer: "Big C Miền Đông", role: "SA", requested: "26/10/2026", deadline: "11/11/2026", status: "Processing", timing: "Late", stage: "Chờ ứng viên", days: 21 },
    { code: "246487", region: "EAST", customer: "MM Mega Market", role: "SUP", requested: "28/10/2026", deadline: "15/11/2026", status: "Done", timing: "On time", stage: "Đã nhận việc", days: 12 },
    { code: "246488", region: "NORTH", customer: "Coopmart Bắc Ninh", role: "SA", requested: "29/10/2026", deadline: "16/11/2026", status: "Done", timing: "On time", stage: "Đã nhận việc", days: 10 },
    { code: "246489", region: "MKD", customer: "Coopmart Cần Thơ", role: "FC", requested: "02/11/2026", deadline: "19/11/2026", status: "Processing", timing: "On time", stage: "Đang tuyển", days: 6 },
    { code: "246490", region: "CENTRAL", customer: "Big C Huế", role: "SA", requested: "04/11/2026", deadline: "22/11/2026", status: "Done", timing: "On time", stage: "Đã nhận việc", days: 9 },
];

const roles = [
    { role: "SA", label: "Nhân viên bán hàng", count: 4 },
    { role: "SUP", label: "Giám sát", count: 2 },
    { role: "FC", label: "Tư vấn viên", count: 3 },
    { role: "TL", label: "Trưởng nhóm", count: 1 },
];

type SpeedView = "region" | "role" | "store";
type SpeedRow = { label: string; total: number; onTime: number; late: number };
const speedRows: Record<SpeedView, SpeedRow[]> = {
    region: [
        { label: "EAST", total: 4, onTime: 3, late: 1 },
        { label: "HCM", total: 1, onTime: 1, late: 0 },
        { label: "MKD", total: 3, onTime: 3, late: 0 },
        { label: "NORTH", total: 2, onTime: 1, late: 1 },
    ],
    role: [
        { label: "SA", total: 6, onTime: 5, late: 1 },
        { label: "FC", total: 2, onTime: 1, late: 1 },
        { label: "SUP", total: 1, onTime: 1, late: 0 },
        { label: "SIP", total: 1, onTime: 1, late: 0 },
    ],
    store: [
        { label: "Big C Go Green", total: 3, onTime: 2, late: 1 },
        { label: "Coop Sóc Trăng", total: 2, onTime: 2, late: 0 },
        { label: "Big C Hạ Long", total: 2, onTime: 1, late: 1 },
        { label: "Coop Trang Bàng", total: 3, onTime: 3, late: 0 },
    ],
};

const completion = [
    { name: "Done", value: 386, color: "#3F73CC" },
    { name: "On time", value: 278, color: "#1C9B6A" },
    { name: "Late", value: 108, color: "#DB5555" },
];

function Panel({ title, subtitle, action, children, className = "" }: {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={`rec-panel ${className}`}>
            <div className="rec-panel-head">
                <div>
                    <h2>{title}</h2>
                    {subtitle && <p>{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

function Metric({ label, value, note, tone = "blue", icon }: {
    label: string;
    value: string;
    note: string;
    tone?: "blue" | "green" | "orange" | "red";
    icon: ReactNode;
}) {
    return <div className={`rec-metric rec-${tone}`}>
        <div className="rec-metric-icon">{icon}</div>
        <div className="rec-metric-content"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
    </div>;
}

function Badge({ status }: { status: Status | Request["timing"] }) {
    const kind = status === "Done" || status === "On time" ? "good" : status === "Late" ? "late" : status === "Processing" ? "progress" : "muted";
    return <span className={`rec-badge rec-badge-${kind}`}>{status}</span>;
}

function RequestsTable({ rows, onPick }: { rows: Request[]; onPick: (row: Request) => void }) {
    return <div className="rec-table-scroll">
        <table className="rec-table">
            <thead><tr>
                <th>JobCode</th><th>Khu vực</th><th>Cửa hàng</th><th>Vị trí</th>
                <th>Ngày yêu cầu</th><th>Hạn</th><th>Trạng thái</th><th>OTF</th><th>Tiến độ</th>
            </tr></thead>
            <tbody>{rows.map((row) => <tr key={row.code} onClick={() => onPick(row)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") onPick(row); }}>
                <td className="rec-code">{row.code}</td><td>{row.region}</td><td>{row.customer}</td><td>{row.role}</td>
                <td>{row.requested}</td><td>{row.deadline}</td><td><Badge status={row.status}/></td><td><Badge status={row.timing}/></td><td>{row.stage}</td>
            </tr>)}</tbody>
        </table>
    </div>;
}

function ProgressStack({ done, pending }: { done: number; pending: number }) {
    const total = Math.max(1, done + pending);
    return <div className="rec-progress-track" title={`${done} hoàn thành, ${pending} đang xử lý`}>
        <span style={{ width: `${done / total * 100}%`, background: "#20A765" }} />
        <span style={{ width: `${pending / total * 100}%`, background: "#F1AE55" }} />
    </div>;
}

const stageSummary = [
    { label: "Chưa có ứng viên", count: 2, percent: "20.0%", color: "#6684C8" },
    { label: "Chờ phỏng vấn", count: 1, percent: "10.0%", color: "#36A777" },
    { label: "Chờ và đang training", count: 3, percent: "30.0%", color: "#9861E9" },
    { label: "Chờ onboard", count: 4, percent: "40.0%", color: "#F0A128" },
];

function Workflow({ row }: { row: Request }) {
    const progress = row.status === "Done" || row.status === "Close" ? 3 : row.stage.includes("onboard") || row.stage.includes("training") ? 2 : 1;
    return <span className="rec-workflow" aria-label={`Bước ${progress} trong 3`}>
        {[1, 2, 3].map((step) => <span key={step} className={step <= progress ? "done" : ""}>{step}</span>)}
    </span>;
}

function StageDetailsTable({ rows, onPick }: { rows: Request[]; onPick: (row: Request) => void }) {
    return <div className="rec-table-scroll rec-stage-table-scroll"><table className="rec-table rec-stage-table">
        <thead><tr><th>JobCode</th><th>Khu vực</th><th>KA</th><th>Cửa hàng</th><th>Vị trí</th><th>Tính chất CV</th><th>Ngày duyệt</th><th>Hạn chốt</th><th>Tiến độ</th><th>Số UV ứng tuyển</th><th>Số UV pass V1</th><th>Ngày tới deadline</th><th>OTF</th><th>Quy trình</th></tr></thead>
        <tbody>{rows.map((row, index) => <tr key={row.code} tabIndex={0} onClick={() => onPick(row)} onKeyDown={(event) => { if (event.key === "Enter") onPick(row); }}>
            <td className="rec-code">{row.code}</td><td>{row.region}</td><td>{index % 3 === 0 ? "Hyper" : "SGC"}</td><td>{row.customer}</td><td>{row.role}</td><td>{index % 2 ? "Chính thức" : "Thời vụ"}</td><td>{row.requested}</td><td>{row.deadline}</td><td>{row.stage}</td><td>{[13,18,53,5,8,4,6,0,1,3][index % 10]}</td><td>{[3,3,2,1,3,1,2,1,0,1][index % 10]}</td><td className={row.timing === "Late" ? "rec-deadline-late" : "rec-deadline-good"}>{row.timing === "Late" ? "-5" : "13"}</td><td><Badge status={row.timing}/></td><td><Workflow row={row}/></td>
        </tr>)}</tbody>
    </table></div>;
}

function CompletionDetailsTable({ rows, onPick, compliance }: { rows: Request[]; onPick: (row: Request) => void; compliance: boolean }) {
    return <div className="rec-table-scroll rec-completion-table-scroll"><table className="rec-table rec-completion-table">
        <thead><tr><th>JobCode</th><th>Khu vực</th><th>KA</th><th>Cửa hàng</th><th>Vị trí</th><th>Tính chất CV</th><th>Ngày duyệt</th><th>Hạn chốt</th><th>Ngày hoàn thành</th><th>OTF</th><th>Số với hạn chốt (Ngày)</th><th>TB hoàn thành (Ngày)</th></tr></thead>
        <tbody>{rows.map((row, index) => <tr key={row.code} tabIndex={0} onClick={() => onPick(row)} onKeyDown={(event) => { if (event.key === "Enter") onPick(row); }}>
            <td className="rec-code">{row.code}</td><td>{row.region}</td><td>{index % 2 ? "SGC" : "Hyper"}</td><td>{row.customer}</td><td>{row.role}</td><td>{index % 3 === 0 ? "Chính thức" : "Thời vụ"}</td><td>{row.requested}</td><td>{row.deadline}</td><td>{row.deadline}</td><td><Badge status={row.timing}/></td><td className={row.timing === "Late" ? "rec-deadline-late" : "rec-deadline-good"}>{compliance ? (row.timing === "Late" ? "+5" : "Đạt") : row.timing === "Late" ? "+5" : "-11"}</td><td>{row.days.toFixed(1)}</td>
        </tr>)}</tbody>
    </table></div>;
}

export function RecruitmentDashboard({ onPageChange, filters, onFiltersChange }: RecruitmentDashboardProps) {
    const [period, setPeriod] = useState<Period>("YTD");
    const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
    const [speedView, setSpeedView] = useState<SpeedView>("region");
    const [selected, setSelected] = useState<Request | null>(null);
    const [tableView, setTableView] = useState<"deadline" | "completion">("completion");

    const visible = useMemo(() => requests.filter((row) =>
        statusFilter === "All" || row.status === statusFilter
    ), [statusFilter]);

    const completionRate = 86.5;

    return <DashboardShell
        activePage="recruitment"
        onPageChange={onPageChange}
        filters={<FilterBar period={period} onPeriodChange={setPeriod} filters={filters} onFiltersChange={onFiltersChange}/>}
    >
        <div className="recruitment-dashboard">
            <section className="rec-overview" aria-label="Tổng quan tuyển dụng">
                <div className="rec-overview-heading"><h1>TỔNG QUAN TUYỂN DỤNG</h1><p>Theo dõi số lượng headcount tuyển dụng so với kế hoạch</p></div>
                <div className="rec-metrics-row">
                    <Metric label="Nhân sự kế hoạch" value="1,099" note="11/2026" icon={<UsersRound size={15}/>}/>
                    <Metric label="Nhân sự thực tế" value="1,093" note="99% of plan" tone="green" icon={<UserRound size={15}/>}/>
                    <Metric label="Số Vacant" value="6" note="1% of plan" icon={<ClipboardList size={15}/>}/>
                    <Metric label="Số yêu cầu tuyển sớm & mở rộng" value="4" note="Không bao gồm trong HC Plan" tone="orange" icon={<FilePlus2 size={15}/>}/>
                    <div className="rec-business-note"><strong><Info size={14}/> Business note</strong><p>Chênh lệch có thể phát sinh do độ trễ thời gian giữa việc cập nhật số lượng nhân sự thực tế và tạo yêu cầu tuyển dụng.</p></div>
                </div>
                <span className="rec-overview-demo">Dữ liệu minh họa · Chưa kết nối DAX/Fabric</span>
            </section>

            <div className="rec-origin-grid">
                <Panel title="NHU CẦU TUYỂN DỤNG" subtitle="Theo dõi nhu cầu tuyển dụng của các Request đang trong quá trình xử lý" className="rec-origin-demand">
                    <div className="rec-demand-layout">
                        <div className="rec-donut-wrap">
                            <div className="rec-donut"><div><strong>10</strong><span>Yêu cầu</span></div></div>
                            <div className="rec-chart-label">Theo yêu cầu tuyển dụng</div>
                        </div>
                        <div className="rec-role-table"><table className="rec-table"><thead><tr><th>Vị trí</th><th>Tên vị trí</th><th>Số lượng</th><th>Tỷ trọng</th></tr></thead>
                            <tbody>{roles.map((row) => <tr key={row.role}><td>{row.role}</td><td>{row.label}</td><td>{row.count}</td><td><div className="rec-ratio"><span style={{width: `${row.count * 10}%`}} />{row.count * 10}%</div></td></tr>)}</tbody></table>
                        </div>
                    </div>
                </Panel>

                <Panel title="TIẾN ĐỘ TUYỂN DỤNG THEO TUẦN" subtitle="Theo dõi kế hoạch, tiến độ và kết quả tuyển dụng theo tuần" className="rec-origin-weekly"
                    action={<select aria-label="Lọc trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rec-select"><option value="All">Tất cả trạng thái</option><option value="Processing">Processing</option><option value="Done">Done</option><option value="Close">Close</option></select>}>
                    <div className="rec-mini-metrics"><div><span>Plan RQ</span><strong>86</strong></div><div><span>Done</span><strong>64</strong></div><div><span>% Hoàn thành</span><strong>{completionRate}%</strong></div><div><span>Processing</span><strong>10</strong></div><div><span>Close</span><strong>12</strong></div></div>
                    <RequestsTable rows={visible} onPick={setSelected}/>
                </Panel>

                <Panel title="TỐC ĐỘ TUYỂN DỤNG" subtitle="Tốc độ xử lý của các Request đang trong quá trình tuyển dụng" className="rec-origin-speed"
                    action={<div className="rec-segment" aria-label="Chọn chiều phân tích tốc độ tuyển dụng">
                        {([ ["region", "Khu vực"], ["role", "Vị trí"], ["store", "Cửa hàng"] ] as const).map(([key, label]) =>
                            <button type="button" key={key} className={speedView === key ? "active" : ""} aria-pressed={speedView === key} onClick={() => setSpeedView(key)}>{label}</button>
                        )}
                    </div>}>
                    <div className="rec-speed-layout">
                        <div className="rec-speed-summary"><strong>YÊU CẦU ĐÚNG HẠN VÀ TRỄ HẠN</strong><ProgressStack done={80} pending={20}/>
                            <div className="rec-speed-dual"><span className="rec-good">80%<small>Đúng hạn</small><em>(8 yêu cầu)</em></span><span className="rec-late">20%<small>Trễ hạn</small><em>(2 yêu cầu)</em></span></div>
                            <div className="rec-aging-block"><strong>YÊU CẦU TRỄ HẠN THEO SỐ NGÀY TRỄ</strong>
                                <div className="rec-aging">
                                    <div><span>&lt; 5 ngày</span><b>1 (50.0%)</b></div>
                                    <div><span>5 - 10 ngày</span><b>1 (50.0%)</b></div>
                                    <div><span>10 - 20 ngày</span><b>0 (0.0%)</b></div>
                                    <div><span>≥ 20 ngày</span><b>0 (0.0%)</b></div>
                                </div>
                            </div>
                        </div>
                        <div className="rec-region-bars rec-speed-table-wrap"><strong>YÊU CẦU THEO VIEW</strong>
                            <table className="rec-speed-table">
                                <thead><tr><th>{speedView === "region" ? "Khu vực" : speedView === "role" ? "Vị trí" : "Cửa hàng"}</th><th>Tổng yêu cầu</th><th>Yêu cầu đúng hạn</th><th>Yêu cầu trễ hạn</th></tr></thead>
                                <tbody>{speedRows[speedView].map((row) => <tr key={row.label}><td>{row.label}</td><td>{row.total}</td><td>{row.onTime}</td><td className={row.late > 0 ? "rec-speed-late-cell" : ""}>{row.late || ""}</td></tr>)}</tbody>
                            </table>
                        </div>
                    </div>
                </Panel>
            </div>

            <div className="rec-stage-row">
                <Panel title="TIẾN ĐỘ TUYỂN DỤNG" subtitle="Theo dõi tiến độ của các Request đang trong quá trình xử lý" className="rec-stage-legend-panel">
                    <div className="rec-stage-hint">Chọn trạng thái để lọc bảng bên cạnh</div>
                    <div className="rec-stage-status-list">{stageSummary.map((item) => <div key={item.label}><span className="rec-stage-dot" style={{background: item.color}}/><span>{item.label}</span><b style={{color:item.color}}>{item.count}</b><strong style={{color:item.color}}>({item.percent})</strong></div>)}</div>
                </Panel>
                <section className="rec-stage-data-panel" aria-label="Bảng tiến độ tuyển dụng"><StageDetailsTable rows={visible} onPick={setSelected}/></section>
            </div>

            <div className="rec-table-view-bar"><span>Chọn Table View:</span><button className={tableView === "deadline" ? "active" : ""} onClick={() => setTableView("deadline")}>Tuân thủ thời hạn Request</button><button className={tableView === "completion" ? "active" : ""} onClick={() => setTableView("completion")}>Hiệu quả hoàn thành tuyển dụng</button></div>
            <Panel title={tableView === "completion" ? "HIỆU QUẢ HOÀN THÀNH TUYỂN DỤNG" : "TUÂN THỦ THỜI HẠN REQUEST"} subtitle="Theo dõi các yêu cầu đã hoàn thành theo OTF và thời gian sớm/trễ so với hạn chốt" className="rec-completion"
                action={<div className="rec-completion-stats">{completion.map((item) => <div key={item.name} className={`rec-completion-stat rec-completion-${item.name.replace(" ", "-").toLowerCase()}`}><span>{item.name === "Done" ? "RQ Done" : item.name}</span><strong>{item.value}{item.name !== "Done" ? ` (${(item.value / 386 * 100).toFixed(1)}%)` : ""}</strong></div>)}</div>}>
                <CompletionDetailsTable rows={requests} onPick={setSelected} compliance={tableView === "deadline"}/>
            </Panel>
            {selected && <div className="rec-modal-backdrop" onClick={() => setSelected(null)} role="presentation"><div className="rec-modal" role="dialog" aria-modal="true" aria-label="Chi tiết yêu cầu tuyển dụng" onClick={(e) => e.stopPropagation()}><div className="rec-modal-head"><h2>CHI TIẾT YÊU CẦU {selected.code}</h2><button onClick={() => setSelected(null)} aria-label="Đóng">×</button></div><dl><dt>Cửa hàng</dt><dd>{selected.customer}</dd><dt>Khu vực · Vị trí</dt><dd>{selected.region} · {selected.role}</dd><dt>Ngày yêu cầu · Deadline</dt><dd>{selected.requested} · {selected.deadline}</dd><dt>Trạng thái</dt><dd><Badge status={selected.status}/></dd><dt>Tiến độ</dt><dd>{selected.stage}</dd><dt>Đúng hạn / Trễ hạn</dt><dd><Badge status={selected.timing}/></dd></dl><p>Số liệu minh họa phục vụ duyệt giao diện.</p></div></div>}
        </div>
    </DashboardShell>;
}
