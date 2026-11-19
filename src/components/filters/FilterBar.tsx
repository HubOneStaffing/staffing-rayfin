import { useState } from "react";
import {
    DEFAULT_STAFFING_FILTERS,
    type StaffingFilterKey,
    type StaffingFilters,
    type StaffingFilterOptions,
} from "../../services/staffingFilters";

type FilterKey = StaffingFilterKey;

type Period = "MTD" | "YTD";

interface FilterBarProps {
    period: Period;
    onPeriodChange: (period: Period) => void;
    selectedMonth?: string | null;
    onMonthChange?: (month: string | null) => void;
    filters?: StaffingFilters;
    onFiltersChange?: (next: StaffingFilters) => void;
    filterOptions?: Partial<StaffingFilterOptions>;
}

type FilterState = StaffingFilters;

const initialFilters = DEFAULT_STAFFING_FILTERS;

// DỮ LIỆU DEMO
const options: Record<FilterKey, string[]> = {
    project: [
        "Staffing SOE",
        "Staffing VNM",
        "Staffing PPT",
    ],

    year: ["2024", "2025", "2026"],

    month: Array.from(
        { length: 12 },
        (_, index) => String(index + 1)
    ),

    channel: [], // Chờ danh mục thực tế từ Power BI; không bịa giá trị demo.

    region: [
        "Miền Bắc",
        "Miền Trung",
        "Miền Nam",
    ],

    province: [
        "Hà Nội",
        "Hải Phòng",
        "Đà Nẵng",
        "TP. Hồ Chí Minh",
        "Đồng Nai",
        "Cần Thơ",
    ],

    role: [
        "FC",
        "TL",
        "Supervisor",
        "Manager",
    ],

    manager1: [
        "Quản lý 01",
        "Quản lý 02",
    ],

    manager2: [
        "Quản lý 03",
        "Quản lý 04",
    ],
};

const fields: {
    key: FilterKey;
    label: string;
    allLabel: string;
}[] = [
    {
        key: "project",
        label: "Dự án",
        allLabel: "Tất cả dự án",
    },
    {
        key: "year",
        label: "Năm",
        allLabel: "Tất cả năm",
    },
    {
        key: "month",
        label: "Tháng",
        allLabel: "Tất cả / YTD",
    },
    {
        key: "channel",
        label: "Kênh",
        allLabel: "Tất cả",
    },
    {
        key: "region",
        label: "Miền",
        allLabel: "Tất cả",
    },
    {
        key: "province",
        label: "Tỉnh",
        allLabel: "Tất cả",
    },
    {
        key: "role",
        label: "Vị trí",
        allLabel: "Tất cả",
    },
    {
        key: "manager1",
        label: "Quản lý cấp 1",
        allLabel: "Tất cả",
    },
    {
        key: "manager2",
        label: "Quản lý cấp 2",
        allLabel: "Tất cả",
    },
];

export function FilterBar({
    onPeriodChange,
    selectedMonth = null,
    onMonthChange,
    filters: controlledFilters,
    onFiltersChange,
    filterOptions,
}: FilterBarProps) {
    const [localFilters, setLocalFilters] =
        useState<FilterState>(initialFilters);
    const filters = controlledFilters ?? localFilters;
    const updateFilters = (next: FilterState) => {
        if (!controlledFilters) setLocalFilters(next);
        onFiltersChange?.(next);
    };

    const setFilter = (
        key: FilterKey,
        value: string
    ) => {
        if (key === "month") {
            const chosenYear = filters.year || "2026";
            onMonthChange?.(value ? `${value.padStart(2, "0")}/${chosenYear}` : null);
        }
        if (key === "year") onMonthChange?.(null);
        const next: FilterState = {
            ...filters,
            [key]: value,
        };

            if (key === "project") {
                next.channel = "";
                next.region = "";
                next.province = "";
                next.role = "";
                next.manager1 = "";
                next.manager2 = "";
            }

            if (key === "year") {
                next.month = "";
            }

            if (key === "region") {
                next.province = "";
                next.manager1 = "";
                next.manager2 = "";
            }

            if (key === "province") {
                next.manager1 = "";
                next.manager2 = "";
            }

            if (key === "manager1") {
                next.manager2 = "";
            }

        updateFilters(next);
    };

    const resetFilters = () => {
        updateFilters({ ...initialFilters });
        onMonthChange?.(null);

        // Reset kỳ dữ liệu về YTD.
        onPeriodChange("YTD");
    };

    const selectStyle = {
        width: "100%",
        height: 28,
        padding: "0 9px",
        background: "#FFFFFF",
        border: "1px solid #CBD8EE",
        borderRadius: 7,
        color: "#344054",
        fontFamily: "Segoe UI, sans-serif",
        fontSize: 11,
        outline: "none",
        cursor: "pointer",
        boxSizing: "border-box" as const,
    };

    return (
        <div
            style={{
                width: "100%",
                display: "grid",

                // 9 bộ lọc + nút Reset.
                gridTemplateColumns:
                    "repeat(9, minmax(0, 1fr)) auto",

                alignItems: "end",
                gap: 10,
                margin: 0,
                padding: "5px 20px",
                background: "#F5F8FF",
                border: "none",
                borderBottom: "1px solid #D9E2EC",
                borderRadius: 0,
                boxSizing: "border-box",
                fontFamily: "Segoe UI, sans-serif",
                overflowX: "auto",
            }}
        >
            {/* 9 BỘ LỌC */}
            {fields.map(({ key, label, allLabel }) => (
                <div
                    key={key}
                    style={{
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    }}
                >
                    <label
                        htmlFor={`filter-${key}`}
                        style={{
                            fontSize: 10,
                            fontWeight: 500,
                            color: "#6179A6",
                            whiteSpace: "nowrap",
                            lineHeight: "12px",
                        }}
                    >
                        {label}
                    </label>

                    <select
                        id={`filter-${key}`}
                        value={key === "month" && onMonthChange
                            ? filters.month || (selectedMonth ? String(Number(selectedMonth.slice(0, 2))) : "")
                            : filters[key]}
                        onChange={(event) =>
                            setFilter(
                                key,
                                event.target.value
                            )
                        }
                        style={selectStyle}
                    >
                        <option value="">
                            {allLabel}
                        </option>

                        {(filterOptions?.[key] ?? options[key]).map((value) => (
                            <option
                                key={value}
                                value={value}
                            >
                                {key === "month"
                                    ? `T${value}`
                                    : value}
                            </option>
                        ))}
                    </select>
                </div>
            ))}

            {/* RESET - GIỮ Ở GÓC PHẢI */}
            <button
                type="button"
                onClick={resetFilters}
                style={{
                    height: 28,
                    padding: "0 12px",
                    border: "1px solid #D0D5DD",
                    borderRadius: 7,
                    background: "#FFFFFF",
                    color: "#475467",
                    fontSize: 11,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxSizing: "border-box",
                }}
            >
                Reset
            </button>
        </div>
    );
}
