
import { useEffect, useRef, useState } from "react";
import { CardTitle } from "../../components/ui/CardTitle";
import {
    StructureHoverTooltip,
    type StructureHover,
} from "../../components/ui/StructureHoverTooltip";
import {
    allocateByWeights,
    getDemoMTDValue,
    getHeadcountMonth,
} from "../../lib/headcountDemo";

type Period = "MTD" | "YTD";

interface TurnoverStructureChartProps {
    period: Period;
    selectedMonth?: string | null;
    selectedWeek?: string | null;
}

type TurnoverRow = {
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
    number[][]
> = {
    gender: [
        [0.42, 0.58],
        [0.55, 0.45],
        [0.48, 0.52],
    ],

    age: [
        [0.18, 0.43, 0.29, 0.10],
        [0.12, 0.38, 0.35, 0.15],
        [0.22, 0.40, 0.27, 0.11],
    ],

    contract: [
        [0.19, 0.46, 0.35],
        [0.13, 0.51, 0.36],
        [0.24, 0.42, 0.34],
    ],
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
    rows: TurnoverRow[],
    key: BreakdownKey
): TurnoverRow[] {
    if (key === "tenure") {
        return rows;
    }

    return rows.map((row, index) => ({
        label: row.label,
        values: allocateDemoValues(
            row.values.reduce(
                (sum, value) => sum + value,
                0
            ),
            demoWeights[key][index]
        ),
    }));
}

/* =====================================
   DEMO DATA
   ===================================== */

const turnoverMTD: TurnoverRow[] = [
    {
        label: "Nghỉ việc tự nguyện",
        values: [1, 2, 3, 4, 6, 7, 7],
    },
    {
        label: "Nghỉ việc không tự nguyện",
        values: [0, 1, 1, 1, 1, 2, 2],
    },
    {
        label: "Không thuộc nhóm",
        values: [2, 1, 2, 2, 2, 2, 1],
    },
];

const turnoverYTD: TurnoverRow[] = [
    {
        label: "Nghỉ việc tự nguyện",
        values: [8, 14, 21, 31, 66, 73, 78],
    },
    {
        label: "Nghỉ việc không tự nguyện",
        values: [5, 7, 7, 9, 7, 9, 9],
    },
    {
        label: "Không thuộc nhóm",
        values: [104, 26, 43, 52, 59, 60, 50],
    },
];

const formatNumber = (value: number) =>
    value.toLocaleString("en-US");

const formatPercent = (
    value: number,
    total: number
) =>
    total > 0
        ? `${((value / total) * 100).toFixed(1)}%`
        : "0.0%";

/* =====================================
   COMPONENT
   ===================================== */

export function TurnoverStructureChart({
    period,
    selectedMonth = null,
    selectedWeek = null,
}: TurnoverStructureChartProps) {
    const [zoom, setZoom] =
        useState(100);

    const [showDetails, setShowDetails] =
        useState(false);

    const [breakdown, setBreakdown] =
        useState<BreakdownKey>("tenure");

    const [menuOpen, setMenuOpen] =
        useState(false);

    const menuRef =
        useRef<HTMLDivElement>(null);

    const hoverAreaRef =
        useRef<HTMLDivElement>(null);

    const [selected, setSelected] =
        useState<{
            rowIndex: number;
            groupIndex: number;
        } | null>(null);

    const [hover, setHover] =
        useState<StructureHover | null>(null);

    /* =====================================
       CLOSE DROPDOWN
       ===================================== */

    useEffect(() => {
        if (!menuOpen) return;

        const handleClickOutside = (
            event: MouseEvent
        ) => {
            if (
                !menuRef.current?.contains(
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
            handleClickOutside
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleClickOutside
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [menuOpen]);

    /* =====================================
       DATA MTD / YTD
       ===================================== */

    const groups =
        breakdownGroups[breakdown];

    const month =
        getHeadcountMonth(selectedMonth);

    const monthlyRows: TurnoverRow[] =
        period === "MTD"
            ? (() => {
                  const summary =
                      getDemoMTDValue(
                          selectedMonth,
                          selectedWeek
                      );

                  const distributed =
                      allocateByWeights(
                          summary.exits,
                          turnoverMTD.flatMap(
                              (row) =>
                                  row.values
                          )
                      );

                  return turnoverMTD.map(
                      (row, index) => ({
                          label: row.label,
                          values:
                              distributed.slice(
                                  index * 7,
                                  index * 7 + 7
                              ),
                      })
                  );
              })()
            : selectedMonth
              ? (() => {
                    const distributed =
                        allocateByWeights(
                            month?.exits ?? 0,
                            turnoverYTD.flatMap(
                                (row) =>
                                    row.values
                            )
                        );

                    return turnoverYTD.map(
                        (row, index) => ({
                            label: row.label,
                            values:
                                distributed.slice(
                                    index * 7,
                                    index * 7 + 7
                                ),
                        })
                    );
                })()
              : turnoverYTD;

    const data = getBreakdownData(
        monthlyRows,
        breakdown
    );

    const totalEmployees =
        data.reduce(
            (sum, row) =>
                sum +
                row.values.reduce(
                    (a, b) => a + b,
                    0
                ),
            0
        );

    const selectedRow =
        selected !== null
            ? data[selected.rowIndex]
            : null;

    const selectedTotal = selectedRow
        ? selectedRow.values.reduce(
              (a, b) => a + b,
              0
          )
        : 0;

    const selectedValue =
        selectedRow && selected
            ? selectedRow.values[
                  selected.groupIndex
              ]
            : 0;

    /* =====================================
       CLICK TOGGLE
       ===================================== */

    const toggleSegment = (
        rowIndex: number,
        groupIndex: number
    ) => {
        setSelected((current) => {
            const isSameSegment =
                current?.rowIndex === rowIndex &&
                current?.groupIndex === groupIndex;

            return isSameSegment
                ? null
                : {
                      rowIndex,
                      groupIndex,
                  };
        });
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minHeight: 380,
                padding: "16px 14px 12px",
                boxSizing: "border-box",
                background: "#FFFFFF",
                border: "1px solid #D9DEE8",
                borderRadius: 12,
                fontFamily: "Segoe UI, sans-serif",
                display: "flex",
                flexDirection: "column",
                overflow: "visible",
            }}
        >
            {/* ZOOM CSS */}
            <style>
                {`
                    .turnover-bar-scroll {
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }

                    .turnover-bar-scroll::-webkit-scrollbar {
                        display: none;
                    }

                    .turnover-zoom {
                        appearance: none;
                        width: 100%;
                        height: 5px;
                        background: #D9DEE8;
                        border-radius: 10px;
                        outline: none;
                        cursor: pointer;
                    }

                    .turnover-zoom::-webkit-slider-thumb {
                        appearance: none;
                        width: 13px;
                        height: 13px;
                        border-radius: 50%;
                        background: #4A9BF2;
                        border: 2px solid #FFFFFF;
                        box-shadow:
                            0 0 0 1px #4A9BF2;
                        cursor: grab;
                    }

                    .turnover-zoom::-moz-range-thumb {
                        width: 13px;
                        height: 13px;
                        border-radius: 50%;
                        background: #4A9BF2;
                        border: 2px solid #FFFFFF;
                        cursor: pointer;
                    }
                `}
            </style>

            {/* TITLE */}
            <div style={{ marginBottom: 12 }}>
                <CardTitle>
                    CƠ CẤU NGHỈ VIỆC
                </CardTitle>
            </div>

            {/* BREAKDOWN */}
            <div
                ref={menuRef}
                style={{
                    position: "relative",
                    alignSelf: "flex-end",
                    marginTop: -30,
                    marginBottom: 12,
                    zIndex: 15,
                }}
            >
                <button
                    type="button"
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                    onClick={() =>
                        setMenuOpen(
                            (current) => !current
                        )
                    }
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        gap: 12,
                        minWidth: 130,
                        height: 24,
                        padding: "0 8px",
                        background: "#FFFFFF",
                        color: "#3157C7",
                        border:
                            "1px solid #BFD1F5",
                        borderRadius: 6,
                        fontSize: 10,
                        cursor: "pointer",
                    }}
                >
                    {
                        breakdownOptions.find(
                            (option) =>
                                option.key === breakdown
                        )?.label
                    }

                    <span aria-hidden="true">
                        {menuOpen ? "⌃" : "⌄"}
                    </span>
                </button>

                {menuOpen && (
                    <div
                        role="menu"
                        aria-label="Chọn nhóm cơ cấu nghỉ việc"
                        style={{
                            position: "absolute",
                            right: 0,
                            top: 27,
                            minWidth: 155,
                            padding: "5px 3px",
                            background: "#FFFFFF",
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
                                    key={option.key}
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
                                        setSelected(null);
                                        setHover(null);
                                        setMenuOpen(false);
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        gap: 6,
                                        width: "100%",
                                        padding: "5px 6px",
                                        background:
                                            breakdown ===
                                            option.key
                                                ? "#EEF4FF"
                                                : "#FFFFFF",
                                        border: 0,
                                        borderRadius: 4,
                                        textAlign: "left",
                                        color: "#24469B",
                                        fontSize: 10,
                                        cursor: "pointer",
                                    }}
                                >
                                    <span
                                        aria-hidden="true"
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

                                    {option.label}
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* LEGEND */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px 9px",
                    marginBottom: 12,
                }}
            >
                {groups.map((group) => (
                    <div
                        key={group.label}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 9,
                            color: "#667085",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <span
                            style={{
                                width: 7,
                                height: 7,
                                flexShrink: 0,
                                borderRadius: "50%",
                                background: group.color,
                            }}
                        />
                        {group.label}
                    </div>
                ))}
            </div>

            {/* STACKED BAR CHART */}
            <div
                ref={hoverAreaRef}
                onMouseLeave={() =>
                    setHover(null)
                }
                style={{
                    flex: 1,
                    minHeight: 0,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent:
                        "space-evenly",
                    gap: 14,
                }}
            >
                {data.map((row, rowIndex) => {
                    const total =
                        row.values.reduce(
                            (sum, value) =>
                                sum + value,
                            0
                        );

                    return (
                        <div
                            key={row.label}
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "135px minmax(0, 1fr)",
                                gap: 10,
                                alignItems: "center",
                            }}
                        >
                            {/* ROW LABEL */}
                            <div
                                style={{
                                    fontSize: 10,
                                    color: "#475467",
                                    textAlign: "right",
                                    lineHeight: 1.4,
                                }}
                            >
                                {rowIndex + 1} -{" "}
                                {row.label}
                            </div>

                            {/* BAR SCROLL */}
                            <div
                                className="turnover-bar-scroll"
                                style={{
                                    width: "100%",
                                    overflowX: "auto",
                                    overflowY: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${zoom}%`,
                                        minWidth: "100%",
                                        height: 46,
                                        display: "flex",
                                        background:
                                            "#F2F5FA",
                                    }}
                                >
                                    {row.values.map(
                                        (
                                            value,
                                            groupIndex
                                        ) => {
                                            const percent =
                                                total > 0
                                                    ? (value /
                                                          total) *
                                                      100
                                                    : 0;

                                            const isSelected =
                                                selected?.rowIndex ===
                                                    rowIndex &&
                                                selected?.groupIndex ===
                                                    groupIndex;

                                            return (
                                                <div
                                                    key={
                                                        groupIndex
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
                                                                    row.label,
                                                                group:
                                                                    groups[
                                                                        groupIndex
                                                                    ].label,
                                                                value,
                                                                percentage:
                                                                    percent,
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
                                                            rowIndex,
                                                            groupIndex
                                                        )
                                                    }
                                                    style={{
                                                        width: `${percent}%`,
                                                        minWidth: 0,
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        background:
                                                            groups[
                                                                groupIndex
                                                            ].color,
                                                        overflow:
                                                            "hidden",
                                                        whiteSpace:
                                                            "nowrap",
                                                        boxSizing:
                                                            "border-box",
                                                        outline:
                                                            isSelected
                                                                ? "2px solid #001F82"
                                                                : "none",
                                                        outlineOffset:
                                                            -2,
                                                        cursor:
                                                            "pointer",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 9,
                                                            fontWeight: 500,
                                                            color:
                                                                groupIndex ===
                                                                0
                                                                    ? "#FFFFFF"
                                                                    : "#26354F",
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {value > 0 &&
                                                        (percent *
                                                            zoom) /
                                                            100 >=
                                                            13
                                                            ? `${formatNumber(
                                                                  value
                                                              )} (${formatPercent(
                                                                  value,
                                                                  total
                                                              )})`
                                                            : ""}
                                                    </span>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* TOOLTIP */}
                <StructureHoverTooltip
                    hover={hover}
                    containerWidth={
                        hoverAreaRef.current?.clientWidth ??
                        460
                    }
                    containerHeight={
                        hoverAreaRef.current?.clientHeight ??
                        230
                    }
                />
            </div>

            {/* SELECTED DETAIL */}
            {selectedRow && selected && (
                <div
                    style={{
                        marginTop: 6,
                        padding: "6px 9px",
                        background: "#F4F7FE",
                        border:
                            "1px solid #DCE6F8",
                        borderRadius: 6,
                        fontSize: 10,
                        color: "#344054",
                        display: "flex",
                        justifyContent:
                            "space-between",
                        gap: 8,
                    }}
                >
                    <span>
                        {selectedRow.label}
                        {" · "}
                        {
                            groups[
                                selected.groupIndex
                            ].label
                        }
                    </span>

                    <strong
                        style={{
                            color: "#001F82",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {formatNumber(
                            selectedValue
                        )}{" "}
                        (
                        {formatPercent(
                            selectedValue,
                            selectedTotal
                        )}
                        )
                    </strong>
                </div>
            )}

            {/* ZOOM */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 9,
                    paddingLeft: 145,
                }}
            >
                <span
                    style={{
                        fontSize: 11,
                        color: "#667085",
                    }}
                >
                    −
                </span>

                <input
                    type="range"
                    className="turnover-zoom"
                    min={100}
                    max={300}
                    step={10}
                    value={zoom}
                    aria-label="Zoom ngang cơ cấu nghỉ việc"
                    onChange={(event) =>
                        setZoom(
                            Number(
                                event.target.value
                            )
                        )
                    }
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                />

                <span
                    style={{
                        fontSize: 11,
                        color: "#667085",
                    }}
                >
                    +
                </span>

                <span
                    style={{
                        minWidth: 32,
                        textAlign: "right",
                        fontSize: 9,
                        color: "#667085",
                    }}
                >
                    {zoom}%
                </span>
            </div>

            {/* DETAILS BUTTON */}
            <button
                type="button"
                onClick={() =>
                    setShowDetails(
                        (current) => !current
                    )
                }
                style={{
                    alignSelf: "flex-end",
                    marginTop: 5,
                    padding: "3px 7px",
                    background: "#F4F7FE",
                    border:
                        "1px solid #DCE6F8",
                    borderRadius: 5,
                    fontSize: 9,
                    color: "#2456D3",
                    cursor: "pointer",
                }}
            >
                {showDetails
                    ? "Ẩn chi tiết số & % ▲"
                    : "Chi tiết số & % ▼"}
            </button>

            {/* DETAILS TABLE */}
            {showDetails && (
                <div
                    style={{
                        maxHeight: 155,
                        overflow: "auto",
                        marginTop: 5,
                        border:
                            "1px solid #E4EAF3",
                        borderRadius: 6,
                    }}
                >
                    <table
                        style={{
                            width: "100%",
                            borderCollapse:
                                "collapse",
                            fontSize: 9,
                            color: "#344054",
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    background:
                                        "#EFF4FC",
                                }}
                            >
                                <th
                                    style={{
                                        padding: 6,
                                        textAlign:
                                            "left",
                                    }}
                                >
                                    Nhóm nghỉ việc
                                </th>

                                {groups.map((group) => (
                                    <th
                                        key={group.label}
                                        style={{
                                            padding: 6,
                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        {group.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((row) => {
                                const total =
                                    row.values.reduce(
                                        (a, b) =>
                                            a + b,
                                        0
                                    );

                                return (
                                    <tr
                                        key={row.label}
                                    >
                                        <td
                                            style={{
                                                padding: 6,
                                                borderTop:
                                                    "1px solid #E4EAF3",
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {row.label}
                                        </td>

                                        {row.values.map(
                                            (
                                                value,
                                                i
                                            ) => (
                                                <td
                                                    key={i}
                                                    style={{
                                                        padding: 6,
                                                        textAlign:
                                                            "center",
                                                        whiteSpace:
                                                            "nowrap",
                                                        borderTop:
                                                            "1px solid #E4EAF3",
                                                    }}
                                                >
                                                    {formatNumber(
                                                        value
                                                    )}
                                                    {" ("}
                                                    {formatPercent(
                                                        value,
                                                        total
                                                    )}
                                                    {")"}
                                                </td>
                                            )
                                        )}
                                    </tr>
                                );
                            })}
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
                    marginTop: 7,
                    fontSize: 9,
                    color: "#98A2B3",
                }}
            >
                <span>
                    {selectedMonth
                        ? `Tháng ${selectedMonth}`
                        : period}
                    {" · Tổng: "}
                    {formatNumber(
                        totalEmployees
                    )}{" "}
                    NS
                </span>

                <span>
                    {selectedMonth && !month
                        ? "Chưa có dữ liệu HC nghỉ của tháng này"
                        : "Phân bổ demo · Chưa kết nối Fabric"}
                </span>
            </div>
        </div>
    );
}
