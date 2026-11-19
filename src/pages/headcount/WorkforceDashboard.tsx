
import { useState } from "react";
import type { StaffingFilters } from "../../services/staffingFilters";
import {
    DemoCrossFilterProvider,
    useDemoCrossFilter,
} from "../../lib/demoCrossFilter";
import type { DashboardPage } from "../../components/layout/DashboardSidebar";
import { DashboardShell } from "../../components/layout/DashboardShell";
import { WorkforceTopGrid } from "../../components/layout/WorkforceTopGrid";
import { WorkforceBottomGrid } from "../../components/layout/WorkforceBottomGrid";
import { FilterBar } from "../../components/filters/FilterBar";
import { HeadcountCurrentCard } from "./HeadcountCurrentCard";
import { HeadcountMovementCard } from "./HeadcountMovementCard";
import { HeadcountTrendChart } from "./HeadcountTrendChart";
import { HeadcountOverviewTable } from "./HeadcountOverviewTable";
import { TurnoverCard } from "./TurnoverCard";
import { TurnoverStructureChart } from "./TurnoverStructureChart";
import { HeadcountStructureChart } from "./HeadcountStructureChart";
import { HeadcountAttentionTable } from "./HeadcountAttentionTable";

export type DashboardPeriod = "MTD" | "YTD";

interface WorkforceDashboardProps {
    onPageChange?: (page: DashboardPage) => void;
    filters?: StaffingFilters;
    onFiltersChange?: (next: StaffingFilters) => void;
}

export function WorkforceDashboard({
    onPageChange,
    filters,
    onFiltersChange,
}: WorkforceDashboardProps) {
    return (
        <DemoCrossFilterProvider>
            <WorkforceDashboardContent
                onPageChange={onPageChange}
                filters={filters}
                onFiltersChange={onFiltersChange}
            />
        </DemoCrossFilterProvider>
    );
}

function WorkforceDashboardContent({
    onPageChange,
    filters,
    onFiltersChange,
}: WorkforceDashboardProps) {
    const { slice, clearSlice } = useDemoCrossFilter();

    const [period, setPeriod] =
        useState<DashboardPeriod>("YTD");

    const [selectedMonth, setSelectedMonth] =
        useState<string | null>(null);

    const [selectedWeek, setSelectedWeek] =
        useState<string | null>(null);

    const changePeriod = (next: DashboardPeriod) => {
        setPeriod(next);
        setSelectedWeek(null);
        clearSlice();
    };

    const toggleMonth = (month: string) => {
        setSelectedMonth((current) =>
            current === month ? null : month
        );
        clearSlice();
    };

    const changeMonth = (month: string | null) => {
        setSelectedMonth(month);
        setSelectedWeek(null);
        clearSlice();
    };

    const toggleWeek = (week: string) => {
        setSelectedWeek((current) =>
            current === week ? null : week
        );
        clearSlice();
    };

    return (
        <DashboardShell
            activePage="headcount"
            onPageChange={onPageChange}
            filters={
                <FilterBar
                    period={period}
                    onPeriodChange={changePeriod}
                    selectedMonth={selectedMonth}
                    onMonthChange={changeMonth}
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                />
            }
        >
            {slice && (
                <div
                    style={{
                        marginBottom: 8,
                        padding: "7px 12px",
                        background: "#EAF1FF",
                        border: "1px solid #BFD1F5",
                        borderRadius: 7,
                        color: "#001F82",
                        fontSize: 11,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <span>
                        Đang lọc demo:{" "}
                        {slice.source === "turnover"
                            ? "Cơ cấu nghỉ việc"
                            : "Cơ cấu nhân sự"}
                        {" · "}
                        {slice.periodLabel}
                        {" · "}
                        {slice.category}
                        {slice.row ? ` · ${slice.row}` : ""}
                    </span>

                    <button
                        type="button"
                        onClick={clearSlice}
                        style={{
                            background: "#FFFFFF",
                            border: "1px solid #BFD1F5",
                            borderRadius: 5,
                            color: "#001F82",
                            cursor: "pointer",
                            padding: "3px 8px",
                            whiteSpace: "nowrap",
                        }}
                    >
                        ✕ Bỏ chọn
                    </button>
                </div>
            )}

            <WorkforceTopGrid
                left={
                    <>
                        <HeadcountCurrentCard
                            period={period}
                            selectedMonth={selectedMonth}
                            selectedWeek={selectedWeek}
                        />

                        <HeadcountMovementCard
                            period={period}
                            onPeriodChange={changePeriod}
                            selectedMonth={selectedMonth}
                            selectedWeek={selectedWeek}
                        />
                    </>
                }
                center={
                    <HeadcountTrendChart
                        period={period}
                        onPeriodChange={changePeriod}
                        selectedMonth={selectedMonth}
                        selectedWeek={selectedWeek}
                        onMonthSelect={toggleMonth}
                        onWeekSelect={toggleWeek}
                    />
                }
                right={
                    <HeadcountOverviewTable
                        period={period}
                        selectedMonth={selectedMonth}
                        selectedWeek={selectedWeek}
                    />
                }
            />

            <WorkforceBottomGrid
                left={
                    <TurnoverCard
                        period={period}
                        onOpenTurnover={() =>
                            onPageChange?.("turnover")
                        }
                        selectedMonth={selectedMonth}
                        selectedWeek={selectedWeek}
                        onMonthSelect={toggleMonth}
                        onWeekSelect={toggleWeek}
                    />
                }
                center={
                    <TurnoverStructureChart
                        period={period}
                        selectedMonth={selectedMonth}
                        selectedWeek={selectedWeek}
                    />
                }
                right={
                    <HeadcountStructureChart
                        period={period}
                        selectedMonth={selectedMonth}
                        selectedWeek={selectedWeek}
                        onMonthSelect={toggleMonth}
                        onWeekSelect={toggleWeek}
                    />
                }
            />

            <div
                style={{
                    marginTop: 16,
                    width: "100%",
                }}
            >
                <HeadcountAttentionTable
                    selectedMonth={selectedMonth}
                />
            </div>
        </DashboardShell>
    );
}
