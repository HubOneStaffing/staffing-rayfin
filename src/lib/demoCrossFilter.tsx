
import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

/* =====================================
   TYPES
   ===================================== */

export type DemoSlice = {
    source: "headcount" | "turnover";

    periodLabel: string;

    breakdown:
        | "gender"
        | "age"
        | "tenure"
        | "contract";

    category: string;

    row?: string;

    share: number;
};

type DemoCrossFilterContext = {
    slice: DemoSlice | null;

    toggleSlice: (next: DemoSlice) => void;

    clearSlice: () => void;
};

/* =====================================
   SHARED CONTEXT
   ===================================== */

const Context =
    createContext<DemoCrossFilterContext | null>(null);

/* =====================================
   PROVIDER
   ===================================== */

export function DemoCrossFilterProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [slice, setSlice] =
        useState<DemoSlice | null>(null);

    const value = useMemo<DemoCrossFilterContext>(
        () => ({
            slice,

            toggleSlice(next) {
                setSlice((current) => {
                    const isSameSelection =
                        current !== null &&
                        current.source === next.source &&
                        current.periodLabel ===
                            next.periodLabel &&
                        current.breakdown ===
                            next.breakdown &&
                        current.category ===
                            next.category &&
                        current.row === next.row;

                    return isSameSelection
                        ? null
                        : next;
                });
            },

            clearSlice() {
                setSlice(null);
            },
        }),
        [slice]
    );

    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    );
}

/* =====================================
   SHARED HOOK
   ===================================== */

export function useDemoCrossFilter() {
    const value = useContext(Context);

    if (!value) {
        throw new Error(
            "DemoCrossFilterProvider is missing"
        );
    }

    return value;
}

/* =====================================
   DEMO FILTER CALCULATION
   ===================================== */

/**
 * Hàm lọc dữ liệu demo theo tỷ trọng.
 *
 * Chú ý:
 * - Chỉ phục vụ demo Cross-filter.
 * - Không thay thế Business Rule/DAX.
 * - Khi nối API thật sẽ tính từ dữ liệu nhân viên.
 */

export function demoFilteredNumber(
    value: number,
    slice: DemoSlice | null,
    metric: "headcount" | "turnover" = "headcount"
) {
    if (!slice) {
        return value;
    }

    // Loại nghỉ việc không lọc trực tiếp HC Active.
    if (
        slice.source === "turnover" &&
        metric === "headcount"
    ) {
        return value;
    }

    const share = Math.max(
        0,
        Math.min(1, slice.share)
    );

    return Math.round(value * share);
}
