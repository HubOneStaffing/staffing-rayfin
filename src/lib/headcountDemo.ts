/** Dữ liệu theo tháng dùng chung cho demo Cross-filter Headcount.
 *  Đây là số minh họa, không phải dữ liệu Fabric/HR thực tế.
 */
export type MonthlyHeadcount = {
    month: string;
    plan: number;
    actual: number;
    hires: number;
    exits: number;
};

export const headcountByMonth: MonthlyHeadcount[] = [
    { month: "06/2026", plan: 1062, actual: 1069, hires: 74, exits: 57 },
    { month: "07/2026", plan: 1055, actual: 1058, hires: 42, exits: 53 },
    { month: "08/2026", plan: 1057, actual: 1060, hires: 46, exits: 44 },
    { month: "09/2026", plan: 1082, actual: 1066, hires: 43, exits: 37 },
    { month: "10/2026", plan: 1091, actual: 1078, hires: 31, exits: 19 },
    { month: "11/2026", plan: 1099, actual: 1095, hires: 25, exits: 8 },
];

/** KPI tổng quan demo đang hiển thị tại HC (khác tổng của 6 tháng trend). */
export const HC_DEMO_YTD_EXITS = 738;
export const HC_DEMO_YTD_TURNOVER = 0.041;
export const HC_DEMO_MONTHLY_TURNOVER: Record<string, number> = {
    "06/2026": 0.049, "07/2026": 0.043, "08/2026": 0.035,
    "09/2026": 0.039, "10/2026": 0.047, "11/2026": 0.042,
};

export const getHeadcountMonth = (month: string | null) =>
    headcountByMonth.find((row) => row.month === month) ?? null;

/** Cùng một kỳ MTD cho mọi thành phần UI (4 tuần thuộc tháng đang chọn).
 *  ĐÂY LÀ DEMO: tỷ lệ nghỉ chỉ nhằm kiểm thử tương tác, không phải DAX chính thức.
 */
export type DemoWeek = MonthlyHeadcount & { label: string; turnover: number };
export const DEFAULT_DEMO_MONTH = headcountByMonth[headcountByMonth.length - 1].month;

export function getDemoMTDWeeks(selectedMonth: string | null = null): DemoWeek[] {
    const month = getHeadcountMonth(selectedMonth ?? DEFAULT_DEMO_MONTH);
    if (!month) return [];

    const hires = allocateByWeights(month.hires, [6, 12, 7, 0]);
    const exits = allocateByWeights(month.exits, [1, 5, 2, 0]);
    let actual = month.actual - month.hires + month.exits;
    return hires.map((hireCount, index) => {
        const opening = actual;
        actual += hireCount - exits[index];
        return {
            month: month.month,
            label: `W${index + 1}`,
            plan: month.plan,
            actual,
            hires: hireCount,
            exits: exits[index],
            turnover: opening > 0 ? exits[index] / opening : 0,
        };
    });
}

export function getDemoMTDValue(selectedMonth: string | null, selectedWeek: string | null) {
    const weeks = getDemoMTDWeeks(selectedMonth);
    const week = selectedWeek ? weeks.find((row) => row.label === selectedWeek) : null;
    const month = getHeadcountMonth(selectedMonth ?? DEFAULT_DEMO_MONTH);
    return {
        month,
        weeks,
        actual: week?.actual ?? month?.actual ?? 0,
        plan: week?.plan ?? month?.plan ?? 0,
        hires: week?.hires ?? month?.hires ?? 0,
        exits: week?.exits ?? month?.exits ?? 0,
        week,
    };
}

/** Phân bổ số nguyên theo tỷ trọng; tổng các phần luôn bằng total. */
export function allocateByWeights(total: number, weights: number[]): number[] {
    if (total <= 0) return weights.map(() => 0);
    const sum = weights.reduce((a, b) => a + Math.max(b, 0), 0);
    if (!sum) return weights.map(() => 0);
    const exact = weights.map((w) => total * Math.max(w, 0) / sum);
    const result = exact.map(Math.floor);
    const remainder = total - result.reduce((a, b) => a + b, 0);
    const order = exact
        .map((value, index) => ({ index, fractional: value - Math.floor(value) }))
        .sort((a, b) => b.fractional - a.fractional);
    for (let i = 0; i < remainder; i++) result[order[i].index]++;
    return result;
}
