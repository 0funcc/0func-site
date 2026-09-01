"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ASCIIText, { ASCIITextHandle } from "./ASCIIText";
import useIsMobile from "../hooks/useIsMobile";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function HeroTitle({ realName, alias }: { realName: string; alias: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const asciiTextRef = useRef<ASCIITextHandle>(null);
    const currentRef = useRef(realName);
    const [showingAlias, setShowingAlias] = useState(false);
    const isMobile = useIsMobile();

    const { contextSafe } = useGSAP({ scope: containerRef });

    const scrambleTo = contextSafe((target: string) => {
        const from = currentRef.current;
        const len = Math.max(from.length, target.length);
        const proxy = { p: 0 };
        gsap.killTweensOf(proxy);
        gsap.to(proxy, {
            p: 1,
            duration: 0.6,
            ease: `steps(${len})`,
            onUpdate: () => {
                const locked = Math.floor(proxy.p * len);
                let out = "";
                for (let i = 0; i < len; i++) {
                    const targetChar = i < target.length ? target[i] : "";
                    if (i < locked) {
                        out += targetChar;
                    } else if (targetChar === " ") {
                        out += " ";
                    } else {
                        out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                    }
                }
                asciiTextRef.current?.setText(out);
            },
            onComplete: () => {
                currentRef.current = target;
                asciiTextRef.current?.setText(target);
            },
        });
    });

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => {
                if (isMobile) return;
                scrambleTo(alias);
            }}
            onMouseLeave={() => {
                if (isMobile) return;
                scrambleTo(realName);
            }}
            onClick={() => {
                if (!isMobile) return;
                const next = !showingAlias;
                setShowingAlias(next);
                scrambleTo(next ? alias : realName);
            }}
            className={`relative h-48 w-full sm:h-64 ${isMobile ? "cursor-pointer" : ""}`}
        >
            <ASCIIText ref={asciiTextRef} text={realName} asciiFontSize={4} textFontSize={120} />
        </div>
    );
}
