
import { useRef, useState } from "react";

/* =====================================
   TYPES
   ===================================== */

type AttentionStatus =
    | "Cần theo dõi"
    | "Sắp hết thử việc"
    | "Sắp nghỉ";

type Employee = {
    id: string;
    name: string;
    position: string;
    store: string;
    joinDate: string;
    resignDate: string;
    contractType: string;
    reward: string;
    rewardPeriod: string;
    status: AttentionStatus;
};

/* =====================================
   DEMO DATA
   ===================================== */

const employees: Employee[] = [
    {
        id: "EMP-001",
        name: "NGUYỄN THỊ MINH TRANG",
        position: "SA",
        store: "COOP KON TUM",
        joinDate: "03/09/2019",
        resignDate: "",
        contractType: "Không xác định thời hạn",
        reward: "<50%",
        rewardPeriod: "06/2026 → 09/2026",
        status: "Cần theo dõi",
    },
    {
        id: "EMP-002",
        name: "NGUYỄN THỊ THỦY",
        position: "SA",
        store: "COOP QUI NHƠN",
        joinDate: "20/03/2017",
        resignDate: "",
        contractType: "Không xác định thời hạn",
        reward: "<50%",
        rewardPeriod: "03/2026 → 09/2026",
        status: "Cần theo dõi",
    },
    {
        id: "EMP-003",
        name: "ĐOÀN THỊ CẨM NHUNG",
        position: "SA",
        store: "COOP BÌNH PHƯỚC",
        joinDate: "29/08/2020",
        resignDate: "",
        contractType: "Không xác định thời hạn",
        reward: "<50%",
        rewardPeriod: "04/2026 → 09/2026",
        status: "Cần theo dõi",
    },
    {
        id: "EMP-004",
        name: "TRẦN MỸ NHÂN",
        position: "SA",
        store: "GO! ĐỒNG NAI",
        joinDate: "01/03/2017",
        resignDate: "",
        contractType: "Không xác định thời hạn",
        reward: "<50%",
        rewardPeriod: "07/2026 → 09/2026",
        status: "Cần theo dõi",
    },
    {
        id: "EMP-005",
        name: "LƯƠNG THẾ HỒ QUỲNH",
        position: "SA",
        store: "GO! HẠ LONG",
        joinDate: "23/08/2020",
        resignDate: "",
        contractType: "Không xác định thời hạn",
        reward: "<50%",
        rewardPeriod: "06/2026 → 09/2026",
        status: "Cần theo dõi",
    },
    {
        id: "EMP-006",
        name: "TRẦN THỊ HỒNG NHO",
        position: "SA",
        store: "GO! AN LẠC",
        joinDate: "01/09/2016",
        resignDate: "",
        contractType: "Không xác định thời hạn",
        reward: "<50%",
        rewardPeriod: "07/2026 → 09/2026",
        status: "Cần theo dõi",
    },
    {
        id: "EMP-007",
        name: "NGUYỄN THỊ THANH THANH",
        position: "FC",
        store: "GO! BÌNH DƯƠNG",
        joinDate: "01/03/2026",
        resignDate: "",
        contractType: "Thử việc",
        reward: "Chưa đánh giá",
        rewardPeriod: "09/2026",
        status: "Sắp hết thử việc",
    },
    {
        id: "EMP-008",
        name: "PHAN THỊ THÚY VY",
        position: "FC",
        store: "COOP XTRA TÂN PHONG",
        joinDate: "20/01/2026",
        resignDate: "",
        contractType: "Thử việc",
        reward: "Chưa đánh giá",
        rewardPeriod: "09/2026",
        status: "Sắp hết thử việc",
    },
    {
        id: "EMP-009",
        name: "LÊ VĂN MINH",
        position: "SA",
        store: "COOP HUẾ",
        joinDate: "04/04/2024",
        resignDate: "30/11/2026",
        contractType: "Xác định thời hạn",
        reward: "<50%",
        rewardPeriod: "08/2026 → 09/2026",
        status: "Sắp nghỉ",
    },
    {
        id: "EMP-010",
        name: "PHẠM THỊ HUYỀN",
        position: "SA",
        store: "GO! ĐÀ NẴNG",
        joinDate: "09/05/2023",
        resignDate: "28/11/2026",
        contractType: "Xác định thời hạn",
        reward: "<50%",
        rewardPeriod: "08/2026 → 09/2026",
        status: "Sắp nghỉ",
    },
];

