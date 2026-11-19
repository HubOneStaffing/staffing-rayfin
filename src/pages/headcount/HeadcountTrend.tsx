
import { LineChart } from "../../components/charts/LineChart";
import { CardTitle } from "../../components/ui/CardTitle";

// DỮ LIỆU MINH HỌA - CHƯA KẾT NỐI FABRIC
const chartData = [
    { month: "T1", actual: 4850, plan: 5100 },
    { month: "T2", actual: 4920, plan: 5150 },
    { month: "T3", actual: 4975, plan: 5200 },
    { month: "T4", actual: 5020, plan: 5250 },
    { month: "T5", actual: 5080, plan: 5300 },
    { month: "T6", actual: 5110, plan: 5350 },
    { month: "T7", actual: 5170, plan: 5400 },
    { month: "T8", actual: 5210, plan: 5450 },
    { month: "T9", actual: 5260, plan: 5500 },
    { month: "T10", actual: 5304, plan: 5550 },
];

export function HeadcountTrend() {
    return (
        <div
            style={{
                background: "#FFFFFF",
                border: "1px solid #D9DEE8",
                borderRadius: 12,

                // ĐỒNG NHẤT PADDING
                padding: "16px 14px 12px",

                boxSizing: "border-box",
                minHeight: 330,
                fontFamily: "Segoe UI, sans-serif",
            }}
        >
            {/* TITLE CHUNG */}
            <div style={{ marginBottom: 12 }}>
                <CardTitle>
                    XU HƯỚNG NHÂN SỰ & BIẾN ĐỘNG
                </CardTitle>
            </div>

            {/* LINE CHART */}
            <LineChart
                data={chartData}
                xKey="month"
                series={[
                    {
                        key: "actual",
                        label: "NS thực tế",
                    },
                    {
                        key: "plan",
                        label: "NS kế hoạch",
                    },
                ]}
            />

            {/* FOOTER */}
            <div
                style={{
                    marginTop: 8,
                    fontSize: 10,
                    color: "#98A2B3",
                    textAlign: "right",
                }}
            >
                Dữ liệu minh họa · Chưa kết nối Fabric
            </div>
        </div>
    );
}
