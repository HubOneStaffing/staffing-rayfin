
import type { ReactNode } from "react";

interface CardTitleProps {
    children: ReactNode;
}

export function CardTitle({ children }: CardTitleProps) {
    return (
        <div
            style={{
                width: "100%",
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                fontFamily: "Segoe UI, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                lineHeight: "18px",
                color: "#001F82",
                textAlign: "left",
                margin: 0,
                padding: 0,
                boxSizing: "border-box",
            }}
        >
            {children}
        </div>
    );
}