type StatusFilter = "All" | AttentionStatus;

/* =====================================
   MONTH FILTER — FIX TYPESCRIPT
   ===================================== */

function isInAttentionMonth(
    employee: Employee,
    month: string
): boolean {
    const toSortValue = (value: string): number => {
        const [m, y] = value.split("/").map(Number);
        return (y ?? 0) * 12 + (m ?? 0);
    };

    if (employee.status === "Sắp nghỉ") {
        return employee.resignDate.slice(3) === month;
    }

    const periods =
        employee.rewardPeriod.match(/\d{2}\/\d{4}/g) ?? [];

    if (periods.length === 0) {
        return false;
    }

    const firstPeriod = periods[0];
    const lastPeriod = periods[periods.length - 1];

    if (!firstPeriod || !lastPeriod) {
        return false;
    }

    const selected = toSortValue(month);

    return (
        selected >= toSortValue(firstPeriod) &&
        selected <= toSortValue(lastPeriod)
    );
}

const statusFilters: {
    key: StatusFilter;
    label: string;
}[] = [
    { key: "All", label: "All" },
    { key: "Cần theo dõi", label: "Cần theo dõi" },
    { key: "Sắp hết thử việc", label: "Sắp hết thử việc" },
    { key: "Sắp nghỉ", label: "Sắp nghỉ" },
];

/* =====================================
   COMPONENT
   ===================================== */

