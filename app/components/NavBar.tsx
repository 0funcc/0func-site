"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import ScrambleLink from "./ScrambleLink";
import { noisyLine } from "./asciiNoise";

const LINK_FADE_MS = 150;

export default function NavBar() {
    const boxRef = useRef<HTMLDivElement>(null);
    const probeRef = useRef<HTMLSpanElement>(null);
    const boxProbeRef = useRef<HTMLSpanElement>(null);
    const logoRef = useRef<HTMLImageElement>(null);
    const maxCols = useRef(0);
    const shrinkCols = useRef(0);
    const colsRef = useRef(0);
    const [cols, setCols] = useState(0);
    const [boxCharsPerCol, setBoxCharsPerCol] = useState(1);
    const [settling, setSettling] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [linksMounted, setLinksMounted] = useState(false);
    const unmountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (expanded) {
            if (unmountTimer.current) {
                clearTimeout(unmountTimer.current);
                unmountTimer.current = null;
            }
            setLinksMounted(true);
        } else {
            unmountTimer.current = setTimeout(() => setLinksMounted(false), LINK_FADE_MS);
        }
        return () => {
            if (unmountTimer.current) clearTimeout(unmountTimer.current);
        };
    }, [expanded]);

    useEffect(() => {
        const box = boxRef.current;
        const probe = probeRef.current;
        const boxProbe = boxProbeRef.current;
        const logo = logoRef.current;
        if (!box || !probe || !boxProbe || !logo) return;

        // Measuring before the webfont has actually loaded would freeze
        // fallback-font metrics into the layout math, so re-measure once
        // the real font is confirmed ready (a no-op if it already was).
        const measure = () => {
            const charWidth = probe.getBoundingClientRect().width / 100;
            // Box-drawing glyphs (─│┌┐└┘) don't necessarily render at the
            // same width as regular characters in every font, so this
            // tracks the conversion ratio between "cols" (regular-char
            // units) and how many box-drawing glyphs are needed to
            // visually span the same distance.
            const boxCharWidth = boxProbe.getBoundingClientRect().width / 50;
            const charsPerCol = charWidth / boxCharWidth;
            setBoxCharsPerCol(charsPerCol);

            maxCols.current = Math.floor(box.clientWidth / charWidth);
            // logo width + horizontal padding (px-4 = 1rem each side) + 2 border chars
            const logoCols = Math.ceil(logo.getBoundingClientRect().width / charWidth);
            const borderCols = Math.ceil(2 / charsPerCol);
            shrinkCols.current = logoCols + Math.ceil(32 / charWidth) + borderCols;
        };

        const resetCols = () => {
            colsRef.current = shrinkCols.current;
            setCols(colsRef.current);
        };

        const onLogoLoad = () => {
            measure();
            resetCols();
        };

        measure();
        resetCols();
        document.fonts.ready.then(() => {
            measure();
            resetCols();
        });
        if (!logo.complete) logo.addEventListener("load", onLogoLoad);
        const ro = new ResizeObserver(measure);
        ro.observe(box);
        return () => {
            logo.removeEventListener("load", onLogoLoad);
            ro.disconnect();
        };
    }, []);

    const lenis = useLenis();

    const { contextSafe } = useGSAP({ scope: boxRef });

    const tweenTo = contextSafe((target: number) => {
        const proxy = { n: colsRef.current };
        const distance = Math.abs(target - colsRef.current);

        setSettling(true);
        gsap.to(proxy, {
            n: target,
            duration: 0.2,
            ease: `steps(${Math.max(distance, 1)})`,
            onUpdate: () => {
                colsRef.current = Math.round(proxy.n);
                setCols(colsRef.current);
            },
            onComplete: () => setSettling(false),
        });
    });

    const inner = Math.max(Math.round(cols * boxCharsPerCol) - 2, 0);

    return (
        <div className="fixed top-0 left-0 z-50 flex w-full flex-col items-center">
            <div
                ref={boxRef}
                onMouseEnter={() => {
                    setExpanded(true);
                    tweenTo(maxCols.current);
                }}
                onMouseLeave={() => {
                    setExpanded(false);
                    tweenTo(shrinkCols.current);
                }}
                className="mx-4 mt-4 w-full max-w-3xl text-center font-mono text-sm leading-none overflow-hidden"
            >
                <span ref={probeRef} aria-hidden="true" className="absolute invisible whitespace-pre">
                    {"0".repeat(100)}
                </span>
                <span ref={boxProbeRef} aria-hidden="true" className="absolute invisible whitespace-pre">
                    {"─".repeat(50)}
                </span>

                <div className="mx-auto bg-background text-foreground" style={{ width: `${cols}ch` }}>
                    <div aria-hidden="true" className="whitespace-pre">
                        {"┌" + noisyLine(inner, settling) + "┐"}
                    </div>

                    <nav className="flex items-center whitespace-pre">
                        {/* A lone "│" renders a couple px off from the same
                            glyph inside the "┌───┐" border strings (likely a
                            font-shaping difference for an isolated glyph vs.
                            one in a longer run) — nudged to match visually. */}
                        <span aria-hidden="true" style={{ position: "relative", left: "0.27em" }}>
                            │
                        </span>
                        <div
                            className={`flex flex-1 items-center px-4 py-3 ${
                                linksMounted ? "justify-between" : "justify-center"
                            }`}
                        >
                            <a
                                href="#about"
                                onClick={(e) => {
                                    e.preventDefault();
                                    lenis?.scrollTo("#about", { offset: -96 });
                                }}
                                className="shrink-0"
                            >
                                <img
                                    ref={logoRef}
                                    src="/0func-logo.svg"
                                    alt="0func Logo"
                                    className="h-8 w-auto max-w-none shrink-0"
                                />
                            </a>
                            {linksMounted && (
                                <>
                                    <ScrambleLink
                                        href="#projects"
                                        label="PROJECTS"
                                        autoPlayDelay={0.05}
                                        visible={expanded}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            lenis?.scrollTo("#projects", { offset: -96 });
                                        }}
                                    />
                                    <ScrambleLink href="/blog" label="BLOG" autoPlayDelay={0.15} visible={expanded} />
                                    <ScrambleLink
                                        href="#contact"
                                        label="CONTACT"
                                        autoPlayDelay={0.1}
                                        visible={expanded}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            lenis?.scrollTo("#contact", { offset: -96 });
                                        }}
                                    />
                                </>
                            )}
                        </div>
                        <span aria-hidden="true" style={{ position: "relative", left: "-0.15em" }}>
                            │
                        </span>
                    </nav>

                    <div aria-hidden="true" className="whitespace-pre">
                        {"└" + noisyLine(inner, settling) + "┘"}
                    </div>
                </div>
            </div>
        </div>
    );
}