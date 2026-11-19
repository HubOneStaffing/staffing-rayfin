
import { useEffect, useRef, useState } from "react";

import { CardTitle } from "../../components/ui/CardTitle";

import {
    StructureHoverTooltip,
    type StructureHover,
} from "../../components/ui/StructureHoverTooltip";

import {
    allocateByWeights,
    getDemoMTDWeeks,
    headcountByMonth,
} from "../../lib/headcountDemo";

type Period = "MTD" | "YTD";

interface HeadcountStructureChartProps {
    period?: Period;
    selectedMonth?: string | null;
    selectedWeek?: string | null;
    onMonthSelect?: (month: string) => void;
    onWeekSelect?: (week: string) => void;
}

type StructureItem = {
    label: string;
    values: number[];
};

type BreakdownKey =
    | "gender"
    | "age"
    | "tenure"
    | "contract";

type BreakdownGroup = {
    label: string;
    color: string;
};

const tenureGroups: BreakdownGroup[] = [
    { label: "Probation", color: "#3157C7" },
    { label: "< 3 tháng", color: "#4A9BF2" },
    { label: "3 - 6 tháng", color: "#82C7F0" },
    { label: "6 tháng - 1 năm", color: "#B6E1F5" },
    { label: "1 - 2 năm", color: "#FFF58A" },
    { label: "2 - 5 năm", color: "#FFE09A" },
    { label: "> 5 năm", color: "#FF86B0" },
];

const breakdownOptions: {
    key: BreakdownKey;
    label: string;
}[] = [
    { key: "gender", label: "Giới tính" },
    { key: "age", label: "Nhóm độ tuổi" },
    { key: "tenure", label: "Nhóm thâm niên" },
    { key: "contract", label: "Loại hợp đồng" },
];

const breakdownGroups: Record<
    BreakdownKey,
    BreakdownGroup[]
> = {
    tenure: tenureGroups,

    gender: [
        { label: "Nam", color: "#4A9BF2" },
        { label: "Nữ", color: "#FF86B0" },
    ],

    age: [
        { label: "< 25 tuổi", color: "#3157C7" },
        { label: "25 - 34 tuổi", color: "#82C7F0" },
        { label: "35 - 44 tuổi", color: "#FFE09A" },
        { label: "≥ 45 tuổi", color: "#FF86B0" },
    ],

    contract: [
        { label: "Thử việc", color: "#4A9BF2" },
        {
            label: "Xác định thời hạn",
            color: "#FFE09A",
        },
        {
            label: "Không xác định thời hạn",
            color: "#FF86B0",
        },
    ],
};

const demoWeights: Record<
    Exclude<BreakdownKey, "tenure">,
    number[]
> = {
    gender: [0.46, 0.54],
    age: [0.18, 0.43, 0.28, 0.11],
    contract: [0.15, 0.49, 0.36],
};

function allocateDemoValues(
    total: number,
    weights: number[]
): number[] {
    const raw = weights.map(
        (weight) => total * weight
    );

    const values = raw.map(Math.floor);

    const remaining =
        total -
        values.reduce(
            (sum, value) => sum + value,
            0
        );

    const order = raw
        .map((value, index) => ({
            index,
            fraction:
                value - Math.floor(value),
        }))
        .sort(
            (a, b) =>
                b.fraction - a.fraction
        );

    for (let i = 0; i < remaining; i++) {
        values[order[i].index]++;
    }

    return values;
}

function getBreakdownData(
    data: StructureItem[],
    breakdown: BreakdownKey
): StructureItem[] {
    if (breakdown === "tenure") {
        return data;
    }

    return data.map((item) => ({
        label: item.label,
        values: allocateDemoValues(
            item.values.reduce(
                (sum, value) => sum + value,
                0
            ),
            demoWeights[breakdown]
        ),
    }));
}

/* =====================================
   DEMO DATA
   ===================================== */

const tenureWeights = [
    8, 15, 52, 90, 178, 276, 447,
];

const CHART_HEIGHT = 250;
const MIN_ZOOM = 70;
const MAX_ZOOM = 250;
const DEFAULT_ZOOM = 100;

const formatNumber = (value: number) =>
    value.toLocaleString("en-US");

const getTotal = (values: number[]) =>
    values.reduce(
        (sum, value) => sum + value,
        0
    );

