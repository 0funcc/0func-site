"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const GLYPHS = "▓▒░#=-01@$%&*";

export default function ScrambleLink({
    href,
    label,
    autoPlayDelay,
    visible = true,
    onClick,
    target,
    className,
    icon,
    iconPosition = "right",
}: {
    href: string;
    label: string;
    autoPlayDelay?: number;
    visible?: boolean;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    target?: string;
    className?: string;
    icon?: string;
    iconPosition?: "left" | "right";
}) {
    const ref = useRef<HTMLAnchorElement>(null);
    const [text, setText] = useState(label);

    const { contextSafe } = useGSAP({ scope: ref });

    const scramble = contextSafe(() => {
        const proxy = { p: 0 };
        gsap.killTweensOf(proxy);
        gsap.to(proxy, {
            p: 1,
            duration: 0.45,
            ease: `steps(${label.length})`,
            onUpdate: () => {
                const locked = Math.floor(proxy.p * label.length);
                setText(
                    label
                        .split("")
                        .map((c, i) =>
                            i < locked || c === " "
                                ? c
                                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                        )
                        .join("")
                );
            },
            onComplete: () => setText(label),
        });
    });

    useEffect(() => {
        if (autoPlayDelay === undefined) return;
        const t = setTimeout(scramble, autoPlayDelay * 1000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // `text` only seeds from `label` at mount; a caller that changes `label`
    // on an already-mounted instance (e.g. a MENU/CLOSE toggle) needs this
    // kept in sync or the old label sticks forever.
    useEffect(() => {
        setText(label);
    }, [label]);

    return (
        <a
            ref={ref}
            href={href}
            target={target}
            rel={target === "_blank" ? "noopener noreferrer" : undefined}
            onMouseEnter={scramble}
            onClick={onClick}
            className={`whitespace-pre font-mono uppercase tabular-nums transition-opacity duration-150 hover:opacity-80 ${
                visible ? "opacity-100" : "opacity-0"
            } ${icon ? "inline-flex items-center gap-1.5" : ""} ${className ?? ""}`}
        >
            {icon && iconPosition === "left" && (
                <img src={icon} alt="" aria-hidden="true" className="h-3 w-3" />
            )}
            {text}
            {icon && iconPosition === "right" && (
                <img src={icon} alt="" aria-hidden="true" className="h-3 w-3" />
            )}
        </a>
    );
}