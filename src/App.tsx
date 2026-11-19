import { useState } from "react";

import { WorkforceDashboard } from "./pages/headcount/WorkforceDashboard";
import { TurnoverDashboard } from "./pages/turnover/TurnoverDashboard";
import { RecruitmentDashboard } from "./pages/recruitment/RecruitmentDashboard";
import { ModuleDashboard } from "./pages/ModuleDashboard";

import type { DashboardPage } from "./components/layout/DashboardSidebar";
import { DEFAULT_STAFFING_FILTERS, type StaffingFilters } from "./services/staffingFilters";

export default function App() {
    const [activePage, setActivePage] =
        useState<DashboardPage>("headcount");
    const [filters, setFilters] = useState<StaffingFilters>({ ...DEFAULT_STAFFING_FILTERS });

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                background: "#EEF7FF",
                fontFamily: "Segoe UI, sans-serif",
            }}
        >
            {activePage === "headcount" ? (
                <WorkforceDashboard
                    onPageChange={setActivePage}
                    filters={filters}
                    onFiltersChange={setFilters}
                />
            ) : activePage === "turnover" ? (
                <TurnoverDashboard
                    onPageChange={setActivePage}
                    filters={filters}
                    onFiltersChange={setFilters}
                />
            ) : activePage === "recruitment" ? (
                <RecruitmentDashboard
                    onPageChange={setActivePage}
                    filters={filters}
                    onFiltersChange={setFilters}
                />
            ) : (
                <ModuleDashboard
                    page={activePage}
                    onPageChange={setActivePage}
                    filters={filters}
                    onFiltersChange={setFilters}
                />
            )}
        </div>
    );
}