const formatPercentage = (
    value: number,
    total: number
) =>
    total > 0
        ? `${((value / total) * 100).toFixed(1)}%`
        : "0.0%";

/* =====================================
   MAIN COMPONENT
   ===================================== */

export function HeadcountStructureChart({
    period = "YTD",
    selectedMonth = null,
    selectedWeek = null,
    onMonthSelect,
    onWeekSelect,
}: HeadcountStructureChartProps) {
    const [zoom, setZoom] =
        useState(DEFAULT_ZOOM);

    const [showDetails, setShowDetails] =
        useState(false);

    const [breakdown, setBreakdown] =
        useState<BreakdownKey>("tenure");

    const [menuOpen, setMenuOpen] =
        useState(false);

    const [selectedSegment, setSelectedSegment] =
        useState<{
            itemIndex: number;
            groupIndex: number;
        } | null>(null);

    const [hover, setHover] =
        useState<StructureHover | null>(null);

    const dropdownRef =
        useRef<HTMLDivElement>(null);

    const chartScrollRef =
        useRef<HTMLDivElement>(null);

    const hoverAreaRef =
        useRef<HTMLDivElement>(null);

    /* =====================================
       REMEMBER PREVIOUS FILTER
       ===================================== */

    const previousMonthRef =
        useRef<string | null>(null);

    const previousWeekRef =
        useRef<string | null>(null);

    /* =====================================
       CLOSE DROPDOWN
       ===================================== */

    useEffect(() => {
        if (!menuOpen) return;

        const handleOutside = (
            event: PointerEvent
        ) => {
            if (
                !dropdownRef.current?.contains(
                    event.target as Node
                )
            ) {
                setMenuOpen(false);
            }
        };

        const handleEscape = (
            event: KeyboardEvent
        ) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        document.addEventListener(
            "pointerdown",
            handleOutside
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutside
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [menuOpen]);

    /* =====================================
       DATA
       ===================================== */

    const groups =
        breakdownGroups[breakdown];

    const sharedMonths: StructureItem[] =
        headcountByMonth.map((row) => ({
            label: row.month,
            values: allocateByWeights(
                row.actual,
                tenureWeights
            ),
        }));

    const sharedWeeks: StructureItem[] =
        getDemoMTDWeeks(selectedMonth).map(
            (row) => ({
                label: row.label,
                values: allocateByWeights(
                    row.actual,
                    tenureWeights
                ),
            })
        );

    const data = getBreakdownData(
        period === "MTD"
            ? sharedWeeks
            : sharedMonths,
        breakdown
    );

    const focusedLabel =
        period === "YTD"
            ? selectedMonth
            : selectedWeek;

    const focusedIndex =
        data.findIndex(
            (item) =>
                item.label === focusedLabel
        );

    const hasFocusedMonth =
        focusedIndex >= 0;

    const monthColumns = data
        .map((_, index) => {
            if (!hasFocusedMonth) {
                return "1fr";
            }

            return index === focusedIndex
                ? "3.4fr"
                : "0.65fr";
        })
        .join(" ");

    const zoomScale =
        zoom / MIN_ZOOM;

    const contentHeight =
        Math.round(
            CHART_HEIGHT * zoomScale
        );

    useEffect(() => {
        const container =
            chartScrollRef.current;

        if (!container) return;

        container.scrollTop =
            container.scrollHeight;
    }, [zoom, period, breakdown]);

    const handleZoomChange = (
        value: number
    ) => {
        setZoom(
            Math.min(
                MAX_ZOOM,
                Math.max(
                    MIN_ZOOM,
                    value
                )
            )
        );
    };

    /* =====================================
       SELECTED DATA
       ===================================== */

    const selectedData =
        selectedSegment
            ? data[
                  selectedSegment.itemIndex
              ]
            : null;

    const selectedGroup =
        selectedSegment
            ? groups[
                  selectedSegment.groupIndex
              ]
            : null;

    const selectedValue =
        selectedData && selectedSegment
            ? selectedData.values[
                  selectedSegment.groupIndex
              ]
            : 0;

    const selectedTotal =
        selectedData
            ? getTotal(
                  selectedData.values
              )
            : 0;

    /* =====================================
       RESTORE PREVIOUS SELECTION
       ===================================== */

    const restoreBeforeSegment = () => {
        const previousMonth =
            previousMonthRef.current;

        const previousWeek =
            previousWeekRef.current;

        if (period === "YTD") {
            if (
                selectedMonth !== previousMonth
            ) {
                if (selectedMonth) {
                    onMonthSelect?.(
                        selectedMonth
                    );
                }

                if (previousMonth) {
                    onMonthSelect?.(
                        previousMonth
                    );
                }
            }
        } else {
            if (
                selectedWeek !== previousWeek
            ) {
                if (selectedWeek) {
                    onWeekSelect?.(
                        selectedWeek
                    );
                }

                if (previousWeek) {
                    onWeekSelect?.(
                        previousWeek
                    );
                }
            }
        }

        setSelectedSegment(null);

        previousMonthRef.current = null;
        previousWeekRef.current = null;
    };

    /* =====================================
       CLICK FIRST / SECOND TIME
       ===================================== */

    const toggleSegment = (
        itemIndex: number,
        groupIndex: number,
        label: string
    ) => {
        const isSameSegment =
            selectedSegment?.itemIndex ===
                itemIndex &&
            selectedSegment?.groupIndex ===
                groupIndex;

        // Click lần 2: trả về trước khi chọn.
        if (isSameSegment) {
            restoreBeforeSegment();
            return;
        }

        // Lưu bộ lọc có trước lần chọn đầu.
        if (!selectedSegment) {
            previousMonthRef.current =
                selectedMonth;

            previousWeekRef.current =
                selectedWeek;
        }

        setSelectedSegment({
            itemIndex,
            groupIndex,
        });

        if (period === "YTD") {
            if (
                selectedMonth !== label
            ) {
                onMonthSelect?.(label);
            }
        } else {
            if (
                selectedWeek !== label
            ) {
                onWeekSelect?.(label);
            }
        }
    };

    /* =====================================
       RENDER
       ===================================== */

    return (
        <div
            style={{
                width: "100%",
                minWidth: 0,
                background: "#FFFFFF",
                border:
                    "1px solid #D9DEE8",
                borderRadius: 12,
                padding:
                    "16px 14px 12px",
                boxSizing: "border-box",
                fontFamily:
                    "Segoe UI, sans-serif",
                color: "#001F82",
            }}
        >
            {/* ZOOM CSS */}
            <style>
                {`
                    .headcount-structure-zoom {
                        appearance: none;
                        border: 0;
                        outline: 0;
                        background: transparent;
                    }

                    .headcount-structure-zoom::-webkit-slider-runnable-track {
                        height: 5px;
                        background: #D9DEE8;
                        border-radius: 999px;
                    }

                    .headcount-structure-zoom::-webkit-slider-thumb {
                        appearance: none;
                        width: 15px;
                        height: 15px;
                        margin-top: -5px;
                        border: 2px solid white;
                        border-radius: 50%;
                        background: #4A9BF2;
                        box-shadow:
                            0 0 0 1px #4A9BF2;
                        cursor: pointer;
                    }

                    .headcount-structure-zoom::-moz-range-track {
                        height: 5px;
                        background: #D9DEE8;
                        border-radius: 999px;
                    }

                    .headcount-structure-zoom::-moz-range-thumb {
                        width: 11px;
                        height: 11px;
                        border: 2px solid white;
                        border-radius: 50%;
                        background: #4A9BF2;
                        cursor: pointer;
                    }

                    .headcount-structure-month {
                        transition:
                            opacity 300ms ease,
                            filter 300ms ease,
                            box-shadow 300ms ease;
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .headcount-structure-month {
                            transition: none;
                        }
                    }
                `}
            </style>

            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    alignItems:
                        "flex-start",
                    justifyContent:
                        "space-between",
                    gap: 8,
                }}
            >
                <CardTitle>
                    CƠ CẤU NHÂN SỰ HIỆN TẠI
                </CardTitle>

                {/* BREAKDOWN DROPDOWN */}
                <div
                    ref={dropdownRef}
                    style={{
                        position: "relative",
                        flexShrink: 0,
                        zIndex: 20,
                    }}
                >
                    <button
                        type="button"
                        aria-expanded={
                            menuOpen
                        }
                        aria-haspopup="true"
                        onClick={() =>
                            setMenuOpen(
                                (current) =>
                                    !current
                            )
                        }
                        style={{
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "space-between",
                            gap: 9,
                            minWidth: 130,
                            height: 24,
                            padding: "0 7px",
                            border:
                                "1px solid #BFD1F5",
                            background:
                                "#FFFFFF",
                            borderRadius: 6,
                            color: "#3157C7",
                            fontSize: 10,
                            cursor: "pointer",
                        }}
                    >
                        {
                            breakdownOptions.find(
                                (option) =>
                                    option.key ===
                                    breakdown
                            )?.label
                        }

                        <span aria-hidden="true">
                            {menuOpen
                                ? "⌃"
                                : "⌄"}
                        </span>
                    </button>

                    {menuOpen && (
                        <div
                            role="menu"
                            aria-label="Chọn nhóm cơ cấu nhân sự"
                            style={{
                                position:
                                    "absolute",
                                right: 0,
                                top: 27,
                                minWidth: 155,
                                padding:
                                    "5px 3px",
                                background:
                                    "#FFFFFF",
                                border:
                                    "1px solid #BFD1F5",
                                borderRadius: 7,
                                boxShadow:
                                    "0 5px 15px rgba(0,31,130,0.14)",
                                zIndex: 50,
                            }}
                        >
                            {breakdownOptions.map(
                                (option) => (
                                    <button
                                        key={
                                            option.key
                                        }
                                        type="button"
                                        role="menuitemradio"
                                        aria-checked={
                                            breakdown ===
                                            option.key
                                        }
                                        onClick={() => {
                                            setBreakdown(
                                                option.key
                                            );

                                            setSelectedSegment(
                                                null
                                            );

                                            previousMonthRef.current =
                                                null;

                                            previousWeekRef.current =
                                                null;

                                            setMenuOpen(
                                                false
                                            );
                                        }}
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: 6,
                                            width: "100%",
                                            padding:
                                                "5px 6px",
                                            border: 0,
                                            borderRadius: 4,
                                            background:
                                                breakdown ===
                                                option.key
                                                    ? "#EEF4FF"
                                                    : "#FFFFFF",
                                            color:
                                                "#24469B",
                                            textAlign:
                                                "left",
                                            fontSize: 10,
                                            cursor:
                                                "pointer",
                                        }}
                                    >
                                        <span
                                            style={{
                                                display:
                                                    "grid",
                                                placeItems:
                                                    "center",
                                                width: 12,
                                                height: 12,
                                                border:
                                                    "1px solid #6B8DDD",
                                                color:
                                                    "#3157C7",
                                                fontSize: 10,
                                            }}
                                        >
                                            {breakdown ===
                                            option.key
                                                ? "✓"
                                                : ""}
                                        </span>

                                        {
                                            option.label
                                        }
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* LEGEND */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px 9px",
                    marginTop: 10,
                    marginBottom: 14,
                    alignItems: "center",
                }}
            >
                {groups.map((group) => (
                    <div
                        key={
                            group.label
                        }
                        style={{
                            display: "flex",
                            alignItems:
                                "center",
                            gap: 4,
                            whiteSpace:
                                "nowrap",
                            fontSize: 9,
                            color:
                                "#52617A",
                        }}
                    >
                        <span
                            style={{
                                width: 7,
                                height: 7,
                                borderRadius:
                                    "50%",
                                background:
                                    group.color,
                                flexShrink: 0,
                            }}
                        />

                        {
                            group.label
                        }
                    </div>
                ))}
            </div>

            {/* CHART + VERTICAL ZOOM */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "22px minmax(0, 1fr)",
                    gap: 12,
                    alignItems: "start",
                }}
            >
                {/* ZOOM CONTROL */}
                <div
                    style={{
                        height: CHART_HEIGHT,
                        display: "flex",
                        flexDirection:
                            "column",
                        alignItems:
                            "center",
                        justifyContent:
                            "space-between",
                    }}
                >
                    <span
                        style={{
                            fontSize: 12,
                            color:
                                "#52617A",
                        }}
                    >
                        +
                    </span>

                    <div
                        style={{
                            flex: 1,
                            minHeight: 0,
                            display: "flex",
                            justifyContent:
                                "center",
                            alignItems:
                                "center",
                            margin: "8px 0",
                        }}
                    >
                        <input
                            className="headcount-structure-zoom"
                            type="range"
                            min={MIN_ZOOM}
                            max={MAX_ZOOM}
                            step={10}
                            value={zoom}
                            aria-label="Zoom biểu đồ cơ cấu nhân sự"
                            onChange={(
                                event
                            ) =>
                                handleZoomChange(
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                            style={{
                                width: 180,
                                height: 16,
                                margin: 0,
                                cursor:
                                    "pointer",
                                transform:
                                    "rotate(-90deg)",
                                background:
                                    "transparent",
                            }}
                        />
                    </div>

                    <span
                        style={{
                            fontSize: 12,
                            color:
                                "#52617A",
                        }}
                    >
                        −
                    </span>
                </div>

                {/* CHART AREA */}
                <div
                    ref={
                        hoverAreaRef
                    }
                    onMouseLeave={() =>
                        setHover(null)
                    }
                    style={{
                        minWidth: 0,
                        position:
                            "relative",
                    }}
                >
                    <div
                        ref={
                            chartScrollRef
                        }
                        style={{
                            height:
                                CHART_HEIGHT,
                            overflowY:
                                "auto",
                            overflowX:
                                "hidden",
                            scrollbarWidth:
                                "thin",
                            scrollbarColor:
                                "#D9DEE8 transparent",
                            boxSizing:
                                "border-box",
                        }}
                    >
                        <div
                            style={{
                                height:
                                    contentHeight,
                                minHeight:
                                    CHART_HEIGHT,
                                display:
                                    "grid",
                                gridTemplateColumns:
                                    monthColumns,
                                gap:
                                    hasFocusedMonth
                                        ? 6
                                        : 10,
                                alignItems:
                                    "stretch",
                                transition:
                                    "grid-template-columns 350ms ease, gap 350ms ease",
                            }}
                        >
                            {data.map(
                                (
                                    item,
                                    itemIndex
                                ) => {
                                    const total =
                                        getTotal(
                                            item.values
                                        );

                                    return (
                                        <div
                                            key={
                                                item.label
                                            }
                                            className="headcount-structure-month"
                                            style={{
                                                height:
                                                    "100%",
                                                display:
                                                    "flex",
                                                flexDirection:
                                                    "column-reverse",
                                                minWidth:
                                                    0,
                                                opacity:
                                                    hasFocusedMonth &&
                                                    focusedIndex !==
                                                        itemIndex
                                                        ? 0.34
                                                        : 1,
                                                filter:
                                                    hasFocusedMonth &&
                                                    focusedIndex !==
                                                        itemIndex
                                                        ? "saturate(0.45)"
                                                        : "none",
                                                boxShadow:
                                                    focusedIndex ===
                                                    itemIndex
                                                        ? "0 0 0 2px #BFD1F5, 0 3px 12px rgba(49,87,199,0.13)"
                                                        : "none",
                                                borderRadius:
                                                    3,
                                            }}
                                        >
                                            {item.values.map(
                                                (
                                                    value,
                                                    groupIndex
                                                ) => {
                                                    const group =
                                                        groups[
                                                            groupIndex
                                                        ];

                                                    const percentage =
                                                        total >
                                                        0
                                                            ? (value /
                                                                  total) *
                                                              100
                                                            : 0;

                                                    const segmentHeight =
                                                        total >
                                                        0
                                                            ? (value /
                                                                  total) *
                                                              contentHeight
                                                            : 0;

                                                    const isSelected =
                                                        selectedSegment?.itemIndex ===
                                                            itemIndex &&
                                                        selectedSegment?.groupIndex ===
                                                            groupIndex;

                                                    return (
                                                        <div
                                                            key={
                                                                group.label
                                                            }
                                                            onMouseMove={(
                                                                event
                                                            ) => {
                                                                const bounds =
                                                                    hoverAreaRef.current?.getBoundingClientRect();

                                                                if (
                                                                    !bounds
                                                                )
                                                                    return;

                                                                setHover(
                                                                    {
                                                                        title:
                                                                            item.label,
                                                                        group:
                                                                            group.label,
                                                                        value,
                                                                        percentage,
                                                                        x:
                                                                            event.clientX -
                                                                            bounds.left,
                                                                        y:
                                                                            event.clientY -
                                                                            bounds.top,
                                                                    }
                                                                );
                                                            }}
                                                            onClick={() =>
                                                                toggleSegment(
                                                                    itemIndex,
                                                                    groupIndex,
                                                                    item.label
                                                                )
                                                            }
                                                            style={{
                                                                height:
                                                                    `${percentage}%`,
                                                                flexShrink:
                                                                    0,
                                                                position:
                                                                    "relative",
                                                                background:
                                                                    group.color,
                                                                boxSizing:
                                                                    "border-box",
                                                                outline:
                                                                    isSelected
                                                                        ? "2px solid #001F82"
                                                                        : "none",
                                                                outlineOffset:
                                                                    "-2px",
                                                                cursor:
                                                                    "pointer",
                                                                overflow:
                                                                    "hidden",
                                                            }}
                                                        >
                                                            {segmentHeight >=
                                                                14 &&
                                                                (!hasFocusedMonth ||
                                                                    focusedIndex ===
                                                                        itemIndex) && (
                                                                    <div
                                                                        style={{
                                                                            position:
                                                                                "absolute",
                                                                            inset: 0,
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            justifyContent:
                                                                                "center",
                                                                            fontSize: 9,
                                                                            fontWeight: 500,
                                                                            lineHeight: 1,
                                                                            color:
                                                                                groupIndex ===
                                                                                0
                                                                                    ? "#FFFFFF"
                                                                                    : "#26354F",
                                                                            whiteSpace:
                                                                                "nowrap",
                                                                            overflow:
                                                                                "hidden",
                                                                            padding:
                                                                                "0 1px",
                                                                            boxSizing:
                                                                                "border-box",
                                                                        }}
                                                                    >
                                                                        {formatNumber(
                                                                            value
                                                                        )}{" "}
                                                                        (
                                                                        {percentage.toFixed(
                                                                            1
                                                                        )}
                                                                        %)
                                                                    </div>
                                                                )}
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    {/* MONTH/WEEK LABELS */}
                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                monthColumns,
                            gap:
                                hasFocusedMonth
                                    ? 6
                                    : 10,
                            marginTop: 8,
                            transition:
                                "grid-template-columns 350ms ease, gap 350ms ease",
                        }}
                    >
                        {data.map(
                            (item) => (
                                <div
                                    key={
                                        item.label
                                    }
                                    title={
                                        item.label
                                    }
                                    onClick={() => {
                                        if (
                                            period ===
                                            "YTD"
                                        ) {
                                            onMonthSelect?.(
                                                item.label
                                            );
                                        } else {
                                            onWeekSelect?.(
                                                item.label
                                            );
                                        }
                                    }}
                                    style={{
                                        textAlign:
                                            "center",
                                        fontSize: 9,
                                        color:
                                            focusedLabel ===
                                            item.label
                                                ? "#001F82"
                                                : "#52617A",
                                        fontWeight:
                                            focusedLabel ===
                                            item.label
                                                ? 700
                                                : 400,
                                        whiteSpace:
                                            "nowrap",
                                        overflow:
                                            "hidden",
                                        opacity:
                                            hasFocusedMonth &&
                                            focusedLabel !==
                                                item.label
                                                ? 0.5
                                                : 1,
                                        cursor:
                                            "pointer",
                                    }}
                                >
                                    {
                                        item.label
                                    }
                                </div>
                            )
                        )}
                    </div>

                    {/* TOOLTIP */}
                    <StructureHoverTooltip
                        hover={
                            hover
                        }
                        containerWidth={
                            hoverAreaRef.current?.clientWidth ??
                            460
                        }
                        containerHeight={
                            hoverAreaRef.current?.clientHeight ??
                            290
                        }
                    />
                </div>
            </div>

            {/* SELECTED SEGMENT */}
            {selectedData && selectedGroup && (
                <div
                    style={{
                        marginTop: 12,
                        padding:
                            "8px 10px",
                        border:
                            "1px solid #D9DEE8",
                        borderRadius: 6,
                        background:
                            "#F8FAFF",
                        fontSize: 11,
                        display: "flex",
                        flexWrap:
                            "wrap",
                        alignItems:
                            "center",
                        justifyContent:
                            "space-between",
                        gap: 8,
                    }}
                >
                    <div>
                        <strong>
                            {
                                selectedData.label
                            }
                        </strong>

                        {" · "}
                        {
                            selectedGroup.label
                        }

                        {" · "}

                        <strong>
                            {formatNumber(
                                selectedValue
                            )}
                            {" ("}
                            {formatPercentage(
                                selectedValue,
                                selectedTotal
                            )}
                            {")"}
                        </strong>
                    </div>

                    <button
                        type="button"
                        onClick={
                            restoreBeforeSegment
                        }
                        style={{
                            border:
                                "none",
                            background:
                                "transparent",
                            color:
                                "#667085",
                            cursor:
                                "pointer",
                            fontSize: 12,
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* DETAILS BUTTON */}
            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "flex-end",
                    marginTop: 9,
                }}
            >
                <button
                    type="button"
                    onClick={() =>
                        setShowDetails(
                            (current) =>
                                !current
                        )
                    }
                    style={{
                        border:
                            "1px solid #D6E2FF",
                        background:
                            "#F5F8FF",
                        color:
                            "#2455D6",
                        borderRadius: 5,
                        padding:
                            "4px 8px",
                        fontSize: 10,
                        cursor:
                            "pointer",
                    }}
                >
                    Chi tiết số & %{" "}
                    {showDetails
                        ? "▲"
                        : "▼"}
                </button>
            </div>

            {/* DETAILS TABLE */}
            {showDetails && (
                <div
                    style={{
                        marginTop: 10,
                        overflowX:
                            "auto",
                        border:
                            "1px solid #E4EAF5",
                        borderRadius: 6,
                    }}
                >
                    <table
                        style={{
                            width: "100%",
                            borderCollapse:
                                "collapse",
                            fontSize: 10,
                            whiteSpace:
                                "nowrap",
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    background:
                                        "#EEF3FF",
                                }}
                            >
                                <th
                                    style={{
                                        padding: 8,
                                        textAlign:
                                            "left",
                                    }}
                                >
                                    {
                                        breakdownOptions.find(
                                            (
                                                option
                                            ) =>
                                                option.key ===
                                                breakdown
                                        )?.label
                                    }
                                </th>

                                {data.map(
                                    (item) => (
                                        <th
                                            key={
                                                item.label
                                            }
                                            style={{
                                                padding:
                                                    8,
                                                textAlign:
                                                    "center",
                                            }}
                                        >
                                            {
                                                item.label
                                            }
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {groups.map(
                                (
                                    group,
                                    groupIndex
                                ) => (
                                    <tr
                                        key={
                                            group.label
                                        }
                                    >
                                        <td
                                            style={{
                                                padding:
                                                    8,
                                                borderTop:
                                                    "1px solid #EDF0F6",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display:
                                                        "inline-block",
                                                    width:
                                                        7,
                                                    height:
                                                        7,
                                                    borderRadius:
                                                        "50%",
                                                    marginRight:
                                                        6,
                                                    background:
                                                        group.color,
                                                }}
                                            />
                                            {
                                                group.label
                                            }
                                        </td>

                                        {data.map(
                                            (
                                                item
                                            ) => {
                                                const total =
                                                    getTotal(
                                                        item.values
                                                    );

                                                const value =
                                                    item.values[
                                                        groupIndex
                                                    ];

                                                return (
                                                    <td
                                                        key={
                                                            item.label
                                                        }
                                                        style={{
                                                            padding:
                                                                8,
                                                            textAlign:
                                                                "center",
                                                            borderTop:
                                                                "1px solid #EDF0F6",
                                                        }}
                                                    >
                                                        {formatNumber(
                                                            value
                                                        )}
                                                        {" ("}
                                                        {formatPercentage(
                                                            value,
                                                            total
                                                        )}
                                                        {")"}
                                                    </td>
                                                );
                                            }
                                        )}
                                    </tr>
                                )
                            )}

                            <tr
                                style={{
                                    background:
                                        "#EEF3FF",
                                    fontWeight: 700,
                                }}
                            >
                                <td
                                    style={{
                                        padding:
                                            8,
                                    }}
                                >
                                    Tổng
                                </td>

                                {data.map(
                                    (item) => (
                                        <td
                                            key={
                                                item.label
                                            }
                                            style={{
                                                padding:
                                                    8,
                                                textAlign:
                                                    "center",
                                            }}
                                        >
                                            {formatNumber(
                                                getTotal(
                                                    item.values
                                                )
                                            )}
                                        </td>
                                    )
                                )}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* FOOTER */}
            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    gap: 8,
                    marginTop: 10,
                    fontSize: 9,
                    color:
                        "#98A2B3",
                }}
            >
                <span>
                    {period}
                    {" · Theo "}
                    {period === "YTD"
                        ? "tháng"
                        : "tuần"}
                    {" · Zoom "}
                    {zoom}%
                </span>

                <span>
                    Dữ liệu minh họa
                    {" · "}
                    Chưa kết nối Fabric
                </span>
            </div>
        </div>
    );
}