export function HeadcountAttentionTable({
    selectedMonth = null,
}: {
    selectedMonth?: string | null;
}) {
    const [selected, setSelected] =
        useState<StatusFilter>("All");

    const tableScrollRef =
        useRef<HTMLDivElement>(null);

    const monthEmployees = selectedMonth
        ? employees.filter((employee) =>
              isInAttentionMonth(employee, selectedMonth)
          )
        : employees;

    const filtered =
        selected === "All"
            ? monthEmployees
            : monthEmployees.filter(
                  (employee) => employee.status === selected
              );

    const countStatus = (key: StatusFilter) =>
        key === "All"
            ? monthEmployees.length
            : monthEmployees.filter(
                  (employee) => employee.status === key
              ).length;

    const thStyle = {
        position: "sticky" as const,
        top: 0,
        zIndex: 2,
        padding: "9px 8px",
        fontSize: 10,
        fontWeight: 700,
        color: "#001F82",
        background: "#E8EEFF",
        borderBottom: "1px solid #D9DEE8",
        textAlign: "left" as const,
        whiteSpace: "nowrap" as const,
    };

    const tdStyle = {
        padding: "8px",
        fontSize: 10,
        color: "#344054",
        borderBottom: "1px solid #EEF2F6",
        whiteSpace: "nowrap" as const,
    };

    return (
        <div
            style={{
                width: "100%",
                background: "#FFFFFF",
                border: "1px solid #D9DEE8",
                borderRadius: 12,
                overflow: "hidden",
                fontFamily: "Segoe UI, sans-serif",
                boxSizing: "border-box",
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 14,
                    padding: "12px 16px",
                    background: "#F8FAFF",
                    borderBottom: "1px solid #D9DEE8",
                }}
            >
                <div
                    style={{
                        color: "#001F82",
                        fontSize: 12,
                        fontWeight: 700,
                    }}
                >
                    NHÂN SỰ CẦN CHÚ Ý – SẮP NGHỈ VIỆC,
                    HẾT HẠN THỬ VIỆC & MỨC THƯỞNG
                </div>

                {/* STATUS FILTERS */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                    }}
                >
                    {statusFilters.map(({ key, label }) => {
                        const active = selected === key;

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => {
                                    setSelected(key);

                                    if (tableScrollRef.current) {
                                        tableScrollRef.current.scrollTop = 0;
                                    }
                                }}
                                style={{
                                    border: active
                                        ? "1px solid #2563EB"
                                        : "1px solid #D9DEE8",
                                    borderRadius: 8,
                                    padding: "8px 12px",
                                    background: active
                                        ? "#EAF1FF"
                                        : "#FFFFFF",
                                    color: active
                                        ? "#001F82"
                                        : "#667085",
                                    cursor: "pointer",
                                    textAlign: "center",
                                    width: 104,
                                    minWidth: 104,
                                    height: 58,
                                    boxSizing: "border-box",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    transition:
                                        "background 0.15s ease, border-color 0.15s ease",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {label}
                                </div>

                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        marginTop: 3,
                                        color:
                                            key === "Sắp nghỉ"
                                                ? "#D92D20"
                                                : "#001F82",
                                    }}
                                >
                                    {countStatus(key)}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TABLE */}
            <div
                ref={tableScrollRef}
                style={{
                    width: "100%",
                    height: 354,
                    overflow: "auto",
                    scrollbarGutter: "stable",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: 1100,
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={thStyle}>Nhân viên</th>
                            <th style={thStyle}>Vị trí</th>
                            <th style={thStyle}>Cửa hàng</th>
                            <th style={thStyle}>Ngày vào làm</th>
                            <th style={thStyle}>Ngày nghỉ việc</th>
                            <th style={thStyle}>Loại hợp đồng</th>
                            <th style={thStyle}>Mức thưởng</th>
                            <th style={thStyle}>Kỳ đánh giá</th>
                            <th style={thStyle}>Trạng thái</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td
                                    colSpan={9}
                                    style={{
                                        padding: 20,
                                        textAlign: "center",
                                        color: "#98A2B3",
                                        fontSize: 11,
                                    }}
                                >
                                    Không có nhân viên phù hợp với bộ lọc.
                                </td>
                            </tr>
                        )}

                        {filtered.map((row, index) => (
                            <tr
                                key={row.id}
                                style={{
                                    background:
                                        index % 2
                                            ? "#FBFCFE"
                                            : "#FFFFFF",
                                }}
                            >
                                <td style={tdStyle}>
                                    <strong>{row.id}</strong>{" "}
                                    {row.name}
                                </td>

                                <td style={tdStyle}>
                                    {row.position}
                                </td>

                                <td style={tdStyle}>
                                    {row.store}
                                </td>

                                <td style={tdStyle}>
                                    {row.joinDate}
                                </td>

                                <td style={tdStyle}>
                                    {row.resignDate || "—"}
                                </td>

                                <td style={tdStyle}>
                                    {row.contractType}
                                </td>

                                <td style={tdStyle}>
                                    {row.reward}
                                </td>

                                <td style={tdStyle}>
                                    {row.rewardPeriod}
                                </td>

                                <td
                                    style={{
                                        ...tdStyle,
                                        color:
                                            row.status === "Sắp nghỉ"
                                                ? "#D92D20"
                                                : "#001F82",
                                        fontWeight: 600,
                                    }}
                                >
                                    ⚑ {row.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FOOTER */}
            <div
                style={{
                    padding: "6px 12px",
                    textAlign: "right",
                    color: "#98A2B3",
                    fontSize: 9,
                }}
            >
                {selectedMonth
                    ? `Tháng ${selectedMonth} · `
                    : ""}
                Dữ liệu minh họa · Chưa kết nối Fabric
            </div>
        </div>
    );
}
