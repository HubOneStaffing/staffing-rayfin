// Component độc lập: phiên bản source được bàn giao không có thư mục
// @/types và @/config. Danh mục hiển thị khớp bộ lọc Staffing hiện tại.
export type WorkforceStructureView = "region" | "province" | "position" | "manager1" | "manager2";

const WORKFORCE_STRUCTURE_CONFIG: Record<WorkforceStructureView, { label: string; column: string }> = {
    region: { label: "Miền", column: "Region" },
    province: { label: "Tỉnh", column: "Old Province" },
    position: { label: "Vị trí", column: "Position" },
    manager1: { label: "Quản lý cấp 1", column: "Level 1 Manager Name" },
    manager2: { label: "Quản lý cấp 2", column: "Level 2 Manager Name" },
};


interface StructureViewSelectorProps {
    value:
        WorkforceStructureView;

    onChange:
        (
            value:
                WorkforceStructureView
        ) => void;
}


export function StructureViewSelector({
    value,
    onChange,
}: StructureViewSelectorProps) {

    const options =
        Object.entries(
            WORKFORCE_STRUCTURE_CONFIG
        ) as [
            WorkforceStructureView,
            {
                label: string;
                column: string;
            }
        ][];


    return (
        <select
            value={value}

            onChange={(event) =>
                onChange(
                    event.target
                        .value as
                        WorkforceStructureView
                )
            }

            style={{
                height: 28,

                minWidth: 130,

                padding:
                    "0 8px",

                border:
                    "1px solid #B8C6E3",

                borderRadius: 6,

                background:
                    "#FFFFFF",

                color:
                    "#001F82",

                fontFamily:
                    "Segoe UI, sans-serif",

                fontSize: 10,

                outline:
                    "none",

                cursor:
                    "pointer",
            }}
        >
            {options.map(
                ([
                    key,
                    config,
                ]) => (
                    <option
                        key={key}
                        value={key}
                    >
                        {
                            config.label
                        }
                    </option>
                )
            )}
        </select>
    );
}
