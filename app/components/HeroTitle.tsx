"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ASCIIText, { ASCIITextHandle } from "./ASCIIText";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function HeroTitle({ realName, alias }: { realName: string; alias: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const asciiTextRef = useRef<ASCIITextHandle>(null);
    const currentRef = useRef(realName);

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
            onMouseEnter={() => scrambleTo(alias)}
            onMouseLeave={() => scrambleTo(realName)}
            className="relative h-48 w-full sm:h-64"
        >
            <ASCIIText ref={asciiTextRef} text={realName} asciiFontSize={4} textFontSize={120} />
        </div>
    );
}
