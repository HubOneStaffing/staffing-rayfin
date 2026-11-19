interface PlaceholderPanelProps {
    title: string;
    height?: number;
}

export function PlaceholderPanel({
    title,
    height = 300,
}: PlaceholderPanelProps) {
    return (
        <div
            style={{
                height,
                background: "#FFFFFF",
                border: "1px solid #D9DEE8",
                borderRadius: 12,
                padding: 16,
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#001F82",
                }}
            >
                {title}
            </div>
        </div>
    );
}