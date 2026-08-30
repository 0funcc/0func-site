"use client";

import { useEffect, useRef, useState } from "react";

export default function FitText({
    text,
    className,
    weight = 700,
}: {
    text: string;
    className?: string;
    weight?: number;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState(16);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const measure = () => {
            const ctx = document.createElement("canvas").getContext("2d");
            if (!ctx) return;

            const REF_SIZE = 100;
            const fontFamily = getComputedStyle(container).fontFamily;
            ctx.font = `${weight} ${REF_SIZE}px ${fontFamily}`;
            const measuredWidth = ctx.measureText(text).width;
            if (measuredWidth <= 0) return;

            setFontSize((container.clientWidth / measuredWidth) * REF_SIZE);
        };

        measure();
        document.fonts.ready.then(measure);
        const ro = new ResizeObserver(measure);
        ro.observe(container);
        return () => ro.disconnect();
    }, [text, weight]);

    return (
        <div
            ref={containerRef}
            className={`w-full overflow-hidden leading-none whitespace-nowrap ${className ?? ""}`}
            style={{ fontSize }}
        >
            {text}
        </div>
    );
}
